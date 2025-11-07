import type { Metadata } from "next";

import HelpArticleLayout from "./components/HelpArticleLayout";
import HelpCallout from "./components/HelpCallout";

export const metadata: Metadata = {
  title: "Visão Geral e Login",
};

export default function HelpOverviewPage() {
  return (
    <HelpArticleLayout
      title="Visão Geral e Login"
      description="Conheça os objetivos do Sistema de Doações Escolares e veja como acessar a plataforma com sua conta Google institucional."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Propósito do sistema</h2>
        <p className="text-muted-foreground">
          O Sistema de Doações Escolares centraliza o registro, acompanhamento e a transparência das arrecadações realizadas pela comunidade escolar. Ele foi desenhado para simplificar o dia a dia dos responsáveis pela campanha, garantindo indicadores em tempo real, histórico confiável e integração com relatórios oficiais.
        </p>
        <p className="text-muted-foreground">
          Todas as áreas do painel foram pensadas para facilitar a gestão colaborativa: dashboards para monitoramento, cadastros de alunos, lançamentos detalhados de doações e exportações padronizadas. A Central de Ajuda acompanha essa jornada para que cada etapa seja executada com segurança.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Como realizar o login com Google</h2>
        <p className="text-muted-foreground">
          O acesso é liberado apenas para contas Google previamente autorizadas pela escola. Caso ainda não possua a permissão, solicite ao administrador responsável.
        </p>
        <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
          <li>Acesse <span className="font-medium text-foreground">https://doacoes.christmaster.com.br</span> e clique em “Entrar com Google”.</li>
          <li>Escolha a conta institucional vinculada à campanha.</li>
          <li>Permita o acesso solicitado pelo sistema para concluir a autenticação.</li>
          <li>Você será redirecionado automaticamente ao dashboard principal após a validação.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Perfis e permissões</h2>
        <p className="text-muted-foreground">
          Cada usuário autorizado recebe o perfil definido pelo time gestor. O sistema diferencia administradores, colaboradores operacionais e visualizadores, restringindo ações críticas a quem realmente precisa executá-las.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li><span className="font-semibold text-foreground">Administradores:</span> podem configurar metas, gerenciar usuários e acessar todos os relatórios.</li>
          <li><span className="font-semibold text-foreground">Equipe de registro:</span> concentra-se no cadastro de alunos e lançamento de doações.</li>
          <li><span className="font-semibold text-foreground">Visualizadores:</span> acompanham o andamento da campanha sem acesso às ações de edição.</li>
        </ul>
      </section>

      <HelpCallout variant="warning">
        Caso a mensagem <span className="font-semibold">“Usuário não autorizado”</span> apareça, confirme se está utilizando a conta correta e solicite a liberação do administrador da escola antes de tentar novamente.
      </HelpCallout>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Boas práticas iniciais</h2>
        <p className="text-muted-foreground">
          Após o primeiro acesso, revise as metas e configurações da campanha, valide se a turma e os alunos estão atualizados e explore os indicadores do dashboard para entender a linha de base da arrecadação. Utilize a Central de Ajuda sempre que surgirem dúvidas sobre uma funcionalidade específica.
        </p>
      </section>
    </HelpArticleLayout>
  );
}
