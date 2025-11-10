import { Compass, LayoutDashboard, GraduationCap, Coins, FileSpreadsheet, Settings, LifeBuoy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface HelpArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  icon: LucideIcon;
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "visao-geral",
    title: "Visão Geral e Login",
    description:
      "Conheça o propósito do sistema, aprenda a acessar com o Google e saiba como proceder em caso de acesso não autorizado.",
    category: "Primeiros Passos",
    keywords: ["introdução", "login", "google", "autorização"],
    icon: Compass,
  },
  {
    slug: "dashboard",
    title: "Dashboard (Resumo das Doações)",
    description:
      "Entenda os cards, gráficos e indicadores do painel principal para acompanhar o desempenho das arrecadações.",
    category: "Monitoramento",
    keywords: ["dashboard", "resumo", "indicadores", "gráficos"],
    icon: LayoutDashboard,
  },
  {
    slug: "alunos",
    title: "Gerenciar Alunos",
    description:
      "Veja como buscar, cadastrar, editar e arquivar alunos com segurança, mantendo a lista sempre atualizada.",
    category: "Gestão",
    keywords: ["alunos", "cadastro", "edição", "status"],
    icon: GraduationCap,
  },
  {
    slug: "doacoes",
    title: "Registrar e Gerenciar Doações",
    description:
      "Aprenda a registrar novas doações, aplicar filtros, corrigir lançamentos e manter o histórico organizado.",
    category: "Operações",
    keywords: ["doação", "registro", "filtros", "excluir"],
    icon: Coins,
  },
  {
    slug: "relatorios",
    title: "Relatórios e Exportação",
    description:
      "Configure filtros por período, exporte planilhas em Excel e saiba como gerar arquivos atualizados em caso de ajustes.",
    category: "Análises",
    keywords: ["relatórios", "excel", "exportar", "período"],
    icon: FileSpreadsheet,
  },
  {
    slug: "configuracoes",
    title: "Configurações do Sistema",
    description:
      "Customize dados institucionais, metas da campanha e acompanhe a versão do sistema com histórico de alterações.",
    category: "Administração",
    keywords: ["configurações", "metas", "versão", "restaurar"],
    icon: Settings,
  },
  {
    slug: "faq",
    title: "Solução de Problemas (FAQ)",
    description:
      "Encontre respostas rápidas para as dúvidas mais frequentes e resolva situações comuns em poucos passos.",
    category: "Suporte",
    keywords: ["faq", "problemas", "login", "exportação"],
    icon: LifeBuoy,
  },
];

export const FAQ_ITEMS = [
  {
    question: "Não consigo fazer login",
    answer:
      "Verifique se está usando a conta institucional autorizada. Caso o aviso de usuário não autorizado continue aparecendo, peça ao administrador para liberar seu acesso e tente novamente após receber a confirmação.",
  },
  {
    question: "Aluno não aparece nas doações",
    answer:
      "Confirme se o aluno está cadastrado como ativo na área de gerenciamento. Se estiver inativo ou recém-criado, atualize a página de registro de doações para carregar a lista mais recente.",
  },
  {
    question: "Dados não atualizam",
    answer:
      "Atualize o navegador ou acesse novamente o dashboard. Mudanças recentes podem levar alguns segundos para refletir; se persistir, limpe o cache ou abra o sistema em uma janela anônima.",
  },
  {
    question: "Erro ao exportar Excel",
    answer:
      "Garanta que um período válido foi selecionado e que há registros dentro do filtro aplicado. Em caso de falha, tente gerar novamente após alguns instantes.",
  },
] as const;

export type FaqItem = (typeof FAQ_ITEMS)[number];
