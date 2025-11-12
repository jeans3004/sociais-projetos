"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn, formatGradeLabel } from "@/lib/utils";
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
import { Student } from "@/types";

interface StudentMultiSelectProps {
  students: Student[];
  value: string[]; // Array de IDs selecionados
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function StudentMultiSelect({
  students,
  value = [],
  onValueChange,
  placeholder = "Selecione aluno(s)...",
  disabled = false,
}: StudentMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedStudents = students.filter((student) =>
    value.includes(student.id)
  );

  const allSelected = students.length > 0 && value.length === students.length;

  const filteredStudents = React.useMemo(() => {
    if (!search) return students;

    const searchLower = search.toLowerCase();
    return students.filter((student) => {
      const searchableText = [
        student.fullName,
        student.class,
        formatGradeLabel(student.grade, student.coordination),
        student.registrationNumber || "",
        student.shift || "",
      ].join(" ").toLowerCase();

      return searchableText.includes(searchLower);
    });
  }, [students, search]);

  const handleToggle = (studentId: string) => {
    const newValue = value.includes(studentId)
      ? value.filter((id) => id !== studentId)
      : [...value, studentId];
    onValueChange(newValue);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onValueChange([]);
    } else {
      onValueChange(students.map((s) => s.id));
    }
  };

  const handleClearAll = () => {
    onValueChange([]);
  };

  const handleRemoveStudent = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value.filter((id) => id !== studentId));
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
            ) : (
              <>
                {selectedStudents.slice(0, 2).map((student) => (
                  <Badge
                    key={student.id}
                    variant="secondary"
                    className="gap-1"
                  >
                    {student.fullName}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => handleRemoveStudent(student.id, e)}
                    />
                  </Badge>
                ))}
                {selectedStudents.length > 2 && (
                  <Badge variant="secondary">
                    +{selectedStudents.length - 2} mais
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
            placeholder="Buscar por nome, série, turma ou matrícula..."
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
            className="max-h-[300px] overflow-y-auto"
            onWheel={(e) => {
              // Garante que o scroll do mouse funcione
              e.stopPropagation();
            }}
          >
            <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredStudents.map((student) => {
                const isSelected = value.includes(student.id);
                return (
                  <CommandItem
                    key={student.id}
                    value={student.id}
                    onSelect={() => handleToggle(student.id)}
                    disabled={false}
                    className="cursor-pointer hover:bg-accent/50 aria-selected:bg-accent/50 transition-colors py-3 !opacity-100 ![pointer-events:all]"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggle(student.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {student.fullName}
                          </span>
                          {student.registrationNumber && (
                            <span className="text-xs text-muted-foreground">
                              Mat: {student.registrationNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatGradeLabel(student.grade, student.coordination)}</span>
                          <span>•</span>
                          <span>Turma {student.class}</span>
                          {student.shift && (
                            <>
                              <span>•</span>
                              <span>{student.shift}</span>
                            </>
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
