import type { Metadata } from "next";

import HelpArticleLayout from "./components/HelpArticleLayout";
import HelpCallout from "./components/HelpCallout";

export const metadata: Metadata = {
  title: "Configurações do Sistema",
};

export default function HelpSettingsPage() {
  return (
    <HelpArticleLayout
      title="Configurações do Sistema"
      description="Personalize dados institucionais, metas e parâmetros gerais para manter o painel alinhado às informações oficiais da escola."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Atualizando dados da escola</h2>
        <p className="text-muted-foreground">
          Mantenha o nome da escola, o logotipo e as informações de contato sempre atualizados. Esses dados aparecem em relatórios e no painel público de transparência quando habilitado.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Revise a ortografia e siglas para manter a comunicação institucional uniforme.</li>
          <li>Utilize imagens em alta resolução para garantir um visual nítido.</li>
          <li>Informe um e-mail válido para retorno de dúvidas da comunidade.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Definindo o ano letivo e as metas</h2>
        <p className="text-muted-foreground">
          Ajuste o ano letivo vigente para organizar o histórico das campanhas. Ao alterar esse campo, todas as visualizações são reindexadas, mantendo a referência temporal correta.
        </p>
        <p className="text-muted-foreground">
          Estabeleça a meta principal de arrecadação com base no planejamento anual. O dashboard utilizará esse valor para calcular o progresso geral da campanha.
        </p>
      </section>

      <HelpCallout variant="success">
        Sempre que atualizar metas, comunique a mudança para a equipe e destaque a nova referência nas divulgações externas.
      </HelpCallout>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Monitorando a versão do sistema</h2>
        <p className="text-muted-foreground">
          A seção de informações técnicas mostra a versão atual da plataforma e o histórico das últimas atualizações relevantes. Consulte essa área para acompanhar novidades ou correções aplicadas pela equipe de tecnologia.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Restaurando valores anteriores</h2>
        <p className="text-muted-foreground">
          Caso uma configuração precise retornar ao padrão, utilize o botão de restauração disponibilizado em cada bloco. O sistema recupera automaticamente o último valor confirmado.
        </p>
        <p className="text-muted-foreground">
          Para mudanças críticas, como redefinição de metas, registre a justificativa em um canal interno. Isso facilita auditorias futuras e garante transparência com a comunidade escolar.
        </p>
      </section>
    </HelpArticleLayout>
  );
}
