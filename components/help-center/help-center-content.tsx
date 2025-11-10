"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { HelpCenterCallout } from "@/components/help-center/callout";
import { HelpCenterFaqAccordion } from "@/components/help-center/faq-accordion";
import { HelpCenterSearch } from "@/components/help-center/search";
import { HelpCenterSidebar } from "@/components/help-center/sidebar-nav";

const helpCenterArticles = [
  {
    id: "overview",
    title: "Visão geral do Help Center",
    description:
      "Conheça os principais recursos e entenda como navegar pelas ferramentas de apoio às redes sociais do projeto.",
    keywords: ["introdução", "ajuda", "visão geral"],
    lastUpdated: "abril de 2024",
    sections: [
      {
        heading: "Como este centro de ajuda está organizado",
        description:
          "Agrupamos os artigos por área do sistema para que você encontre rapidamente instruções e boas práticas para cada rotina.",
        bullets: [
          "Painel de controle para acompanhar indicadores em tempo real",
          "Gestão de estudantes com importação em massa e atualizações rápidas",
          "Ferramentas de campanhas e doações com métricas financeiras",
          "Relatórios estratégicos para prestação de contas e acompanhamento",
        ],
      },
      {
        heading: "Atalhos recomendados para novos usuários",
        steps: [
          "Revise o guia de boas-vindas para configurar permissões e equipes.",
          "Acesse a seção de estudantes para importar dados ou conectar integrações existentes.",
          "Configure as metas de doações no painel de campanhas antes de iniciar uma nova ação.",
          "Ative os alertas automáticos em configurações para receber notificações importantes.",
        ],
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboards e indicadores",
    description:
      "Aprenda a personalizar widgets, acompanhar métricas em tempo real e compartilhar painéis com sua equipe.",
    keywords: ["dashboard", "indicadores", "widgets"],
    lastUpdated: "março de 2024",
    sections: [
      {
        heading: "Configuração do painel inicial",
        description:
          "Defina as métricas prioritárias para a sua organização, escolhendo entre indicadores de estudantes, doações e engajamento.",
        steps: [
          "Clique em 'Editar layout' no canto superior direito do dashboard.",
          "Escolha os widgets desejados e arraste para reorganizar a ordem.",
          "Salve o layout e compartilhe com colegas adicionando-os como colaboradores.",
        ],
      },
      {
        heading: "Boas práticas",
        bullets: [
          "Utilize filtros avançados para criar visões segmentadas por campanha ou período.",
          "Crie painéis dedicados para diretoria com indicadores financeiros consolidados.",
          "Habilite alertas automáticos para variações críticas de indicadores.",
        ],
      },
    ],
  },
  {
    id: "students",
    title: "Gestão de estudantes",
    description:
      "Centralize cadastros, importações em massa e acompanhamento de matrículas e presença.",
    keywords: ["estudantes", "cadastro", "importação"],
    lastUpdated: "fevereiro de 2024",
    sections: [
      {
        heading: "Importação de dados",
        steps: [
          "Baixe o modelo CSV disponível na página de estudantes.",
          "Preencha com as informações obrigatórias, incluindo contato de responsáveis.",
          "Envie o arquivo pelo assistente de importação e valide os campos antes de confirmar.",
        ],
      },
      {
        heading: "Monitoramento contínuo",
        bullets: [
          "Acompanhe frequência e notas por turma utilizando os filtros rápidos.",
          "Ative notificações automáticas para ausências consecutivas.",
          "Utilize comentários para registrar interações com famílias e parceiros.",
        ],
      },
    ],
  },
  {
    id: "donations",
    title: "Campanhas e doações",
    description:
      "Gerencie campanhas financeiras, acompanhe metas e gere relatórios de transparência.",
    keywords: ["doações", "campanhas", "financeiro"],
    lastUpdated: "abril de 2024",
    sections: [
      {
        heading: "Criando uma campanha",
        steps: [
          "Acesse a área de campanhas e selecione 'Nova campanha'.",
          "Defina a meta financeira, período de arrecadação e mensagem de divulgação.",
          "Compartilhe o link público gerado automaticamente ou integre com redes sociais.",
        ],
      },
      {
        heading: "Acompanhamento e transparência",
        bullets: [
          "Monitore a linha do tempo de doações com identificação do doador e forma de pagamento.",
          "Utilize o painel de conversão para entender o desempenho de cada canal.",
          "Exporte relatórios para prestação de contas com um clique.",
        ],
      },
    ],
  },
  {
    id: "reports",
    title: "Relatórios e indicadores",
    description:
      "Construa relatórios personalizados, automatize envios e exporte para PDF ou planilhas.",
    keywords: ["relatórios", "exportação", "indicadores"],
    lastUpdated: "janeiro de 2024",
    sections: [
      {
        heading: "Relatórios personalizados",
        description:
          "Combine dados de estudantes, campanhas e impacto social para compor relatórios estratégicos em minutos.",
        steps: [
          "Selecione a base de dados desejada e aplique filtros.",
          "Escolha o formato de visualização (tabela, gráfico ou resumo narrativo).",
          "Agende o envio automático por e-mail para os principais stakeholders.",
        ],
      },
      {
        heading: "Exportações rápidas",
        bullets: [
          "Faça download em PDF para apresentações ou compartilhe planilhas com equipes operacionais.",
          "Aplique máscaras de dados para preservar informações sensíveis antes de compartilhar.",
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "Configurações e permissões",
    description:
      "Controle acesso, personalize notificações e conecte integrações externas.",
    keywords: ["configurações", "permissões", "segurança"],
    lastUpdated: "março de 2024",
    sections: [
      {
        heading: "Gestão de usuários",
        bullets: [
          "Convide novos usuários definindo perfis como administrador, gestor ou colaborador.",
          "Revise solicitações pendentes na aba de aprovações.",
          "Audite atividades recentes no registro de auditoria integrado.",
        ],
      },
      {
        heading: "Integrações disponíveis",
        steps: [
          "Conecte planilhas do Google ou Excel para sincronização automática.",
          "Integre com plataformas de pagamento para registrar doações em tempo real.",
          "Ative webhooks para receber eventos em ferramentas externas.",
        ],
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Soluções de problemas",
    description:
      "Respostas para dúvidas frequentes, incidentes e canais de suporte.",
    keywords: ["erros", "suporte", "faq"],
    lastUpdated: "abril de 2024",
    sections: [
      {
        heading: "Checklist inicial",
        bullets: [
          "Confirme se o usuário possui permissões para acessar o recurso desejado.",
          "Verifique a conexão com a internet e status das integrações ativas.",
          "Consulte o status de serviços na página de transparência em tempo real.",
        ],
      },
      {
        heading: "Quando acionar o suporte",
        steps: [
          "Registre prints ou vídeos curtos para ilustrar o problema.",
          "Informe data, hora e ação realizada quando o erro ocorreu.",
          "Envie a solicitação pelo canal oficial para acompanhamento prioritário.",
        ],
      },
    ],
  },
] as const;

type HelpCenterArticle = (typeof helpCenterArticles)[number];

type HelpCenterSection = HelpCenterArticle["sections"][number];

function normalizeSection(section: HelpCenterSection) {
  const texts: string[] = [section.heading];
  if ('description' in section && section.description) {
    texts.push(section.description);
  }
  if ('bullets' in section && section.bullets) {
    texts.push(section.bullets.join(" "));
  }
  if ('steps' in section && section.steps) {
    texts.push(section.steps.join(" "));
  }
  return texts.join(" ");
}

function matchesQuery(article: HelpCenterArticle, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return false;
  }

  const searchableText = [
    article.title,
    article.description,
    article.keywords.join(" "),
    article.sections.map(normalizeSection).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

export function HelpCenterContent() {
  const [activeArticleId, setActiveArticleId] = useState<string>(helpCenterArticles[0].id);
  const [query, setQuery] = useState("");

  const faqItems = [
    {
      id: "faq-support",
      question: "Como entro em contato com o suporte técnico?",
      answer: (
        <div className="space-y-2">
          <p>
            Abra um chamado pelo botão &quot;Falar com o suporte&quot; disponível no canto inferior direito
            do sistema ou envie um e-mail para <strong>suporte@sociais.app</strong> descrevendo o
            contexto.
          </p>
          <p>
            Chamados críticos (indisponibilidade total) recebem resposta em até 1 hora útil. Questões
            operacionais são respondidas em até 1 dia útil.
          </p>
        </div>
      ),
    },
    {
      id: "faq-training",
      question: "Existe treinamento para novos integrantes da equipe?",
      answer: (
        <div className="space-y-2">
          <p>
            Sim! Disponibilizamos sessões mensais de onboarding e uma biblioteca com vídeos curtos.
            Utilize o formulário de agendamento em Configurações &gt; Treinamentos para garantir uma
            vaga.
          </p>
          <p>
            Você também pode compartilhar os artigos acima como material de apoio inicial.
          </p>
        </div>
      ),
    },
    {
      id: "faq-data",
      question: "Como solicito a remoção ou anonimização de dados?",
      answer: (
        <div className="space-y-2">
          <p>
            Acesse Configurações &gt; Privacidade e siga o fluxo de solicitação, indicando o conjunto de
            dados a ser removido ou anonimizado.
          </p>
          <p>
            Um membro da equipe de compliance confirmará o atendimento e notificará os responsáveis em
            até 72 horas.
          </p>
        </div>
      ),
    },
  ];

  const activeArticle = useMemo(
    () => helpCenterArticles.find((article) => article.id === activeArticleId) ?? helpCenterArticles[0],
    [activeArticleId]
  );

  const searchResults = useMemo(
    () => (query ? helpCenterArticles.filter((article) => matchesQuery(article, query)) : []),
    [query]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[300px,1fr] lg:gap-12">
        <aside className="space-y-6">
          <HelpCenterSearch query={query} onQueryChange={setQuery} />

          {query && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">{searchResults.length} artigo(s) encontrado(s)</p>
              <div className="mt-3 space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((article) => (
                    <button
                      key={article.id}
                      type="button"
                      className="w-full rounded-md border border-transparent bg-white/70 px-3 py-2 text-left text-sm transition hover:border-primary hover:bg-white"
                      onClick={() => setActiveArticleId(article.id)}
                    >
                      <div className="font-medium text-foreground">{article.title}</div>
                      <p className="text-xs text-muted-foreground">{article.description}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Nenhum artigo corresponde ao termo pesquisado. Tente palavras-chave diferentes.
                  </p>
                )}
              </div>
            </div>
          )}

          <HelpCenterSidebar
            items={helpCenterArticles.map((article) => ({
              id: article.id,
              title: article.title,
              description: article.description,
            }))}
            activeId={activeArticleId}
            onSelect={setActiveArticleId}
          />

          <HelpCenterCallout
            title="Precisa de ajuda imediata?"
            description="Nossa equipe está disponível de segunda a sexta, das 8h às 18h (horário de Brasília)."
          >
            <ul className="space-y-2 text-sm">
              <li>
                <strong className="font-semibold text-primary">Chat instantâneo:</strong> clique no ícone
                de suporte no canto inferior direito do painel.
              </li>
              <li>
                <strong className="font-semibold text-primary">Telefone:</strong> (11) 5555-1234
              </li>
              <li>
                <strong className="font-semibold text-primary">E-mail:</strong> suporte@sociais.app
              </li>
            </ul>
          </HelpCenterCallout>
        </aside>

        <section className="space-y-10">
          <header className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Artigo</p>
              <h1 className="text-3xl font-bold text-foreground">{activeArticle.title}</h1>
            </div>
            <p className="text-base text-muted-foreground">{activeArticle.description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Atualizado em {activeArticle.lastUpdated}</Badge>
              {activeArticle.keywords.map((keyword) => (
                <Badge key={keyword} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </header>

          <div className="space-y-8">
            {activeArticle.sections.map((section) => (
              <article key={section.heading} className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
                  {'description' in section && section.description ? (
                    <p className="mt-2 text-muted-foreground">{section.description}</p>
                  ) : null}
                </div>

                {'steps' in section && section.steps ? (
                  <ol className="space-y-3 rounded-lg border border-muted-foreground/20 bg-muted/30 p-4 text-muted-foreground">
                    {section.steps.map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="mt-1 h-6 w-6 shrink-0 rounded-full bg-primary/10 text-center text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}

                {'bullets' in section && section.bullets ? (
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Perguntas frequentes</h2>
            <HelpCenterFaqAccordion items={faqItems} />
          </div>
        </section>
      </div>
    </div>
  );
}
