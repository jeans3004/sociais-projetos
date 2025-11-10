import type { Metadata } from "next";

import HelpCenterContent from "./components/HelpCenterContent";

export const metadata: Metadata = {
  title: "Central de Ajuda",
  description:
    "Encontre guias passo a passo, perguntas frequentes e dicas rápidas para aproveitar todos os recursos do Sistema de Doações Escolares.",
};

export default function HelpCenterPage() {
  return <HelpCenterContent />;
}
