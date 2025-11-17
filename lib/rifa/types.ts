import { Timestamp } from "firebase/firestore";

export type TicketStatus = "available" | "assigned" | "drawn";

export type CampaignStatus = "active" | "inactive";

export interface RaffleCampaign {
  id: string;
  name: string;
  description?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  status: CampaignStatus;
  ticketGoal?: number;
  ticketsTotal?: number;
  ticketsAssigned?: number;
  ticketsDrawn?: number;
  ticketsAvailable?: number;
  createdAt?: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export interface RaffleDonationItem {
  product: string;
  quantity: number;
  unit?: string;
  packageDetail?: string; // Descrição da unidade do pacote (ex: "400 gramas", "500ml")
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
  ticketNumber: number;
  number?: number;
  status: TicketStatus;
  studentId?: string;
  studentName?: string;
  studentClass?: string;
  studentGrade?: string;
  donationId?: string;
  assignedAt?: Timestamp;
  drawnAt?: Timestamp;
  createdAt?: Timestamp;
  createdBy?: string;
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
  ticketsDrawn: number;
  ticketsAvailable?: number;
  updatedAt?: Timestamp;
}

export interface RaffleDrawResult {
  id: string;
  campaignId: string;
  ticketId: string;
  ticketNumber: number;
  studentId: string;
  studentName?: string;
  performedBy: string;
  performedByName?: string;
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

export interface RegisterRaffleTicketsInput {
  campaignId: string;
  studentId: string;
  studentName: string;
  studentClass?: string;
  studentGrade?: string;
  quantity: number;
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  ticketGoal?: number;
}

export interface UpdateCampaignInput extends CreateCampaignInput {
  id: string;
}

export interface DeterministicDrawInput {
  campaignId: string;
  seed: string;
  winnersCount: number;
}
