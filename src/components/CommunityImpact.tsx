import { formatINR } from "@/lib/format";

interface CommunityImpactProps {
  lakhs: number;
}

export function CommunityImpact({ lakhs }: CommunityImpactProps) {
  return (
    <div className="bg-success/5 border-2 border-success/20 rounded-xl p-4 shadow-sm">
      <h2 className="font-bold text-[10px] mb-1.5 text-success uppercase tracking-[0.1em]">Community Impact Redirector</h2>
      <p className="text-xs text-muted-foreground mb-4">
        If this <span className="font-bold text-foreground">{formatINR(lakhs)}</span> was recovered, it could fund:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2.5">
        <ImpactCard
          title="Classrooms"
          value={Math.floor(lakhs / 8)}
          unit="rooms"
          detail="₹8L each"
          icon="🏫"
        />
        <ImpactCard
          title="Rural Roads"
          value={Math.floor(lakhs / 5)}
          unit="km"
          detail="₹5L/km"
          icon="🛣️"
        />
        <ImpactCard
          title="PHC Medicine"
          value={Math.floor(lakhs / 3)}
          unit="months"
          detail="₹3L/mo"
          icon="💊"
        />
      </div>
      <button className="w-full mt-4 bg-success hover:bg-success/90 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98] shadow-md shadow-success/20">
        Generate Reallocation Proposal
      </button>
    </div>
  );
}

function ImpactCard({ title, value, unit, detail, icon }: any) {
  return (
    <div className="bg-white border border-success/10 rounded-lg p-3 flex items-center justify-between group hover:border-success/30 transition-colors">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase">{title}</div>
          <div className="text-[9px] text-muted-foreground/60">{detail}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-black text-success leading-none">{value}</div>
        <div className="text-[8px] font-bold uppercase text-muted-foreground/50">{unit}</div>
      </div>
    </div>
  );
}
