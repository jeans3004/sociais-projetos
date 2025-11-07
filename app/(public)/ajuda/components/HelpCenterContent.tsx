"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { HELP_ARTICLES, FAQ_ITEMS, type HelpArticle } from "../articles";
import HelpSidebar from "./HelpSidebar";
import HelpSearch from "./HelpSearch";
import HelpCallout from "./HelpCallout";
import HelpAccordion from "./HelpAccordion";

interface HelpCenterContentProps {
  articles?: HelpArticle[];
}

export function HelpCenterContent({ articles = HELP_ARTICLES }: HelpCenterContentProps) {
  const [query, setQuery] = useState("");

  const filteredArticles = useMemo(() => {
    if (!query) return articles;
    const normalized = query.toLowerCase();
    return articles.filter((article) => {
      return (
        article.title.toLowerCase().includes(normalized) ||
        article.description.toLowerCase().includes(normalized) ||
        article.keywords.some((keyword) => keyword.toLowerCase().includes(normalized))
      );
    });
  }, [articles, query]);

  return (
    <section className="bg-slate-50/80 py-12 sm:py-16">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:gap-12">
        <div className="lg:w-[240px] lg:flex-shrink-0">
          <HelpSidebar />
        </div>
        <div className="flex-1 space-y-10">
          <header className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4" aria-hidden />
              Suporte integrado
            </p>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Central de Ajuda
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                Encontre orientações detalhadas sobre cada área do Sistema de Doações Escolares. Pesquise por temas, explore os artigos passo a passo e resolva dúvidas sem sair do painel.
              </p>
            </div>
            <HelpSearch value={query} onValueChange={setQuery} className="max-w-xl" />
            <HelpCallout variant="tip">
              Use palavras-chave como “alunos”, “relatórios” ou “metas” para encontrar instruções específicas com mais rapidez.
            </HelpCallout>
          </header>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-foreground">Artigos disponíveis</h2>
              <span className="text-sm text-muted-foreground">
                {filteredArticles.length} {filteredArticles.length === 1 ? "resultado" : "resultados"}
              </span>
            </div>
            {filteredArticles.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Nenhum artigo encontrado</CardTitle>
                  <CardDescription>
                    Ajuste sua busca ou navegue pela lista completa na barra lateral para explorar todas as orientações disponíveis.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {filteredArticles.map((article) => {
                  const Icon = article.icon;
                  return (
                    <Card key={article.slug} className="group h-full rounded-2xl border border-border/70 transition hover:border-primary/60 hover:shadow-md">
                      <CardHeader className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          <Icon className="h-4 w-4" aria-hidden />
                          {article.category}
                        </div>
                        <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                        <CardDescription>{article.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button asChild variant="ghost" className="group/button mt-2 w-full justify-between px-0 text-primary">
                          <Link href={`/ajuda/${article.slug}`}>
                            Ler artigo completo
                            <ArrowRight className="h-4 w-4 transition group-hover/button:translate-x-1" aria-hidden />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-foreground">FAQ rápida</h2>
              <p className="text-sm text-muted-foreground">
                Veja respostas imediatas para dúvidas recorrentes. Acesse o artigo completo de FAQ para instruções passo a passo.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm">
              <HelpAccordion items={FAQ_ITEMS} defaultValue={FAQ_ITEMS[0].question} />
              <div className="mt-4 text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href="/ajuda/faq">Abrir FAQ completa</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export default HelpCenterContent;
