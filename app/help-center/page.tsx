import { Metadata } from "next";

import { HelpCenterContent } from "@/components/help-center/help-center-content";

export const metadata: Metadata = {
  title: "Central de Ajuda",
  description:
    "Acesse tutoriais, perguntas frequentes e dicas práticas para aproveitar todos os recursos da plataforma Sociais.",
};

export default function HelpCenterPage() {
  return <HelpCenterContent />;
}
