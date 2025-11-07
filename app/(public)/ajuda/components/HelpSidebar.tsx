"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HELP_ARTICLES } from "../articles";
import { cn } from "@/lib/utils";

const BASE_PATH = "/ajuda";

export function HelpSidebar() {
  const pathname = usePathname();

  const isActive = (slug?: string) => {
    if (!pathname) return false;
    if (!slug) {
      return pathname === BASE_PATH;
    }
    return pathname === `${BASE_PATH}/${slug}`;
  };

  return (
    <nav aria-label="Central de Ajuda" className="lg:sticky lg:top-24">
      <div className="rounded-xl border border-border/60 bg-background/80 shadow-sm backdrop-blur">
        <div className="border-b border-border/60 px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Artigos
          </p>
        </div>
        <ul className="flex flex-col divide-y divide-border/60">
          <li>
            <Link
              href={BASE_PATH}
              className={cn(
                "flex items-start gap-3 px-5 py-4 text-sm font-medium transition-colors hover:text-primary",
                isActive() ? "text-primary" : "text-muted-foreground"
              )}
              aria-current={isActive() ? "page" : undefined}
            >
              <span className="mt-1 h-2 w-2 rounded-full bg-primary/60" aria-hidden />
              <div>
                <span className="block text-base font-semibold text-foreground">
                  Central de Ajuda
                </span>
                <span className="text-xs text-muted-foreground">
                  Explore todos os recursos do sistema
                </span>
              </div>
            </Link>
          </li>
          {HELP_ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link
                href={`${BASE_PATH}/${article.slug}`}
                className={cn(
                  "flex items-start gap-3 px-5 py-4 transition-colors hover:text-primary",
                  isActive(article.slug)
                    ? "text-primary"
                    : "text-sm text-muted-foreground"
                )}
                aria-current={isActive(article.slug) ? "page" : undefined}
              >
                <span className="mt-2 h-2 w-2 rounded-full bg-primary/50" aria-hidden />
                <div>
                  <span className="block text-sm font-semibold text-foreground">
                    {article.title}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {article.category}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default HelpSidebar;
