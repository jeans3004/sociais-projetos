import { AlertTriangle, Info, Lightbulb, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  info: {
    icon: Info,
    accent: "border-blue-600/70 bg-blue-50 text-blue-950",
    label: "Saiba mais",
  },
  success: {
    icon: RefreshCcw,
    accent: "border-emerald-600/70 bg-emerald-50 text-emerald-900",
    label: "Bom saber",
  },
  warning: {
    icon: AlertTriangle,
    accent: "border-amber-600/70 bg-amber-50 text-amber-900",
    label: "Atenção",
  },
  tip: {
    icon: Lightbulb,
    accent: "border-primary/70 bg-primary/5 text-foreground",
    label: "Dica",
  },
} as const;

export type HelpCalloutVariant = keyof typeof VARIANT_STYLES;

interface HelpCalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  variant?: HelpCalloutVariant;
}

export function HelpCallout({
  title,
  variant = "info",
  className,
  children,
  ...props
}: HelpCalloutProps) {
  const style = VARIANT_STYLES[variant];
  const Icon = style.icon;

  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-xl border-l-4 px-4 py-3 text-sm shadow-sm sm:px-5",
        style.accent,
        className
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden />
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {title ?? style.label}
        </p>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default HelpCallout;
