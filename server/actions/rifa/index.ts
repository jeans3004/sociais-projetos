"use server";

import { db } from "@/lib/firebase/config";
import {
  CreateCampaignInput,
  DeterministicDrawInput,
  RaffleActionContext,
  RegisterRaffleTicketsInput,
  UpdateCampaignInput,
} from "@/lib/rifa/types";
import { seedrandom } from "@/lib/rifa/random";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

async function logEvent(
  action: string,
  before: unknown,
  after: unknown,
  context: RaffleActionContext,
  campaignId?: string,
  studentId?: string
) {
  const logsRef = collection(db, "raffleAuditLogs");
  await addDoc(logsRef, {
    action,
    campaignId: campaignId ?? null,
    studentId: studentId ?? null,
    before,
    after,
    actorId: context.actorId,
    actorName: context.actorName ?? null,
    createdAt: serverTimestamp(),
  });
}

function toTimestamp(date: Date) {
  return Timestamp.fromDate(date);
}

export async function createCampaignAction(
  input: CreateCampaignInput,
  context: RaffleActionContext
) {
  if (input.endDate < input.startDate) {
    throw new Error("Data de término não pode ser anterior à data de início");
  }

  const campaignsRef = collection(db, "raffleCampaigns");
  const payload = {
    name: input.name,
    description: input.description ?? null,
    startDate: toTimestamp(input.startDate),
    endDate: toTimestamp(input.endDate),
    status: input.status,
    ticketGoal: input.ticketGoal ?? null,
    ticketsTotal: 0,
    ticketsAssigned: 0,
    ticketsDrawn: 0,
    ticketsAvailable: 0,
    createdAt: serverTimestamp(),
    createdBy: context.actorId,
    updatedAt: serverTimestamp(),
    updatedBy: context.actorId,
  };

  const docRef = await addDoc(campaignsRef, payload);
  await logEvent("campaign.create", null, payload, context, docRef.id);

  return { id: docRef.id };
}

export async function updateCampaignAction(
  input: UpdateCampaignInput,
  context: RaffleActionContext
) {
  if (input.endDate < input.startDate) {
    throw new Error("Data de término não pode ser anterior à data de início");
  }

  const campaignRef = doc(db, "raffleCampaigns", input.id);

  let before: unknown = null;
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(campaignRef);
    if (!snapshot.exists()) {
      throw new Error("Campanha não encontrada");
    }
    before = snapshot.data();
    transaction.update(campaignRef, {
      name: input.name,
      description: input.description ?? null,
      startDate: toTimestamp(input.startDate),
      endDate: toTimestamp(input.endDate),
      status: input.status,
      ticketGoal: input.ticketGoal ?? null,
      updatedAt: serverTimestamp(),
      updatedBy: context.actorId,
    });
  });

  await logEvent("campaign.update", before, input, context, input.id);

  return { id: input.id };
}

// Gera números aleatórios únicos para bilhetes
function generateUniqueRandomNumbers(
  count: number,
  existingNumbers: Set<number>,
  min: number = 1,
  max: number = 999999
): number[] {
  const numbers: number[] = [];
  const maxAttempts = count * 100; // Prevenir loop infinito
  let attempts = 0;

  while (numbers.length < count && attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!existingNumbers.has(randomNum) && !numbers.includes(randomNum)) {
      numbers.push(randomNum);
      existingNumbers.add(randomNum);
    }
    attempts++;
  }

  if (numbers.length < count) {
    throw new Error(
      "Não foi possível gerar números únicos suficientes. Tente novamente."
    );
  }

  return numbers.sort((a, b) => a - b);
}

