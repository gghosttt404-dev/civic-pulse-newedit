import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Wallet, Users, ArrowRight, Shield, Zap, Eye } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({ meta: [{ title: "NagrikAI — India's Civic Intelligence Platform" }] }),
});

function CountUp({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const dur = 1500; const start = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setV(Math.floor(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{prefix}{v.toLocaleString("en-IN")}{suffix}</span>;
}

function Landing() {
  return (
    <div className="min-h-screen bg-navy-deep text-white">
      <nav className="px-6 lg:px-12 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="text-saffron">NAGRIK</span>AI
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/onboarding" className="text-sm text-white/80 hover:text-white px-4 py-2">Login</Link>
          <Link to="/onboarding" className="text-sm bg-saffron text-white px-5 py-2.5 rounded-full font-semibold hover:opacity-90">Get Started</Link>
        </div>
      </nav>

      <section className="px-6 lg:px-12 max-w-7xl mx-auto py-16 lg:py-24">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-saffron mb-6">
            <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-pulse" />
            CIVIC INTELLIGENCE • BUILT FOR BHARAT
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            India's Civic <span className="text-saffron">Intelligence</span> Platform
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-white/70 max-w-2xl leading-relaxed">
            Expose ghost projects. Claim your entitled welfare schemes. Build your community — all from one unified platform powered by satellite AI.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/map" className="inline-flex items-center gap-2 bg-saffron text-white px-6 py-3.5 rounded-full font-semibold hover:opacity-90">
              <Search className="w-4 h-4" /> Expose Fraud
            </Link>
            <Link to="/onboarding" className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-white/5">
              <Wallet className="w-4 h-4" /> Find My Schemes
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 max-w-7xl mx-auto py-12 border-y border-white/10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { v: 4.5, suf: " L Cr", label: "Lost annually to ghost projects", prefix: "₹" },
            { v: 450, suf: "+", label: "Central welfare schemes" },
            { v: 80, suf: " Cr", label: "Citizens with unclaimed benefits" },
            { v: 40, suf: "%", label: "Of projects never independently verified" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-4xl lg:text-5xl font-bold text-saffron">
                <CountUp to={s.v} suffix={s.suf} prefix={s.prefix || ""} />
              </div>
              <div className="text-sm text-white/60 mt-2 leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 lg:px-12 max-w-7xl mx-auto py-20">
        <h2 className="text-3xl lg:text-4xl font-bold mb-12">Three pillars. One platform.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { tone: "danger", icon: Eye, title: "Ghost Infrastructure Detector", desc: "Satellite AI cross-references government claims with reality. Flag fraud in seconds." },
            { tone: "success", icon: Wallet, title: "GovGrant AI", desc: "Personalized welfare scheme matching across 450+ central + state programs." },
            { tone: "info", icon: Users, title: "Community Recovery", desc: "Redirect wasted funds to real local needs. Submit reallocation proposals." },
          ].map((c, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-saffron/40 transition">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${c.tone === "danger" ? "bg-danger/15 text-danger" : c.tone === "success" ? "bg-success/15 text-success" : "bg-info/15 text-info"}`}>
                <c.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{c.desc}</p>
              <div className="mt-5 inline-flex items-center text-saffron text-sm font-medium">Learn more <ArrowRight className="w-3 h-3 ml-1" /></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 lg:px-12 py-10 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <div className="text-xl font-bold"><span className="text-saffron">NAGRIK</span>AI</div>
            <div className="text-sm text-white/50 mt-1">Built for India. Open for every citizen.</div>
          </div>
          <div className="text-sm text-white/40">© 2026 NagrikAI</div>
        </div>
      </footer>
    </div>
  );
}
