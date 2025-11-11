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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/types";
import {
  groupStudentsHierarchically,
  getSortedCoordinations,
  getSortedGrades,
  getSortedClasses,
  countStudentsInCoordination,
  countStudentsInGrade,
} from "@/lib/utils/groupStudents";

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
    return students.filter((student) => {
      const searchableText = [
        student.fullName,
        student.class,
        formatGradeLabel(student.grade),
        student.registrationNumber || "",
        student.shift || "",
      ].join(" ").toLowerCase();

      return searchableText.includes(searchLower);
    });
  }, [students, search]);

  // Agrupar estudantes hierarquicamente quando não há busca
  const groupedStudents = React.useMemo(
    () => groupStudentsHierarchically(students),
    [students]
  );

  const coordinations = React.useMemo(
    () => getSortedCoordinations(groupedStudents),
    [groupedStudents]
  );

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setSearch("");
        }
      }}
    >
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
      <PopoverContent className="w-[500px] p-0 max-h-[500px]" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por nome, série, turma ou matrícula..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[450px]">
            {search ? (
              // Modo de busca: mostrar resultados filtrados
              <>
                <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                <CommandGroup>
                  {filteredStudents.map((student) => (
                    <CommandItem
                      key={student.id}
                      value={student.id}
                      onSelect={() => {
                        onValueChange(student.id === value ? "" : student.id);
                        setOpen(false);
                      }}
                      disabled={false}
                      className="cursor-pointer hover:bg-accent/50 aria-selected:bg-accent/50 transition-colors py-3 !opacity-100 ![pointer-events:all]"
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
                  ))}
                </CommandGroup>
              </>
            ) : (
              // Modo de navegação: mostrar grupos hierárquicos
              <div className="p-2">
                <Accordion type="multiple" className="w-full">
                  {coordinations.map((coordination) => {
                    const grades = groupedStudents[coordination];
                    const totalStudents = countStudentsInCoordination(grades);

                    return (
                      <AccordionItem key={coordination} value={coordination} className="border-b-0">
                        <AccordionTrigger className="hover:no-underline py-2 px-2 hover:bg-accent/50 rounded-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {coordination}
                            </span>
                            <Badge variant="secondary" className="font-normal text-xs">
                              {totalStudents}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0 pl-2">
                          <Accordion type="multiple" className="w-full">
                            {getSortedGrades(grades).map((grade) => {
                              const classes = grades[grade];
                              const gradeTotal = countStudentsInGrade(classes);

                              return (
                                <AccordionItem key={`${coordination}-${grade}`} value={grade} className="border-b-0">
                                  <AccordionTrigger className="hover:no-underline py-2 px-2 hover:bg-accent/50 rounded-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{grade}</span>
                                      <Badge variant="outline" className="font-normal text-xs">
                                        {gradeTotal}
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pb-0 pl-2">
                                    <Accordion type="multiple" className="w-full">
                                      {getSortedClasses(classes).map((className) => {
                                        const studentsInClass = classes[className];

                                        return (
                                          <AccordionItem
                                            key={`${coordination}-${grade}-${className}`}
                                            value={className}
                                            className="border-b-0"
                                          >
                                            <AccordionTrigger className="hover:no-underline py-2 px-2 hover:bg-accent/50 rounded-sm">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">
                                                  Turma {className}
                                                </span>
                                                <Badge className="font-normal text-xs">
                                                  {studentsInClass.length}
                                                </Badge>
                                              </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-2 pl-2">
                                              <div className="space-y-1">
                                                {studentsInClass.map((student) => (
                                                  <div
                                                    key={student.id}
                                                    onClick={() => {
                                                      onValueChange(student.id === value ? "" : student.id);
                                                      setOpen(false);
                                                    }}
                                                    className={cn(
                                                      "flex items-center gap-2 px-2 py-2 rounded-sm cursor-pointer hover:bg-accent/50 transition-colors",
                                                      value === student.id && "bg-accent"
                                                    )}
                                                  >
                                                    <Check
                                                      className={cn(
                                                        "h-4 w-4 shrink-0",
                                                        value === student.id ? "opacity-100" : "opacity-0"
                                                      )}
                                                    />
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                      <span className="font-medium text-sm truncate">
                                                        {student.fullName}
                                                      </span>
                                                      {student.registrationNumber && (
                                                        <span className="text-xs text-muted-foreground">
                                                          Mat: {student.registrationNumber}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </AccordionContent>
                                          </AccordionItem>
                                        );
                                      })}
                                    </Accordion>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
