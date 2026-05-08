import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/lib/session";
import { formatINR } from "@/lib/format";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Map, Wallet, FileText, Radio, AlertTriangle, TrendingUp, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const profile = useUserProfile();
  const [stats, setStats] = useState({ ghosts: 0, rtis: 0, schemes: 0, value: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: g }, { count: r }, { data: rec }] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).gt("ghost_score", 55),
        supabase.from("rtis").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats(s => ({ ...s, ghosts: g || 0, rtis: r || 0, schemes: 12, value: 47000 }));
      setRecent(rec || []);
      if (profile?.district) {
        const { data: a } = await supabase.from("projects").select("*").eq("district", profile.district).gt("ghost_score", 75);
        setAlerts(a || []);
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
          <Stat icon={ShieldAlert} tone="danger" label="Ghost Projects Flagged" value={stats.ghosts} />
          <Stat icon={FileText} tone="info" label="RTIs Generated" value={stats.rtis} />
          <Stat icon={Wallet} tone="success" label="Schemes Matched" value={stats.schemes} />
          <Stat icon={TrendingUp} tone="saffron" label="Est. Benefit Value" value={`₹${(stats.value/1000).toFixed(1)}K/yr`} />
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
            <div className="flex items-center gap-2 mb-3 text-danger font-semibold"><AlertTriangle className="w-5 h-5" /> Critical Alerts in {profile?.district}</div>
            <div className="space-y-2">
              {alerts.map(a => (
                <Link key={a.id} to="/project/$id" params={{ id: a.id }} className="flex items-center justify-between bg-white rounded-lg p-3 hover:shadow-card">
                  <div>
                    <div className="font-medium text-sm">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{formatINR(a.sanctioned_amount)} • {a.executing_agency}</div>
                  </div>
                  <SeverityBadge severity={a.severity} />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border p-5 shadow-card">
          <h2 className="font-semibold mb-3">Recent Flags Across India</h2>
          <div className="space-y-2">
            {recent.map(r => (
              <Link key={r.id} to="/project/$id" params={{ id: r.id }} className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.district}, {r.state} • {formatINR(r.sanctioned_amount)}</div>
                </div>
                <div className="text-2xl font-bold tabular-nums" style={{ color: r.ghost_score > 80 ? "oklch(0.58 0.22 25)" : r.ghost_score > 55 ? "oklch(0.71 0.19 50)" : "oklch(0.52 0.13 155)" }}>{r.ghost_score}</div>
                <SeverityBadge severity={r.severity} />
              </Link>
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
