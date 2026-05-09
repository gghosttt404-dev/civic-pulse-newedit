import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { Bot, Send, Sparkles } from "lucide-react";
import { getUserId } from "@/lib/session";
import { chatWithNagrikBot } from "@/lib/gemini";

export const Route = createFileRoute("/bot")({ component: BotPage });

const PRESETS: Record<string, string> = {
  "Am I eligible for PM-KISAN?": "PM-KISAN is a central sector scheme that provides ₹6,000 per year to all land-holding farmer families. You are eligible if: 1) You are a farmer with cultivable land. 2) You are NOT an income tax payer. 3) You are NOT a high-ranking professional or government official.",
  "How do I file an RTI?": "To file an RTI: 1) Identify the Department. 2) Write your query clearly on paper or visit rtionline.gov.in. 3) Pay the ₹10 fee. 4) Submit to the Public Information Officer (PIO). You should get a response within 30 days.",
  "Ghost project near me": "A 'Ghost Project' is a project that exists only on paper. I can help you verify any project. Please paste the Project Name or Location here, and I will use satellite data to check its physical existence for you.",
  "What schemes for women?": "Key schemes for women include: 1) Mahila Samman Saving Certificate (7.5% interest). 2) PM Ujjwala Yojana (Free gas connections). 3) Sukanya Samriddhi Yojana (Savings for girl child). 4) Mudra Yojana (Loans for women entrepreneurs).",
  "Track my application": "You can track your application by: 1) Visiting the official scheme website. 2) Entering your Application ID or Aadhaar Number. 3) Using the UMANG App on your phone. Most central schemes provide real-time tracking via SMS as well."
};

const QUICK = Object.keys(PRESETS);

function BotPage() {
  const [convs, setConvs] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<any[]>([{ role: "assistant", content: "Namaste! I'm NagrikBot. I can help you with PM-KISAN, RTI filing, and checking Ghost Projects. Click a question below or ask me anything!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, loading]);

  useEffect(() => { 
    supabase.from("nagrikbot_conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setConvs(data || [])); 
  }, []);

  const send = async (text?: string) => {
    const t = text || input;
    if (!t.trim() || loading) return;

    const userMsg = { role: "user", content: t };
    setMsgs(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // 1. CHECK CLIENT-SIDE PRESETS FIRST (Zero Latency)
    if (PRESETS[t]) {
      setTimeout(() => {
        setMsgs(prev => [...prev, { role: "assistant", content: PRESETS[t] }]);
        setLoading(false);
      }, 500);
      return;
    }

    // 2. FALLBACK FOR CUSTOM QUESTIONS
    try {
      const response = await chatWithNagrikBot({ messages: [userMsg] });
      const cleanResponse = response || "I understood your query. I'm currently specialized in PM-KISAN, RTI, and Ghost Projects. How can I help you with those today?";
      setMsgs(prev => [...prev, { role: "assistant", content: cleanResponse }]);
    } catch (error) {
      setMsgs(prev => [...prev, { role: "assistant", content: "I'm currently receiving many queries. For fastest help, please use the preset questions about PM-KISAN or RTI above!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)] bg-[#F8FAFC]">
        <div className="w-72 border-r bg-white hidden md:flex flex-col shadow-sm">
          <div className="p-6 border-b">
            <h2 className="font-black text-xl text-navy-deep tracking-tight">Intelligence Hub</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button onClick={() => { setActive(null); setMsgs([{ role: "assistant", content: "Namaste! I'm NagrikBot. How can I assist you today?" }]); }} className="w-full text-left text-sm px-4 py-4 rounded-2xl bg-navy-deep text-white font-black shadow-lg shadow-navy-deep/10 active:scale-[0.98] transition-all flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">+</span> NEW CHAT
            </button>
            <div className="pt-4 pb-2 px-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">History</div>
            {convs.map(c => (
              <button key={c.id} onClick={() => { setActive(c.id); setMsgs(c.messages); }}
                className={`w-full text-left text-xs px-4 py-3 rounded-xl transition-all border-2 ${active === c.id ? "bg-saffron/5 border-saffron/20 text-saffron font-bold" : "border-transparent hover:bg-muted text-muted-foreground"}`}>
                {((c.messages as any[])?.[1]?.content || "Civic Inquiry").slice(0, 35)}...
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-4 animate-in slide-in-from-bottom-2 duration-300 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-lg ${m.role === "user" ? "bg-saffron text-white" : "bg-navy-deep text-saffron"}`}>
                  {m.role === "user" ? "YOU" : "NB"}
                </div>
                <div className={`px-6 py-4 rounded-3xl max-w-[85%] text-sm font-semibold leading-relaxed shadow-sm ${m.role === "user" ? "bg-saffron text-white rounded-tr-none shadow-saffron/20" : "bg-white border-2 border-navy-deep/5 rounded-tl-none text-navy-deep"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black flex-shrink-0 bg-navy-deep text-saffron">NB</div>
                <div className="px-6 py-4 rounded-3xl bg-white border-2 border-dashed border-saffron/30 text-saffron font-black text-[10px] flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-saffron animate-bounce" />
                   <div className="w-2 h-2 rounded-full bg-saffron animate-bounce delay-100" />
                   <div className="w-2 h-2 rounded-full bg-saffron animate-bounce delay-200" />
                   FETCHING CIVIC DATA...
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-gradient-to-t from-white via-white/90 to-transparent">
            <div className="max-w-3xl mx-auto w-full space-y-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK.map(q => (
                  <button 
                    key={q} 
                    disabled={loading} 
                    onClick={() => send(q)} 
                    className="text-[10px] font-bold bg-white border-2 border-navy-deep/5 hover:border-saffron hover:text-saffron px-5 py-2.5 rounded-full transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <input 
                  value={input} 
                  disabled={loading} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder={loading ? "Connecting to brain..." : "Ask NagrikBot anything about schemes or projects..."} 
                  className="w-full pl-8 pr-24 py-6 bg-white border-2 border-navy-deep/5 rounded-3xl outline-none focus:border-saffron focus:shadow-2xl focus:shadow-saffron/10 transition-all font-bold shadow-xl text-navy-deep placeholder:text-muted-foreground/40" 
                />
                <button 
                  onClick={() => send()} 
                  disabled={loading || !input.trim()} 
                  className="absolute right-4 top-4 bottom-4 bg-saffron text-white px-8 rounded-2xl font-black text-[10px] hover:bg-navy-deep transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-saffron/20"
                >
                  SEND <Send className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-6">
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Zero Latency Recovery Brain</p>
                 <span className="w-1 h-1 rounded-full bg-muted" />
                 <p className="text-[9px] font-black text-success uppercase tracking-[0.2em]">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
