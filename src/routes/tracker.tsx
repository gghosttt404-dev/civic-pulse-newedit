import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { formatINR } from "@/lib/format";
import { Search, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { fetchGovtProjects, type GovtProject } from "@/lib/govt-api";
import { SeverityBadge } from "@/components/SeverityBadge";

export const Route = createFileRoute("/tracker")({ component: Tracker });

function Tracker() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<GovtProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const projects = await fetchGovtProjects();
      setList(projects);
      setLoading(false);
    })();
  }, []);

  const filtered = list.filter(
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
            <p className="text-muted-foreground">Monitoring real-time physical and financial progress of PMGSY projects.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by project name, district, or state..."
              className="w-full pl-11 pr-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Syncing with Government Data Portal...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="bg-card border rounded-xl shadow-card hover:border-saffron/50 transition-colors overflow-hidden flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">PMGSY</span>
                        {p.ghost_risk && (
                          <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">🔴 Ghost Risk</span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{p.district}, {p.state}</p>
                    </div>
                    <SeverityBadge severity={p.ghost_risk ? "CRITICAL" : (p.status === "DELAYED" ? "HIGH" : "LOW")} />
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-4 border-y my-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Sanctioned Amount</p>
                      <p className="font-bold text-lg">{formatINR(p.sanctioned_amount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Fund Released</p>
                      <p className="font-bold text-lg text-navy-deep">{formatINR(p.fund_released)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Physical Completion</span>
                      <span className="font-bold text-navy-deep">{p.completion_pct}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${p.ghost_risk ? "bg-danger" : (p.completion_pct > 80 ? "bg-success" : "bg-saffron")}`}
                        style={{ width: `${p.completion_pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-muted/30 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.status === "ON_TRACK" ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-danger" />
                    )}
                    <span className={`text-[10px] font-bold uppercase ${p.status === "ON_TRACK" ? "text-success" : "text-danger"}`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                  <Link to="/analyze" className="text-xs text-saffron font-bold hover:underline">Run AI Analysis →</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24 bg-card border rounded-2xl">
            <p className="text-muted-foreground">No projects match your search criteria.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
