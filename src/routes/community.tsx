import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Trophy, Plus, CheckCircle2, TrendingUp, Users, X, Send } from "lucide-react";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/community")({ component: Community });

const MOCK_PROPOSALS = [
  {
    id: "prop-1",
    title: "Solar Street Lights Installation",
    district: "Mysuru",
    state: "Karnataka",
    recovered_amount: 1.2,
    status: "VOTING",
    proposed_use: [
      { title: "50 Solar Poles for Main Road", cost: 0.8 },
      { title: "Maintenance Fund", cost: 0.4 }
    ],
    votes: 452
  },
  {
    id: "prop-2",
    title: "Public Library & Digital Hub",
    district: "Patna",
    state: "Bihar",
    recovered_amount: 3.5,
    status: "APPROVED",
    proposed_use: [
      { title: "Library Renovation", cost: 1.5 },
      { title: "20 Computer Workstations", cost: 2.0 }
    ],
    votes: 890
  },
  {
    id: "prop-3",
    title: "Drinking Water Purification Plant",
    district: "Nagpur",
    state: "Maharashtra",
    recovered_amount: 2.8,
    status: "COMPLETED",
    proposed_use: [
      { title: "RO Plant Installation", cost: 2.0 },
      { title: "Pipeline Network", cost: 0.8 }
    ],
    votes: 1205
  },
];

function Community() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">Community Recovery</h1>
            <p className="text-muted-foreground max-w-xl">Redirecting "Ghost Funds" from stalled projects into real community infrastructure.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-card border-2 border-saffron/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-saffron/10 flex items-center justify-center text-saffron">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase">Total Recovered</p>
                <p className="text-lg font-black text-navy-deep">₹13.65 Cr</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-success text-white px-6 py-4 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg hover:shadow-success/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> CREATE PROPOSAL
            </button>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="font-black text-xl flex items-center gap-2">
            <CheckCircle2 className="text-success w-6 h-6" /> Reallocation Proposals
          </h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {MOCK_PROPOSALS.map((p) => (
              <div key={p.id} className="bg-card border-2 border-transparent hover:border-success/30 rounded-2xl p-6 shadow-card transition-all relative overflow-hidden group">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded tracking-widest ${p.status === "COMPLETED" ? "bg-success text-white" : "bg-saffron text-white"}`}>
                      {p.status}
                    </span>
                    <h3 className="font-black text-xl mt-3 leading-tight">{p.title}</h3>
                    <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-tighter">{p.district}, {p.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Fund Recovered</p>
                    <p className="text-2xl font-black text-success">₹{p.recovered_amount} Cr</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {p.proposed_use.map((use, idx) => (
                    <div key={idx} className="bg-muted/50 p-3 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-navy-deep">{use.title}</span>
                      <span className="text-xs font-black text-muted-foreground">₹{use.cost} Cr</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Users className="w-4 h-4" /> {p.votes} Citizens Voted
                  </div>
                  <button className={`px-5 py-2 rounded-lg font-black text-xs transition-all ${p.status === "VOTING" ? "bg-saffron text-white shadow-lg shadow-saffron/20" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                    {p.status === "VOTING" ? "VOTE NOW" : "PROPOSAL LOCKED"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-lg rounded-2xl shadow-elevated overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b flex items-center justify-between bg-navy-deep text-white">
                <h2 className="font-black text-xl">New Recovery Proposal</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-xl">Proposal Submitted!</h3>
                    <p className="text-muted-foreground text-sm">Your proposal is being reviewed for legal validity.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-muted-foreground">Proposal Title</label>
                      <input required placeholder="e.g. Solar Power for District Hospital" className="w-full p-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-saffron" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-muted-foreground">Target District</label>
                        <input required placeholder="District Name" className="w-full p-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-saffron" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-muted-foreground">Estimated Cost (Cr)</label>
                        <input required type="number" step="0.1" placeholder="Amount in Crores" className="w-full p-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-saffron" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-muted-foreground">Detailed Description</label>
                      <textarea required rows={4} placeholder="How will this fund be used?" className="w-full p-3 bg-muted rounded-xl outline-none focus:ring-2 focus:ring-saffron resize-none" />
                    </div>
                    <button type="submit" className="w-full bg-saffron text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-saffron/20 hover:bg-saffron/90 transition-all">
                      SUBMIT FOR VOTING <Send className="w-4 h-4" />
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
