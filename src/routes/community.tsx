import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/lib/session";
import { formatINR } from "@/lib/format";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Trophy, Plus } from "lucide-react";

export const Route = createFileRoute("/community")({ component: Community });

function Community() {
  const profile = useUserProfile();
  const [projects, setProjects] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("projects").select("*").gt("ghost_score", 55).then(({ data }) => setProjects(data || []));
    supabase.from("community_proposals").select("*, projects(name)").then(({ data }) => setProposals(data || []));
  }, []);

  const myDistrict = projects.filter(p => !profile?.district || p.district === profile.district);
  const stories = proposals.filter(p => p.success_story);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Community Dashboard</h1>
          <p className="text-muted-foreground">Your district. Your money. Your voice.</p>
        </div>

        <section>
          <h2 className="font-bold text-lg mb-4">Ghost Projects in {profile?.district || "Your Area"}</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {(myDistrict.length ? myDistrict : projects.slice(0, 6)).map(p => (
              <div key={p.id} className="bg-card border rounded-xl p-4 shadow-card">
                <div className="flex items-start justify-between mb-2"><div className="font-semibold text-sm leading-tight">{p.name}</div><SeverityBadge severity={p.severity} /></div>
                <div className="text-xs text-muted-foreground mb-3">{formatINR(p.sanctioned_amount)}</div>
                <button className="w-full bg-saffron text-white text-xs py-2 rounded-lg font-semibold">Claim This Project</button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Reallocation Proposals</h2>
            <button className="bg-success text-white px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-1"><Plus className="w-4 h-4" /> New Proposal</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {proposals.map(p => (
              <div key={p.id} className="bg-card border rounded-xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-muted text-xs px-2 py-0.5 rounded">{p.status}</span>
                  <span className="font-bold text-success">{formatINR(p.recovered_amount_est)}</span>
                </div>
                <div className="font-semibold mb-2">From: {p.projects?.name}</div>
                <div className="space-y-2">
                  {(p.proposed_use as any[]).map((u, i) => (
                    <div key={i} className="text-xs bg-muted/50 p-2 rounded"><span className="font-semibold">{u.title}</span> — ₹{u.estimated_cost}L</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Trophy className="text-saffron w-5 h-5" /> Success Stories</h2>
          {stories.length === 0 ? (
            <div className="bg-success/5 border border-success/20 rounded-xl p-8 text-center">
              <p className="text-success font-semibold">Be the first success story.</p>
              <p className="text-sm text-muted-foreground mt-1">When a proposal gets acted on, it'll show up here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">{stories.map(s => <div key={s.id} className="bg-success/10 border-2 border-success/30 rounded-xl p-5">{s.success_description}</div>)}</div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
