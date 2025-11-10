"use client";

import Link from "next/link";
import { BookOpenCheck, Compass, LifeBuoy, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

import { HELP_ARTICLES, FAQ_ITEMS } from "@/app/(public)/ajuda/articles";
import HelpAccordion from "@/app/(public)/ajuda/components/HelpAccordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_TIPS = [
  {
    title: "Como começar",
    description:
      "Revise suas permissões, personalize os dados da campanha e conheça o painel antes de registrar informações.",
    checklist: [
      "Confirme o e-mail institucional liberado pelo administrador.",
      "Complete as metas e dados da escola na área de Configurações.",
      "Explore o Dashboard para entender o progresso inicial das arrecadações.",
    ],
  },
  {
    title: "Registro diário de doações",
    description:
      "Mantenha os lançamentos organizados com registros frequentes e verificação dos dados dos alunos.",
    checklist: [
      "Busque o aluno ou a turma antes de lançar uma nova contribuição.",
      "Utilize filtros por período para evitar lançamentos duplicados.",
      "Corrija valores incorretos editando ou removendo o registro imediatamente.",
    ],
  },
  {
    title: "Acompanhe e compartilhe resultados",
    description:
      "Use relatórios para comunicar o desempenho da campanha a toda a comunidade escolar.",
    checklist: [
      "Filtre por período para comparar semanas ou meses de arrecadação.",
      "Exporte planilhas em Excel para apresentar os números em reuniões.",
      "Monitore os indicadores do Dashboard para celebrar conquistas com os alunos.",
    ],
  },
];

const SUPPORT_HIGHLIGHTS = [
  {
    icon: Compass,
    label: "Guias passo a passo",
    description: "Leia os artigos completos com capturas de tela e instruções detalhadas para cada área do painel.",
    href: "/ajuda",
    actionLabel: "Abrir Central de Ajuda",
  },
  {
    icon: MessageCircle,
    label: "FAQ resolutiva",
    description: "Encontre respostas rápidas para dúvidas sobre login, exportações e organização de turmas.",
    href: "/ajuda/faq",
    actionLabel: "Ler FAQ completa",
  },
  {
    icon: LifeBuoy,
    label: "Precisa de atendimento?",
    description: "Se o artigo não resolver o problema, registre um chamado com o time administrador da campanha.",
    href: "mailto:suporte@doacoes-escolares.com",
    actionLabel: "Falar com o suporte",
  },
];

export default function AjudaPage() {
  return (
    <div className="space-y-12 bg-slate-50/60 p-6 pb-16 lg:p-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-8 text-white shadow-xl">
        <div className="space-y-6 md:max-w-3xl">
          <Badge
            variant="secondary"
            className="w-fit bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm"
          >
            Central de Ajuda
          </Badge>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">Tire suas dúvidas e aproveite o sistema ao máximo</h1>
            <p className="text-base text-white/80 md:text-lg">
              Reunimos dicas, tutoriais e perguntas frequentes para que sua equipe mantenha o registro de doações sempre atualizado.
              Pesquise artigos completos, encontre respostas rápidas ou fale com o suporte quando precisar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link href="/ajuda">
                <BookOpenCheck className="mr-2 h-5 w-5" aria-hidden />
                Acessar artigos completos
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
              <Link href="/ajuda/faq">
                <MessageCircle className="mr-2 h-5 w-5" aria-hidden />
                Consultar FAQ rápida
              </Link>
            </Button>
          </div>
        </div>
        <Sparkles className="absolute -right-12 -top-10 h-48 w-48 text-white/20" aria-hidden />
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">Dicas práticas para o dia a dia</h2>
          <p className="text-sm text-slate-600">
            Utilize o passo a passo abaixo para garantir que o registro das doações continue seguro, organizado e transparente para toda a comunidade escolar.
          </p>
        </header>
        <div className="grid gap-4 lg:grid-cols-3">
          {QUICK_TIPS.map((tip) => (
            <Card key={tip.title} className="h-full border-none bg-white/90 shadow-md shadow-primary/5">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                  {tip.title}
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">{tip.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-2 text-sm text-slate-600">
                  {tip.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">Recursos que resolvem dúvidas rapidamente</h2>
          <p className="text-sm text-slate-600">
            Acesse orientações aprofundadas, respostas rápidas ou abra um chamado com nossa equipe gestora.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SUPPORT_HIGHLIGHTS.map((item) => (
            <Card key={item.label} className="flex h-full flex-col border border-slate-200 bg-white">
              <CardHeader className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <item.icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </div>
                <CardDescription className="text-sm text-slate-600">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild variant="outline" className="w-full">
                  {item.href.startsWith("mailto:") ? (
                    <a href={item.href}>
                      {item.actionLabel}
                    </a>
                  ) : (
                    <Link href={item.href}>{item.actionLabel}</Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">Principais tópicos de ajuda</h2>
          <p className="text-sm text-slate-600">
            Veja um resumo das áreas mais acessadas. Clique para abrir o artigo completo com instruções ilustradas.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {HELP_ARTICLES.map((article) => (
            <Card key={article.slug} className="border border-slate-200 bg-white">
              <CardHeader className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  <article.icon className="h-4 w-4 text-primary" aria-hidden />
                  {article.category}
                </div>
                <CardTitle className="text-lg text-slate-900">{article.title}</CardTitle>
                <CardDescription className="text-sm text-slate-600">{article.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="px-0 text-primary hover:text-primary">
                  <Link href={`/ajuda/${article.slug}`}>Ler artigo</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">FAQ: respostas imediatas</h2>
          <p className="text-sm text-slate-600">
            Problemas comuns podem ser resolvidos em poucos passos. Consulte as perguntas abaixo ou abra a FAQ completa.
          </p>
        </header>
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-6">
            <HelpAccordion items={FAQ_ITEMS} defaultValue={FAQ_ITEMS[0].question} />
            <div className="mt-6 text-right">
              <Button asChild variant="outline" size="sm">
                <Link href="/ajuda/faq">Ver todas as perguntas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
