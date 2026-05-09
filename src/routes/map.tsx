import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatINR } from "@/lib/format";
import { Search, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { fetchGovtProjects, type GovtProject } from "@/lib/govt-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { SAMPLE_PROJECTS } from "@/lib/sample-projects";

export const Route = createFileRoute("/map")({ component: GhostMap });

type GoogleMapsAuthWindow = Window & { gm_authFailure?: () => void };
const GOOGLE_MAPS_ENABLED = import.meta.env.VITE_GOOGLE_MAPS_ENABLED === "true";

function markerColor(status: string) {
  if (status === "GHOST_RISK") return "#dc2626"; // Red
  if (status === "DELAYED") return "#eab308"; // Yellow
  return "#22c55e"; // Green
}

function GhostMap() {
  const [projects, setProjects] = useState<GovtProject[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<GovtProject | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const govt = await fetchGovtProjects();
        const govtProjects = Array.isArray(govt) && govt.length > 0 ? govt : [];

        const mappedSamples: GovtProject[] = SAMPLE_PROJECTS.map(p => ({
          id: p.id,
          name: p.name,
          state: p.state,
          district: p.district,
          sanctioned_amount: p.sanctioned_amount,
          fund_released: p.sanctioned_amount * 0.9,
          completion_pct: p.progress_score,
          ghost_risk: (p.ghost_score || 0) > 70,
          status: p.severity === "CRITICAL" ? "GHOST_RISK" : (p.severity === "HIGH" ? "DELAYED" : "ON_TRACK"),
          lat: p.lat,
          lng: p.lng
        }));

        setProjects([...mappedSamples, ...govtProjects]);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          !q || (p.name + p.district + p.state).toLowerCase().includes(q.toLowerCase()),
      ),
    [projects, q],
  );

  useEffect(() => {
    if (!mapRef.current || !GOOGLE_MAPS_ENABLED) return;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setMapError("Missing Key"); return; }

    import("@googlemaps/js-api-loader")
      .then(async ({ setOptions, importLibrary }) => {
        setOptions({ apiKey, version: "3.55" });
        const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
          importLibrary("maps"), importLibrary("marker")
        ]);
        
        const nextMap = new Map(mapRef.current!, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 5,
          disableDefaultUI: true,
          zoomControl: true,
          mapId: "CIVIC_MAP_ID",
        });
        setMap(nextMap);
      })
      .catch(e => setMapError("Load Error"));
  }, []);

  useEffect(() => {
    if (!map) return;
    let markers: google.maps.marker.AdvancedMarkerElement[] = [];
    
    import("@googlemaps/js-api-loader")
      .then(({ importLibrary }) => importLibrary("marker"))
      .then(({ AdvancedMarkerElement }) => {
        markers = filtered.flatMap((project) => {
          if (project.lat == null || project.lng == null) return [];
          const markerEl = document.createElement("button");
          markerEl.className = "w-5 h-5 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125";
          markerEl.style.backgroundColor = markerColor(project.status);

          const marker = new AdvancedMarkerElement({
            map, position: { lat: project.lat, lng: project.lng }, title: project.name, content: markerEl,
          });
          marker.addListener("click", () => setSelected(project));
          return [marker];
        });
      });
    return () => markers.forEach(m => m.map = null);
  }, [filtered, map]);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)] relative">
        <div className="w-80 border-r bg-card flex flex-col z-20 shadow-elevated">
          <div className="p-4 border-b space-y-4">
            <h2 className="font-bold text-lg">Ghost Heatmap</h2>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects..." className="w-full pl-3 pr-3 py-2 text-sm bg-muted rounded-lg outline-none" />
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger" /> GHOST</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> DELAYED</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> ON TRACK</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => setSelected(p)} className={`w-full text-left bg-white border rounded-lg p-3 hover:border-saffron transition ${selected?.id === p.id ? "border-saffron ring-2 ring-saffron/20" : ""}`}>
                <div className="font-medium text-sm leading-tight mb-1">{p.name}</div>
                <div className="text-[10px] text-muted-foreground">{p.district}, {p.state}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded text-white`} style={{backgroundColor: markerColor(p.status)}}>{p.status}</span>
                  <span className="text-[10px] font-bold">{p.completion_pct}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative bg-navy-deep">
          <div ref={mapRef} className="absolute inset-0" />
          {selected && (
            <div className="absolute top-4 right-4 w-72 bg-card border rounded-xl shadow-elevated z-30 p-5 animate-in slide-in-from-right-4">
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3"><X className="w-4 h-4" /></button>
              <h3 className="font-bold text-sm mb-2">{selected.name}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div><p className="text-muted-foreground uppercase text-[9px]">Sanctioned</p><p className="font-black">{formatINR(selected.sanctioned_amount)}</p></div>
                <div><p className="text-muted-foreground uppercase text-[9px]">Status</p><p className="font-black">{selected.status}</p></div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold"><span>Progress</span><span>{selected.completion_pct}%</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-saffron" style={{ width: `${selected.completion_pct}%` }} />
                </div>
              </div>
              <Link to="/tracker" className="w-full bg-navy-deep text-white text-xs font-bold py-2 rounded-lg mt-4 flex items-center justify-center">View Details</Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
