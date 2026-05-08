import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { projectsOrFallback, type Project } from "@/lib/sample-projects";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Download, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/reports")({ component: Reports });

function Reports() {
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Bihar");
  const [projects, setProjects] = useState<Project[]>([]);
  const [schemeCount, setSchemeCount] = useState(0);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .then(({ data }) => setProjects(projectsOrFallback(data)));
    supabase
      .from("schemes")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setSchemeCount(count || 0));
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.state === state &&
      (!district || (p.district ?? "").toLowerCase().includes(district.toLowerCase())),
  );
  const ghosts = filtered.filter((p) => (p.ghost_score ?? 0) > 55);
  const totalWaste = ghosts.reduce((s, p) => s + Number(p.sanctioned_amount), 0);

  const districtCards = Array.from(new Set(projects.map((p) => `${p.district}|${p.state}`)))
    .map((s) => {
      const [d, st] = s.split("|");
      const ps = projects.filter((p) => p.district === d);
      return {
        d,
        st,
        count: ps.length,
        ghosts: ps.filter((p) => (p.ghost_score ?? 0) > 55).length,
      };
    })
    .slice(0, 8);

  const [isGenerating, setIsGenerating] = useState(false);

  const generate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const el = document.getElementById("report-view");
      el?.scrollIntoView({ behavior: "smooth" });
    }, 1500);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 print:p-0">
        <div className="print:hidden">
          <h1 className="text-3xl font-bold">District Intelligence Reports</h1>
          <p className="text-muted-foreground">
            Generate evidence-backed civic intelligence reports for any district.
          </p>
        </div>

        <div className="bg-card border rounded-xl p-5 shadow-card flex flex-wrap gap-3 print:hidden">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            {[
              "Bihar",
              "Maharashtra",
              "Uttar Pradesh",
              "Jharkhand",
              "Madhya Pradesh",
              "Rajasthan",
              "Karnataka",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="District (optional)"
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm"
          />
          <button 
            disabled={isGenerating}
            onClick={generate} 
            className="bg-saffron text-white px-5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            {isGenerating ? "Analyzing Ground Data..." : "Generate Report"}
          </button>
        </div>

        {filtered.length > 0 && (
          <div id="report-view" className="bg-card border rounded-2xl p-6 shadow-card print:border-0 print:shadow-none print:p-0">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-bold text-xl mb-1">
                  Civic Intelligence Report: {district || "All districts"} • {state}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Compiled from satellite AI + government records • {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="hidden print:block text-right">
                <div className="text-sm font-bold text-saffron">NAGRIK AI</div>
                <div className="text-[10px] text-muted-foreground">Transparency Platform</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Stat label="Ghost Projects" value={ghosts.length} tone="danger" />
              <Stat label="Estimated Waste" value={formatINR(totalWaste)} tone="saffron" />
              <Stat label="Schemes Monitored" value={schemeCount} tone="success" />
            </div>

            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Flagged Infrastructure Projects</h3>
            <div className="space-y-2 mb-8">
              {ghosts.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-muted/40 p-4 rounded-xl text-sm border border-transparent hover:border-saffron/20 transition"
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <div className="font-bold truncate">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.district}, {p.state} • {p.executing_agency}</div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-bold tabular-nums">{formatINR(p.sanctioned_amount)}</span>
                    <SeverityBadge severity={p.severity ?? "LOW"} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-navy-deep/5 border-l-4 border-navy-deep p-4 text-xs italic text-muted-foreground mb-8">
              "This report uses satellite change detection to identify discrepancies between government fund releases and ground reality. A high ghost score indicates a potential 'ghost project' where funds were spent but infrastructure is missing."
            </div>

            <button onClick={downloadPDF} className="bg-navy-deep text-white px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 print:hidden">
              <Download className="w-4 h-4" /> Download Intelligence PDF
            </button>
          </div>
        )}

        <div>
          <h2 className="font-bold text-lg mb-4">Pre-generated District Reports</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {districtCards.map((c) => (
              <button
                key={c.d + c.st}
                onClick={() => {
                  setState(c.st);
                  setDistrict(c.d);
                }}
                className="bg-card border rounded-xl p-4 shadow-card text-left hover:border-saffron"
              >
                <div className="font-semibold">{c.d}</div>
                <div className="text-xs text-muted-foreground">{c.st}</div>
                <div className="mt-3 flex justify-between text-xs">
                  <span>{c.count} projects</span>
                  <span className="text-danger font-bold">{c.ghosts} ghost</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
function Stat({ label, value, tone }: any) {
  const m: any = { danger: "text-danger", saffron: "text-saffron", success: "text-success" };
  return (
    <div className="bg-muted/40 rounded-xl p-4">
      <div className={`text-3xl font-bold ${m[tone]}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
