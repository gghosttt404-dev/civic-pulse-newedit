import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState, useEffect } from "react";
import { Trophy, Plus, CheckCircle2, TrendingUp, Users, X, Send, Sparkles, ShieldCheck, Filter } from "lucide-react";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/community")({ component: Community });

const INITIAL_PROPOSALS = [
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
  {
    id: "prop-4",
    title: "Community Health Center Upgrade",
    district: "Bhopal",
    state: "Madhya Pradesh",
    recovered_amount: 4.1,
    status: "VOTING",
    proposed_use: [
      { title: "Oxygen Plant Setup", cost: 2.5 },
      { title: "Modern Dialysis Unit", cost: 1.6 }
    ],
    votes: 310
  },
  {
    id: "prop-5",
    title: "Smart Classroom Initiative",
    district: "Ranchi",
    state: "Jharkhand",
    recovered_amount: 0.9,
    status: "VOTING",
    proposed_use: [
      { title: "10 Interactive Panels", cost: 0.5 },
      { title: "E-Library Subscription", cost: 0.4 }
    ],
    votes: 156
  },
  {
    id: "prop-6",
    title: "Rural Skill Training Center",
    district: "Guntur",
    state: "Andhra Pradesh",
    recovered_amount: 2.1,
    status: "APPROVED",
    proposed_use: [
      { title: "Vocational Tools & Equipment", cost: 1.2 },
      { title: "Training Staff Salaries", cost: 0.9 }
    ],
    votes: 540
  },
];

