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
import { Teacher } from "@/types";

interface TeacherComboboxProps {
  teachers: Teacher[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TeacherCombobox({
  teachers,
  value,
  onValueChange,
  placeholder = "Selecione um professor...",
  disabled = false,
}: TeacherComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedTeacher = teachers.find((teacher) => teacher.id === value);

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
          {selectedTeacher ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-medium truncate">{selectedTeacher.fullName}</span>
              {selectedTeacher.department && (
                <span className="text-xs text-muted-foreground">
                  {selectedTeacher.department}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false} className="overflow-hidden">
          <CommandInput
            placeholder="Buscar por nome, departamento ou matrícula..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[400px] overflow-y-auto">
            <CommandEmpty>Nenhum professor encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredTeachers.map((teacher) => (
                <CommandItem
                  key={teacher.id}
                  value={teacher.id}
                  keywords={[
                    teacher.fullName,
                    teacher.department || "",
                    teacher.email || "",
                    teacher.registrationNumber || "",
                  ]}
                  onSelect={() => {
                    onValueChange(teacher.id === value ? "" : teacher.id);
                    setOpen(false);
                  }}
                  disabled={false}
                  className="cursor-pointer hover:bg-accent/50 aria-selected:bg-accent/50 transition-colors py-3 !opacity-100 ![pointer-events:all]"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === teacher.id ? "opacity-100" : "opacity-0"
                    )}
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
                        <span>{teacher.email}</span>
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
