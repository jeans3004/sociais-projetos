import type { Metadata } from "next";

import { HELP_ARTICLES } from "@/app/(public)/ajuda/articles";
import HelpCenterContent from "@/app/(public)/ajuda/components/HelpCenterContent";

export const metadata: Metadata = {
  title: "Central de Ajuda",
  description:
    "Encontre guias passo a passo, perguntas frequentes e dicas rápidas para aproveitar todos os recursos do Sistema de Doações Escolares.",
};

export default function HelpCenterDashboardPage() {
  return <HelpCenterContent articles={HELP_ARTICLES} />;
}
