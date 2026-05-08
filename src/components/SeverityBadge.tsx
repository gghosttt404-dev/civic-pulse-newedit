import { severityColor } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SeverityBadge({ severity }: { severity: string }) {
  const isCritical = severity === "CRITICAL";
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide",
      severityColor(severity),
      isCritical && "pulse-ring"
    )}>
      {severity}
    </span>
  );
}
