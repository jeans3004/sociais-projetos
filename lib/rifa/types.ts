import { Timestamp } from "firebase/firestore";

export type TicketStatus =
  | "available"
  | "assigned"
  | "redeemed"
  | "canceled";

export interface RaffleCampaign {
  id: string;
  name: string;
  description?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  status: "draft" | "active" | "closed";
  ticketsTotal?: number;
  ticketsAssigned?: number;
  ticketsRedeemed?: number;
  ticketsAvailable?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface RaffleDonationItem {
  product: string;
  quantity: number;
  unit?: string;
}

export interface RaffleDonation {
  id: string;
  campaignId: string;
  studentId: string;
  studentName?: string;
  studentClass?: string;
  studentGrade?: string;
  receiptUrl?: string;
  notes?: string;
  status?: "pending" | "confirmed";
  ticketsGranted?: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  registeredBy?: string;
  registeredByName?: string;
  donationDate?: Timestamp;
  products?: RaffleDonationItem[];
}

export interface RaffleTicket {
  id: string;
  campaignId: string;
  number: number;
  status: TicketStatus;
  studentId?: string;
  donationId?: string;
  assignedAt?: Timestamp;
  redeemedAt?: Timestamp;
}

export interface RaffleActionContext {
  actorId: string;
  actorName?: string;
}

export interface StudentCampaignStats {
  id: string; // `${campaignId}_${studentId}`
  campaignId: string;
  studentId: string;
  ticketsAssigned: number;
  ticketsRedeemed: number;
  ticketsAvailable?: number;
  updatedAt?: Timestamp;
}

export interface RaffleDrawResult {
  id: string;
  campaignId: string;
  seed: string;
  winners: string[];
  integrityHash: string;
  createdAt: Timestamp;
}

export interface RaffleTimelineEntry {
  id: string;
  type: "donation" | "assignment" | "redemption";
  title: string;
  subtitle?: string;
  ticketNumbers?: number[];
  timestamp: Timestamp;
}

export interface AssignTicketsInput {
  campaignId: string;
  studentId: string;
  donationId?: string;
  quantity: number;
}

export interface RegisterDonationInput {
  campaignId: string;
  studentId: string;
  products: RaffleDonationItem[];
  notes?: string;
  receiptUrl?: string;
  donationDate?: Date;
}

export interface DeterministicDrawInput {
  campaignId: string;
  seed: string;
  winnersCount: number;
}
