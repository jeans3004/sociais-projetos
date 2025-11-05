"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.status === "pending") {
        router.push("/auth/aguardando-aprovacao");
      } else if (user.status === "rejected") {
        router.push("/auth/login");
      }
      // Se status for undefined (usuários antigos), permite acesso
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Permite acesso se: usuário existe E (status é approved OU status é undefined/não existe)
  if (!user) {
    return null;
  }

  if (user.status === "rejected") {
    return null;
  }

  if (user.status === "pending") {
    return null;
  }

  return <>{children}</>;
}
