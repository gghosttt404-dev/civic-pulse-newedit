import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState, useMemo } from "react";
import { useUserProfile } from "@/lib/session";
import { formatINR } from "@/lib/format";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Map, Wallet, FileText, Radio, AlertTriangle, TrendingUp, ShieldAlert, CheckCircle2 } from "lucide-react";
import { fetchGovtProjects, type GovtProject } from "@/lib/govt-api";
import { SAMPLE_PROJECTS } from "@/lib/sample-projects";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const profile = useUserProfile();
  const [stats, setStats] = useState({ ghosts: 0, rtis: 14, schemes: 12, value: 0 });
  const [combined, setCombined] = useState<GovtProject[]>([]);
  const [alerts, setAlerts] = useState<GovtProject[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const govt = await fetchGovtProjects();
        const govtProjects = (Array.isArray(govt) ? govt : []).filter(g => !g.id.startsWith("fallback"));

        const verified: GovtProject[] = SAMPLE_PROJECTS.map(p => ({
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

        const ghostCount = all.filter(p => p.ghost_risk).length;
        const totalValue = all.reduce((sum, p) => sum + p.sanctioned_amount, 0);

        setStats(prev => ({
          ...prev,
          ghosts: ghostCount,
          value: totalValue
        }));

        if (profile?.state) {
          const local = all.filter(p => p.state === profile.state && p.ghost_risk);
          setAlerts(local);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [profile]);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-navy-deep tracking-tighter">
              Jai Hind{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 🇮🇳
            </h1>
            <p className="text-muted-foreground font-medium">Verified Citizen Oversight Dashboard</p>
          </div>
          <div className="bg-saffron/10 border-2 border-saffron/20 rounded-2xl px-6 py-3 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-saffron flex items-center justify-center text-white shadow-lg">
               <TrendingUp className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-saffron">Active Oversight</p>
               <p className="text-lg font-black text-navy-deep">{combined.length} Projects</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={ShieldAlert} tone="danger" label="Potential Ghost Risks" value={stats.ghosts} />
          <Stat icon={FileText} tone="info" label="RTI Inquiries" value={stats.rtis} />
          <Stat icon={Wallet} tone="success" label="Benefits Matched" value={stats.schemes} />
          <Stat icon={TrendingUp} tone="saffron" label="Funds Monitored" value={formatINR(stats.value)} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: "/map", icon: Map, label: "Ghost Heatmap", desc: "Interactive Map" },
            { to: "/grants", icon: Wallet, label: "My Benefits", desc: "Scheme Finder" },
            { to: "/rti", icon: FileText, label: "RTI Hub", desc: "Legal Action" },
            { to: "/tracker", icon: Radio, label: "Project Tracker", desc: "Live Monitoring" },
          ].map(q => (
            <Link key={q.to} to={q.to} className="bg-card rounded-2xl border-2 border-transparent hover:border-saffron/40 p-6 shadow-card transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <q.icon className="w-16 h-16" />
              </div>
              <q.icon className="w-8 h-8 text-saffron mb-4" />
              <div className="font-black text-navy-deep">{q.label}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{q.desc}</div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-xl flex items-center gap-2"><CheckCircle2 className="text-success" /> Verified Projects Activity</h2>
                <Link to="/tracker" className="text-xs font-black text-saffron hover:underline uppercase">View All Projects →</Link>
              </div>
              <div className="space-y-3">
                {combined.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-xl border transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-navy-deep group-hover:text-saffron transition-colors">{r.name}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">{r.district}, {r.state}</div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                       <div className="hidden md:block">
                         <div className="text-xs font-black text-navy-deep">{r.completion_pct}%</div>
                         <div className="w-16 h-1 bg-muted rounded-full mt-1">
                           <div className="h-full bg-saffron rounded-full" style={{width: `${r.completion_pct}%`}} />
                         </div>
                       </div>
                       {r.ghost_risk && <SeverityBadge severity="CRITICAL" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {alerts.length > 0 && (
              <div className="bg-danger/5 border-2 border-danger/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 text-danger font-black uppercase text-xs tracking-widest"><AlertTriangle className="w-5 h-5" /> State Alerts: {profile?.state}</div>
                <div className="space-y-3">
                  {alerts.slice(0, 3).map(a => (
                    <div key={a.id} className="bg-white rounded-xl p-3 shadow-sm border border-danger/10">
                      <div className="font-bold text-[11px] leading-tight mb-1">{a.name}</div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-muted-foreground">{a.district}</span>
                         <SeverityBadge severity="CRITICAL" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-navy-deep text-white rounded-2xl p-6 shadow-card relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="font-black text-lg mb-2">NagrikBot AI</h3>
                 <p className="text-xs text-white/70 mb-4">Have questions about a project or scheme? Ask our AI assistant.</p>
                 <Link to="/analyze" className="inline-block bg-saffron text-white text-[10px] font-black px-6 py-3 rounded-full shadow-lg shadow-saffron/20 hover:scale-105 transition-transform uppercase">
                   Start Conversation
                 </Link>
               </div>
               <Radio className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-white/5" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, tone, label, value }: any) {
  const map: any = { danger: "text-danger bg-danger/10 border-danger/20", info: "text-info bg-info/10 border-info/20", success: "text-success bg-success/10 border-success/20", saffron: "text-saffron bg-saffron/10 border-saffron/20" };
  return (
    <div className={`bg-card rounded-2xl border p-6 shadow-card hover:shadow-elevated transition-shadow`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${map[tone]} border-2 mb-4`}><Icon className="w-6 h-6" /></div>
      <div className="text-2xl font-black text-navy-deep tracking-tighter tabular-nums">{value}</div>
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
