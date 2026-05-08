import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, ghostScoreColor } from "@/lib/format";
import { projectsOrFallback, type Project } from "@/lib/sample-projects";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Search, X } from "lucide-react";

export const Route = createFileRoute("/map")({ component: GhostMap });

const TYPES = ["All", "ROAD", "BRIDGE", "SCHOOL", "HEALTH", "WATER"];
const SEVS = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const MAP_VIEWS = [
  { v: "ghost", l: "Ghost Exposure" },
  { v: "recovery", l: "Recovery Opportunities" },
  { v: "success", l: "Success Stories" },
] as const;

type MapView = (typeof MAP_VIEWS)[number]["v"];

function GhostMap() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [type, setType] = useState("All");
  const [sev, setSev] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const [view, setView] = useState<MapView>("ghost");

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .then(({ data }) => setProjects(projectsOrFallback(data)))
      .catch(() => setProjects(projectsOrFallback(null)));
    const ch = supabase
      .channel("projects-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () =>
        supabase
          .from("projects")
          .select("*")
          .then(({ data }) => setProjects(projectsOrFallback(data)))
          .catch(() => setProjects(projectsOrFallback(null))),
      )
      .subscribe();
    return () => {
      ch.unsubscribe();
    };
  }, []);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (type === "All" || p.project_type === type) &&
          (sev === "All" || p.severity === sev) &&
          (!q || (p.name + p.district + p.state).toLowerCase().includes(q.toLowerCase())),
      ),
    [projects, type, sev, q],
  );

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left sidebar */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects, districts..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`text-xs px-2.5 py-1 rounded-full ${type === t ? "bg-navy-deep text-white" : "bg-muted hover:bg-muted/70"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {SEVS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSev(s)}
                  className={`text-xs px-2.5 py-1 rounded-full ${sev === s ? "bg-saffron text-white" : "bg-muted hover:bg-muted/70"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left bg-white border rounded-lg p-3 hover:border-saffron transition ${selected?.id === p.id ? "border-saffron ring-2 ring-saffron/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-medium text-sm leading-tight">{p.name}</div>
                  <SeverityBadge severity={p.severity ?? "LOW"} />
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {p.district}, {p.state}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${p.ghost_score ?? 0}%`,
                        background: ghostScoreColor(p.ghost_score ?? 0),
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: ghostScoreColor(p.ghost_score ?? 0) }}
                  >
                    {p.ghost_score ?? 0}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatINR(p.sanctioned_amount)}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No projects match your filters.
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative bg-navy-deep overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card rounded-full p-1 flex shadow-elevated">
            {MAP_VIEWS.map((t) => (
              <button
                key={t.v}
                onClick={() => setView(t.v)}
                className={`text-xs px-4 py-2 rounded-full font-medium transition ${view === t.v ? "bg-saffron text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t.l}
              </button>
            ))}
          </div>

          <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_30%_35%,rgba(255,128,0,0.18),transparent_22%),radial-gradient(circle_at_72%_52%,rgba(34,197,94,0.16),transparent_18%),linear-gradient(135deg,#111827_0%,#0f172a_48%,#182033_100%)]">
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="absolute left-[16%] top-[18%] h-[62%] w-[54%] rounded-[55%_45%_62%_38%] border border-white/15 bg-emerald-400/10 shadow-[inset_0_0_60px_rgba(16,185,129,0.12)]" />
            <div className="absolute left-[34%] top-[22%] h-[40%] w-[34%] rounded-[45%_55%_42%_58%] border border-white/10 bg-saffron/10" />

            {filtered.map((project) => {
              if (project.lat == null || project.lng == null) return null;
              const left = Math.min(86, Math.max(12, ((project.lng - 68) / 30) * 74 + 12));
              const top = Math.min(82, Math.max(14, ((36 - project.lat) / 28) * 68 + 14));
              const score = project.ghost_score ?? 0;
              const tone = score > 80 ? "bg-danger" : score > 55 ? "bg-saffron" : "bg-success";

              return (
                <button
                  key={project.id}
                  onClick={() => setSelected(project)}
                  className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg ${tone} ${selected?.id === project.id ? "ring-4 ring-white/40" : ""}`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  title={project.name}
                  aria-label={project.name}
                />
              );
            })}
          </div>

          {selected && (
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-card shadow-elevated overflow-y-auto">
              <div className="relative">
                <img
                  src={selected.satellite_image_url}
                  alt=""
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-navy-deep/80 text-white text-xs px-2 py-1 rounded">
                  🛰️ AI Analysed
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg leading-tight">{selected.name}</h3>
                  <SeverityBadge severity={selected.severity ?? "LOW"} />
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  {selected.district}, {selected.state}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Sanctioned</div>
                    <div className="font-bold">{formatINR(selected.sanctioned_amount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Ghost Score</div>
                    <div
                      className="font-bold"
                      style={{ color: ghostScoreColor(selected.ghost_score ?? 0) }}
                    >
                      {selected.ghost_score ?? 0}/100
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Agency</div>
                    <div className="font-medium text-sm">{selected.executing_agency}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/project/$id"
                    params={{ id: selected.id }}
                    className="bg-saffron text-white text-center py-2.5 rounded-lg text-sm font-semibold"
                  >
                    View Full Details
                  </Link>
                  <Link
                    to="/rti"
                    className="border text-center py-2.5 rounded-lg text-sm font-semibold"
                  >
                    Generate RTI
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
