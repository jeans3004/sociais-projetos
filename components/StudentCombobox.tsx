"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [search, setSearch] = React.useState("");

  const selectedStudent = students.find((student) => student.id === value);

  const filteredStudents = React.useMemo(() => {
    if (!search) return students;

    const searchLower = search.toLowerCase();
    return students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(searchLower) ||
        student.class.toLowerCase().includes(searchLower) ||
        (student.registrationNumber &&
          student.registrationNumber.toLowerCase().includes(searchLower))
    );
  }, [students, search]);

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
                {selectedStudent.grade}º Ano - {selectedStudent.class}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar aluno por nome, turma ou matrícula..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredStudents.map((student) => (
                <CommandItem
                  key={student.id}
                  value={student.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
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
                      <span>{student.grade}º Ano</span>
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
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
