import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile, getUserId } from "@/lib/session";
import { formatINR } from "@/lib/format";
import { projectsOrFallback, type Project } from "@/lib/sample-projects";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Trophy, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/community")({ component: Community });

function Community() {
  const profile = useUserProfile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [claimTarget, setClaimTarget] = useState<Project | null>(null);
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [newProposalData, setNewProposalData] = useState({
    title: "",
    cost: 5,
  });

  const load = () => {
    supabase
      .from("projects")
      .select("*")
      .gt("ghost_score", 55)
      .then(({ data }) =>
        setProjects(projectsOrFallback(data).filter((project) => (project.ghost_score ?? 0) > 55)),
      );
    supabase
      .from("community_proposals")
      .select("*, projects(name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setProposals(data || []));
  };

  useEffect(() => { load(); }, []);

  const myDistrict = projects.filter((p) => !profile?.district || p.district === profile.district);
  const stories = proposals.filter((p) => p.success_story);

  const submitProposal = async () => {
    if (!claimTarget && !showNewProposal) return;
    
    const { error } = await supabase.from("community_proposals").insert({
      project_id: claimTarget?.id,
      created_by: getUserId(),
      district: profile?.district || "Unknown",
      state: profile?.state || "Unknown",
      status: "PROPOSED",
      recovered_amount_est: claimTarget?.sanctioned_amount || 1000000,
      proposed_use: [
        { title: newProposalData.title || "Solar Street Lights", estimated_cost: newProposalData.cost },
        { title: "Public Library Renovation", estimated_cost: 10 }
      ]
    });

    if (error) toast.error(error.message);
    else {
      toast.success("Proposal submitted for community voting!");
      setClaimTarget(null);
      setShowNewProposal(false);
      load();
    }
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Community Dashboard</h1>
          <p className="text-muted-foreground">Your district. Your money. Your voice.</p>
        </div>

        <section>
          <h2 className="font-bold text-lg mb-4">
            Ghost Projects in {profile?.district || "Your Area"}
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {(myDistrict.length ? myDistrict : projects.slice(0, 6)).map((p) => (
              <div key={p.id} className="bg-card border rounded-xl p-4 shadow-card hover:border-saffron/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-sm leading-tight">{p.name}</div>
                  <SeverityBadge severity={p.severity ?? "LOW"} />
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  {formatINR(p.sanctioned_amount)}
                </div>
                <button 
                  onClick={() => setClaimTarget(p)}
                  className="w-full bg-saffron text-white text-xs py-2 rounded-lg font-semibold hover:bg-saffron/90 transition"
                >
                  Claim This Project
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Reallocation Proposals</h2>
            <button 
              onClick={() => setShowNewProposal(true)}
              className="bg-success text-white px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-1 hover:bg-success/90 transition"
            >
              <Plus className="w-4 h-4" /> New Proposal
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {proposals.map((p) => (
              <div key={p.id} className="bg-card border rounded-xl p-5 shadow-card border-l-4 border-l-success">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-success/10 text-success text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                    {p.status}
                  </span>
                  <span className="font-bold text-success">
                    {formatINR(p.recovered_amount_est)}
                  </span>
                </div>
                <div className="font-semibold mb-2">Targeting: {p.projects?.name || "Multiple Projects"}</div>
                <div className="space-y-2">
                  {(p.proposed_use as any[]).map((u, i) => (
                    <div key={i} className="text-xs bg-muted/50 p-2 rounded flex justify-between">
                      <span>{u.title}</span>
                      <span className="font-bold">₹{u.estimated_cost}L</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Trophy className="text-saffron w-5 h-5" /> Success Stories
          </h2>
          {stories.length === 0 ? (
            <div className="bg-success/5 border border-success/20 rounded-xl p-8 text-center">
              <p className="text-success font-semibold">Be the first success story.</p>
              <p className="text-sm text-muted-foreground mt-1">
                When a proposal gets acted on, it'll show up here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {stories.map((s) => (
                <div key={s.id} className="bg-success/10 border-2 border-success/30 rounded-xl p-5">
                  {s.success_description}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={!!claimTarget || showNewProposal} onOpenChange={(o) => { if(!o) { setClaimTarget(null); setShowNewProposal(false); } }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{claimTarget ? "Claim Ghost Funds" : "New Community Proposal"}</DialogTitle>
            <DialogDescription>
              {claimTarget 
                ? `You are proposing to reallocate ${formatINR(claimTarget.sanctioned_amount)} from this suspicious project to a community need.`
                : "Propose a new project to be funded by recovered ghost project funds."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Proposed Community Use</label>
              <input 
                value={newProposalData.title}
                onChange={e => setNewProposalData(d => ({ ...d, title: e.target.value }))}
                placeholder="e.g. Solar Street Lights for Main Road"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-success"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Cost (in Lakhs)</label>
              <input 
                type="number"
                value={newProposalData.cost}
                onChange={e => setNewProposalData(d => ({ ...d, cost: +e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-success"
              />
            </div>
            <button 
              onClick={submitProposal}
              className="w-full bg-success text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-success/90 transition"
            >
              <Check className="w-4 h-4" /> Submit Proposal
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
