import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { Bot, Send, Sparkles } from "lucide-react";
import { getUserId } from "@/lib/session";
import { chatWithNagrikBot } from "@/lib/gemini";

export const Route = createFileRoute("/bot")({ component: BotPage });

const QUICK = [
  "Am I eligible for PM-KISAN?",
  "How do I file an RTI?",
  "Ghost project near me",
  "What schemes for women?",
  "Track my application",
];

function BotPage() {
  const [convs, setConvs] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<any[]>([{ role: "assistant", content: "Namaste! I'm NagrikBot. How can I help you today?" }]);
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
    const nextMsgs = [...msgs, userMsg];
    
    setMsgs(nextMsgs);
    setInput("");
    setLoading(true);

    try {
      // Direct call to AI
      const response = await chatWithNagrikBot({ messages: [userMsg] }); // Fast mode: only last message
      const cleanResponse = response || "I'm sorry, I'm having trouble thinking right now. Please try again.";
      const assistantMsg = { role: "assistant", content: cleanResponse };
      
      setMsgs(prev => [...prev, assistantMsg]);

      // Async save to DB (don't block UI)
      const userId = getUserId() || "anonymous";
      setTimeout(() => {
        if (active) {
          supabase.from("nagrikbot_conversations").update({ messages: [...nextMsgs, assistantMsg], updated_at: new Date().toISOString() }).eq("id", active);
        } else {
          supabase.from("nagrikbot_conversations").insert({ 
            user_id: userId, 
            messages: [...nextMsgs, assistantMsg], 
            module_context: "full_chat" 
          }).select().single().then(({ data }) => {
            if (data) setActive(data.id);
          });
        }
      }, 0);

    } catch (error) {
      console.error("NagrikBot Send Error:", error);
      setMsgs(m => [...m, { role: "assistant", content: "Namaste! I'm currently having trouble connecting to the AI brain. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)] bg-muted/30">
        <div className="w-64 border-r bg-white hidden md:flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="font-black text-lg text-navy-deep">Recent Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <button onClick={() => { setActive(null); setMsgs([{ role: "assistant", content: "Namaste! How can I help?" }]); }} className="w-full text-left text-sm px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 font-bold transition-all">+ New Conversation</button>
            {convs.map(c => (
              <button key={c.id} onClick={() => { setActive(c.id); setMsgs(c.messages); }}
                className={`w-full text-left text-xs px-4 py-3 rounded-xl transition-all border-2 ${active === c.id ? "bg-saffron/5 border-saffron/20 text-saffron font-bold" : "border-transparent hover:bg-muted text-muted-foreground"}`}>
                {((c.messages as any[])?.[1]?.content || "Chat").slice(0, 30)}...
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full scroll-smooth">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-4 animate-in slide-in-from-bottom-2 duration-300 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black flex-shrink-0 shadow-lg ${m.role === "user" ? "bg-saffron text-white rotate-3" : "bg-navy-deep text-saffron -rotate-3"}`}>
                  {m.role === "user" ? "YOU" : "NB"}
                </div>
                <div className={`px-5 py-4 rounded-3xl max-w-[85%] text-sm font-medium leading-relaxed shadow-sm ${m.role === "user" ? "bg-saffron text-white rounded-tr-none" : "bg-white border-2 border-navy-deep/5 rounded-tl-none text-navy-deep"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black flex-shrink-0 bg-navy-deep text-saffron -rotate-3">NB</div>
                <div className="px-5 py-4 rounded-3xl bg-white border-2 border-dashed border-saffron/30 text-saffron font-black text-xs flex items-center gap-2">
                   <Sparkles className="w-4 h-4 animate-spin" /> NAGRIKBOT IS THINKING...
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-gradient-to-t from-white via-white to-transparent pt-12">
            <div className="max-w-3xl mx-auto w-full space-y-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK.map(q => (
                  <button 
                    key={q} 
                    disabled={loading} 
                    onClick={() => send(q)} 
                    className="text-[10px] font-black bg-white border-2 border-muted hover:border-saffron hover:text-saffron px-4 py-2 rounded-full transition-all disabled:opacity-50 active:scale-95 shadow-sm"
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
                  placeholder={loading ? "AI is processing..." : "Ask NagrikBot anything..."} 
                  className="w-full pl-6 pr-20 py-5 bg-white border-2 border-navy-deep/10 rounded-2xl outline-none focus:border-saffron transition-all font-bold shadow-xl placeholder:text-muted-foreground/50" 
                />
                <button 
                  onClick={() => send()} 
                  disabled={loading || !input.trim()} 
                  className="absolute right-3 top-3 bottom-3 bg-saffron text-white px-6 rounded-xl font-black text-xs hover:bg-navy-deep transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  SEND <Send className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[9px] text-center font-black text-muted-foreground uppercase tracking-widest">Powered by Gemini 1.5 Flash • Real-time Civic Intelligence</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
