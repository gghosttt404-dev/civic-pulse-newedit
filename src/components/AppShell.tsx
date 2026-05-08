import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home, Map, Search, Wallet, FileText, Radio, Users, BarChart3, Bot, Bell, Menu, X, Settings, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/session";
import { NagrikBotBubble } from "./NagrikBotBubble";

const NAV = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/map", icon: Map, label: "Ghost Heatmap" },
  { to: "/analyze", icon: Search, label: "Analyse Claim" },
  { to: "/grants", icon: Wallet, label: "My Benefits" },
  { to: "/rti", icon: FileText, label: "RTI Hub" },
  { to: "/tracker", icon: Radio, label: "Project Tracker" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/bot", icon: Bot, label: "NagrikBot" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const profile = useUserProfile();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const alerts = [
    { id: 1, title: "New Ghost Project Flagged", desc: "Suspicious activity detected in Patna district.", time: "2m ago", unread: true },
    { id: 2, title: "RTI Response Due", desc: "Your RTI for Ken River Bridge is due for response in 3 days.", time: "1h ago", unread: true },
    { id: 3, title: "Grant Approved", desc: "Your PM-KISAN application has been verified.", time: "5h ago", unread: false },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-60 bg-navy-deep text-white flex flex-col transition-transform print:hidden",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            <span className="text-saffron">NAGRIK</span><span>AI</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(n => {
            const active = loc.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all relative",
                  active
                    ? "bg-white/5 text-saffron font-semibold border-l-2 border-saffron"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}>
                <n.icon className="w-4 h-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-saffron flex items-center justify-center text-sm font-bold">
              {(profile?.name || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{profile?.name || "Guest"}</div>
              <Link to="/onboarding" className="text-xs text-white/60 hover:text-saffron">Edit profile</Link>
            </div>
            <Settings className="w-4 h-4 text-white/60" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b flex items-center px-4 gap-3 sticky top-0 z-30 print:hidden">
          <button onClick={() => setOpen(true)} className="lg:hidden"><Menu className="w-5 h-5" /></button>
          <div className="flex-1" />
          <div className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-md hover:bg-muted transition"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>
            
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-card border rounded-xl shadow-elevated z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                  <span className="font-bold text-sm">Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="text-xs text-saffron hover:underline">Mark all read</button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {alerts.map(a => (
                    <div key={a.id} className={cn("p-4 border-b hover:bg-muted/50 transition cursor-pointer", a.unread && "bg-saffron/5 border-l-2 border-l-saffron")}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold">{a.title}</span>
                        <span className="text-[10px] text-muted-foreground">{a.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{a.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center border-t">
                  <button className="text-xs text-muted-foreground hover:text-saffron transition">View all activity</button>
                </div>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">{profile?.district}, {profile?.state}</div>
        </header>
        <main className="flex-1 min-w-0 print:p-0">{children}</main>
      </div>

      <div className="print:hidden">
        <NagrikBotBubble />
      </div>
    </div>
  );
}
