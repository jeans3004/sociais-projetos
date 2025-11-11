"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketStatus } from "@/lib/rifa/types";

export type FiltersValue = {
  studentQuery: string;
  classQuery: string;
  status: TicketStatus | "all";
  ticketNumber: string;
  startDate: Date | null;
  endDate: Date | null;
};

interface FiltersBarProps {
  filters: FiltersValue;
  onFiltersChange: <K extends keyof FiltersValue>(
    key: K,
    value: FiltersValue[K]
  ) => void;
  onApply: () => void;
  onClear: () => void;
}

function formatInputDate(value?: Date | null) {
  if (!value) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function FiltersBar({ filters, onFiltersChange, onApply, onClear }: FiltersBarProps) {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setExpanded(mediaQuery.matches);
  }, []);

  const toggle = () => setExpanded((value) => !value);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Ajuste os filtros para refinar os resultados.</p>
        <Button variant="ghost" size="sm" className="md:hidden" onClick={toggle}>
          {expanded ? "Recolher" : "Expandir"}
        </Button>
      </div>
      <div className={`${expanded ? "grid" : "hidden md:grid"} grid-cols-1 gap-4 md:grid-cols-2`}>
        <div className="space-y-2">
          <Label htmlFor="filter-student">Aluno</Label>
          <Input
            id="filter-student"
            placeholder="Nome ou ID"
            value={filters.studentQuery}
            onChange={(event) => onFiltersChange("studentQuery", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-class">Turma</Label>
          <Input
            id="filter-class"
            placeholder="Ex.: 6º Ano B"
            value={filters.classQuery}
            onChange={(event) => onFiltersChange("classQuery", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-status">Status das rifas</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange("status", value as TicketStatus | "all")}
          >
            <SelectTrigger id="filter-status">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="available">Disponíveis</SelectItem>
              <SelectItem value="assigned">Atribuídos</SelectItem>
              <SelectItem value="drawn">Sorteados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-ticket">Nº da rifa</Label>
          <Input
            id="filter-ticket"
            placeholder="Ex.: 125"
            inputMode="numeric"
            value={filters.ticketNumber}
            onChange={(event) =>
              onFiltersChange("ticketNumber", event.target.value.replace(/[^0-9]/g, ""))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-start">Início</Label>
          <Input
            id="filter-start"
            type="date"
            value={formatInputDate(filters.startDate)}
            onChange={(event) =>
              onFiltersChange(
                "startDate",
                event.target.value ? new Date(event.target.value) : null
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-end">Fim</Label>
          <Input
            id="filter-end"
            type="date"
            value={formatInputDate(filters.endDate)}
            onChange={(event) =>
              onFiltersChange(
                "endDate",
                event.target.value ? new Date(event.target.value) : null
              )
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClear}>
          Limpar filtros
        </Button>
        <Button onClick={onApply}>Aplicar filtros</Button>
      </div>
    </div>
  );
}
