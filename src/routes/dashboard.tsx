import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/session";
import { formatINR } from "@/lib/format";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Map, Wallet, FileText, Radio, AlertTriangle, TrendingUp, ShieldAlert, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Satellite } from "lucide-react";
import { fetchGovtProjects, type GovtProject } from "@/lib/govt-api";
import { SAMPLE_PROJECTS } from "@/lib/sample-projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const profile = useUserProfile();
  const [stats, setStats] = useState({ ghosts: 0, rtis: 14, schemes: 12, value: 0 });
  const [combined, setCombined] = useState<GovtProject[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const govt = await fetchGovtProjects();
        const govtProjects = (Array.isArray(govt) ? govt : []).filter(g => !g.id.startsWith("fallback"));
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
        }));
        const all = [...verified, ...govtProjects];
        setCombined(all);
        setStats({
          ghosts: all.filter(p => p.ghost_risk).length,
          rtis: 14,
          schemes: 12,
          value: all.reduce((sum, p) => sum + p.sanctioned_amount, 0)
        });
      } catch (err) { console.error(err); }
    })();
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-top-10 duration-1000">
        
        {/* Badge */}
        <div className="bg-saffron/10 text-saffron px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-saffron/20 flex items-center gap-2">
          <Sparkles className="w-3 h-3 fill-saffron" /> AI-Powered Civic Oversight
        </div>

        {/* Hero Title */}
        <div className="max-w-4xl space-y-6">
           <h1 className="text-6xl md:text-8xl font-black text-navy-deep tracking-tighter leading-[0.9]">
             Expose ghost projects, <span className="text-saffron italic">instantly.</span>
           </h1>
           <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
             NagrikAI cross-references government claims with verified satellite data and financial audits — using AI that understands infrastructure, location, and corruption patterns in real-time.
           </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
           <Link to="/analyze" className="bg-saffron text-white px-10 py-5 rounded-3xl font-black text-sm flex items-center gap-3 shadow-2xl shadow-saffron/20 hover:scale-105 hover:bg-navy-deep transition-all active:scale-95 group">
             Analyse a Claim <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </Link>
           <Link to="/tracker" className="bg-white border-2 border-navy-deep/5 text-navy-deep px-10 py-5 rounded-3xl font-black text-sm hover:border-saffron hover:text-saffron transition-all active:scale-95">
             Explore Tracker
           </Link>
        </div>

        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No registration required · Verified for all 28 States</p>

        {/* Live Feed Section (Inspired by "Live Matches") */}
        <section className="w-full pt-16 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-300">
           <div className="bg-navy-deep rounded-[3rem] p-12 text-white relative overflow-hidden shadow-premium">
              <div className="absolute top-0 right-0 p-12 opacity-5"><ShieldAlert className="w-64 h-64 rotate-12" /></div>
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Live Integrity Matches Near {profile?.district || "India"}</span>
                 </div>
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Updated just now</span>
              </div>

              <div className="grid md:grid-cols-3 gap-6 relative z-10">
                 {combined.filter(p => p.ghost_risk).slice(0, 3).map((p, i) => (
                    <div key={p.id} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md hover:bg-white/10 transition-all group">
                       <div className="flex items-center justify-between mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-saffron/20 flex items-center justify-center text-saffron group-hover:rotate-12 transition-transform">
                             <Satellite className="w-6 h-6" />
                          </div>
                          <div className="bg-saffron/20 text-saffron px-3 py-1.5 rounded-full text-[10px] font-black">98.4% MATCH</div>
                       </div>
                       <h3 className="text-lg font-black text-left leading-tight mb-2">{p.name}</h3>
                       <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest mb-6">
                          <ShieldCheck className="w-4 h-4 text-success" /> {p.district}, {p.state}
                       </div>
                       <Link to="/analyze" search={{ text: p.name }} className="w-full bg-white text-navy-deep py-4 rounded-2xl font-black text-xs block hover:bg-saffron hover:text-white transition-all shadow-lg active:scale-95">
                          View Evidence Finder
                       </Link>
                    </div>
                 ))}
              </div>
              
              <div className="mt-12 flex justify-center border-t border-white/10 pt-12">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-4xl">
                    <MiniStat label="Ghost Risks" value={stats.ghosts} />
                    <MiniStat label="Funds Monitored" value={`${(stats.value / 100).toFixed(1)}B`} />
                    <MiniStat label="RTI Drafted" value={stats.rtis} />
                    <MiniStat label="Beneficiaries" value="2.4M" />
                 </div>
              </div>
           </div>
        </section>
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string, value: string | number }) {
   return (
      <div className="text-center">
         <p className="text-3xl font-black text-white tracking-tighter mb-1">{value}</p>
         <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">{label}</p>
      </div>
   );
}
