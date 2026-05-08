import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { SeverityBadge } from "@/components/SeverityBadge";
import { GhostScoreGauge } from "@/components/GhostScoreGauge";
import { AlertTriangle, FileText, Camera, Download, Share2, Check, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getUserId } from "@/lib/session";

export const Route = createFileRoute("/project/$id")({ component: ProjectDetail });

function ProjectDetail() {
  const { id } = useParams({ from: "/project/$id" });
  const [p, setP] = useState<any | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("projects").select("*").eq("id", id).maybeSingle().then(({ data }) => setP(data));
    supabase.from("citizen_reports").select("*").eq("project_id", id).then(({ data }) => setReports(data || []));
  }, [id]);

  const generateRTI = async () => {
    if (!p) return;
    const { data, error } = await supabase.from("rtis").insert({
      user_id: getUserId(),
      project_id: p.id,
      rti_type: "GHOST",
      pio_name: "The PIO",
      pio_address: `Office of the District Magistrate, ${p.district}`,
      department: p.executing_agency,
      subject_line: `Information regarding ${p.name}`,
      body_english: `Under Section 6(1) of the RTI Act, 2005, I request information regarding "${p.name}" sanctioned for ₹${p.sanctioned_amount} lakhs in ${p.district}, ${p.state}: 1) Date-wise expenditure. 2) Contractor and tender documents. 3) Site inspection reports. 4) Geo-tagged completion photos. 5) Third-party quality audit.`,
      status: "DRAFTED",
    }).select().single();
    if (error) toast.error(error.message);
    else { toast.success("RTI drafted! Redirecting..."); window.location.href = "/rti"; }
  };

  if (!p) return <AppShell><div className="p-12 text-center text-muted-foreground">Loading...</div></AppShell>;

  const lakhs = Number(p.sanctioned_amount);
  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <nav className="flex items-center text-sm text-muted-foreground gap-1.5">
          <Link to="/map" className="hover:text-foreground">Map</Link>
          <ChevronRight className="w-3 h-3" /><span>{p.district}</span>
          <ChevronRight className="w-3 h-3" /><span className="text-foreground">{p.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-elevated bg-card relative">
          {/* LEFT panel */}
          <div className="bg-navy-deep text-white p-7">
            <div className="text-xs uppercase tracking-wider text-white/60 mb-3">Government Claims</div>
            <h1 className="text-2xl lg:text-3xl font-bold leading-tight mb-1">{p.name}</h1>
            <div className="text-white/60 text-sm mb-6">{p.district}, {p.state}</div>
            <div className="text-5xl font-bold text-saffron mb-1">{formatINR(lakhs)}</div>
            <div className="text-xs text-white/50 mb-6">Sanctioned amount</div>
            <dl className="space-y-3 text-sm">
              <Row k="Project type" v={<span className="bg-white/10 px-2 py-0.5 rounded">{p.project_type}</span>} />
              <Row k="Executing agency" v={p.executing_agency} />
              <Row k="Fund release" v={p.release_date} />
              <Row k="Claimed completion" v={p.claimed_completion_date} />
              <Row k="Block" v={p.block} />
            </dl>
          </div>

          {/* CENTER gauge */}
          <div className="absolute top-7 left-1/2 -translate-x-1/2 hidden lg:block z-10">
            <div className="bg-card rounded-full p-4 shadow-elevated">
              <GhostScoreGauge score={p.ghost_score} size={140} />
            </div>
          </div>

          {/* RIGHT panel */}
          <div className="bg-[oklch(0.15_0.02_250)] text-white p-7">
            <div className="text-xs uppercase tracking-wider text-white/60 mb-3">🛰️ Satellite Reality</div>
            <div className="rounded-lg overflow-hidden mb-4 relative">
              <img src={p.satellite_image_url} alt="" className="w-full h-48 object-cover" />
              <div className="absolute top-3 left-3 bg-saffron text-white text-xs px-2 py-1 rounded">AI Analysis Complete</div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4">{p.gemini_analysis}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">Construction detected:</span>
              {p.construction_detected ?
                <span className="bg-success text-white text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"><Check className="w-3 h-3"/> YES</span> :
                <span className="bg-danger text-white text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"><X className="w-3 h-3"/> NO</span>}
            </div>
          </div>
        </div>

        {/* Mobile gauge */}
        <div className="flex justify-center lg:hidden"><GhostScoreGauge score={p.ghost_score} /></div>

        {/* Evidence */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-danger" /> Evidence Points</h2>
          <ul className="space-y-2">
            {(p.evidence_points as string[]).map((e, i) => (
              <li key={i} className="border-l-4 border-danger bg-danger/5 px-4 py-2.5 text-sm">⚠️ {e}</li>
            ))}
          </ul>
        </div>

        {/* Community Impact */}
        <div className="bg-success/5 border-2 border-success/20 rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-1 text-success">Community Impact Redirector</h2>
          <p className="text-sm text-muted-foreground mb-4">If this {formatINR(lakhs)} was recovered, it could fund:</p>
          <div className="grid md:grid-cols-3 gap-3">
            <ImpactCard title="Classrooms" value={Math.floor(lakhs / 8)} unit="rooms" detail="@ ₹8L per classroom" />
            <ImpactCard title="Rural Roads" value={Math.floor(lakhs / 5)} unit="km" detail="@ ₹5L per km PMGSY" />
            <ImpactCard title="PHC Medicine" value={Math.floor(lakhs / 3)} unit="months" detail="@ ₹3L per month supply" />
          </div>
          <button className="mt-5 bg-success text-white px-5 py-2.5 rounded-lg text-sm font-semibold">Generate Reallocation Proposal</button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={generateRTI} className="bg-saffron text-white px-5 py-3 rounded-lg text-sm font-semibold inline-flex items-center gap-2"><FileText className="w-4 h-4" /> Generate RTI</button>
          <button className="bg-card border px-5 py-3 rounded-lg text-sm font-semibold inline-flex items-center gap-2"><Camera className="w-4 h-4" /> Submit Ground Report</button>
          <button className="bg-card border px-5 py-3 rounded-lg text-sm font-semibold inline-flex items-center gap-2"><Download className="w-4 h-4" /> Download Evidence PDF</button>
          <button className="bg-card border px-3 py-3 rounded-lg"><Share2 className="w-4 h-4" /></button>
          <span className="ml-auto self-center text-xs text-saffron border border-saffron/30 px-2 py-1 rounded">🔌 AI Integration Ready</span>
        </div>

        {/* Citizen reports */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="font-bold text-lg mb-4">Citizen Ground Reports</h2>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Be the first to report from the ground</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {reports.map(r => (
                <div key={r.id} className="border rounded-lg overflow-hidden">
                  {r.photo_url && <img src={r.photo_url} alt="" className="w-full h-32 object-cover" />}
                  <div className="p-3 text-xs"><div>{r.note}</div><div className="text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return <div className="flex justify-between gap-4 py-2 border-b border-white/10"><dt className="text-white/50">{k}</dt><dd className="text-right">{v}</dd></div>;
}
function ImpactCard({ title, value, unit, detail }: any) {
  return <div className="bg-white rounded-lg p-4">
    <div className="text-3xl font-bold text-success">{value}</div>
    <div className="text-sm font-medium">{unit}</div>
    <div className="text-xs text-muted-foreground mt-1">{title} • {detail}</div>
  </div>;
}
