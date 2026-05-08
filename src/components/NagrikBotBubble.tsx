import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getUserId } from "@/lib/session";
import { chatWithNagrikBot } from "@/lib/gemini";

export function NagrikBotBubble() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Namaste! I'm NagrikBot. Ask me about schemes, RTIs, or ghost projects." },
  ]);
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: "user", content: input };
    const nextMsgs = [...msgs, userMsg];
    setMsgs(nextMsgs);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithNagrikBot({ messages: nextMsgs });
      const assistantMsg = { role: "assistant", content: response };
      const finalMsgs = [...nextMsgs, assistantMsg];
      setMsgs(finalMsgs);
      
      await supabase.from("nagrikbot_conversations").insert({
        user_id: getUserId(),
        messages: finalMsgs,
        module_context: "floating_bubble",
      });
    } catch (error) {
      console.error(error);
      setMsgs(m => [...m, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-saffron text-white shadow-elevated flex items-center justify-center hover:scale-105 transition">
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[300px] h-[400px] bg-card rounded-xl shadow-elevated border flex flex-col overflow-hidden">
          <div className="bg-navy-deep text-white px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center text-xs font-bold">NB</div>
            <div>
              <div className="text-sm font-semibold">NagrikBot</div>
              <div className="text-[10px] text-white/60">Powered by Gemini AI</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "ml-auto bg-saffron text-white px-3 py-2 rounded-lg max-w-[85%] text-sm" : "bg-muted px-3 py-2 rounded-lg max-w-[85%] text-sm"}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="bg-muted px-3 py-2 rounded-lg max-w-[85%] text-sm italic text-muted-foreground animate-pulse">
                NagrikBot is thinking...
              </div>
            )}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask anything..." className="flex-1 px-3 py-2 text-sm bg-muted rounded-md outline-none focus:ring-2 focus:ring-saffron" />
            <button onClick={send} className="bg-saffron text-white rounded-md px-3"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </>
  );
}
