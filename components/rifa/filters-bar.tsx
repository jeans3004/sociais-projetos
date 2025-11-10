"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketStatus } from "@/lib/rifa/types";

interface FiltersBarProps {
  studentQuery: string;
  onStudentQueryChange: (value: string) => void;
  classQuery: string;
  onClassQueryChange: (value: string) => void;
  status: TicketStatus | "all";
  onStatusChange: (status: TicketStatus | "all") => void;
  ticketNumber: string;
  onTicketNumberChange: (value: string) => void;
  startDate?: Date | null;
  endDate?: Date | null;
  onStartDateChange: (value: Date | null) => void;
  onEndDateChange: (value: Date | null) => void;
  onClear: () => void;
}

function formatInputDate(value?: Date | null) {
  if (!value) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function FiltersBar({
  studentQuery,
  onStudentQueryChange,
  classQuery,
  onClassQueryChange,
  status,
  onStatusChange,
  ticketNumber,
  onTicketNumberChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: FiltersBarProps) {
  const statusOptions = useMemo(() => [
    { value: "all", label: "Todos" },
    { value: "available", label: "Disponíveis" },
    { value: "assigned", label: "Atribuídos" },
    { value: "redeemed", label: "Resgatados" },
    { value: "canceled", label: "Cancelados" },
  ], []);

  return (
    <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      <div className="space-y-1">
        <Label htmlFor="student-filter">Aluno</Label>
        <Input
          id="student-filter"
          placeholder="Nome ou ID"
          value={studentQuery}
          onChange={(event) => onStudentQueryChange(event.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="class-filter">Turma</Label>
        <Input
          id="class-filter"
          placeholder="Ex: 6º Ano B"
          value={classQuery}
          onChange={(event) => onClassQueryChange(event.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="status-filter">Status das rifas</Label>
        <Select value={status} onValueChange={(value) => onStatusChange(value as TicketStatus | "all")}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="ticket-number-filter">Nº da rifa</Label>
        <Input
          id="ticket-number-filter"
          placeholder="Ex: 125"
          value={ticketNumber}
          onChange={(event) => onTicketNumberChange(event.target.value.replace(/[^0-9]/g, ""))}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="start-date">Início</Label>
        <Input
          id="start-date"
          type="date"
          value={formatInputDate(startDate)}
          onChange={(event) =>
            onStartDateChange(event.target.value ? new Date(event.target.value) : null)
          }
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="end-date">Fim</Label>
        <Input
          id="end-date"
          type="date"
          value={formatInputDate(endDate)}
          onChange={(event) =>
            onEndDateChange(event.target.value ? new Date(event.target.value) : null)
          }
        />
      </div>
      <div className="md:col-span-2 lg:col-span-4 xl:col-span-6 flex justify-end">
        <Button variant="ghost" onClick={onClear}>
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
