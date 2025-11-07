"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { RoleGuard } from "@/components/RoleGuard";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/lib/validators";
import { Settings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateSettings, updateSettings } from "@/lib/firebase/settings";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Save } from "lucide-react";

type SettingsFormData = Omit<Settings, "id" | "updatedAt" | "updatedBy" | "paymentMethods">;

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrCreateSettings();
      setSettings(data);
      reset({
        schoolName: data.schoolName,
        monthlyGoal: data.monthlyGoal,
        yearlyGoal: data.yearlyGoal,
        academicYear: data.academicYear,
      });
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações.",
      });
    } finally {
      setLoading(false);
    }
  }, [reset, toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onSubmit = async (data: SettingsFormData) => {
    if (!user) return;

    try {
      setSaving(true);
      await updateSettings(data, user.id);
      await loadSettings();
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Escola</CardTitle>
            <CardDescription>
              Configure as informações básicas da escola
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName">Nome da Escola *</Label>
              <Input
                id="schoolName"
                {...register("schoolName")}
                placeholder="Nome da escola"
              />
              {errors.schoolName && (
                <p className="text-sm text-destructive">
                  {errors.schoolName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear">Ano Letivo *</Label>
              <Input
                id="academicYear"
                {...register("academicYear")}
                placeholder="2024"
              />
              {errors.academicYear && (
                <p className="text-sm text-destructive">
                  {errors.academicYear.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metas de Arrecadação</CardTitle>
            <CardDescription>
              Configure as metas mensais e anuais de doações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyGoal">Meta Mensal (R$) *</Label>
                <Input
                  id="monthlyGoal"
                  type="number"
                  step="0.01"
                  {...register("monthlyGoal", { valueAsNumber: true })}
                  placeholder="10000.00"
                />
                {errors.monthlyGoal && (
                  <p className="text-sm text-destructive">
                    {errors.monthlyGoal.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearlyGoal">Meta Anual (R$) *</Label>
                <Input
                  id="yearlyGoal"
                  type="number"
                  step="0.01"
                  {...register("yearlyGoal", { valueAsNumber: true })}
                  placeholder="120000.00"
                />
                {errors.yearlyGoal && (
                  <p className="text-sm text-destructive">
                    {errors.yearlyGoal.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Versão:</span> 1.0.0
            </p>
            <p>
              <span className="font-medium">Última atualização:</span>{" "}
              {settings?.updatedAt
                ? new Date(settings.updatedAt.toDate()).toLocaleString("pt-BR")
                : "N/A"}
            </p>
            <p>
              <span className="font-medium">Atualizado por:</span>{" "}
              {settings?.updatedBy || "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
        </div>
      )}
    </RoleGuard>
  );
}
