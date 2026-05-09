import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Home, Map, Search, Wallet, FileText, Radio, Users, BarChart3, Bot, Bell, Menu, X, Settings, LogOut, Sparkles, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/session";
import { NagrikBotBubble } from "./NagrikBotBubble";

const NAV = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/tracker", icon: Radio, label: "Tracker" },
  { to: "/analyze", icon: Search, label: "Integrity" },
  { to: "/rti", icon: FileText, label: "RTI Hub" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/bot", icon: Bot, label: "NagrikBot" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const profile = useUserProfile();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background hero-gradient selection:bg-saffron/30 selection:text-saffron selection:font-bold">
      {/* Floating Navbar */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 px-6 py-6",
        scrolled ? "py-4" : "py-8"
      )}>
        <div className={cn(
          "max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500",
          scrolled ? "bg-white/80 backdrop-blur-xl shadow-premium border border-white/40" : "bg-transparent"
        )}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-navy-deep flex items-center justify-center transition-transform group-hover:rotate-12">
              <Sparkles className="w-5 h-5 text-saffron fill-saffron" />
            </div>
            <span className="text-xl font-black text-navy-deep tracking-tight">
              Nagrik<span className="text-saffron">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/50 p-1.5 rounded-full border border-navy-deep/5">
            {NAV.map(n => {
              const active = loc.pathname === n.to;
              return (
                <Link key={n.to} to={n.to}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-black transition-all",
                    active 
                      ? "bg-white text-navy-deep shadow-sm" 
                      : "text-muted-foreground hover:text-navy-deep hover:bg-white/50"
                  )}>
                  {n.label}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 pr-4 border-r border-navy-deep/10">
               <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Citizen</p>
                  <p className="text-xs font-black text-navy-deep leading-none">{profile?.name || "Guest User"}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron font-black text-xs">
                  {(profile?.name || "G")[0].toUpperCase()}
               </div>
            </div>
            <Link to="/onboarding" className="bg-navy-deep text-white px-8 py-3 rounded-full text-sm font-black hover:bg-saffron hover:shadow-lg hover:shadow-saffron/20 transition-all active:scale-95">
              Get Started <span className="ml-2 font-light">→</span>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white border border-navy-deep/5"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl animate-in fade-in duration-300 lg:hidden flex flex-col items-center justify-center gap-8 px-6">
           <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8 p-3 bg-muted rounded-2xl"><X /></button>
           {NAV.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setMobileMenuOpen(false)} className="text-4xl font-black text-navy-deep hover:text-saffron transition-colors">
                {n.label}
              </Link>
           ))}
           <div className="pt-8 border-t w-full text-center">
              <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">{profile?.district}, {profile?.state}</p>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 pt-32 pb-20 px-6 transition-all duration-500",
        mobileMenuOpen ? "blur-xl" : ""
      )}>
        <div className="max-w-7xl mx-auto min-h-[60vh]">
          {children}
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="py-12 border-t bg-white/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-navy-deep flex items-center justify-center"><Sparkles className="w-4 h-4 text-saffron" /></div>
              <span className="font-black text-navy-deep tracking-tight italic">Empowering India via Transparency.</span>
           </div>
           <div className="flex gap-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <a href="#" className="hover:text-saffron transition-colors">Integrity Protocol</a>
              <a href="#" className="hover:text-saffron transition-colors">Data Gov Portal</a>
              <a href="#" className="hover:text-saffron transition-colors">Privacy Policy</a>
           </div>
        </div>
      </footer>

      <div className="print:hidden">
        <NagrikBotBubble />
      </div>
    </div>
  );
}
