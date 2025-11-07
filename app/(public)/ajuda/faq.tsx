import type { Metadata } from "next";

import HelpArticleLayout from "./components/HelpArticleLayout";
import HelpCallout from "./components/HelpCallout";
import HelpAccordion from "./components/HelpAccordion";
import { FAQ_ITEMS } from "./articles";

export const metadata: Metadata = {
  title: "Solução de Problemas (FAQ)",
};

export default function HelpFaqPage() {
  return (
    <HelpArticleLayout
      title="Solução de Problemas (FAQ)"
      description="Consulte respostas rápidas para dúvidas recorrentes e resolva situações comuns sem acionar o suporte."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Como utilizar esta seção</h2>
        <p className="text-muted-foreground">
          As perguntas e respostas abaixo reúnem orientações diretas para resolver os problemas mais frequentes. Clique sobre cada tópico para abrir a explicação correspondente.
        </p>
      </section>

      <HelpCallout variant="info">
        Se a dúvida persistir após seguir as instruções, registre a ocorrência no canal oficial da coordenação com o máximo de detalhes possíveis.
      </HelpCallout>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Perguntas frequentes</h2>
        <div className="rounded-xl border border-border/60 bg-background/90 p-2 shadow-sm sm:p-4">
          <HelpAccordion items={FAQ_ITEMS} defaultValue={FAQ_ITEMS[0].question} />
        </div>
      </section>
    </HelpArticleLayout>
  );
}
