"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.status === "pending") {
        router.push("/auth/aguardando-aprovacao");
      } else if (user.status === "rejected") {
        router.push("/auth/login");
      } else {
        // Usuário aprovado ou sem status (antigo) - permite acesso
        router.push("/dashboard/dashboard");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}
