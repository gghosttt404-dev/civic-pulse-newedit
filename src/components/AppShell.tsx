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
          <button className="relative p-2 rounded-md hover:bg-muted">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </button>
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
