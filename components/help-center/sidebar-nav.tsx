"use client";

import { cn } from "@/lib/utils";

export type HelpCenterSidebarItem = {
  id: string;
  title: string;
  description: string;
};

type HelpCenterSidebarProps = {
  items: HelpCenterSidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function HelpCenterSidebar({ items, activeId, onSelect }: HelpCenterSidebarProps) {
  return (
    <nav className="space-y-2" aria-label="Ajuda: seções principais">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            "w-full rounded-lg border p-4 text-left transition-all",
            activeId === item.id
              ? "border-primary bg-primary/5 text-primary"
              : "border-muted-foreground/20 hover:border-primary/60 hover:bg-muted"
          )}
        >
          <div className="font-semibold leading-tight">{item.title}</div>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        </button>
      ))}
    </nav>
  );
}
