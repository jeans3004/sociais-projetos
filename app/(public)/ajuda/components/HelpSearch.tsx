"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HelpSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onValueChange: (value: string) => void;
}

export function HelpSearch({ value, onValueChange, className, ...props }: HelpSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="Busque por títulos, temas ou palavras-chave"
        className="h-12 rounded-xl pl-10 text-base"
        aria-label="Buscar artigos na Central de Ajuda"
        {...props}
      />
    </div>
  );
}

export default HelpSearch;
