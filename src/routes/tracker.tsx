import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState, useMemo } from "react";
import { formatINR } from "@/lib/format";
import { Search, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import { fetchGovtProjects, type GovtProject } from "@/lib/govt-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { SAMPLE_PROJECTS } from "@/lib/sample-projects";

export const Route = createFileRoute("/tracker")({ component: Tracker });

function Tracker() {
  const [q, setQ] = useState("");
  const [govtList, setGovtList] = useState<GovtProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchGovtProjects();
        // If API fails, fetchGovtProjects returns our fallbacks, 
        // but we'll prioritize the original verified data below.
        setGovtList(Array.isArray(data) ? data : []);
      } catch (err) {
        setGovtList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const combined = useMemo(() => {
    // Verified projects from the original dataset
    const verified = SAMPLE_PROJECTS.map(p => ({
      id: p.id,
      name: p.name,
      state: p.state,
      district: p.district,
      sanctioned_amount: p.sanctioned_amount,
      fund_released: p.sanctioned_amount * 0.85,
      completion_pct: p.progress_score,
      ghost_risk: (p.ghost_score || 0) > 70,
      status: p.severity === "CRITICAL" ? "GHOST_RISK" : (p.severity === "HIGH" ? "DELAYED" : "ON_TRACK"),
      is_verified: true
    }));

    // Filter out govt projects that are actually our fallbacks if we already have verified data
    const realGovt = govtList.filter(g => !g.id.startsWith("fallback"));

    return [...verified, ...realGovt];
  }, [govtList]);

  const filtered = combined.filter(
    (p) =>
      !q ||
      `${p.name} ${p.district} ${p.state}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Project Progress Tracker</h1>
            <p className="text-muted-foreground">Monitoring {combined.length} total projects across the nation.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search project database..."
              className="w-full pl-11 pr-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card border-2 border-transparent hover:border-saffron/30 rounded-2xl shadow-card transition-all overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${p.is_verified ? "bg-navy-deep text-white" : "bg-muted text-muted-foreground"}`}>
                        {p.is_verified ? "VERIFIED PROJECT" : "GOVT DATA"}
                      </span>
                      {p.ghost_risk && (
                        <span className="bg-danger/10 text-danger text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> GHOST RISK
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl leading-tight text-navy-deep">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{p.district}, {p.state}</p>
                  </div>
                  <SeverityBadge severity={p.ghost_risk ? "CRITICAL" : (p.status === "DELAYED" ? "HIGH" : "LOW")} />
                </div>

                <div className="grid grid-cols-2 gap-8 py-5 border-y my-5 border-muted/50">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Sanctioned</p>
                    <p className="font-black text-xl text-navy-deep">{formatINR(p.sanctioned_amount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Progress</p>
                    <p className="font-black text-xl text-saffron">{p.completion_pct}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${p.ghost_risk ? "bg-danger" : "bg-saffron"}`}
                      style={{ width: `${p.completion_pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase">
                  {p.ghost_risk ? "🔴 Discrepancy Detected" : "🟢 Data Consistent"}
                </div>
                <Link 
                  to="/analyze" 
                  className="bg-navy-deep text-white text-xs font-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-saffron transition-all"
                >
                  ANALYSE CLAIM <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Syncing with Government Data...</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
