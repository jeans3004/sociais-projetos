"use client";

import { Fragment } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RaffleTimelineEntry, RaffleTicket } from "@/lib/rifa/types";
import { Timestamp } from "firebase/firestore";

interface StudentDrawerProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  studentName?: string;
  studentClass?: string;
  tickets: RaffleTicket[];
  timeline: RaffleTimelineEntry[];
}

function toDate(value?: Timestamp | Date | null) {
  if (!value) return undefined;
  if (value instanceof Date) {
    return value;
  }
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (typeof (value as any).toDate === "function") {
    return (value as any).toDate();
  }
  return value as Date;
}

function formatTimestamp(date?: Date) {
  if (!date) return "";
  try {
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch (error) {
    return "";
  }
}

export function StudentDrawer({
  open,
  onOpenChange,
  studentName,
  studentClass,
  tickets,
  timeline,
}: StudentDrawerProps) {
  const assignedTickets = tickets.filter((ticket) => ticket.status === "assigned");
  const drawnTickets = tickets.filter((ticket) => ticket.status === "drawn");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col space-y-6 overflow-hidden sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{studentName ?? "Perfil do aluno"}</SheetTitle>
          <SheetDescription>
            {studentClass ? `Turma ${studentClass}` : "Inventário de rifas"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm font-semibold text-muted-foreground">Resumo</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-background p-3 shadow-sm">
                <p className="text-sm text-muted-foreground">Atribuídas</p>
                <p className="text-2xl font-bold text-foreground">{assignedTickets.length}</p>
              </div>
              <div className="rounded-md bg-background p-3 shadow-sm">
                <p className="text-sm text-muted-foreground">Sorteadas</p>
                <p className="text-2xl font-bold text-foreground">{drawnTickets.length}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">Inventário</p>
            </div>
            {tickets.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Nenhuma rifa atribuída a este aluno.
              </div>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-2">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-foreground">Rifa #{ticket.ticketNumber ?? ticket.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.createdAt
                          ? `Criada em ${formatTimestamp(toDate(ticket.createdAt))}`
                          : "Sem registro"}
                      </p>
                    </div>
                    <Badge variant={ticket.status === "drawn" ? "secondary" : "outline"}>
                      {ticket.status === "assigned"
                        ? "Atribuída"
                        : ticket.status === "drawn"
                        ? "Sorteada"
                        : "Disponível"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Linha do tempo</p>
            {timeline.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Nenhuma atividade registrada para este aluno na campanha selecionada.
              </div>
            ) : (
              <div className="space-y-3">
                {timeline.map((item) => (
                  <Fragment key={item.id}>
                    <div className="rounded-lg border bg-background p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          {item.subtitle ? (
                            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                          ) : null}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(toDate(item.timestamp as Timestamp | Date))}
                        </span>
                      </div>
                      {item.ticketNumbers && item.ticketNumbers.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {item.ticketNumbers.map((number) => (
                            <span
                              key={number}
                              className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-foreground"
                            >
                              #{number}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
