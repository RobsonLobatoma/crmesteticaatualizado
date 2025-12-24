import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  helperText?: ReactNode;
}

export function KpiCard({ label, value, helperText }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        {helperText ? <div className="text-[11px] text-muted-foreground">{helperText}</div> : null}
      </CardContent>
    </Card>
  );
}