export async function registerRaffleTicketsAction(
  input: RegisterRaffleTicketsInput,
  context: RaffleActionContext
) {
  if (input.quantity < 1) {
    throw new Error("Quantidade mínima de bilhetes é 1");
  }

  const campaignRef = doc(db, "raffleCampaigns", input.campaignId);
  const ticketsRef = collection(db, "tickets");
  const statsRef = doc(
    db,
    "studentCampaignStats",
    `${input.campaignId}_${input.studentId}`
  );
  let ticketNumbers: number[] = [];

  // Buscar números existentes ANTES da transação para evitar duplicatas
  const existingTicketsSnapshot = await getDocs(
    query(ticketsRef, where("campaignId", "==", input.campaignId))
  );
  const existingNumbers = new Set<number>();
  existingTicketsSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.ticketNumber) {
      existingNumbers.add(data.ticketNumber);
    }
  });

  await runTransaction(db, async (transaction) => {
    const campaignSnapshot = await transaction.get(campaignRef);
    if (!campaignSnapshot.exists()) {
      throw new Error("Campanha não encontrada");
    }

    const campaignData = campaignSnapshot.data() as {
      status?: string;
      startDate?: Timestamp;
      endDate?: Timestamp;
      ticketsTotal?: number;
    };

    if (campaignData.status !== "active") {
      throw new Error("Campanha inativa");
    }

    const now = new Date();
    const startDate = campaignData.startDate
      ? campaignData.startDate.toDate()
      : undefined;
    const endDate = campaignData.endDate
      ? campaignData.endDate.toDate()
      : undefined;

    if (startDate && now < startDate) {
      throw new Error("A campanha ainda não está ativa");
    }

    if (endDate && now > endDate) {
      throw new Error("A campanha já foi encerrada");
    }

    // Gerar números aleatórios únicos
    ticketNumbers = generateUniqueRandomNumbers(
      input.quantity,
      existingNumbers
    );

    const ticketRefs = ticketNumbers.map(() => doc(ticketsRef));

    transaction.update(campaignRef, {
      ticketsTotal: increment(input.quantity),
      ticketsAssigned: increment(input.quantity),
      updatedAt: serverTimestamp(),
      updatedBy: context.actorId,
    });

    transaction.set(
      statsRef,
      {
        campaignId: input.campaignId,
        studentId: input.studentId,
        ticketsAssigned: increment(input.quantity),
        ticketsDrawn: increment(0),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    ticketRefs.forEach((ticketRef, index) => {
      transaction.set(ticketRef, {
        campaignId: input.campaignId,
        ticketNumber: ticketNumbers[index],
        studentId: input.studentId,
        studentName: input.studentName,
        studentClass: input.studentClass ?? null,
        studentGrade: input.studentGrade ?? null,
        status: "assigned",
        createdAt: serverTimestamp(),
        createdBy: context.actorId,
      });
    });
  });

  await logEvent(
    "tickets.create",
    null,
    {
      ticketNumbers,
      studentId: input.studentId,
    },
    context,
    input.campaignId,
    input.studentId
  );

  return { ticketNumbers };
}

export async function runDeterministicDrawAction(
  input: DeterministicDrawInput,
  context: RaffleActionContext
) {
  const ticketsRef = collection(db, "tickets");
  const eligibleSnapshot = await getDocs(
    query(
      ticketsRef,
      where("campaignId", "==", input.campaignId),
      where("status", "==", "assigned"),
      orderBy("ticketNumber", "asc")
    )
  );

  if (eligibleSnapshot.empty) {
    throw new Error("Nenhuma rifa elegível para o sorteio");
  }

  const tickets = eligibleSnapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...(docSnapshot.data() as {
      ticketNumber: number;
      studentId: string;
      studentName?: string;
    }),
  }));

  const winners: typeof tickets = [];
  const rng = seedrandom(`${input.seed}:${input.campaignId}`);
  const usedIndexes = new Set<number>();

  while (
    winners.length < input.winnersCount &&
    usedIndexes.size < tickets.length
  ) {
    const idx = Math.floor(rng() * tickets.length);
    if (usedIndexes.has(idx)) continue;
    usedIndexes.add(idx);
    winners.push(tickets[idx]);
  }

  if (winners.length === 0) {
    throw new Error("Não foi possível selecionar um vencedor");
  }

  const campaignRef = doc(db, "raffleCampaigns", input.campaignId);

  await runTransaction(db, async (transaction) => {
    transaction.update(campaignRef, {
      ticketsDrawn: increment(winners.length),
      updatedAt: serverTimestamp(),
      updatedBy: context.actorId,
    });

    for (const winner of winners) {
      const ticketRef = doc(db, "tickets", winner.id);
      const ticketSnap = await transaction.get(ticketRef);
      if (!ticketSnap.exists()) {
        throw new Error("Bilhete não encontrado");
      }
      if (ticketSnap.data()?.status !== "assigned") {
        throw new Error(
          `Bilhete #${winner.ticketNumber} não está disponível para sorteio`
        );
      }

      transaction.update(ticketRef, {
        status: "drawn",
        drawnAt: serverTimestamp(),
      });

      const statsRef = doc(
        db,
        "studentCampaignStats",
        `${input.campaignId}_${winner.studentId}`
      );
      transaction.set(
        statsRef,
        {
          campaignId: input.campaignId,
          studentId: winner.studentId,
          ticketsDrawn: increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  });

  const results = await Promise.all(
    winners.map(async (winner) => {
      const drawsRef = collection(db, "raffleDraws");
      const drawDoc = await addDoc(drawsRef, {
        campaignId: input.campaignId,
        ticketId: winner.id,
        ticketNumber: winner.ticketNumber,
        studentId: winner.studentId,
        studentName: winner.studentName ?? null,
        performedBy: context.actorId,
        performedByName: context.actorName ?? null,
        createdAt: serverTimestamp(),
      });
      return {
        drawId: drawDoc.id,
        ticketId: winner.id,
        ticketNumber: winner.ticketNumber,
        studentId: winner.studentId,
        studentName: winner.studentName ?? null,
      };
    })
  );

  await logEvent(
    "draw.execute",
    null,
    {
      winners: winners.map((winner) => winner.ticketNumber),
    },
    context,
    input.campaignId
  );

  return {
    draws: results,
  };
}
