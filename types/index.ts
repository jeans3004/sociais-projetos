import { Timestamp } from "firebase/firestore";

// Product types
export type ProductType =
  | "Arroz"
  | "Feijão"
  | "Macarrão"
  | "Açúcar"
  | "Biscoito"
  | "Leite em pó"
  | "Café"
  | "Higiene"
  | "Limpeza"
  | "Outros";

export const PRODUCT_TYPES: ProductType[] = [
  "Arroz",
  "Feijão",
  "Macarrão",
  "Açúcar",
  "Biscoito",
  "Leite em pó",
  "Café",
  "Higiene",
  "Limpeza",
  "Outros",
];

export interface ProductDonation {
  product: ProductType;
  quantity: number;
  unit: "kg" | "g" | "un" | "lt" | "pacote";
}

// Student types
export interface Student {
  id: string;
  fullName: string;
  email?: string;
  parentEmail: string;
  class: string; // Ex: "8A", "9B"
  grade: number; // Ex: 8, 9
  shift?: string; // Turno: Manhã, Tarde, Noite
  coordination?: string; // Coordenação
  registrationNumber?: string; // Matrícula
  status: "active" | "inactive";
  totalDonations: number; // Total de doações (quantidade de itens)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StudentFormData {
  fullName: string;
  email?: string;
  parentEmail: string;
  class: string;
  grade: number;
  shift?: string;
  coordination?: string;
  registrationNumber?: string;
  status: "active" | "inactive";
}

export interface StudentImportData {
  "Estudante": string;
  "Série/Ano": string | number;
  "Turma": string;
  "Turno": string;
  "Coordenação": string;
  "Matrícula": string;
  "E-mail": string;
}

// Donation types
export interface Donation {
  id: string;
  studentId: string;
  studentName?: string; // Denormalized for easier queries
  studentClass?: string; // Denormalized
  products: ProductDonation[]; // Lista de produtos doados
  date: Timestamp;
  receiptUrl?: string;
  notes?: string;
  registeredBy: string; // ID do admin
  registeredByName?: string; // Denormalized
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  updatedBy?: string;
  updatedByName?: string;
}

export interface DonationFormData {
  studentId: string;
  products: ProductDonation[];
  date: Date;
  receiptUrl?: string;
  notes?: string;
}

export interface Ticket {
  id: string;
  code: string;
  status: string;
  studentId?: string;
  studentName?: string;
  participantName?: string;
  studentClass?: string;
  assignedAt?: Timestamp;
  updatedAt?: Timestamp;
  [key: string]: any; // Campos adicionais opcionais provenientes do Firestore
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  timestamp: Timestamp;
  performedBy?: string;
  performedByName?: string;
  details?: string;
  sensitive?: boolean;
}

export interface ContestacaoFormData {
  nome: string;
  contato: string;
  referencia?: string;
  descricao: string;
}

// User (Admin) types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  status: "pending" | "approved" | "rejected";
  photoURL?: string;
  lastLogin: Timestamp;
  createdAt: Timestamp;
}

export interface UserFormData {
  email: string;
  name: string;
  role: "admin" | "user";
  password: string;
}

// Settings types
export interface Settings {
  id: string;
  schoolName: string;
  monthlyGoal: number; // Meta mensal de itens doados
  yearlyGoal: number; // Meta anual de itens doados
  academicYear: string;
  updatedAt: Timestamp;
  updatedBy: string;
}

// Dashboard types
export interface DashboardMetrics {
  monthlyTotal: number; // Total de itens no mês
  yearlyTotal: number; // Total de itens no ano
  uniqueDonors: number;
  goalProgress: number;
  monthlyGoal: number;
  productBreakdown: Record<ProductType, number>; // Quantidade por produto
}

export interface MonthlyData {
  month: string;
  total: number; // Total de itens
}

export interface ClassRanking {
  class: string;
  totalDonated: number; // Total de itens doados
  donorCount: number;
}

export interface ProductSummary {
  product: ProductType;
  totalQuantity: number;
  unit: string;
  donationCount: number;
}

// Report types
export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  studentId?: string;
  product?: ProductType;
  class?: string;
  coordination?: string;
}

export interface DonationReport {
  donations: Donation[];
  totalItems: number; // Total de itens doados
  count: number; // Número de doações
  productSummary: ProductSummary[]; // Resumo por produto
}
