"use client";

import * as React from "react";
import { ChevronsUpDown, X } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Student } from "@/types";
import {
  groupStudentsHierarchically,
  getSortedCoordinations,
  getSortedGrades,
  getSortedClasses,
  countStudentsInCoordination,
  countStudentsInGrade,
} from "@/lib/utils/groupStudents";

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

  // Agrupar estudantes hierarquicamente quando não há busca
  const groupedStudents = React.useMemo(
    () => groupStudentsHierarchically(students),
    [students]
  );

  const coordinations = React.useMemo(
    () => getSortedCoordinations(groupedStudents),
    [groupedStudents]
  );

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
      <PopoverContent className="w-[500px] p-0" align="start">
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
          <CommandList className="max-h-[400px] overflow-y-auto overflow-x-hidden">
            {search ? (
              // Modo de busca: mostrar resultados filtrados com checkboxes
              <>
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
              </>
            ) : (
              // Modo de navegação: mostrar grupos hierárquicos com checkboxes
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
                                                {studentsInClass.map((student) => {
                                                  const isSelected = value.includes(student.id);
                                                  return (
                                                    <div
                                                      key={student.id}
                                                      onClick={() => handleToggle(student.id)}
                                                      className={cn(
                                                        "flex items-center gap-2 px-2 py-2 rounded-sm cursor-pointer hover:bg-accent/50 transition-colors",
                                                        isSelected && "bg-accent"
                                                      )}
                                                    >
                                                      <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleToggle(student.id)}
                                                        onClick={(e) => e.stopPropagation()}
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
                                                  );
                                                })}
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
