"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, UserFormData } from "@/types";
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

const userSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  role: z.enum(["admin", "user"]),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

interface UserFormProps {
  user?: User | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
}

export function UserForm({ user, open, onClose, onSubmit }: UserFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
      role: user?.role || "user",
      password: "",
    },
  });

  const roleValue = watch("role");

  const onSubmitForm = async (data: UserFormData) => {
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
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Atualize as informações do usuário."
              : "Crie um novo usuário no sistema. O login será feito com Google."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nome completo"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="usuario@email.com"
              disabled={!!user}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Usuário *</Label>
            <Select
              value={roleValue}
              onValueChange={(value) => setValue("role", value as "admin" | "user")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {roleValue === "admin"
                ? "Acesso completo ao sistema"
                : "Acesso apenas a doações e relatórios"}
            </p>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha Temporária *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                O usuário poderá alterar a senha após o primeiro login
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : user ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
