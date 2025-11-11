import {
  Timestamp,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  getDocs,
  QueryConstraint,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  RaffleCampaign,
  RaffleDonation,
  RaffleDrawResult,
  RaffleTicket,
  StudentCampaignStats,
  TicketStatus,
} from "./types";
import {
  mapCampaign,
  mapDonation,
  mapDraw,
  mapStats,
  mapTicket,
} from "./utils";

export interface RaffleFilters {
  campaignId?: string;
  studentId?: string;
  className?: string;
  status?: TicketStatus | "all";
  ticketNumber?: number | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
}

export function subscribeToCampaigns(
  callback: (campaigns: RaffleCampaign[]) => void
) {
  const campaignsRef = collection(db, "raffleCampaigns");
  const q = query(campaignsRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(mapCampaign));
  });
}

export function subscribeToDonations(
  filters: RaffleFilters,
  callback: (donations: RaffleDonation[]) => void
) {
  const baseRef = collection(db, "donations");
  const constraints: QueryConstraint[] = [];
  if (filters.campaignId) {
    constraints.push(where("campaignId", "==", filters.campaignId));
  }
  if (filters.studentId) {
    constraints.push(where("studentId", "==", filters.studentId));
  }
  if (filters.className) {
    constraints.push(where("studentClass", "==", filters.className));
  }
  if (filters.periodStart) {
    constraints.push(
      where("createdAt", ">=", Timestamp.fromDate(filters.periodStart))
    );
  }
  if (filters.periodEnd) {
    constraints.push(
      where("createdAt", "<=", Timestamp.fromDate(filters.periodEnd))
    );
  }
  const q = query(baseRef, ...constraints, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(mapDonation));
  });
}

export function subscribeToTickets(
  filters: RaffleFilters,
  callback: (tickets: RaffleTicket[]) => void
) {
  const baseRef = collection(db, "tickets");
  const constraints: QueryConstraint[] = [];
  if (filters.campaignId) {
    constraints.push(where("campaignId", "==", filters.campaignId));
  }
  if (filters.status && filters.status !== "all") {
    constraints.push(where("status", "==", filters.status));
  }
  if (filters.studentId) {
    constraints.push(where("studentId", "==", filters.studentId));
  }
  if (filters.ticketNumber != null) {
    constraints.push(where("ticketNumber", "==", filters.ticketNumber));
  }
  const q = query(baseRef, ...constraints, orderBy("ticketNumber", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(mapTicket));
  });
}

export function subscribeToStudentStats(
  filters: RaffleFilters,
  callback: (stats: StudentCampaignStats[]) => void
) {
  const baseRef = collection(db, "studentCampaignStats");
  const constraints: QueryConstraint[] = [];
  if (filters.campaignId) {
    constraints.push(where("campaignId", "==", filters.campaignId));
  }
  if (filters.studentId) {
    constraints.push(where("studentId", "==", filters.studentId));
  }
  const q = query(
    baseRef,
    ...constraints,
    orderBy("ticketsAssigned", "desc"),
    limit(200)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(mapStats));
  });
}

export function subscribeToDraws(
  campaignId: string | undefined,
  callback: (draws: RaffleDrawResult[]) => void
) {
  const drawsRef = collection(db, "raffleDraws");
  const constraints: QueryConstraint[] = [
    orderBy("createdAt", "desc"),
    limit(200),
  ];
  if (campaignId) {
    constraints.unshift(where("campaignId", "==", campaignId));
  }
  const q = query(drawsRef, ...constraints);
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(mapDraw));
  });
}

export async function getTicketByNumber(
  campaignId: string,
  number: number
): Promise<RaffleTicket | null> {
  const ticketsRef = collection(db, "tickets");
  const q = query(
    ticketsRef,
    where("campaignId", "==", campaignId),
    where("ticketNumber", "==", number),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return mapTicket(snapshot.docs[0]);
}

export async function getCampaignById(
  campaignId: string
): Promise<RaffleCampaign | null> {
  const ref = doc(db, "raffleCampaigns", campaignId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as RaffleCampaign), id: snapshot.id };
}
