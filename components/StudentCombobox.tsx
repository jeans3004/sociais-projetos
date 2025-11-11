"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, formatGradeLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

interface StudentComboboxProps {
  students: Student[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function StudentCombobox({
  students,
  value,
  onValueChange,
  placeholder = "Selecione um aluno...",
  disabled = false,
}: StudentComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedStudent = students.find((student) => student.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedStudent ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium truncate">{selectedStudent.fullName}</span>
              <span className="text-xs text-muted-foreground">
                {formatGradeLabel(selectedStudent.grade)} - {selectedStudent.class}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por nome, série, turma ou matrícula..." />
          <CommandList>
            <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
            <CommandGroup>
              {students.map((student) => {
                const keywords = [
                  student.class,
                  formatGradeLabel(student.grade),
                  student.registrationNumber || "",
                  student.shift || "",
                ].join(" ");

                return (
                  <CommandItem
                    key={student.id}
                    value={student.fullName}
                    keywords={[keywords]}
                    onSelect={() => {
                      onValueChange(student.id === value ? "" : student.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer hover:bg-accent/50 aria-selected:bg-accent/50 transition-colors py-3"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === student.id ? "opacity-100" : "opacity-0"
                      )}
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
                        <span>{formatGradeLabel(student.grade)}</span>
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
