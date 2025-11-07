import Link from "next/link";

import { Button } from "@/components/ui/button";

import HelpSidebar from "./HelpSidebar";

interface HelpArticleLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function HelpArticleLayout({ title, description, children }: HelpArticleLayoutProps) {
  return (
    <section className="bg-slate-50/80 py-12 sm:py-16">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:gap-12">
        <div className="lg:w-[240px] lg:flex-shrink-0">
          <HelpSidebar />
        </div>
        <article className="flex-1 space-y-10">
          <header className="space-y-4">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="transition hover:text-primary">
                    Início
                  </Link>
                </li>
                <li aria-hidden className="text-muted-foreground/70">
                  /
                </li>
                <li>
                  <Link href="/ajuda" className="transition hover:text-primary">
                    Central de Ajuda
                  </Link>
                </li>
                <li aria-hidden className="text-muted-foreground/70">
                  /
                </li>
                <li aria-current="page" className="font-medium text-foreground">
                  {title}
                </li>
              </ol>
            </nav>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
              <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </header>

          <div className="space-y-8 text-sm leading-relaxed text-foreground">{children}</div>

          <div className="pt-4">
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href="/ajuda">🔙 Voltar à Central de Ajuda</Link>
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default HelpArticleLayout;
