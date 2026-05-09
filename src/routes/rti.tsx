import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { FileText, Download, Send, Search, ChevronRight, Lock } from "lucide-react";

export const Route = createFileRoute("/rti")({ component: RTIHub });

const MOCK_TEMPLATES = [
  {
    id: "temp-road",
    title: "Road Project Transparency Inquiry",
    category: "INFRASTRUCTURE",
    questions: [
      "Copy of the sanctioned estimate and technical specifications.",
      "Details of payments made to the contractor date-wise.",
      "Copy of the completion certificate and quality test reports.",
      "Geo-tagged photos of the project site as per government norms."
    ],
    usage_count: 1420
  },
  {
    id: "temp-hospital",
    title: "Hospital Fund & Equipment Audit",
    category: "HEALTHCARE",
    questions: [
      "Total budget sanctioned for medical equipment in last 3 years.",
      "List of equipment purchased and their current working status.",
      "Details of staff vacancies and sanctioned strength.",
      "Copy of the medicines stock register for the current month."
    ],
    usage_count: 850
  },
  {
    id: "temp-school",
    title: "School Infrastructure Verification",
    category: "EDUCATION",
    questions: [
      "Funds released for classroom renovation and toilet construction.",
      "Copy of the Mid-Day Meal fund utilization report.",
      "Details of computer lab installation and internet connectivity.",
      "Copy of the latest safety audit certificate of the building."
    ],
    usage_count: 630
  }
];

function RTIHub() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">AI-Drafted RTI Hub</h1>
            <p className="text-muted-foreground">Expertly crafted RTI templates to demand accountability from local departments.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder="Search templates (e.g. 'Police', 'Land')..."
              className="w-full pl-11 pr-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {MOCK_TEMPLATES.map((t) => (
            <div key={t.id} className="bg-card border-2 border-transparent hover:border-saffron/30 rounded-2xl p-6 shadow-card transition-all flex flex-col group">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                   <span className="text-[10px] font-black text-navy-deep bg-muted px-2 py-1 rounded tracking-widest uppercase">{t.category}</span>
                   <span className="text-[10px] font-bold text-muted-foreground">{t.usage_count} Drafted</span>
                </div>
                <h3 className="font-black text-lg mb-4 group-hover:text-saffron transition-colors leading-tight">{t.title}</h3>
                <ul className="space-y-3">
                  {t.questions.map((q, idx) => (
                    <li key={idx} className="flex gap-3 text-xs text-muted-foreground leading-relaxed">
                      <ChevronRight className="w-3 h-3 text-saffron flex-shrink-0 mt-0.5" /> {q}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 flex gap-2">
                <button className="flex-1 bg-navy-deep text-white text-xs font-black py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-saffron transition-colors">
                  <FileText className="w-4 h-4" /> DRAFT NOW
                </button>
                <button className="bg-muted text-muted-foreground p-3 rounded-lg hover:text-navy-deep transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border-2 border-dashed border-muted-foreground/20 rounded-2xl p-12 text-center">
           <Lock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
           <h2 className="font-black text-xl mb-2">Generate Custom AI RTI</h2>
           <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">Describe your issue in plain language, and NagrikAI will draft the perfect legal inquiry for you.</p>
           <button className="bg-saffron text-white px-8 py-4 rounded-xl font-black text-sm flex items-center gap-2 mx-auto shadow-lg shadow-saffron/20">
             LAUNCH AI DRAFTER <Send className="w-4 h-4" />
           </button>
        </div>

        <div className="bg-card rounded-2xl border p-6 shadow-card">
           <h2 className="font-black mb-4">My Filed RTIs</h2>
           <div className="text-center py-12 text-muted-foreground">
             <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p className="text-sm font-medium">You haven't filed any RTIs yet. Your activity will appear here.</p>
           </div>
        </div>
      </div>
    </AppShell>
  );
}
