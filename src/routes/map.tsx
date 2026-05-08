import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, ghostScoreColor } from "@/lib/format";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Search, X } from "lucide-react";

export const Route = createFileRoute("/map")({ component: MapPage });

const TYPES = ["All", "ROAD", "SCHOOL", "BRIDGE", "ANGANWADI", "HEALTH"];
const SEVS = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

function MapPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [type, setType] = useState("All");
  const [sev, setSev] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [view, setView] = useState<"ghost" | "recovery" | "success">("ghost");

  useEffect(() => {
    supabase.from("projects").select("*").then(({ data }) => setProjects(data || []));
    const ch = supabase.channel("projects-rt").on("postgres_changes", { event: "*", schema: "public", table: "projects" },
      () => supabase.from("projects").select("*").then(({ data }) => setProjects(data || []))).subscribe();
    return () => { ch.unsubscribe(); };
  }, []);

  const filtered = useMemo(() => projects.filter(p =>
    (type === "All" || p.project_type === type) &&
    (sev === "All" || p.severity === sev) &&
    (!q || (p.name + p.district + p.state).toLowerCase().includes(q.toLowerCase()))
  ), [projects, type, sev, q]);

  // Convert lat/lng to x/y on India bounding box (approx 8-37 N, 68-97 E)
  const toXY = (lat: number, lng: number) => ({
    x: ((lng - 68) / 29) * 100,
    y: ((37 - lat) / 29) * 100,
  });

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left sidebar */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects, districts..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-saffron" />
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {TYPES.map(t => <button key={t} onClick={() => setType(t)} className={`text-xs px-2.5 py-1 rounded-full ${type === t ? "bg-navy-deep text-white" : "bg-muted hover:bg-muted/70"}`}>{t}</button>)}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {SEVS.map(s => <button key={s} onClick={() => setSev(s)} className={`text-xs px-2.5 py-1 rounded-full ${sev === s ? "bg-saffron text-white" : "bg-muted hover:bg-muted/70"}`}>{s}</button>)}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map(p => (
              <button key={p.id} onClick={() => setSelected(p)}
                className={`w-full text-left bg-white border rounded-lg p-3 hover:border-saffron transition ${selected?.id === p.id ? "border-saffron ring-2 ring-saffron/20" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-medium text-sm leading-tight">{p.name}</div>
                  <SeverityBadge severity={p.severity} />
                </div>
                <div className="text-xs text-muted-foreground mb-2">{p.district}, {p.state}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${p.ghost_score}%`, background: ghostScoreColor(p.ghost_score) }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ color: ghostScoreColor(p.ghost_score) }}>{p.ghost_score}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{formatINR(p.sanctioned_amount)}</div>
              </button>
            ))}
            {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No projects match your filters.</div>}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative bg-navy-deep overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card rounded-full p-1 flex shadow-elevated">
            {[
              { v: "ghost", l: "Ghost Exposure" },
              { v: "recovery", l: "Recovery Opportunities" },
              { v: "success", l: "Success Stories" },
            ].map(t => (
              <button key={t.v} onClick={() => setView(t.v as any)}
                className={`text-xs px-4 py-2 rounded-full font-medium transition ${view === t.v ? "bg-saffron text-white" : "text-muted-foreground hover:text-foreground"}`}>{t.l}</button>
            ))}
          </div>

          <div className="absolute inset-0">
            <div className="relative w-full h-full" style={{ background: "radial-gradient(circle at 50% 40%, oklch(0.25 0.04 250) 0%, oklch(0.18 0.03 250) 70%)" }}>
              {/* Subtle India outline */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
                <path d="M30,15 Q45,10 60,15 L75,25 L78,40 L72,55 L65,70 L55,85 L42,82 L30,70 L22,55 L20,40 L25,25 Z"
                  fill="none" stroke="oklch(0.5 0.03 240)" strokeWidth="0.3" />
              </svg>
              {filtered.map(p => {
                const { x, y } = toXY(p.lat, p.lng);
                const color = ghostScoreColor(p.ghost_score);
                const critical = p.severity === "CRITICAL";
                return (
                  <button key={p.id} onClick={() => setSelected(p)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}%`, top: `${y}%` }}>
                    <span className={`block w-3 h-3 rounded-full ${critical ? "pulse-ring" : ""}`} style={{ background: color, boxShadow: `0 0 0 2px ${color}40` }} />
                    <span className="absolute left-4 top-0 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition bg-navy px-2 py-0.5 rounded">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selected && (
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-card shadow-elevated overflow-y-auto">
              <div className="relative">
                <img src={selected.satellite_image_url} alt="" className="w-full h-48 object-cover" />
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                <div className="absolute bottom-3 left-3 bg-navy-deep/80 text-white text-xs px-2 py-1 rounded">🛰️ AI Analysed</div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg leading-tight">{selected.name}</h3>
                  <SeverityBadge severity={selected.severity} />
                </div>
                <div className="text-sm text-muted-foreground mb-4">{selected.district}, {selected.state}</div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div><div className="text-xs text-muted-foreground">Sanctioned</div><div className="font-bold">{formatINR(selected.sanctioned_amount)}</div></div>
                  <div><div className="text-xs text-muted-foreground">Ghost Score</div><div className="font-bold" style={{ color: ghostScoreColor(selected.ghost_score) }}>{selected.ghost_score}/100</div></div>
                  <div className="col-span-2"><div className="text-xs text-muted-foreground">Agency</div><div className="font-medium text-sm">{selected.executing_agency}</div></div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/project/$id" params={{ id: selected.id }} className="bg-saffron text-white text-center py-2.5 rounded-lg text-sm font-semibold">View Full Details</Link>
                  <Link to="/rti" className="border text-center py-2.5 rounded-lg text-sm font-semibold">Generate RTI</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
