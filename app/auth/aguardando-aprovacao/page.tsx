"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AguardandoAprovacaoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você saiu do sistema.",
      });
      router.push("/auth/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível fazer logout.",
      });
    }
  }, [router, toast]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.status === "approved") {
        router.push("/dashboard/dashboard");
      } else if (user.status === "rejected") {
        handleSignOut();
      }
    }
  }, [user, loading, router, handleSignOut]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.status === "rejected") {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Clock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Acesso Bloqueado</CardTitle>
          <CardDescription>
            Aguardando liberação do administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="mb-2">
              <span className="font-semibold">Olá, {user.name}!</span>
            </p>
            <p className="text-muted-foreground">
              Seu cadastro foi realizado com sucesso, mas o acesso ao sistema
              está bloqueado. Um administrador precisa revisar e aprovar
              sua solicitação antes que você possa acessar o sistema.
            </p>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm">
            <p className="font-medium text-yellow-900 mb-1">O que fazer agora?</p>
            <ul className="list-disc list-inside text-yellow-800 space-y-1">
              <li>Aguarde a aprovação do administrador</li>
              <li>Entre em contato com o administrador do sistema</li>
              <li>Você pode clicar em &quot;Verificar Status&quot; para atualizar</li>
              <li>Faça logout e tente novamente mais tarde</li>
            </ul>
          </div>

          <div className="space-y-2 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.refresh()}
            >
              Verificar Status
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p className="mb-2"><strong>Seu email cadastrado:</strong></p>
            <p className="font-mono text-xs bg-muted px-2 py-1 rounded">{user.email}</p>
            <p className="mt-3">Dúvidas? Entre em contato com o administrador do sistema.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
