"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema } from "@/lib/validators";
import { Student, StudentFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudentFormProps {
  student?: Student | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => Promise<void>;
}

export function StudentForm({ student, open, onClose, onSubmit }: StudentFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: "",
      email: "",
      parentEmail: "",
      class: "",
      grade: 6,
      shift: "",
      coordination: "",
      registrationNumber: "",
      status: "active",
    },
  });

  const gradeValue = watch("grade");
  const statusValue = watch("status");
  const shiftValue = watch("shift");

  useEffect(() => {
    if (student) {
      reset({
        fullName: student.fullName,
        email: student.email || "",
        parentEmail: student.parentEmail,
        class: student.class,
        grade: student.grade,
        shift: student.shift || "",
        coordination: student.coordination || "",
        registrationNumber: student.registrationNumber || "",
        status: student.status,
      });
    } else {
      reset({
        fullName: "",
        email: "",
        parentEmail: "",
        class: "",
        grade: 6,
        shift: "",
        coordination: "",
        registrationNumber: "",
        status: "active",
      });
    }
  }, [student, reset]);

  const onSubmitForm = async (data: StudentFormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{student ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do aluno. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo *</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Nome completo do aluno"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email do Aluno</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@aluno.com (opcional)"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentEmail">Email do Responsável *</Label>
            <Input
              id="parentEmail"
              type="email"
              {...register("parentEmail")}
              placeholder="email@responsavel.com"
            />
            {errors.parentEmail && (
              <p className="text-sm text-destructive">{errors.parentEmail.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Série *</Label>
              <Select
                value={gradeValue?.toString()}
                onValueChange={(value) => setValue("grade", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      {grade}º Ano
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade && (
                <p className="text-sm text-destructive">{errors.grade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Turma *</Label>
              <Input
                id="class"
                {...register("class")}
                placeholder="Ex: 8A, 9B"
                maxLength={3}
              />
              {errors.class && (
                <p className="text-sm text-destructive">{errors.class.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shift">Turno</Label>
              <Select
                value={shiftValue}
                onValueChange={(value) => setValue("shift", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manhã">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noite">Noite</SelectItem>
                  <SelectItem value="Integral">Integral</SelectItem>
                </SelectContent>
              </Select>
              {errors.shift && (
                <p className="text-sm text-destructive">{errors.shift.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Matrícula</Label>
              <Input
                id="registrationNumber"
                {...register("registrationNumber")}
                placeholder="Número de matrícula"
              />
              {errors.registrationNumber && (
                <p className="text-sm text-destructive">
                  {errors.registrationNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coordination">Coordenação</Label>
            <Input
              id="coordination"
              {...register("coordination")}
              placeholder="Nome da coordenação"
            />
            {errors.coordination && (
              <p className="text-sm text-destructive">{errors.coordination.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={statusValue}
              onValueChange={(value: "active" | "inactive") =>
                setValue("status", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : student ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
