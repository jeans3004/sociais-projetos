import type { Metadata } from "next";

import HelpArticleLayout from "./components/HelpArticleLayout";
import HelpCallout from "./components/HelpCallout";

export const metadata: Metadata = {
  title: "Registrar e Gerenciar Doações",
};

export default function HelpDonationsPage() {
  return (
    <HelpArticleLayout
      title="Registrar e Gerenciar Doações"
      description="Domine o fluxo de lançamento, filtros e correções das doações para manter o histórico confiável e atualizado."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Iniciando um novo registro</h2>
        <p className="text-muted-foreground">
          Clique em “Registrar doação” para abrir o formulário. Informe a turma, o aluno, o item entregue, quantidade e unidade de medida. Campos opcionais como observações ajudam a contextualizar situações especiais.
        </p>
        <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
          <li>Confirme se o aluno está ativo na lista para evitar inconsistências.</li>
          <li>Utilize unidades padronizadas (kg, un, lt) para garantir relatórios comparáveis.</li>
          <li>Salve o registro e aguarde a confirmação visual de sucesso antes de fechar o modal.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Aplicando filtros avançados</h2>
        <p className="text-muted-foreground">
          A lista de doações possui filtros por período, turma, aluno e tipo de item. Combine critérios para localizar lançamentos específicos ou conferir metas semanais.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Filtre por data para validar eventos pontuais como mutirões ou campanhas temáticas.</li>
          <li>Use o campo de busca para encontrar rapidamente um item específico.</li>
          <li>Limpe os filtros ao finalizar a análise para retornar à visão geral.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Revisando e corrigindo lançamentos</h2>
        <p className="text-muted-foreground">
          Caso identifique um registro incorreto, utilize a opção “Editar” para ajustar informações antes de confirmar a exclusão. Atualizações são refletidas automaticamente no dashboard e nos relatórios.
        </p>
      </section>

      <HelpCallout variant="warning">
        Exclusões são definitivas e não podem ser desfeitas. Analise com atenção antes de remover um lançamento e comunique a equipe responsável quando houver necessidade de correção.
      </HelpCallout>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Refazendo registros incorretos</h2>
        <p className="text-muted-foreground">
          Se for preciso refazer uma doação, exclua o registro incorreto e crie um novo lançamento com os dados corretos. Utilize as observações para registrar o motivo da correção e manter a rastreabilidade.
        </p>
        <p className="text-muted-foreground">
          Quando o erro estiver relacionado à turma ou ao aluno selecionado, verifique primeiro a situação do cadastro em “Gerenciar Alunos”. Ajustes por lá garantirão que o novo lançamento seja vinculado ao estudante correto.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Boas práticas de conferência</h2>
        <p className="text-muted-foreground">
          Revise os lançamentos ao final de cada dia de campanha, especialmente após eventos maiores. Gere um relatório rápido para comparar com as planilhas físicas e evitar divergências futuras.
        </p>
      </section>
    </HelpArticleLayout>
  );
}
