import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { Bot, Send } from "lucide-react";
import { getUserId } from "@/lib/session";

export const Route = createFileRoute("/bot")({ component: BotPage });

const QUICK = [
  "Am I eligible for PM-KISAN?",
  "How do I file an RTI?",
  "Ghost project near me",
  "What schemes for women?",
  "Track my application",
];
import { chatWithNagrikBot } from "@/lib/gemini";

function BotPage() {
  const [convs, setConvs] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<any[]>([{ role: "assistant", content: "Namaste! I'm NagrikBot. How can I help you today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { supabase.from("nagrikbot_conversations").select("*").order("updated_at", { ascending: false }).limit(20).then(({ data }) => setConvs(data || [])); }, []);

  const send = async (text?: string) => {
    const t = text || input;
    if (!t.trim() || loading) return;

    const userMsg = { role: "user", content: t };
    const nextMsgs = [...msgs, userMsg];
    setMsgs(nextMsgs);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithNagrikBot({ messages: nextMsgs });
      const assistantMsg = { role: "assistant", content: response };
      const finalMsgs = [...nextMsgs, assistantMsg];
      setMsgs(finalMsgs);

      if (active) {
        await supabase.from("nagrikbot_conversations").update({ messages: finalMsgs, updated_at: new Date().toISOString() }).eq("id", active);
      } else {
        const { data } = await supabase.from("nagrikbot_conversations").insert({ 
          user_id: getUserId(), 
          messages: finalMsgs, 
          module_context: "full_chat" 
        }).select().single();
        if (data) setActive(data.id);
      }
      // Refresh sidebar
      supabase.from("nagrikbot_conversations").select("*").order("updated_at", { ascending: false }).limit(20).then(({ data }) => setConvs(data || []));
    } catch (error) {
      console.error(error);
      setMsgs(m => [...m, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-60 border-r bg-card flex flex-col">
          <div className="p-4 border-b font-bold">Conversations</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button onClick={() => { setActive(null); setMsgs([{ role: "assistant", content: "Namaste! How can I help?" }]); }} className="w-full text-left text-sm px-3 py-2 rounded hover:bg-muted">+ New Chat</button>
            {convs.map(c => (
              <button key={c.id} onClick={() => { setActive(c.id); setMsgs(c.messages); }}
                className={`w-full text-left text-xs px-3 py-2 rounded ${active === c.id ? "bg-muted" : "hover:bg-muted/50"}`}>
                {((c.messages as any[])?.[1]?.content || "Chat").slice(0, 40)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl mx-auto w-full">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.role === "user" ? "bg-saffron text-white" : "bg-navy-deep text-saffron"}`}>
                  {m.role === "user" ? "You" : "NB"}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${m.role === "user" ? "bg-saffron text-white" : "bg-card border shadow-sm"}`}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-navy-deep text-saffron">NB</div>
                <div className="px-4 py-3 rounded-2xl bg-card border shadow-sm text-sm italic text-muted-foreground animate-pulse">NagrikBot is thinking...</div>
              </div>
            )}
          </div>
          <div className="border-t p-4 max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK.map(q => <button key={q} disabled={loading} onClick={() => send(q)} className="text-xs bg-muted hover:bg-muted/70 px-3 py-1.5 rounded-full disabled:opacity-50">{q}</button>)}
            </div>
            <div className="flex gap-2">
              <input value={input} disabled={loading} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                placeholder={loading ? "Waiting for AI..." : "Ask NagrikBot anything..."} className="flex-1 px-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-saffron disabled:opacity-50" />
              <button onClick={() => send()} disabled={loading} className="bg-saffron text-white px-5 rounded-xl disabled:opacity-50"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
