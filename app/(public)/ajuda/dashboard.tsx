import type { Metadata } from "next";

import HelpArticleLayout from "./components/HelpArticleLayout";
import HelpCallout from "./components/HelpCallout";

export const metadata: Metadata = {
  title: "Dashboard (Resumo das Doações)",
};

export default function HelpDashboardPage() {
  return (
    <HelpArticleLayout
      title="Dashboard (Resumo das Doações)"
      description="Navegue pelos cards, gráficos e rankings do painel principal para acompanhar a evolução das arrecadações em tempo real."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">O que você encontra no painel inicial</h2>
        <p className="text-muted-foreground">
          O dashboard reúne indicadores essenciais para avaliar o desempenho da campanha sem esforço. Ao acessar o sistema, você visualiza imediatamente os totais de doações, metas, itens mais entregues e engajamento por turma.
        </p>
        <p className="text-muted-foreground">
          Os números são atualizados sempre que uma nova doação é registrada ou quando algum ajuste é realizado. Utilize esse espaço como sua referência diária para planejar ações e priorizar as turmas que precisam de reforço.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Cards de resumo</h2>
        <p className="text-muted-foreground">
          Na parte superior do painel, os cards apresentam os dados consolidados da campanha. Cada card destaca um indicador chave e traz comparativos com o período anterior.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li><span className="font-semibold text-foreground">Total de itens arrecadados:</span> soma geral das doações registradas.</li>
          <li><span className="font-semibold text-foreground">Valor estimado:</span> conversão das arrecadações em valor financeiro para dar dimensão do impacto.</li>
          <li><span className="font-semibold text-foreground">Turma destaque:</span> identifica a sala com melhor desempenho no período.</li>
          <li><span className="font-semibold text-foreground">Participação ativa:</span> quantifica quantos alunos contribuíram pelo menos uma vez.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Gráfico de evolução</h2>
        <p className="text-muted-foreground">
          A área de gráficos apresenta a distribuição das doações ao longo do tempo. Passe o cursor sobre os pontos para ver detalhes e identificar oscilações ou campanhas específicas.
        </p>
        <p className="text-muted-foreground">
          É possível comparar picos de arrecadação com eventos realizados na escola. Use essas informações para replicar ações bem-sucedidas e ajustar períodos de menor engajamento.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Ranking de turmas</h2>
        <p className="text-muted-foreground">
          O ranking lista as turmas com maior contribuição, ordenadas pelo total de itens. Além do posicionamento, você visualiza quantidade arrecadada e número de doadores únicos.
        </p>
        <p className="text-muted-foreground">
          Utilize o ranking para reconhecer publicamente os alunos, estimular a competição saudável e definir metas personalizadas por segmento ou série.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Barra de progresso da meta</h2>
        <p className="text-muted-foreground">
          Ao lado dos cards, a barra de progresso mostra o percentual atingido em relação à meta definida nas configurações. Ela considera a quantidade total de itens arrecadados e atualiza automaticamente.
        </p>
        <p className="text-muted-foreground">
          Quando o indicador se aproximar de 100%, planeje a comunicação de encerramento da campanha e avalie a definição de uma meta complementar para manter o engajamento.
        </p>
      </section>

      <HelpCallout variant="warning">
        A exclusão de registros impacta imediatamente os indicadores e <span className="font-semibold">não há ação de desfazer</span>. Antes de remover uma doação, confirme com a equipe responsável se o ajuste é realmente necessário.
      </HelpCallout>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Rotina sugerida de acompanhamento</h2>
        <p className="text-muted-foreground">
          Reserve alguns minutos diariamente para revisar os indicadores do dashboard. Dessa forma você identifica desvios rapidamente e aciona as áreas corretas para manter a campanha saudável.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Monitore os cards principais e anote variações significativas.</li>
          <li>Observe o gráfico para detectar queda de arrecadação e planejar ações de recuperação.</li>
          <li>Compartilhe o ranking semanalmente com a comunidade escolar para manter a motivação.</li>
        </ul>
      </section>
    </HelpArticleLayout>
  );
}
