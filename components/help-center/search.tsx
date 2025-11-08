"use client";

import { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";

interface HelpCenterSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export function HelpCenterSearch({ query, onQueryChange }: HelpCenterSearchProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground" htmlFor="help-center-search">
        Pesquise por artigos, tópicos ou palavras-chave
      </label>
      <Input
        id="help-center-search"
        placeholder="Ex.: dashboards, relatórios, doações"
        value={query}
        onChange={handleChange}
        className="h-11"
      />
    </div>
  );
}
