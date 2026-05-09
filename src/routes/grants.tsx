import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Sparkles, ExternalLink, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/grants")({ component: Grants });

const MOCK_SCHEMES = [
  {
    id: "scheme-pm-kisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "AGRICULTURE",
    benefit_value: "₹6,000/year",
    eligibility_summary: "Income support to all landholding farmers' families in the country to supplement their financial needs.",
    match_score: 0.95,
    application_url: "https://pmkisan.gov.in"
  },
  {
    id: "scheme-pmay",
    name: "PM Awas Yojana (PMAY-Gramin)",
    ministry: "Ministry of Rural Development",
    category: "HOUSING",
    benefit_value: "₹1.20 Lakh",
    eligibility_summary: "Financial assistance for construction of pucca houses for all houseless and those living in dilapidated houses.",
    match_score: 0.88,
    application_url: "https://pmayg.nic.in"
  },
  {
    id: "scheme-pmjay",
    name: "Ayushman Bharat (PM-JAY)",
    ministry: "Ministry of Health and Family Welfare",
    category: "HEALTH",
    benefit_value: "₹5 Lakh/Family/Year",
    eligibility_summary: "Health insurance cover for secondary and tertiary care hospitalization to over 10.74 crore poor families.",
    match_score: 0.92,
    application_url: "https://pmjay.gov.in"
  },
  {
    id: "scheme-mgnrega",
    name: "MGNREGA Job Card",
    ministry: "Ministry of Rural Development",
    category: "EMPLOYMENT",
    benefit_value: "100 Days Guaranteed Work",
    eligibility_summary: "Enhancing livelihood security by providing at least 100 days of guaranteed wage employment.",
    match_score: 0.85,
    application_url: "https://nrega.nic.in"
  },
  {
    id: "scheme-scholarship",
    name: "National Scholarship - Post Matric",
    ministry: "Ministry of Minority Affairs",
    category: "EDUCATION",
    benefit_value: "₹1,200/month + Admission fees",
    eligibility_summary: "Scholarships for students from minority communities whose parental annual income is less than ₹2 Lakh.",
    match_score: 0.98,
    application_url: "https://scholarships.gov.in"
  }
];

const CAT_COLORS: Record<string, string> = {
  AGRICULTURE: "bg-success/10 text-success border-success/20",
  HOUSING: "bg-saffron/10 text-saffron border-saffron/20",
  HEALTH: "bg-danger/10 text-danger border-danger/20",
  EMPLOYMENT: "bg-info/10 text-info border-info/20",
  EDUCATION: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

function Grants() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-navy-deep to-blue-900 text-white rounded-2xl p-8 relative overflow-hidden shadow-elevated">
          <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-saffron font-black mb-3">
              <Sparkles className="w-4 h-4" /> Personalized GovGrant Engine
            </div>
            <h1 className="text-3xl lg:text-4xl font-black mb-3">Your Welfare Dashboard</h1>
            <p className="text-white/70 max-w-2xl text-sm leading-relaxed">
              Matching your profile <span className="text-white font-bold">(Age 34, Karnataka, Income &lt; 2L)</span> against <span className="text-white font-bold">450+ central & state schemes</span>.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {MOCK_SCHEMES.map((s) => (
            <div key={s.id} className="bg-card rounded-xl border-2 border-transparent hover:border-saffron/30 p-6 shadow-card transition-all group">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded border ${CAT_COLORS[s.category]}`}>
                    {s.category}
                  </span>
                  <h3 className="font-bold text-lg mt-3 leading-tight group-hover:text-saffron transition-colors">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{s.ministry}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-navy-deep">{s.benefit_value}</div>
                  <div className="text-[10px] font-bold text-success flex items-center justify-end gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> MATCHED
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-muted-foreground">Match Confidence</span>
                  <span className="text-saffron">{s.match_score * 100}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-saffron" style={{ width: `${s.match_score * 100}%` }} />
                </div>
              </div>

              <button 
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-navy-deep py-2 px-3 bg-muted/50 rounded-lg mb-4 transition-colors"
              >
                Eligibility & Documentation 
                {expanded === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expanded === s.id && (
                <div className="bg-muted/30 p-4 rounded-lg mb-4 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-xs leading-relaxed text-muted-foreground mb-3">{s.eligibility_summary}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-[10px] font-bold text-navy-deep">✓ Aadhaar Card</div>
                    <div className="text-[10px] font-bold text-navy-deep">✓ Bank Account</div>
                    <div className="text-[10px] font-bold text-navy-deep">✓ Income Certificate</div>
                    <div className="text-[10px] font-bold text-navy-deep">✓ Resident Proof</div>
                  </div>
                </div>
              )}

              <a 
                href={s.application_url}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-navy-deep text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-saffron transition-colors"
              >
                Start Application <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
