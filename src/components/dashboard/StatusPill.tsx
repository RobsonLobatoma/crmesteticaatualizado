import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "default" | "success" | "warning" | "danger" | "info";

interface StatusPillProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

export function StatusPill({ label, tone = "default", className }: StatusPillProps) {
  const toneClassName =
    tone === "success"
      ? "border-primary/40 bg-primary/10 text-primary"
      : tone === "warning"
        ? "border-accent/40 bg-accent/10 text-accent-foreground"
        : tone === "danger"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : tone === "info"
            ? "border-accent/40 bg-accent/10 text-accent-foreground"
            : "border-border/60 bg-muted text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", toneClassName, className)}
    >
      {label}
    </Badge>
  );
}
