import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SummaryTone = "default" | "investment" | "expense" | "balance";

const toneClasses: Record<SummaryTone, string> = {
  default: "bg-secondary text-secondary-foreground",
  investment: "bg-primary/12 text-primary",
  expense: "bg-warning/15 text-warning",
  balance: "bg-success/15 text-success",
};

export function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: SummaryTone;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-lg font-bold tracking-tight text-card-foreground">{value}</p>
        {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
