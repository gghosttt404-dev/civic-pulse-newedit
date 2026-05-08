import { useEffect, useState } from "react";
import { ghostScoreColor } from "@/lib/format";

export function GhostScoreGauge({ score, size = 180 }: { score: number; size?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 2;
      if (i >= score) { setV(score); clearInterval(t); }
      else setV(i);
    }, 12);
    return () => clearInterval(t);
  }, [score]);

  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const arc = 0.75; // 270deg arc
  const offset = c * arc * (1 - v / 100) + c * (1 - arc);
  const color = ghostScoreColor(v);
  const sev = v >= 81 ? "CRITICAL" : v >= 56 ? "HIGH" : v >= 31 ? "MEDIUM" : "LOW";

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.92 0.01 240)" strokeWidth={12}
          strokeDasharray={c} strokeDashoffset={c * (1 - arc)} strokeLinecap="round" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.3s" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold" style={{ color }}>{v}</div>
        <div className="text-xs font-semibold tracking-wider mt-1" style={{ color }}>{sev}</div>
      </div>
    </div>
  );
}
