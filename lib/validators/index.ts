import { z } from "zod";

// Student validation schema
export const studentSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  parentEmail: z.string().email("Email do responsável inválido"),
  class: z.string().min(2, "Turma é obrigatória"),
  grade: z.number().min(1).max(12, "Série deve estar entre 1 e 12"),
  shift: z.string().optional(),
  coordination: z.string().optional(),
  registrationNumber: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

// Teacher validation schema
export const teacherSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  department: z.string().optional(),
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

// Product donation validation schema
export const productDonationSchema = z.object({
  product: z.enum([
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
  ]),
  quantity: z.number().positive("Quantidade deve ser positiva"),
  unit: z.enum(["kg", "g", "un", "lt", "pacote"]),
});

// Donation validation schema
export const donationSchema = z.object({
  donorType: z.enum(["student", "teacher"]),
  studentId: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
  teacherId: z.string().optional(),
  teacherIds: z.array(z.string()).optional(),
  products: z
    .array(productDonationSchema)
    .min(1, "Adicione pelo menos um produto"),
  date: z.date(),
  receiptUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // Validar que studentId/studentIds ou teacherId/teacherIds está presente conforme o donorType
    if (data.donorType === "student") {
      // Aceita studentId (compatibilidade) ou studentIds (novo)
      return (data.studentId && data.studentId.trim().length > 0) ||
             (data.studentIds && data.studentIds.length > 0);
    } else if (data.donorType === "teacher") {
      // Aceita teacherId (compatibilidade) ou teacherIds (novo)
      return (data.teacherId && data.teacherId.trim().length > 0) ||
             (data.teacherIds && data.teacherIds.length > 0);
    }
    return false;
  },
  {
    message: "Selecione um aluno ou professor",
    path: ["studentIds"], // Will show error on the appropriate field
  }
).refine(
  (data) => {
    // Se algum produto for "Outros", observações são obrigatórias
    const hasOthers = data.products.some((p) => p.product === "Outros");
    if (hasOthers) {
      return data.notes && data.notes.trim().length > 0;
    }
    return true;
  },
  {
    message: "Observações são obrigatórias quando o produto 'Outros' é selecionado",
    path: ["notes"],
  }
);

// Settings validation schema
export const settingsSchema = z.object({
  schoolName: z.string().min(3, "Nome da escola é obrigatório"),
  monthlyGoal: z.number().positive("Meta mensal deve ser positiva"),
  yearlyGoal: z.number().positive("Meta anual deve ser positiva"),
  academicYear: z.string().min(4, "Ano letivo inválido"),
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
});
