import type { Metadata } from "next";

import HelpArticleLayout from "./components/HelpArticleLayout";
import HelpCallout from "./components/HelpCallout";

export const metadata: Metadata = {
  title: "Relatórios e Exportação",
};

export default function HelpReportsPage() {
  return (
    <HelpArticleLayout
      title="Relatórios e Exportação"
      description="Gere relatórios confiáveis aplicando filtros personalizados e exporte planilhas prontas para prestação de contas."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Filtrando por período e critérios</h2>
        <p className="text-muted-foreground">
          A área de relatórios permite combinar filtros de data, turma, tipo de item e status do aluno. Configure o período inicial e final para concentrar a análise em semanas, meses ou eventos específicos.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Selecione intervalos curtos para auditorias rápidas.</li>
          <li>Utilize filtros por turma para comparar desempenho entre séries.</li>
          <li>Combine critérios para gerar relatórios prontos para reuniões e conselhos.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Exportando para Excel</h2>
        <p className="text-muted-foreground">
          Após definir os filtros, clique em “Exportar Excel”. O sistema gera automaticamente um arquivo com colunas padronizadas, facilitando o compartilhamento com a equipe financeira ou a diretoria.
        </p>
        <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
          <li>Revise o período selecionado na tela antes de exportar.</li>
          <li>Confirme o local de download no dispositivo para evitar duplicidade de arquivos.</li>
          <li>Renomeie a planilha com a data ou evento correspondente para facilitar a organização.</li>
        </ol>
      </section>

      <HelpCallout variant="tip">
        Ajuste o nome do arquivo exportado no momento do download para manter uma trilha organizada das versões enviadas à coordenação ou ao conselho escolar.
      </HelpCallout>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Corrigindo filtros antes da exportação</h2>
        <p className="text-muted-foreground">
          Se o relatório não apresentar os dados esperados, revise os filtros aplicados. Um intervalo incorreto ou a seleção de uma turma inexistente pode resultar em arquivos vazios.
        </p>
        <p className="text-muted-foreground">
          Clique em “Limpar filtros” para reiniciar a busca e configure os critérios novamente. Em seguida, gere uma nova visualização antes de exportar.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Baixando novamente após ajustes</h2>
        <p className="text-muted-foreground">
          Sempre que corrigir um filtro ou atualizar uma informação, exporte um novo arquivo. Isso garante que todos os dados enviados à coordenação reflitam a versão mais atual do sistema.
        </p>
        <p className="text-muted-foreground">
          Ao reenviar relatórios, inclua uma breve observação indicando que se trata de uma versão revisada para manter a rastreabilidade documental.
        </p>
      </section>
    </HelpArticleLayout>
  );
}
