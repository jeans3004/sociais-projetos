"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  UserCog,
  Ticket,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "user"],
  },
  {
    title: "Alunos",
    href: "/dashboard/alunos",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Doações",
    href: "/dashboard/doacoes",
    icon: DollarSign,
    roles: ["admin", "user"],
  },
  {
    title: "Rifa",
    href: "/dashboard/rifa",
    icon: Ticket,
    roles: ["admin", "user"],
  },
  {
    title: "Relatórios",
    href: "/dashboard/relatorios",
    icon: FileText,
    roles: ["admin", "user"],
  },
  {
    title: "Usuários",
    href: "/dashboard/usuarios",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
    roles: ["admin"],
  },
  {
    title: "Ajuda",
    href: "/dashboard/ajuda",
    icon: LifeBuoy,
    roles: ["admin", "user"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você saiu do sistema com sucesso.",
      });
      router.push("/auth/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível fazer logout. Tente novamente.",
      });
    }
  };

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <div className="flex h-full flex-col bg-card border-r">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
            CM
          </div>
          <span className="text-lg font-semibold">Doações CM</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <Link
          href="/transparencia"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/20">
            <ShieldCheck className="h-5 w-5 transition group-hover:scale-110" />
            Portal da Transparência
          </div>
        </Link>
      </div>

      <div className="p-3 border-t">
        {user && (
          <div className="px-3 py-2 mb-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-xs">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}
