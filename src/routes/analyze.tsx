import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { GhostScoreGauge } from "@/components/GhostScoreGauge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Sparkles, FileText, Save, FileSearch, Satellite, Gauge, ListChecks, Bot } from "lucide-react";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/analyze")({ component: Analyze });

const AGENTS = [
  { name: "Document Parser Agent", desc: "Extracting entities...", icon: FileSearch, ms: 500 },
  { name: "Satellite Vision Agent", desc: "Fetching imagery...", icon: Satellite, ms: 1000 },
  { name: "Ghost Score Agent", desc: "Cross-referencing claims...", icon: Gauge, ms: 800 },
  { name: "Evidence Aggregator", desc: "Compiling findings...", icon: ListChecks, ms: 600 },
  { name: "RTI Generator", desc: "Preparing legal document...", icon: Bot, ms: 700 },
];

function Analyze() {
  const [text, setText] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [district, setDistrict] = useState("");
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);

  const run = async () => {
    setDone(false); setStep(0);
    for (let i = 0; i < AGENTS.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, AGENTS[i].ms));
    }
    setStep(AGENTS.length); setDone(true);
  };

  const score = 78;
  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analyse any infrastructure claim</h1>
          <p className="text-muted-foreground">Paste any project description, tender notice, or news article. AI will analyse it in seconds.</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-card space-y-4">
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste project description, tender notice, news article, or any claim..."
            className="w-full h-32 p-4 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-saffron" />
          <div className="grid grid-cols-3 gap-3">
            <select value={state} onChange={e => setState(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              {["Maharashtra","Bihar","UP","Jharkhand","MP","Rajasthan","Karnataka"].map(s => <option key={s}>{s}</option>)}
            </select>
            <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="District" className="px-3 py-2 border rounded-lg text-sm" />
            <select className="px-3 py-2 border rounded-lg text-sm">{["ROAD","SCHOOL","BRIDGE","ANGANWADI","HEALTH"].map(s => <option key={s}>{s}</option>)}</select>
          </div>
          <button onClick={run} className="w-full bg-saffron text-white py-3.5 rounded-lg font-semibold inline-flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Analyse with AI
          </button>
        </div>

        {step >= 0 && (
          <div className="bg-card border rounded-2xl p-6 shadow-card space-y-3">
            <h2 className="font-semibold mb-3">Agent Pipeline</h2>
            {AGENTS.map((a, i) => {
              const status = step > i ? "complete" : step === i ? "running" : "waiting";
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${status === "running" ? "border-saffron bg-saffron/5" : status === "complete" ? "border-success/30 bg-success/5" : "border-muted"}`}>
                  <a.icon className={`w-5 h-5 ${status === "complete" ? "text-success" : status === "running" ? "text-saffron" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.desc}</div>
                  </div>
                  <span className={`text-xs font-bold ${status === "complete" ? "text-success" : status === "running" ? "text-saffron" : "text-muted-foreground"}`}>
                    {status === "complete" ? "✓ COMPLETE" : status === "running" ? "RUNNING" : "WAITING"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {done && (
          <div className="bg-card border rounded-2xl p-6 shadow-elevated space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">Analysis Result</h2>
              <SeverityBadge severity="HIGH" />
            </div>
            <div className="flex flex-wrap gap-2">
              {["Project: Rural Road Phase II","Location: " + (district || "—") + ", " + state,"Amount: ₹2.45 Cr","Date: 2023","Agency: PWD"].map(c => <span key={c} className="text-xs bg-muted px-3 py-1.5 rounded-full">{c}</span>)}
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <GhostScoreGauge score={score} />
              <div className="flex-1 space-y-2">
                {["No road surface detected in 2024 imagery","Same dirt path present in 2021 baseline","Construction equipment absent across 14 months","Local panchayat has no completion certificate"].map((e, i) =>
                  <div key={i} className="text-sm border-l-4 border-danger bg-danger/5 px-3 py-1.5">⚠️ {e}</div>)}
              </div>
            </div>
            <div className="bg-success/5 border border-success/20 rounded-xl p-4">
              <div className="text-sm font-semibold text-success mb-2">Community Impact: If recovered, this {formatINR(245)} could fund:</div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div><div className="text-2xl font-bold text-success">30</div>classrooms</div>
                <div><div className="text-2xl font-bold text-success">49</div>km of road</div>
                <div><div className="text-2xl font-bold text-success">81</div>months PHC supply</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-navy-deep text-white px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save to Database</button>
              <button className="bg-saffron text-white px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2"><FileText className="w-4 h-4" /> Generate RTI</button>
              <span className="ml-auto self-center text-xs text-saffron">🔌 AI Integration Ready</span>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
