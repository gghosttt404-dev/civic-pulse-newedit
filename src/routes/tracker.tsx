import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, ghostScoreColor } from "@/lib/format";
import { projectsOrFallback, type Project } from "@/lib/sample-projects";
import { Search, Camera } from "lucide-react";

export const Route = createFileRoute("/tracker")({ component: Tracker });

function statusFor(p: Project) {
  const ghostScore = p.ghost_score ?? 0;
  const progressScore = p.progress_score ?? 0;
  if (ghostScore > 75) return { l: "Ghost Suspected 🚨", c: "bg-danger text-white" };
  if (progressScore < 10) return { l: "Stalled 🔴", c: "bg-danger text-white" };
  if (progressScore < 41) return { l: "Delayed ⚠️", c: "bg-saffron text-white" };
  if (progressScore < 81) return { l: "In Progress 🟡", c: "bg-warn text-navy-deep" };
  return { l: "Nearing Completion 🟢", c: "bg-success text-white" };
}

function Tracker() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Project[]>([]);
  const [exp, setExp] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .then(({ data }) => setList(projectsOrFallback(data)))
      .catch(() => setList(projectsOrFallback(null)));
  }, []);
  const filtered = list.filter(
    (p) =>
      !q ||
      `${p.name} ${p.district ?? ""} ${p.state ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Project Progress Tracker</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search project by name, district, or scheme..."
            className="w-full pl-11 pr-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-saffron"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const st = statusFor(p);
            const progressScore = p.progress_score ?? 0;
            return (
              <div key={p.id} className="bg-card border rounded-xl shadow-card overflow-hidden">
                <div className="flex">
                  <img src={p.satellite_image_url} className="w-32 h-32 object-cover" alt="" />
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm leading-tight">{p.name}</h3>
                      <span className="bg-muted text-xs px-2 py-0.5 rounded">{p.project_type}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.district}, {p.state}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatINR(p.sanctioned_amount)} • Claimed: {p.claimed_completion_date}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${progressScore}%`,
                              background: ghostScoreColor(100 - progressScore),
                            }}
                          />
                        </div>
                        <div className="text-[10px] mt-1">{progressScore}% progress detected</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${st.c}`}>
                        {st.l}
                      </span>
                      <button
                        onClick={() => setExp(exp === p.id ? null : p.id)}
                        className="text-xs text-saffron font-medium"
                      >
                        {exp === p.id ? "Hide" : "Details"}
                      </button>
                    </div>
                  </div>
                </div>
                {exp === p.id && (
                  <div className="border-t p-4 text-sm space-y-3 bg-muted/30">
                    <p className="text-muted-foreground">{p.gemini_analysis}</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="bg-card border px-3 py-2 rounded-lg text-xs inline-flex items-center gap-1">
                        <Camera className="w-3 h-3" /> Submit Ground Report
                      </button>
                      <button className="bg-danger text-white px-3 py-2 rounded-lg text-xs">
                        Flag as Ghost
                      </button>
                      <Link
                        to="/rti"
                        className="bg-saffron text-white px-3 py-2 rounded-lg text-xs"
                      >
                        File RTI
                      </Link>
                      <Link
                        to="/project/$id"
                        params={{ id: p.id }}
                        className="text-xs text-saffron self-center font-semibold ml-auto"
                      >
                        Full Detail →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
