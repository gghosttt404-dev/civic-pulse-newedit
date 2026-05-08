export function formatINR(lakhs: number | string | null | undefined): string {
  if (lakhs == null) return "—";
  const n = typeof lakhs === "string" ? parseFloat(lakhs) : lakhs;
  if (isNaN(n)) return "—";
  if (n >= 100) return `₹${(n / 100).toFixed(2)} crore`;
  return `₹${n.toFixed(1)} lakh`;
}

export function severityColor(sev: string | null | undefined) {
  switch (sev) {
    case "CRITICAL": return "bg-danger text-white";
    case "HIGH": return "bg-saffron text-white";
    case "MEDIUM": return "bg-warn text-navy-deep";
    case "LOW": return "bg-success text-white";
    default: return "bg-muted text-muted-foreground";
  }
}

export function ghostScoreColor(score: number) {
  if (score >= 81) return "oklch(0.58 0.22 25)";
  if (score >= 56) return "oklch(0.71 0.19 50)";
  if (score >= 31) return "oklch(0.78 0.17 80)";
  return "oklch(0.52 0.13 155)";
}
