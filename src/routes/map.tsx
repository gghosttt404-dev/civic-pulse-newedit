import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, ghostScoreColor } from "@/lib/format";
import { projectsOrFallback, type Project } from "@/lib/sample-projects";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Search, X, FileText, Camera, Download, Share2, AlertTriangle } from "lucide-react";
import { CommunityImpact } from "@/components/CommunityImpact";
import { toast } from "sonner";
import { getUserId } from "@/lib/session";

export const Route = createFileRoute("/map")({ component: GhostMap });

const TYPES = ["All", "ROAD", "BRIDGE", "SCHOOL", "HEALTH", "WATER"];
const SEVS = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const MAP_VIEWS = [
  { v: "ghost", l: "Ghost Exposure" },
  { v: "recovery", l: "Recovery Opportunities" },
  { v: "success", l: "Success Stories" },
] as const;

type MapView = (typeof MAP_VIEWS)[number]["v"];
type GoogleMapsAuthWindow = Window & { gm_authFailure?: () => void };
const GOOGLE_MAPS_ENABLED = import.meta.env.VITE_GOOGLE_MAPS_ENABLED === "true";

function markerColor(score: number) {
  if (score > 80) return "#dc2626";
  if (score > 55) return "#f97316";
  return "#16a34a";
}

function GhostMap() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [type, setType] = useState("All");
  const [sev, setSev] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [view, setView] = useState<MapView>("ghost");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportNote, setReportNote] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);

  const submitReport = async () => {
    if (!selected || !reportNote.trim()) return;
    const { error } = await supabase.from("citizen_reports").insert({
      project_id: selected.id,
      submitted_by: getUserId(),
      note: reportNote,
      verified: false
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Report submitted for verification!");
      setShowReportDialog(false);
      setReportNote("");
    }
  };

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .then(({ data }) => setProjects(projectsOrFallback(data)))
      .catch(() => setProjects(projectsOrFallback(null)));
    const ch = supabase
      .channel("projects-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () =>
        supabase
          .from("projects")
          .select("*")
          .then(({ data }) => setProjects(projectsOrFallback(data)))
          .catch(() => setProjects(projectsOrFallback(null))),
      )
      .subscribe();
    return () => {
      ch.unsubscribe();
    };
  }, []);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (type === "All" || p.project_type === type) &&
          (sev === "All" || p.severity === sev) &&
          (!q || (p.name + p.district + p.state).toLowerCase().includes(q.toLowerCase())),
      ),
    [projects, type, sev, q],
  );

  useEffect(() => {
    if (!mapRef.current) return;
    if (!GOOGLE_MAPS_ENABLED) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError("Missing VITE_GOOGLE_MAPS_API_KEY in the deployed environment.");
      return;
    }

    let cancelled = false;
    const authWindow = window as GoogleMapsAuthWindow;
    authWindow.gm_authFailure = () => {
      setMapError(
        "Google Maps rejected the API key. Enable Maps JavaScript API and allow this Vercel domain.",
      );
    };

    import("@googlemaps/js-api-loader")
      .then(async ({ setOptions, importLibrary }) => {
        setOptions({
          apiKey,
          version: "3.55",
        });

        const [ { Map }, { AdvancedMarkerElement }, { HeatmapLayer } ] = await Promise.all([
          importLibrary("maps"),
          importLibrary("marker"),
          importLibrary("visualization"),
        ]);
        
        if (cancelled || !mapRef.current) return;

        const nextMap = new Map(mapRef.current, {
          center: { lat: 22.9734, lng: 78.6569 },
          zoom: 5,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
        });

        setMap(nextMap);
        setMapError(null);
      })
      .catch((error) => {
        console.error(error);
        setMapError(
          "Google Maps could not load. Check the browser API key and Maps JavaScript API access.",
        );
      });

    return () => {
      cancelled = true;
      authWindow.gm_authFailure = undefined;
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    let markers: google.maps.marker.AdvancedMarkerElement[] = [];
    let cancelled = false;

    import("@googlemaps/js-api-loader")
      .then(({ importLibrary }) => Promise.all([importLibrary("marker"), importLibrary("visualization")]))
      .then(([{ AdvancedMarkerElement }, { HeatmapLayer }]) => {
        if (cancelled) return;

        if (view === "ghost" || view === "recovery") {
          const heatmapData = filtered
            .filter((p) => p.lat != null && p.lng != null)
            .map((p) => ({
              location: new google.maps.LatLng(p.lat!, p.lng!),
              weight: view === "ghost" ? (p.ghost_score ?? 0) / 10 : Number(p.sanctioned_amount) / 10,
            }));

          const heatmap = new HeatmapLayer({
            data: heatmapData,
            map,
            radius: 40,
            opacity: 0.8,
            gradient: view === "ghost" 
              ? ["rgba(0, 255, 255, 0)", "rgba(0, 255, 255, 1)", "rgba(0, 191, 255, 1)", "rgba(0, 127, 255, 1)", "rgba(0, 63, 255, 1)", "rgba(0, 0, 255, 1)", "rgba(0, 0, 223, 1)", "rgba(0, 0, 191, 1)", "rgba(0, 0, 159, 1)", "rgba(0, 0, 127, 1)", "rgba(63, 0, 91, 1)", "rgba(127, 0, 63, 1)", "rgba(191, 0, 31, 1)", "rgba(255, 0, 0, 1)"]
              : ["rgba(0, 255, 0, 0)", "rgba(0, 255, 0, 1)", "rgba(50, 255, 0, 1)", "rgba(100, 255, 0, 1)", "rgba(150, 255, 0, 1)", "rgba(200, 255, 0, 1)", "rgba(255, 255, 0, 1)", "rgba(255, 200, 0, 1)", "rgba(255, 150, 0, 1)", "rgba(255, 100, 0, 1)", "rgba(255, 50, 0, 1)", "rgba(255, 0, 0, 1)"]
          });

          return () => {
            heatmap.setMap(null);
          };
        }

        markers = filtered.flatMap((project) => {
          if (project.lat == null || project.lng == null) return [];

          const score = project.ghost_score ?? 0;
          const markerEl = document.createElement("button");
          markerEl.type = "button";
          markerEl.title = project.name;
          markerEl.setAttribute("aria-label", project.name);
          markerEl.style.cssText = [
            "width: 18px",
            "height: 18px",
            "border-radius: 9999px",
            "border: 2px solid white",
            `background: ${markerColor(score)}`,
            "box-shadow: 0 8px 24px rgba(0,0,0,.35)",
            "cursor: pointer",
          ].join(";");

          const marker = new AdvancedMarkerElement({
            map,
            position: { lat: project.lat, lng: project.lng },
            title: project.name,
            content: markerEl,
          });

          marker.addListener("click", () => setSelected(project));
          return [marker];
        });
      });

    return () => {
      cancelled = true;
      markers.forEach((marker) => {
        marker.map = null;
      });
      markers = [];
    };
  }, [filtered, map, view]);

  useEffect(() => {
    if (!map || selected?.lat == null || selected.lng == null) return;
    map.panTo({ lat: selected.lat, lng: selected.lng });
    map.setZoom(Math.max(map.getZoom() ?? 5, 7));

    // Fetch reports for selected project
    supabase
      .from("citizen_reports")
      .select("*")
      .eq("project_id", selected.id)
      .then(({ data }) => setReports(data || []));
  }, [map, selected]);

  const generateRTI = async () => {
    if (!selected) return;
    const { data, error } = await supabase
      .from("rtis")
      .insert({
        user_id: getUserId(),
        project_id: selected.id,
        rti_type: "GHOST",
        pio_name: "The PIO",
        pio_address: `Office of the District Magistrate, ${selected.district}`,
        department: selected.executing_agency,
        subject_line: `Information regarding ${selected.name}`,
        body_english: `Under Section 6(1) of the RTI Act, 2005, I request information regarding "${selected.name}" sanctioned for ₹${selected.sanctioned_amount} lakhs in ${selected.district}, ${selected.state}: 1) Date-wise expenditure. 2) Contractor and tender documents. 3) Site inspection reports. 4) Geo-tagged completion photos. 5) Third-party quality audit.`,
        status: "DRAFTED",
      })
      .select()
      .single();
    if (error) toast.error(error.message);
    else {
      toast.success("RTI drafted! Redirecting...");
      window.location.href = "/rti";
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left sidebar */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects, districts..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`text-xs px-2.5 py-1 rounded-full ${type === t ? "bg-navy-deep text-white" : "bg-muted hover:bg-muted/70"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {SEVS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSev(s)}
                  className={`text-xs px-2.5 py-1 rounded-full ${sev === s ? "bg-saffron text-white" : "bg-muted hover:bg-muted/70"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left bg-white border rounded-lg p-3 hover:border-saffron transition ${selected?.id === p.id ? "border-saffron ring-2 ring-saffron/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-medium text-sm leading-tight">{p.name}</div>
                  <SeverityBadge severity={p.severity ?? "LOW"} />
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {p.district}, {p.state}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${p.ghost_score ?? 0}%`,
                        background: ghostScoreColor(p.ghost_score ?? 0),
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: ghostScoreColor(p.ghost_score ?? 0) }}
                  >
                    {p.ghost_score ?? 0}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatINR(p.sanctioned_amount)}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No projects match your filters.
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative bg-navy-deep overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card rounded-full p-1 flex shadow-elevated">
            {MAP_VIEWS.map((t) => (
              <button
                key={t.v}
                onClick={() => setView(t.v)}
                className={`text-xs px-4 py-2 rounded-full font-medium transition ${view === t.v ? "bg-saffron text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t.l}
              </button>
            ))}
          </div>

          <div ref={mapRef} className="absolute inset-0" />

          {!map && !GOOGLE_MAPS_ENABLED && (
            <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_30%_35%,rgba(255,128,0,0.18),transparent_22%),radial-gradient(circle_at_72%_52%,rgba(34,197,94,0.16),transparent_18%),linear-gradient(135deg,#111827_0%,#0f172a_48%,#182033_100%)]">
              <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
              <div className="absolute left-[16%] top-[18%] h-[62%] w-[54%] rounded-[55%_45%_62%_38%] border border-white/15 bg-emerald-400/10 shadow-[inset_0_0_60px_rgba(16,185,129,0.12)]" />
              <div className="absolute left-[34%] top-[22%] h-[40%] w-[34%] rounded-[45%_55%_42%_58%] border border-white/10 bg-saffron/10" />

              {filtered.map((project) => {
                if (project.lat == null || project.lng == null) return null;
                const left = Math.min(86, Math.max(12, ((project.lng - 68) / 30) * 74 + 12));
                const top = Math.min(82, Math.max(14, ((36 - project.lat) / 28) * 68 + 14));
                const score = project.ghost_score ?? 0;
                const tone = score > 80 ? "bg-danger" : score > 55 ? "bg-saffron" : "bg-success";

                return (
                  <button
                    key={project.id}
                    onClick={() => setSelected(project)}
                    className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg ${tone} ${selected?.id === project.id ? "ring-4 ring-white/40" : ""}`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    title={project.name}
                    aria-label={project.name}
                  />
                );
              })}
            </div>
          )}

          {mapError && (
            <div className="absolute left-4 bottom-4 z-10 max-w-md rounded-lg border border-danger/30 bg-card p-4 text-sm shadow-elevated">
              <div className="font-semibold text-danger">Google Maps needs configuration</div>
              <p className="mt-1 text-muted-foreground">{mapError}</p>
            </div>
          )}

          {selected && (
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-card shadow-elevated overflow-y-auto">
              <div className="relative">
                <img
                  src={selected.satellite_image_url}
                  alt=""
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 bg-navy-deep/80 text-white text-xs px-2 py-1 rounded">
                  🛰️ AI Analysed
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg leading-tight">{selected.name}</h3>
                  <SeverityBadge severity={selected.severity ?? "LOW"} />
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  {selected.district}, {selected.state}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Sanctioned</div>
                    <div className="font-bold">{formatINR(selected.sanctioned_amount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Ghost Score</div>
                    <div
                      className="font-bold"
                      style={{ color: ghostScoreColor(selected.ghost_score ?? 0) }}
                    >
                      {selected.ghost_score ?? 0}/100
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Agency</div>
                    <div className="font-medium text-sm">{selected.executing_agency}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Evidence summary */}
                  <div className="space-y-2">
                    <div className="bg-danger/5 border-l-4 border-danger p-3 text-xs">
                      <div className="font-bold flex items-center gap-1.5 mb-1 text-danger uppercase tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5" /> Satellite Evidence
                      </div>
                      <p className="text-muted-foreground">{selected.gemini_analysis}</p>
                    </div>
                    {(selected.evidence_points as string[] || []).map((e, i) => (
                      <div key={i} className="bg-amber-50 border-l-4 border-amber-400 p-2 text-[10px] text-amber-800 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {e}
                      </div>
                    ))}
                  </div>

                  {/* Community Impact */}
                  <CommunityImpact lakhs={Number(selected.sanctioned_amount)} />

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={generateRTI}
                      className="bg-saffron text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> Generate RTI
                    </button>
                    <Link
                      to="/project/$id"
                      params={{ id: selected.id }}
                      className="bg-navy-deep text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center"
                    >
                      Full Details
                    </Link>
                    <button 
                      onClick={() => setShowReportDialog(true)}
                      className="border py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" /> Report
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="border py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Evidence
                    </button>
                  </div>

                  {/* Report Dialog Overlay */}
                  {showReportDialog && (
                    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
                      <div className="bg-card w-full max-w-sm rounded-xl p-5 shadow-elevated">
                        <h3 className="font-bold mb-4">Submit Ground Report</h3>
                        <textarea 
                          value={reportNote}
                          onChange={e => setReportNote(e.target.value)}
                          placeholder="What did you see at the site?"
                          className="w-full h-32 p-3 border rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-saffron"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setShowReportDialog(false)}
                            className="flex-1 border py-2 rounded-lg text-sm font-semibold"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={submitReport}
                            className="flex-1 bg-saffron text-white py-2 rounded-lg text-sm font-semibold"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Citizen Reports */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider mb-2">Ground Reports</h4>
                    {reports.length === 0 ? (
                      <div className="text-center py-4 border rounded-lg bg-muted/30">
                        <Camera className="w-6 h-6 mx-auto mb-1 opacity-20" />
                        <p className="text-[10px] text-muted-foreground">No ground reports yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {reports.slice(0, 2).map((r) => (
                          <div key={r.id} className="flex gap-2 p-2 border rounded-lg bg-white">
                            {r.photo_url && (
                              <img src={r.photo_url} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-[10px] line-clamp-2">{r.note}</p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {new Date(r.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
