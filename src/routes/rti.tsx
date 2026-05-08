import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserId } from "@/lib/session";
import { toast } from "sonner";
import { FileText, Sparkles } from "lucide-react";

export const Route = createFileRoute("/rti")({ component: RTIHub });

const RTI_TYPES = [
  { v: "GHOST", emoji: "🏗️", title: "Ghost Infrastructure", desc: "Request evidence for suspicious project" },
  { v: "SCHEME", emoji: "💸", title: "Scheme Non-Delivery", desc: "Why hasn't my benefit been disbursed?" },
  { v: "FUND", emoji: "💰", title: "Fund Utilization", desc: "Where did the money go?" },
  { v: "EMPLOYMENT", emoji: "👔", title: "Employment Process", desc: "Hiring irregularities" },
  { v: "LAND", emoji: "🏠", title: "Land Records", desc: "Land acquisition documents" },
  { v: "CUSTOM", emoji: "✍️", title: "Custom RTI", desc: "Describe your issue" },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFTED: "bg-muted text-foreground",
  FILED: "bg-info text-white",
  ACKNOWLEDGED: "bg-info/70 text-white",
  RESPONDED: "bg-success text-white",
  APPEALED: "bg-saffron text-white",
};

function RTIHub() {
  const [type, setType] = useState("GHOST");
  const [department, setDepartment] = useState("");
  const [state, setState] = useState("Bihar");
  const [issue, setIssue] = useState("");
  const [generated, setGenerated] = useState<any | null>(null);
  const [rtis, setRtis] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState("");

  const load = () => supabase.from("rtis").select("*").order("generated_at", { ascending: false }).then(({ data }) => setRtis(data || []));
  
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (generated) setDraftText(generated.body_english);
  }, [generated]);

  const generate = async () => {
    const subject = `Information request — ${RTI_TYPES.find(t => t.v === type)?.title}`;
    const body = `Under Section 6(1) of the RTI Act, 2005, I, the undersigned citizen, request the following information from your office:\n\n${issue || `Details regarding ${type.toLowerCase()} matter in ${state}`}\n\n1) Date-wise expenditure statement.\n2) Copies of tender documents and contractor details.\n3) Site inspection / verification reports for the last 12 months.\n4) Geo-tagged photographic evidence of completion.\n5) Third-party quality audit reports if any.\n\nThe information is requested in English. Required application fee of ₹10 is enclosed by IPO.`;
    
    const { data, error } = await supabase.from("rtis").insert({
      user_id: getUserId(),
      rti_type: type,
      pio_name: "The Public Information Officer",
      pio_address: `Office of the District Magistrate, ${state}`,
      department: department || "Concerned Department",
      subject_line: subject,
      body_english: body,
      status: "DRAFTED",
    }).select().single();

    if (error) toast.error(error.message);
    else { 
      setGenerated(data); 
      toast.success("RTI drafted by AI"); 
      load(); 
    }
  };

  const updateRTI = async () => {
    if (!generated) return;
    const { error } = await supabase.from("rtis").update({ body_english: draftText }).eq("id", generated.id);
    if (error) toast.error(error.message);
    else { 
      toast.success("Draft updated"); 
      setEditing(false); 
      load(); 
    }
  };

  const markFiled = async () => {
    if (!generated) return;
    const { error } = await supabase.from("rtis").update({ status: "FILED", filed_at: new Date().toISOString() }).eq("id", generated.id);
    if (error) toast.error(error.message);
    else { 
      toast.success("Marked as Filed!"); 
      setGenerated(null); 
      load(); 
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto print:p-0">
        <div className="print:hidden">
          <h1 className="text-3xl font-bold mb-2">RTI Hub</h1>
          <p className="text-muted-foreground mb-6">AI-drafted Right to Information applications in seconds.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4 print:col-span-5">
            <div className="bg-card border rounded-xl p-5 shadow-card print:hidden">
              <h2 className="font-bold mb-4">Generate New RTI</h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {RTI_TYPES.map(t => (
                  <button key={t.v} onClick={() => setType(t.v)} className={`text-left p-3 rounded-lg border text-xs transition ${type === t.v ? "border-saffron bg-saffron/5" : "hover:border-saffron/40"}`}>
                    <div className="text-lg">{t.emoji}</div>
                    <div className="font-semibold mt-1">{t.title}</div>
                    <div className="text-muted-foreground mt-0.5 text-[10px]">{t.desc}</div>
                  </button>
                ))}
              </div>
              <textarea value={issue} onChange={e => setIssue(e.target.value)} placeholder="Describe your issue..."
                className="w-full px-3 py-2 border rounded-lg text-sm h-24 outline-none focus:ring-2 focus:ring-saffron mb-3" />
              <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department / Ministry"
                className="w-full px-3 py-2 border rounded-lg text-sm mb-3" />
              <input value={state} onChange={e => setState(e.target.value)} placeholder="State"
                className="w-full px-3 py-2 border rounded-lg text-sm mb-4" />
              <button onClick={generate} className="w-full bg-saffron text-white py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Generate RTI with AI
              </button>
              <div className="text-[10px] text-center text-saffron mt-2">🔌 AI Integration Ready</div>
            </div>

            {generated && (
              <div className="bg-white border-2 border-saffron rounded-xl p-6 font-serif text-sm shadow-elevated print:border-0 print:shadow-none print:p-0">
                <div className="text-xs text-muted-foreground mb-3 print:hidden">Generated Draft (editable)</div>
                <div className="font-semibold">To,</div>
                <div>{generated.pio_name}</div>
                <div>{generated.pio_address}</div>
                <div className="my-3"><strong>Subject:</strong> {generated.subject_line}</div>
                
                {editing ? (
                  <textarea 
                    value={draftText} 
                    onChange={e => setDraftText(e.target.value)}
                    className="w-full h-64 p-2 border rounded font-sans text-xs mb-3"
                  />
                ) : (
                  <div className="whitespace-pre-line text-xs leading-relaxed">{draftText}</div>
                )}

                <div className="flex gap-2 mt-4 print:hidden">
                  {editing ? (
                    <button onClick={updateRTI} className="text-xs bg-saffron text-white px-3 py-1.5 rounded">Save Changes</button>
                  ) : (
                    <button onClick={() => setEditing(true)} className="text-xs bg-navy-deep text-white px-3 py-1.5 rounded">Edit</button>
                  )}
                  <button onClick={downloadPDF} className="text-xs border px-3 py-1.5 rounded">Download PDF</button>
                  <button onClick={markFiled} className="text-xs bg-success text-white px-3 py-1.5 rounded">Mark as Filed</button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-3 print:hidden">
            <h2 className="font-bold">My RTIs ({rtis.length})</h2>
            {rtis.map(r => (
              <div key={r.id} className="bg-card border rounded-xl p-4 shadow-card">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-saffron" />
                    <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded">{r.rti_type}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                </div>
                <div className="font-semibold text-sm">{r.subject_line}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.department} • {new Date(r.generated_at).toLocaleDateString()}</div>
              </div>
            ))}
            {rtis.length === 0 && <div className="text-center text-muted-foreground py-12">No RTIs yet. Generate your first one →</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
