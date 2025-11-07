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
