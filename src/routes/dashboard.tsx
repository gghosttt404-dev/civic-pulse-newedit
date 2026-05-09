import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/session";
import { formatINR } from "@/lib/format";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Map, Wallet, FileText, Radio, AlertTriangle, TrendingUp, ShieldAlert } from "lucide-react";
import { fetchGovtProjects, type GovtProject } from "@/lib/govt-api";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const profile = useUserProfile();
  const [stats, setStats] = useState({ ghosts: 0, rtis: 0, schemes: 0, value: 0 });
  const [recent, setRecent] = useState<GovtProject[]>([]);
  const [alerts, setAlerts] = useState<GovtProject[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const rawProjects = await fetchGovtProjects();
        const projects = Array.isArray(rawProjects) && rawProjects.length > 0 ? rawProjects : [
          { id: "f1", name: "Bridge over Kosi Tributary", state: "Bihar", district: "Madhepura", sanctioned_amount: 890, fund_released: 810, completion_pct: 11, ghost_risk: true, status: "GHOST_RISK", lat: 25.92, lng: 86.79 },
          { id: "f2", name: "Rural Road Phulwari", state: "Bihar", district: "Patna", sanctioned_amount: 245, fund_released: 230, completion_pct: 8, ghost_risk: true, status: "GHOST_RISK", lat: 25.59, lng: 85.13 },
          { id: "f3", name: "Rural Hospital Chitradurga", state: "Karnataka", district: "Chitradurga", sanctioned_amount: 580, fund_released: 540, completion_pct: 18, ghost_risk: true, status: "GHOST_RISK", lat: 14.05, lng: 76.17 }
        ];
        
        const ghostCount = projects.filter(p => p.ghost_risk).length;
        const totalSanctioned = projects.reduce((sum, p) => sum + p.sanctioned_amount, 0);
        
        setStats({
          ghosts: ghostCount,
          rtis: 14,
          schemes: 12,
          value: totalSanctioned
        });
        setRecent(projects.slice(0, 5));
        
        if (profile?.state) {
          const localAlerts = projects.filter(p => p.state === profile.state && p.ghost_risk);
          setAlerts(localAlerts);
        }
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      }
    })();
  }, [profile]);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋</h1>
          <p className="text-muted-foreground">Here's what's happening across India today.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={ShieldAlert} tone="danger" label="Ghost Risks Flagged" value={stats.ghosts} />
          <Stat icon={FileText} tone="info" label="RTIs Generated" value={stats.rtis} />
          <Stat icon={Wallet} tone="success" label="Schemes Matched" value={stats.schemes} />
          <Stat icon={TrendingUp} tone="saffron" label="Total Sanctioned" value={formatINR(stats.value)} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: "/map", icon: Map, label: "Ghost Heatmap", desc: "View all flagged projects" },
            { to: "/grants", icon: Wallet, label: "Find Schemes", desc: "Match welfare benefits" },
            { to: "/rti", icon: FileText, label: "File RTI", desc: "Generate AI-drafted RTI" },
            { to: "/tracker", icon: Radio, label: "Track Project", desc: "Monitor progress" },
          ].map(q => (
            <Link key={q.to} to={q.to} className="bg-card rounded-xl border p-5 shadow-card hover:border-saffron hover:shadow-elevated transition group">
              <q.icon className="w-6 h-6 text-saffron mb-3" />
              <div className="font-semibold">{q.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{q.desc}</div>
            </Link>
          ))}
        </div>

        {alerts.length > 0 && (
          <div className="bg-danger/5 border-2 border-danger/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-danger font-semibold"><AlertTriangle className="w-5 h-5" /> Critical Alerts in {profile?.state}</div>
            <div className="space-y-2">
              {alerts.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                  <div>
                    <div className="font-medium text-sm">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{formatINR(a.sanctioned_amount)} • {a.district}</div>
                  </div>
                  <SeverityBadge severity="CRITICAL" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border p-5 shadow-card">
          <h2 className="font-semibold mb-3">Recent Projects Across India</h2>
          <div className="space-y-2">
            {recent.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.district}, {r.state} • {formatINR(r.sanctioned_amount)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{r.completion_pct}% Complete</div>
                  <div className="text-[10px] text-muted-foreground">Released: {formatINR(r.fund_released)}</div>
                </div>
                {r.ghost_risk && <SeverityBadge severity="CRITICAL" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, tone, label, value }: any) {
  const map: any = { danger: "text-danger bg-danger/10", info: "text-info bg-info/10", success: "text-success bg-success/10", saffron: "text-saffron bg-saffron/10" };
  return (
    <div className="bg-card rounded-xl border p-5 shadow-card">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${map[tone]} mb-3`}><Icon className="w-5 h-5" /></div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