function Community() {
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [voted, setVoted] = useState<string[]>([]);
  const [filter, setFilter] = useState("ALL");

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    const newProp = {
      id: `prop-new-${Date.now()}`,
      title: newTitle,
      district: newDistrict,
      state: "Local State",
      recovered_amount: parseFloat(newAmount) || 0,
      status: "VOTING",
      proposed_use: [
        { title: "Initial Phase", cost: parseFloat(newAmount) * 0.7 },
        { title: "Contingency", cost: parseFloat(newAmount) * 0.3 }
      ],
      votes: 1
    };

    setProposals([newProp, ...proposals]);
    setSubmitted(true);
    
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitted(false);
      setNewTitle("");
      setNewDistrict("");
      setNewAmount("");
      setNewDesc("");
    }, 2000);
  };

  const handleVote = (id: string) => {
    if (voted.includes(id)) return;
    setVoted([...voted, id]);
  };

  const filteredProposals = proposals.filter(p => filter === "ALL" || p.status === filter);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-navy-deep tracking-tighter">Community Recovery</h1>
            <p className="text-muted-foreground font-medium max-w-xl">Redirecting "Ghost Funds" from stalled projects into real community infrastructure.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-card border-2 border-saffron/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Recovered</p>
                <p className="text-xl font-black text-navy-deep">₹{(proposals.reduce((a, b) => a + b.recovered_amount, 0)).toFixed(2)} Cr</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-success text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg hover:shadow-success/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> CREATE PROPOSAL
            </button>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-black text-2xl flex items-center gap-2 text-navy-deep tracking-tight">
              <CheckCircle2 className="text-success w-7 h-7" /> Active Reallocations
            </h2>
            <div className="flex flex-wrap gap-2">
               {["ALL", "VOTING", "APPROVED", "COMPLETED"].map(f => (
                 <button 
                   key={f} 
                   onClick={() => setFilter(f)}
                   className={`text-[10px] font-black px-4 py-2 rounded-full border-2 transition-all ${filter === f ? 'bg-navy-deep text-white border-navy-deep shadow-md' : 'bg-white border-muted text-muted-foreground hover:border-saffron'}`}
                 >
                   {f}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredProposals.map((p) => (
              <div key={p.id} className="bg-card border-2 border-transparent hover:border-saffron/20 rounded-3xl p-8 shadow-card transition-all relative overflow-hidden group">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase ${p.status === "COMPLETED" ? "bg-success/10 text-success border border-success/20" : "bg-saffron/10 text-saffron border border-saffron/20"}`}>
                      {p.status}
                    </span>
                    <h3 className="font-black text-2xl mt-4 leading-tight text-navy-deep group-hover:text-saffron transition-colors">{p.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <ShieldCheck className="w-4 h-4 text-success" />
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{p.district}, {p.state} • RECOVERY ID: {p.id.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Fund Pool</p>
                    <p className="text-3xl font-black text-success tracking-tighter">₹{p.recovered_amount} Cr</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8 bg-muted/30 p-6 rounded-2xl border-2 border-dashed border-muted">
                  <h4 className="text-[10px] font-black text-navy-deep uppercase tracking-widest mb-2">Budget Allocation Plan</h4>
                  {p.proposed_use.map((use, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-navy-deep/5">
                      <span className="text-xs font-black text-navy-deep">{use.title}</span>
                      <span className="text-xs font-black text-success tracking-tighter">₹{use.cost.toFixed(2)} Cr</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-xs font-black text-muted-foreground">
                    <Users className="w-4 h-4" /> {p.votes + (voted.includes(p.id) ? 1 : 0)} Citizens Support
                  </div>
                  <div className="flex gap-3">
                    <Link 
                      to="/analyze" 
                      search={{ text: `Community Proposal: ${p.title}\nDistrict: ${p.district}\nAmount: ${p.recovered_amount} Cr\nStatus: ${p.status}` }}
                      className="px-6 py-3 bg-white border-2 border-navy-deep/10 text-navy-deep rounded-xl font-black text-xs hover:border-saffron transition-all"
                    >
                      ANALYSE RISK
                    </Link>
                    <button 
                      onClick={() => handleVote(p.id)}
                      disabled={p.status !== "VOTING" || voted.includes(p.id)}
                      className={`px-8 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${p.status === "VOTING" ? (voted.includes(p.id) ? "bg-success text-white" : "bg-saffron text-white shadow-lg shadow-saffron/20 hover:scale-105") : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                    >
                      {voted.includes(p.id) ? <><CheckCircle2 className="w-4 h-4" /> VOTED</> : (p.status === "VOTING" ? "VOTE FOR RECOVERY" : "PROPOSAL CLOSED")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 bg-navy-deep/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-lg rounded-3xl shadow-elevated overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-navy-deep/10">
              <div className="p-8 border-b flex items-center justify-between bg-white">
                <div>
                   <h2 className="font-black text-2xl text-navy-deep tracking-tighter leading-none">New Recovery Proposal</h2>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Submit fund reallocation plan</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-muted rounded-full transition-colors"><X className="w-6 h-6 text-navy-deep" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {submitted ? (
                  <div className="py-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-success/10 text-success rounded-3xl flex items-center justify-center mx-auto shadow-lg rotate-12">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                       <h3 className="font-black text-2xl text-navy-deep">Proposal Live!</h3>
                       <p className="text-muted-foreground font-medium text-sm mt-2">Your proposal is now visible to thousands of citizens for voting.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Infrastructure Goal</label>
                      <input 
                        required 
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="e.g. Smart School Conversion" 
                        className="w-full p-4 bg-muted/50 border-2 border-transparent focus:border-saffron focus:bg-white rounded-2xl outline-none transition-all font-bold" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Target District</label>
                        <input 
                          required 
                          value={newDistrict}
                          onChange={e => setNewDistrict(e.target.value)}
                          placeholder="District" 
                          className="w-full p-4 bg-muted/50 border-2 border-transparent focus:border-saffron focus:bg-white rounded-2xl outline-none transition-all font-bold" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Budget (₹ Cr)</label>
                        <input 
                          required 
                          type="number" 
                          step="0.1" 
                          value={newAmount}
                          onChange={e => setNewAmount(e.target.value)}
                          placeholder="Cr" 
                          className="w-full p-4 bg-muted/50 border-2 border-transparent focus:border-saffron focus:bg-white rounded-2xl outline-none transition-all font-bold" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Impact Description</label>
                      <textarea 
                        required 
                        rows={4} 
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        placeholder="Describe how this recovered fund will serve the community..." 
                        className="w-full p-4 bg-muted/50 border-2 border-transparent focus:border-saffron focus:bg-white rounded-2xl outline-none transition-all font-bold resize-none" 
                      />
                    </div>
                    <button type="submit" className="w-full bg-saffron text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-saffron/20 hover:scale-[1.01] transition-transform active:scale-95">
                      PUBLISH PROPOSAL <Send className="w-4 h-4" />
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
