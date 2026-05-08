import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, ghostScoreColor } from "@/lib/format";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Search, X } from "lucide-react";

import { Loader } from "@googlemaps/js-api-loader";

export const Route = createFileRoute("/map")({ component: GhostMap });

const TYPES = ["All", "ROAD", "BRIDGE", "SCHOOL", "HEALTH", "WATER"];
const SEVS = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

function GhostMap() {
  const [projects, setProjects] = useState<any[]>([]);
  const [type, setType] = useState("All");
  const [sev, setSev] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [view, setView] = useState<"ghost" | "recovery" | "success">("ghost");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("projects").select("*").then(({ data }) => setProjects(data || []));
    const ch = supabase.channel("projects-rt").on("postgres_changes", { event: "*", schema: "public", table: "projects" },
      () => supabase.from("projects").select("*").then(({ data }) => setProjects(data || []))).subscribe();
    return () => { ch.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
    });

    loader.importLibrary("maps").then(({ Map }) => {
      const newMap = new Map(mapRef.current!, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        mapId: "f9d6a3b2b4b5b6b7",
        disableDefaultUI: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#1a1c2c" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#1a1c2c" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8b9bb4" }] },
          { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b5d67" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
        ],
      });
      setMap(newMap);
    });
  }, []);

  const filtered = useMemo(() => projects.filter(p =>
    (type === "All" || p.project_type === type) &&
    (sev === "All" || p.severity === sev) &&
    (!q || (p.name + p.district + p.state).toLowerCase().includes(q.toLowerCase()))
  ), [projects, type, sev, q]);

  // Update markers
  useEffect(() => {
    if (!map || !filtered.length) return;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
    });

    loader.importLibrary("marker").then(({ Marker }) => {
      filtered.forEach(p => {
        const marker = new Marker({
          position: { lat: p.lat, lng: p.lng },
          map: map,
          title: p.name,
        });

        marker.addListener("click", () => setSelected(p));
      });
    });
  }, [map, filtered]);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left sidebar */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects, districts..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-saffron" />
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {TYPES.map(t => <button key={t} onClick={() => setType(t)} className={`text-xs px-2.5 py-1 rounded-full ${type === t ? "bg-navy-deep text-white" : "bg-muted hover:bg-muted/70"}`}>{t}</button>)}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {SEVS.map(s => <button key={s} onClick={() => setSev(s)} className={`text-xs px-2.5 py-1 rounded-full ${sev === s ? "bg-saffron text-white" : "bg-muted hover:bg-muted/70"}`}>{s}</button>)}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map(p => (
              <button key={p.id} onClick={() => setSelected(p)}
                className={`w-full text-left bg-white border rounded-lg p-3 hover:border-saffron transition ${selected?.id === p.id ? "border-saffron ring-2 ring-saffron/20" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-medium text-sm leading-tight">{p.name}</div>
                  <SeverityBadge severity={p.severity} />
                </div>
                <div className="text-xs text-muted-foreground mb-2">{p.district}, {p.state}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${p.ghost_score}%`, background: ghostScoreColor(p.ghost_score) }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ color: ghostScoreColor(p.ghost_score) }}>{p.ghost_score}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{formatINR(p.sanctioned_amount)}</div>
              </button>
            ))}
            {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No projects match your filters.</div>}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative bg-navy-deep overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card rounded-full p-1 flex shadow-elevated">
            {[
              { v: "ghost", l: "Ghost Exposure" },
              { v: "recovery", l: "Recovery Opportunities" },
              { v: "success", l: "Success Stories" },
            ].map(t => (
              <button key={t.v} onClick={() => setView(t.v as any)}
                className={`text-xs px-4 py-2 rounded-full font-medium transition ${view === t.v ? "bg-saffron text-white" : "text-muted-foreground hover:text-foreground"}`}>{t.l}</button>
            ))}
          </div>

          <div ref={mapRef} className="absolute inset-0 w-full h-full" />

          {selected && (
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-card shadow-elevated overflow-y-auto">
              <div className="relative">
                <img src={selected.satellite_image_url} alt="" className="w-full h-48 object-cover" />
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"><X className="w-4 h-4" /></button>
                <div className="absolute bottom-3 left-3 bg-navy-deep/80 text-white text-xs px-2 py-1 rounded">🛰️ AI Analysed</div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg leading-tight">{selected.name}</h3>
                  <SeverityBadge severity={selected.severity} />
                </div>
                <div className="text-sm text-muted-foreground mb-4">{selected.district}, {selected.state}</div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div><div className="text-xs text-muted-foreground">Sanctioned</div><div className="font-bold">{formatINR(selected.sanctioned_amount)}</div></div>
                  <div><div className="text-xs text-muted-foreground">Ghost Score</div><div className="font-bold" style={{ color: ghostScoreColor(selected.ghost_score) }}>{selected.ghost_score}/100</div></div>
                  <div className="col-span-2"><div className="text-xs text-muted-foreground">Agency</div><div className="font-medium text-sm">{selected.executing_agency}</div></div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/project/$id" params={{ id: selected.id }} className="bg-saffron text-white text-center py-2.5 rounded-lg text-sm font-semibold">View Full Details</Link>
                  <Link to="/rti" className="border text-center py-2.5 rounded-lg text-sm font-semibold">Generate RTI</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
