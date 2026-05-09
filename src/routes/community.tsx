import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Trophy, Plus, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/community")({ component: Community });

const MOCK_PROPOSALS = [
  {
    id: "prop-1",
    title: "Solar Street Lights Installation",
    district: "Mysuru",
    state: "Karnataka",
    recovered_amount: 1.2, // In Crores
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
    title: "Anganwadi Modernization",
    district: "Ranchi",
    state: "Jharkhand",
    recovered_amount: 0.95,
    status: "VOTING",
    proposed_use: [
      { title: "E-Learning Kits", cost: 0.45 },
      { title: "Building Repairs", cost: 0.5 }
    ],
    votes: 215
  },
  {
    id: "prop-5",
    title: "Primary Health Center Equipment",
    district: "Udaipur",
    state: "Rajasthan",
    recovered_amount: 5.2,
    status: "APPROVED",
    proposed_use: [
      { title: "X-Ray & Lab Upgrade", cost: 3.0 },
      { title: "Emergency Ambulance", cost: 2.2 }
    ],
    votes: 764
  }
];

function Community() {
  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2">Community Recovery Dashboard</h1>
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
            <button className="bg-success text-white px-6 py-4 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg hover:shadow-success/20 transition-all">
              <Plus className="w-5 h-5" /> NEW PROPOSAL
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
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity ${p.status === "COMPLETED" ? "text-success" : "text-saffron"}`}>
                   <TrendingUp className="w-full h-full -rotate-12 translate-x-8 -translate-y-8" />
                </div>
                
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded tracking-widest ${p.status === "COMPLETED" ? "bg-success text-white" : (p.status === "APPROVED" ? "bg-navy-deep text-white" : "bg-saffron text-white")}`}>
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
                      <span className="text-xs font-black text-muted-foreground">₹{use.recovered_amount || use.cost} Cr</span>
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

        <section className="bg-success/5 border-2 border-success/20 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <Trophy className="w-12 h-12 text-success mx-auto mb-4" />
            <h2 className="font-black text-2xl mb-2 text-navy-deep">Recovery Success Stories</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6 text-sm font-medium">When a proposal gets implemented using recovered funds, it joins our wall of fame.</p>
            <div className="inline-block bg-white border-2 border-success/30 px-6 py-3 rounded-full font-black text-success text-sm shadow-sm">
              3 Projects Successfully Reallocated in 2024
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <CheckCircle2 className="w-96 h-96 -rotate-12 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
