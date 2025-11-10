"use server";

import { db } from "@/lib/firebase/config";
import {
  AssignTicketsInput,
  DeterministicDrawInput,
  RaffleActionContext,
  RegisterDonationInput,
} from "@/lib/rifa/types";
import { computeIntegrityHash } from "@/lib/rifa/hash";
import { seedrandom } from "@/lib/rifa/random";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  getDocs,
} from "firebase/firestore";

async function logEvent(
  action: string,
  before: unknown,
  after: unknown,
  context: RaffleActionContext,
  campaignId: string,
  studentId?: string
) {
  const logsRef = collection(db, "raffleAuditLogs");
  await addDoc(logsRef, {
    action,
    campaignId,
    studentId,
    before,
    after,
    actorId: context.actorId,
    actorName: context.actorName,
    createdAt: serverTimestamp(),
  });
}

export async function assignTicketsAction(
  input: AssignTicketsInput,
  context: RaffleActionContext
) {
  const assignedAt = Timestamp.now();
  const ticketsRef = collection(db, "tickets");
  const statsId = `${input.campaignId}_${input.studentId}`;
  const statsRef = doc(db, "studentCampaignStats", statsId);
  const campaignRef = doc(db, "raffleCampaigns", input.campaignId);

  const ticketQuery = query(
    ticketsRef,
    where("campaignId", "==", input.campaignId),
    where("status", "==", "available"),
    orderBy("number", "asc"),
    limit(input.quantity)
  );

  const updatedTicketIds: string[] = [];
  const updatedTicketNumbers: number[] = [];

  await runTransaction(db, async (transaction) => {
    const availableSnapshot = await transaction.get(ticketQuery);
    if (availableSnapshot.size < input.quantity) {
      throw new Error("Quantidade de rifas indisponível para atribuição");
    }

    availableSnapshot.docs.forEach((ticketDoc) => {
      updatedTicketIds.push(ticketDoc.id);
      const data = ticketDoc.data();
      updatedTicketNumbers.push(data.number);
      transaction.update(ticketDoc.ref, {
        status: "assigned",
        studentId: input.studentId,
        donationId: input.donationId ?? null,
        assignedAt,
      });
    });

    transaction.set(
      statsRef,
      {
        campaignId: input.campaignId,
        studentId: input.studentId,
        ticketsAssigned: increment(input.quantity),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    transaction.set(
      campaignRef,
      {
        ticketsAssigned: increment(input.quantity),
        ticketsAvailable: increment(-input.quantity),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  await logEvent(
    "assign",
    null,
    {
      ticketIds: updatedTicketIds,
      ticketNumbers: updatedTicketNumbers,
      donationId: input.donationId,
    },
    context,
    input.campaignId,
    input.studentId
  );

  return { ticketIds: updatedTicketIds, ticketNumbers: updatedTicketNumbers };
}

export async function registerDonationAction(
  input: RegisterDonationInput,
  context: RaffleActionContext
) {
  const donationsRef = collection(db, "donations");
  const createdAt = Timestamp.now();
  const ticketsGranted = input.products.reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0
  );

  const donationDoc = await addDoc(donationsRef, {
    campaignId: input.campaignId,
    studentId: input.studentId,
    products: input.products,
    notes: input.notes ?? null,
    receiptUrl: input.receiptUrl ?? null,
    ticketsGranted,
    status: "confirmed",
    createdAt,
    donationDate: input.donationDate
      ? Timestamp.fromDate(input.donationDate)
      : createdAt,
    registeredBy: context.actorId,
    registeredByName: context.actorName ?? null,
  });

  await logEvent(
    "donation",
    null,
    {
      donationId: donationDoc.id,
      ticketsGranted,
    },
    context,
    input.campaignId,
    input.studentId
  );

  if (ticketsGranted > 0) {
    await assignTicketsAction(
      {
        campaignId: input.campaignId,
        studentId: input.studentId,
        donationId: donationDoc.id,
        quantity: ticketsGranted,
      },
      context
    );
  }

  return { donationId: donationDoc.id, ticketsGranted };
}

export async function runDeterministicDrawAction(
  input: DeterministicDrawInput,
  context: RaffleActionContext
) {
  const ticketsRef = collection(db, "tickets");
  const eligibleQuery = query(
    ticketsRef,
    where("campaignId", "==", input.campaignId),
    where("status", "in", ["assigned", "redeemed"]),
    orderBy("number", "asc")
  );

  const snapshot = await getDocs(eligibleQuery);
  if (snapshot.empty) {
    throw new Error("Nenhuma rifa elegível para o sorteio");
  }

  const tickets = snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...(docSnapshot.data() as { number: number; studentId?: string }),
  }));

  const rng = seedrandom(`${input.seed}:${input.campaignId}`);
  const winners: string[] = [];
  const usedIndexes = new Set<number>();

  while (winners.length < input.winnersCount && usedIndexes.size < tickets.length) {
    const idx = Math.floor(rng() * tickets.length);
    if (usedIndexes.has(idx)) continue;
    usedIndexes.add(idx);
    winners.push(tickets[idx].id);
  }

  const integrityHash = computeIntegrityHash(
    input.seed,
    winners,
    input.campaignId
  );

  const drawsRef = collection(db, "raffleDraws");
  const drawDoc = await addDoc(drawsRef, {
    campaignId: input.campaignId,
    seed: input.seed,
    winners,
    integrityHash,
    createdAt: serverTimestamp(),
    winnersCount: input.winnersCount,
  });

  await logEvent(
    "draw",
    null,
    {
      drawId: drawDoc.id,
      winners,
      seed: input.seed,
    },
    context,
    input.campaignId
  );

  return { drawId: drawDoc.id, winners, integrityHash };
}
