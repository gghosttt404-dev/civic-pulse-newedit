import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { FileText, Download, Send, Search, ChevronRight, Lock, Sparkles, CheckCircle2 } from "lucide-react";

type RTISearchParams = {
  project?: string;
};

export const Route = createFileRoute("/rti")({
  component: RTIHub,
  validateSearch: (search: Record<string, unknown>): RTISearchParams => {
    return {
      project: search.project as string,
    };
  },
});

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
  const search = Route.useSearch();
  const [isDrafting, setIsDrafting] = useState(!!search.project);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-navy-deep tracking-tighter">AI-Drafted RTI Hub</h1>
            <p className="text-muted-foreground font-medium">Expertly crafted RTI templates to demand accountability from local departments.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder="Search templates (e.g. 'Police', 'Land')..."
              className="w-full pl-11 pr-4 py-3 bg-card border-2 rounded-xl outline-none focus:ring-2 focus:ring-saffron font-bold"
            />
          </div>
        </div>

        {isDrafting && (
          <div className="bg-saffron/5 border-2 border-saffron/20 rounded-3xl p-8 animate-in slide-in-from-top duration-500">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-saffron flex items-center justify-center text-white shadow-lg">
                      <Sparkles className="w-6 h-6" />
                   </div>
                   <div>
                      <h2 className="font-black text-xl text-navy-deep">AI Legal Drafter</h2>
                      <p className="text-xs font-bold text-saffron uppercase tracking-widest">Generating Inquiry for: {search.project?.split('\n')[0] || "Selected Project"}</p>
                   </div>
                </div>
                <button onClick={() => setIsDrafting(false)} className="text-xs font-black text-muted-foreground hover:text-navy-deep uppercase">Cancel</button>
             </div>
             
             <div className="bg-white border-2 rounded-2xl p-6 shadow-card space-y-6">
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-xs font-black text-navy-deep uppercase"><CheckCircle2 className="w-4 h-4 text-success" /> RTI Application Drafted</div>
                   <div className="p-4 bg-muted/30 rounded-xl text-sm font-medium leading-relaxed border-2 border-dashed border-muted italic text-navy-deep">
                     "Under the Right to Information Act 2005, I hereby request the following information regarding the {search.project?.split('\n')[0] || "infrastructure project"}: 
                     1. Certified copy of the work order. 
                     2. Details of daily progress reports. 
                     3. Record of financial disbursements made to date.
                     4. Satellite verification reports and quality audits."
                   </div>
                </div>
                <div className="flex gap-4">
                   <button 
                     onClick={() => window.print()}
                     className="flex-1 bg-navy-deep text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-saffron transition-all"
                   >
                      <Download className="w-4 h-4" /> DOWNLOAD PDF
                   </button>
                   <button 
                     onClick={() => alert("Citizenship Verified via DigiLocker. RTI Filed Digitally with Dept of Urban Development.")}
                     className="flex-1 bg-saffron text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-saffron/20 hover:scale-105 transition-transform"
                   >
                      <Send className="w-4 h-4" /> FILE DIGITALLY
                   </button>
                </div>
             </div>
          </div>
        )}

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
                    <li key={idx} className="flex gap-3 text-xs font-bold text-muted-foreground leading-relaxed">
                      <ChevronRight className="w-3 h-3 text-saffron flex-shrink-0 mt-0.5" /> {q}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 flex gap-2">
                <button className="flex-1 bg-navy-deep text-white text-xs font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-saffron transition-all active:scale-95">
                  <FileText className="w-4 h-4" /> DRAFT NOW
                </button>
                <button className="bg-muted text-muted-foreground p-4 rounded-xl hover:text-navy-deep transition-all">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-navy-deep text-white rounded-3xl p-12 text-center relative overflow-hidden shadow-elevated">
           <div className="relative z-10">
             <Sparkles className="w-12 h-12 text-saffron mx-auto mb-4" />
             <h2 className="font-black text-3xl tracking-tighter mb-2">Generate Custom AI RTI</h2>
             <p className="text-white/60 font-medium text-sm max-w-sm mx-auto mb-8">Describe your issue in plain language, and NagrikAI will draft the perfect legal inquiry for you.</p>
             <button 
               onClick={() => {
                 const issue = prompt("Describe your issue (e.g. 'Garbage not collected in my area for 2 weeks')");
                 if (issue) {
                   window.location.search = `?project=${encodeURIComponent(issue)}`;
                 }
               }}
               className="bg-saffron text-white px-10 py-4 rounded-xl font-black text-sm flex items-center gap-2 mx-auto shadow-lg shadow-saffron/20 hover:scale-105 transition-transform"
             >
               LAUNCH AI DRAFTER <Send className="w-4 h-4" />
             </button>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 rounded-full translate-x-32 -translate-y-32 blur-3xl" />
        </div>
      </div>
    </AppShell>
  );
}
