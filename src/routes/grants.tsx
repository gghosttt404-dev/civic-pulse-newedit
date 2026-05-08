import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/lib/session";
import { Sparkles, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/grants")({ component: Grants });

const CAT_COLORS: Record<string, string> = {
  AGRICULTURE: "bg-success/15 text-success",
  EDUCATION: "bg-info/15 text-info",
  WOMEN: "bg-purple-grant/15 text-purple-grant",
  HOUSING: "bg-saffron/15 text-saffron",
  HEALTH: "bg-danger/15 text-danger",
  SKILL: "bg-info/15 text-info",
  STARTUP: "bg-saffron/15 text-saffron",
  SENIOR: "bg-muted text-foreground",
  RURAL: "bg-success/15 text-success",
};

function Grants() {
  const profile = useUserProfile();
  const [tab, setTab] = useState<"matched" | "all" | "tracker">("matched");
  const [schemes, setSchemes] = useState<any[]>([]);
  const [matched, setMatched] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("schemes").select("*").then(({ data }) => {
      const all = data || [];
      setSchemes(all);
      // Compute matches client-side using profile
      if (profile) {
        const m = all.map(s => ({ ...s, score: scoreFor(s, profile) })).filter(s => s.score > 0.3).sort((a, b) => b.score - a.score);
        setMatched(m);
      }
    });
  }, [profile]);

  if (!profile?.profile_complete) {
    return <AppShell><div className="p-12 max-w-2xl mx-auto text-center bg-card rounded-2xl shadow-card mt-12">
      <div className="text-5xl mb-4">📝</div>
      <h2 className="text-2xl font-bold mb-2">Complete your profile</h2>
      <p className="text-muted-foreground mb-6">Tell us about yourself so we can find every scheme you're entitled to.</p>
      <Link to="/onboarding" className="inline-block bg-saffron text-white px-6 py-3 rounded-lg font-semibold">Complete Profile to See Your Schemes →</Link>
    </div></AppShell>;
  }

  const totalValue = matched.reduce((sum, s) => sum + estValue(s.benefit_value), 0);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-purple text-white rounded-2xl p-7">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/70 mb-2"><Sparkles className="w-4 h-4" /> GovGrant AI</div>
          <h1 className="text-3xl font-bold mb-2">Your Personalized Welfare Dashboard</h1>
          <p className="text-white/80">Based on your profile, you may be entitled to <span className="font-bold text-white">₹{totalValue.toLocaleString("en-IN")}</span> in annual benefits across {matched.length} schemes.</p>
        </div>

        <div className="flex gap-2 border-b">
          {[{v:"matched",l:"My Matched Schemes"},{v:"all",l:"All Schemes"},{v:"tracker",l:"Application Tracker"}].map(t =>
            <button key={t.v} onClick={()=>setTab(t.v as any)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab===t.v?"border-saffron text-saffron":"border-transparent text-muted-foreground"}`}>{t.l}</button>)}
        </div>

        {tab === "matched" && (
          <>
            {matched.length > 0 && (
              <div className="bg-saffron/10 border border-saffron/30 rounded-xl p-4">
                <div className="font-semibold text-saffron text-sm mb-1">⚡ Priority Action — High Value</div>
                <div className="text-sm">{matched.slice(0, 3).map(s => s.name).join(" • ")}</div>
              </div>
            )}
            <div className="grid lg:grid-cols-2 gap-4">
              {matched.map(s => (
                <div key={s.id} className="bg-card rounded-xl border p-5 shadow-card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold leading-tight">{s.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CAT_COLORS[s.category] || "bg-muted"}`}>{s.category}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">{s.ministry}</div>
                  <div className="text-2xl font-bold text-purple-grant mb-3">{s.benefit_value}</div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1"><span>Eligibility match</span><span className="font-bold">{Math.round(s.score * 100)}%</span></div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-success" style={{ width: `${s.score * 100}%` }} /></div>
                  </div>
                  <button onClick={() => setExpanded(expanded === s.id ? null : s.id)} className="text-xs text-saffron font-medium flex items-center gap-1 mb-3">
                    Why You Qualify {expanded === s.id ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                  </button>
                  {expanded === s.id && <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg mb-3">{s.eligibility_summary}</div>}
                  <a href={s.application_url} target="_blank" rel="noreferrer" className="bg-saffron text-white px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2">Apply Now <ExternalLink className="w-3 h-3" /></a>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "all" && (
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase">
                <tr><th className="text-left px-4 py-3">Scheme</th><th className="text-left px-4 py-3">Ministry</th><th className="text-left px-4 py-3">Benefit</th><th></th></tr>
              </thead>
              <tbody>
                {schemes.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.ministry}</td>
                    <td className="px-4 py-3">{s.benefit_value}</td>
                    <td className="px-4 py-3"><a href={s.application_url} target="_blank" rel="noreferrer" className="text-saffron text-xs font-semibold">Apply →</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "tracker" && (
          <div className="bg-card rounded-xl border p-12 text-center shadow-card">
            <div className="text-5xl mb-3">📋</div>
            <h3 className="font-semibold mb-1">No applications yet</h3>
            <p className="text-sm text-muted-foreground">When you apply for schemes, track their status here.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function scoreFor(s: any, p: any): number {
  let score = 0.5;
  if (s.eligible_genders && s.eligible_genders !== "ALL" && s.eligible_genders !== p.gender) return 0;
  if (s.min_age && p.age < s.min_age) return 0;
  if (s.max_age && p.age > s.max_age) return 0;
  if (s.requires_bpl && !p.bpl_status) return 0;
  if (s.min_income_limit && p.monthly_income * 12 > s.min_income_limit) return 0.2;
  if (s.eligible_castes === "SC_ST" && !["SC","ST"].includes(p.caste_category)) return 0.1;
  if (s.state_specific && s.state_specific !== p.state) return 0;
  score = 0.7;
  if (s.occupation_required === "FARMER" && p.land_holding_acres > 0) score = 0.95;
  if (s.eligible_castes === "SC_ST" && ["SC","ST"].includes(p.caste_category)) score = 0.9;
  if (s.requires_bpl && p.bpl_status) score = 0.92;
  if (s.eligible_genders === "FEMALE" && p.gender === "FEMALE") score += 0.1;
  return Math.min(1, score);
}
function estValue(b: string): number {
  const m = b.match(/₹([\d,]+(?:\.\d+)?)\s*(lakh|crore|L|Cr)?/i);
  if (!m) return 5000;
  const n = parseFloat(m[1].replaceAll(",", ""));
  const unit = (m[2] || "").toLowerCase();
  if (unit.startsWith("l")) return n * 100000;
  if (unit.startsWith("c")) return n * 10000000;
  return n;
}
