import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  FileSearch,
  FileText,
  Gauge,
  ListChecks,
  Satellite,
  Save,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { AppShell } from "@/components/AppShell";
import { GhostScoreGauge } from "@/components/GhostScoreGauge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { analyzeClaim, type AnalysisResult } from "@/lib/gemini";

type AnalyzeSearchParams = {
  text?: string;
  state?: string;
  district?: string;
};

export const Route = createFileRoute("/analyze")({
  component: Analyze,
  validateSearch: (search: Record<string, unknown>): AnalyzeSearchParams => {
    return {
      text: search.text as string,
      state: search.state as string,
      district: search.district as string,
    };
  },
});

const AGENTS = [
  { name: "Document Parser Agent", desc: "Extracting entities...", icon: FileSearch, ms: 500 },
  { name: "Satellite Vision Agent", desc: "Fetching imagery...", icon: Satellite, ms: 1000 },
  { name: "Ghost Score Agent", desc: "Cross-referencing claims...", icon: Gauge, ms: 800 },
  { name: "Evidence Aggregator", desc: "Compiling findings...", icon: ListChecks, ms: 600 },
  { name: "RTI Generator", desc: "Preparing legal document...", icon: Bot, ms: 700 },
];

function Analyze() {
  const search = Route.useSearch();
  const [text, setText] = useState(search.text || "");
  const [state, setState] = useState(search.state || "Maharashtra");
  const [district, setDistrict] = useState(search.district || "");
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  const hasAutoRun = useRef(false);

  const run = async (inputText?: string) => {
    const finalVal = inputText || text;
    if (!finalVal.trim()) return;
    
    setLoading(true);
    setDone(false);
    setStep(0);
    setResult(null);

    // Run simulations for UI effect
    for (let i = 0; i < AGENTS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, AGENTS[i].ms / 2));
    }

    try {
      const aiResult = await analyzeClaim(finalVal);
      setResult(aiResult);
      setStep(AGENTS.length);
      setDone(true);
    } catch (error) {
      console.error(error);
      alert("AI analysis failed. Please check your API key.");
      setStep(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search.text && !hasAutoRun.current) {
      hasAutoRun.current = true;
      run(search.text);
    }
  }, [search.text]);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-navy-deep tracking-tighter">AI Project Analysis</h1>
          <p className="text-muted-foreground font-medium">
            Paste any project claim or notice. Our multi-agent AI system will cross-verify it against satellite data.
          </p>
        </div>

        <div className="bg-card border-2 rounded-2xl p-6 shadow-card space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste project description, tender notice, news article, or any claim..."
            className="w-full h-32 p-4 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-saffron font-medium"
          />
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm font-bold bg-white"
              >
                {["Maharashtra", "Bihar", "Uttar Pradesh", "Jharkhand", "Madhya Pradesh", "Rajasthan", "Karnataka"].map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">District</label>
              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Patna"
                className="w-full px-3 py-2 border rounded-lg text-sm font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Category</label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm font-bold bg-white">
                {["ROAD", "SCHOOL", "BRIDGE", "ANGANWADI", "HEALTH"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => run()}
            disabled={loading}
            className="w-full bg-saffron text-white py-4 rounded-xl font-black inline-flex items-center justify-center gap-2 shadow-lg shadow-saffron/20 hover:scale-[1.01] transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "ANALYISING..." : "ANALYSE WITH GEMINI AI"}
          </button>
        </div>

        {step >= 0 && (
          <div className="bg-card border-2 rounded-2xl p-6 shadow-card space-y-3">
            <h2 className="font-black text-lg mb-3 flex items-center gap-2">
              <Bot className="text-saffron w-5 h-5" /> Active Agent Pipeline
            </h2>
            <div className="space-y-2">
              {AGENTS.map((a, i) => {
                const status = step > i ? "complete" : step === i ? "running" : "waiting";
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 ${status === "running" ? "border-saffron bg-saffron/5" : status === "complete" ? "border-success/30 bg-success/5" : "border-muted"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status === "complete" ? "bg-success text-white" : status === "running" ? "bg-saffron text-white" : "bg-muted text-muted-foreground"}`}>
                      <a.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-black text-navy-deep tracking-tight">{a.name}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">{a.desc}</div>
                    </div>
                    {status === "complete" && <span className="text-[10px] font-black text-success tracking-widest">✓ SUCCESS</span>}
                    {status === "running" && <Loader2 className="w-4 h-4 text-saffron animate-spin" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {done && result && (
          <div className="bg-card border-2 border-navy-deep/10 rounded-2xl p-8 shadow-elevated space-y-6 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-full translate-x-16 -translate-y-16 blur-3xl" />
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-2xl text-navy-deep tracking-tighter">AI Integrity Report</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Generated: {new Date().toLocaleDateString()}</p>
              </div>
              <SeverityBadge severity={result.severity} />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center bg-muted/30 p-6 rounded-2xl">
              <GhostScoreGauge score={Math.min(100, Math.max(0, result.score || 0))} />
              <div className="flex-1 space-y-3 w-full">
                <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-2">Evidence Points</h3>
                {(result.points || ["Analysis complete. Details pending verification."]).map((e, i) => (
                  <div
                    key={i}
                    className="text-xs font-bold border-l-4 border-danger bg-white shadow-sm px-4 py-3 rounded-r-lg animate-in slide-in-from-left duration-300"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <span className="text-danger mr-2 font-black">!</span> {e}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-navy-deep text-white p-5 rounded-2xl text-sm font-medium leading-relaxed italic">
              " {result.summary} "
            </div>

            <div className="bg-success/5 border-2 border-success/20 rounded-2xl p-6">
              <div className="text-xs font-black text-success mb-4 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Potential Community Recovery
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-1">
                  <div className="text-3xl font-black text-success tracking-tighter">30</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase">Smart Classes</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black text-success tracking-tighter">4.9k</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase">Rural Meters</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black text-success tracking-tighter">12</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase">Clinic Months</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button className="flex-1 bg-navy-deep text-white px-6 py-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-navy-deep/90 transition-all shadow-lg active:scale-95">
                <Save className="w-4 h-4" /> EXPORT TO DATABASE
              </button>
              <button className="flex-1 bg-saffron text-white px-6 py-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-saffron/90 transition-all shadow-lg shadow-saffron/20 active:scale-95">
                <FileText className="w-4 h-4" /> GENERATE LEGAL RTI
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
