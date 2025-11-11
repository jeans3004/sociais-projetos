import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("pt-BR", options).format(value);
}

export function formatItems(value: number): string {
  return `${formatNumber(value)} itens`;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(dateObj);
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(dateObj);
}

/**
 * Formata quantidade e unidade de produtos
 * Converte automaticamente gramas para kg se >= 1000g
 */
export function formatProductQuantity(quantity: number, unit: string): string {
  // Se for gramas e >= 1000, converte para kg
  if (unit === "g" && quantity >= 1000) {
    const kg = quantity / 1000;
    return `${formatNumber(kg, { minimumFractionDigits: 2, maximumFractionDigits: 3 })} kg`;
  }

  // Formata outras unidades normalmente
  const unitLabels: Record<string, string> = {
    kg: "kg",
    g: "g",
    un: "un",
    lt: "L",
    pacote: "pacote(s)",
  };

  return `${formatNumber(quantity, { maximumFractionDigits: 2 })} ${unitLabels[unit] || unit}`;
}

/**
 * Formata série/ano conforme o nível de ensino
 * Ensino Médio (10-12 ou 1-3 com coordenação): usa "série" (1ª Série, 2ª Série, 3ª Série)
 * Ensino Fundamental (1-9): usa "ano" (1º Ano, 2º Ano, ..., 9º Ano)
 */
export function formatGradeLabel(grade: number, coordination?: string): string {
  // Se for Ensino Médio pela coordenação e grade 1-3, trata como série
  if (coordination === "Ensino Médio" && grade >= 1 && grade <= 3) {
    return `${grade}ª Série`;
  }

  // Se for Ensino Médio pelos números 10-12
  if (grade >= 10 && grade <= 12) {
    // Ensino Médio: converte 10->1ª, 11->2ª, 12->3ª
    const serie = grade - 9;
    return `${serie}ª Série`;
  }

  // Ensino Fundamental
  return `${grade}º Ano`;
}
