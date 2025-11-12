"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Teacher } from "@/types";

interface TeacherMultiSelectProps {
  teachers: Teacher[];
  value: string[]; // Array de IDs selecionados
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TeacherMultiSelect({
  teachers,
  value = [],
  onValueChange,
  placeholder = "Selecione professor(es)...",
  disabled = false,
}: TeacherMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedTeachers = teachers.filter((teacher) =>
    value.includes(teacher.id)
  );

  const allSelected = teachers.length > 0 && value.length === teachers.length;

  const filteredTeachers = React.useMemo(() => {
    if (!search) return teachers;

    const searchLower = search.toLowerCase();
    return teachers.filter((teacher) => {
      const searchableText = [
        teacher.fullName,
        teacher.department || "",
        teacher.email || "",
        teacher.registrationNumber || "",
      ].join(" ").toLowerCase();

      return searchableText.includes(searchLower);
    });
  }, [teachers, search]);

  const handleToggle = (teacherId: string) => {
    const newValue = value.includes(teacherId)
      ? value.filter((id) => id !== teacherId)
      : [...value, teacherId];
    onValueChange(newValue);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onValueChange([]);
    } else {
      onValueChange(teachers.map((t) => t.id));
    }
  };

  const handleClearAll = () => {
    onValueChange([]);
  };

  const handleRemoveTeacher = (teacherId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value.filter((id) => id !== teacherId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-[40px] h-auto"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : allSelected ? (
              <Badge variant="default" className="font-medium">
                Corpo Docente ({teachers.length})
              </Badge>
            ) : (
              <>
                {selectedTeachers.slice(0, 2).map((teacher) => (
                  <Badge
                    key={teacher.id}
                    variant="secondary"
                    className="gap-1"
                  >
                    {teacher.fullName}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => handleRemoveTeacher(teacher.id, e)}
                    />
                  </Badge>
                ))}
                {selectedTeachers.length > 2 && (
                  <Badge variant="secondary">
                    +{selectedTeachers.length - 2} mais
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[500px] p-0"
        align="start"
        onWheel={(e) => {
          // Permite scroll do mouse dentro do popover
          e.stopPropagation();
        }}
      >
        <Command shouldFilter={false} className="overflow-hidden">
          <CommandInput
            placeholder="Buscar por nome, departamento ou matrícula..."
            value={search}
            onValueChange={setSearch}
          />
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 text-xs"
            >
              {allSelected ? "Desmarcar todos" : "Selecionar todos"}
            </Button>
            {value.length > 0 && (
              <>
                <span className="text-xs text-muted-foreground">
                  {value.length} selecionado(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 text-xs ml-auto"
                >
                  Limpar
                </Button>
              </>
            )}
          </div>
          <CommandList
            className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent"
            style={{ touchAction: 'pan-y' }}
            onWheel={(e) => {
              // Garante que o scroll do mouse funcione
              e.stopPropagation();
            }}
          >
            <CommandEmpty>Nenhum professor encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredTeachers.map((teacher) => {
                const isSelected = value.includes(teacher.id);
                return (
                  <CommandItem
                    key={teacher.id}
                    value={teacher.id}
                    onSelect={() => handleToggle(teacher.id)}
                    disabled={false}
                    className="cursor-pointer hover:bg-accent/50 aria-selected:bg-accent/50 transition-colors py-3 !opacity-100 ![pointer-events:all] min-h-[48px] select-none"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggle(teacher.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {teacher.fullName}
                          </span>
                          {teacher.registrationNumber && (
                            <span className="text-xs text-muted-foreground">
                              Mat: {teacher.registrationNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {teacher.department && (
                            <span>{teacher.department}</span>
                          )}
                          {teacher.department && teacher.email && (
                            <span>•</span>
                          )}
                          {teacher.email && (
                            <span className="truncate">{teacher.email}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
