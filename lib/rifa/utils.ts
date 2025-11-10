import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import {
  RaffleDonation,
  RaffleTicket,
  StudentCampaignStats,
  RaffleCampaign,
  RaffleDrawResult,
} from "./types";

export function mapDonation(
  doc: QueryDocumentSnapshot<DocumentData>
): RaffleDonation {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as RaffleDonation;
}

export function mapTicket(
  doc: QueryDocumentSnapshot<DocumentData>
): RaffleTicket {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as RaffleTicket;
}

export function mapStats(
  doc: QueryDocumentSnapshot<DocumentData>
): StudentCampaignStats {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as StudentCampaignStats;
}

export function mapCampaign(
  doc: QueryDocumentSnapshot<DocumentData>
): RaffleCampaign {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as RaffleCampaign;
}

export function mapDraw(
  doc: QueryDocumentSnapshot<DocumentData>
): RaffleDrawResult {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as RaffleDrawResult;
}
