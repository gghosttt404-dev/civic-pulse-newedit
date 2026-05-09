import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatINR } from "@/lib/format";
import { Search, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { fetchGovtProjects, type GovtProject } from "@/lib/govt-api";
import { SeverityBadge } from "@/components/SeverityBadge";

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
        const data = await fetchGovtProjects();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setProjects([]);
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
    if (!mapRef.current) return;
    if (!GOOGLE_MAPS_ENABLED) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError("Missing Google Maps API Key.");
      return;
    }

    let cancelled = false;
    const authWindow = window as GoogleMapsAuthWindow;
    authWindow.gm_authFailure = () => {
      setMapError("Google Maps authentication failed.");
    };

    import("@googlemaps/js-api-loader")
      .then(async ({ setOptions, importLibrary }) => {
        setOptions({ apiKey, version: "3.55" });

        const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
          importLibrary("maps"),
          importLibrary("marker"),
        ]);
        
        if (cancelled || !mapRef.current) return;

        const nextMap = new Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 5,
          disableDefaultUI: true,
          zoomControl: true,
          mapId: "CIVIC_MAP_ID", // Using Advanced Markers
        });

        setMap(nextMap);
        setMapError(null);
      })
      .catch((error) => {
        console.error(error);
        setMapError("Google Maps could not load.");
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
      .then(({ importLibrary }) => importLibrary("marker"))
      .then(({ AdvancedMarkerElement }) => {
        if (cancelled) return;

        markers = filtered.flatMap((project) => {
          if (project.lat == null || project.lng == null) return [];

          const markerEl = document.createElement("button");
          markerEl.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            background: ${markerColor(project.status)};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s;
          `;
          markerEl.onmouseenter = () => markerEl.style.transform = "scale(1.2)";
          markerEl.onmouseleave = () => markerEl.style.transform = "scale(1)";

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
      markers.forEach((m) => m.map = null);
    };
  }, [filtered, map]);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)] relative">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card flex flex-col z-20 shadow-elevated">
          <div className="p-4 border-b space-y-4">
            <h2 className="font-bold text-lg">Ghost Heatmap</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-saffron"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-danger" /> GHOST RISK
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> DELAYED
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-success" /> ON TRACK
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left bg-white border rounded-lg p-3 hover:border-saffron transition ${selected?.id === p.id ? "border-saffron ring-2 ring-saffron/20" : ""}`}
              >
                <div className="font-medium text-sm leading-tight mb-1">{p.name}</div>
                <div className="text-[10px] text-muted-foreground mb-2">{p.district}, {p.state}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${p.status === "GHOST_RISK" ? "bg-danger text-white" : (p.status === "DELAYED" ? "bg-yellow-500 text-white" : "bg-success text-white")}`}>
                    {p.status}
                  </span>
                  <span className="text-[10px] font-bold">{p.completion_pct}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative bg-navy-deep overflow-hidden">
          <div ref={mapRef} className="absolute inset-0" />
          
          {selected && (
            <div className="absolute top-4 right-4 w-72 bg-card border rounded-xl shadow-elevated z-30 p-5 animate-in slide-in-from-right-4 duration-300">
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-1 hover:bg-muted rounded-full">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <SeverityBadge severity={selected.status === "GHOST_RISK" ? "CRITICAL" : "HIGH"} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{selected.state}</span>
              </div>
              <h3 className="font-bold text-sm mb-2">{selected.name}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase">Sanctioned</p>
                  <p className="text-xs font-black">{formatINR(selected.sanctioned_amount)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase">Released</p>
                  <p className="text-xs font-black">{formatINR(selected.fund_released)}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Progress</span>
                  <span>{selected.completion_pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${selected.status === "GHOST_RISK" ? "bg-danger" : "bg-success"}`} style={{ width: `${selected.completion_pct}%` }} />
                </div>
              </div>
              <Link to="/tracker" className="w-full bg-navy-deep text-white text-xs font-bold py-2 rounded-lg mt-4 flex items-center justify-center">
                Open in Tracker →
              </Link>
            </div>
          )}

          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy-deep/80 z-40 text-center p-6">
              <div className="bg-card border-2 border-danger/30 rounded-2xl p-8 max-w-sm">
                <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-4" />
                <h3 className="font-bold text-white text-lg mb-2">Maps Initialization Error</h3>
                <p className="text-muted-foreground text-sm mb-6">{mapError}</p>
                <button onClick={() => window.location.reload()} className="bg-saffron text-white px-6 py-2 rounded-lg font-bold">Retry Connection</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
