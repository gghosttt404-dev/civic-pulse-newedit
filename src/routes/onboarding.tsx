import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setUserId, setUserProfile } from "@/lib/session";
import { Bot, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const STATES = ["Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"];
const LANGS = ["English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati", "Kannada", "Odia", "Punjabi", "Malayalam", "Assamese", "Maithili", "Bhojpuri"];

const TIPS: Record<number, string> = {
  1: "Tell me where you are, so I can find schemes from your state government too.",
  2: "Many central schemes have caste-based reservations. This stays private.",
  3: "Education unlocks NSP scholarships and skill schemes.",
  4: "Income drives most welfare eligibility — be honest for best matches.",
  5: "BPL households unlock 100+ additional benefits.",
  6: "Land holding affects PM-KISAN eligibility.",
  7: "Disability and health insurance schemes have huge benefits.",
  8: "Almost done — pick your language and let's find your money.",
};

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({
    name: "", age: 25, gender: "MALE", state: "Maharashtra", district: "", pincode: "",
    caste_category: "GEN", education_level: "GRADUATE", education_stream: "",
    occupation: "", employer_type: "PRIVATE", monthly_income: 25000,
    household_size: 4, bpl_status: false, ration_card_type: "APL",
    land_holding_acres: 0, bank_account_type: "SAVINGS",
    preferred_language: "en",
  });

  const update = (k: string, v: any) => setData((d: any) => ({ ...d, [k]: v }));
  const onText = (k: string) => (v: any) => update(k, v);

  const submit = async () => {
    const { data: row, error } = await supabase.from("users").insert({ ...data, profile_complete: true }).select().single();
    if (error) { toast.error(error.message); return; }
    setUserId(row.id); setUserProfile(row);
    toast.success("Profile saved! Finding your schemes...");
    nav({ to: "/grants" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold"><span className="text-saffron">NAGRIK</span>AI</div>
          <div className="text-sm text-muted-foreground mt-1">Citizen Profile Builder</div>
        </div>

        <div className="bg-muted h-2 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-saffron transition-all" style={{ width: `${(step / 8) * 100}%` }} />
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 lg:p-8">
          <div className="flex items-start gap-3 mb-6 p-3 bg-saffron/5 rounded-lg border border-saffron/20">
            <div className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center text-white text-xs font-bold flex-shrink-0">NB</div>
            <div className="text-sm text-foreground/80">{TIPS[step]}</div>
          </div>

          <div className="text-xs text-saffron font-semibold tracking-wider mb-2">STEP {step} OF 8</div>

          {step === 1 && <Section title="Identity">
            <Input label="Full Name" value={data.name} onChange={v => update("name", v)} />
            <Row>
              <Input label="Age" type="number" value={data.age} onChange={v => update("age", +v)} />
              <Radio label="Gender" value={data.gender} onChange={v => update("gender", v)} options={["MALE", "FEMALE", "OTHER"]} />
            </Row>
            <Row>
              <Select label="State" value={data.state} onChange={v => update("state", v)} options={STATES} />
              <Input label="District" value={data.district} onChange={v => update("district", v)} />
            </Row>
            <Input label="Pincode" value={data.pincode} onChange={v => update("pincode", v)} />
          </Section>}

          {step === 2 && <Section title="Caste & Community">
            <Radio label="Caste Category" value={data.caste_category} onChange={v => update("caste_category", v)} options={["GEN", "OBC", "SC", "ST"]} />
          </Section>}

          {step === 3 && <Section title="Education">
            <Select label="Highest Qualification" value={data.education_level} onChange={v => update("education_level", v)} options={["BELOW_10", "CLASS_10", "CLASS_12", "GRADUATE", "POSTGRAD", "PHD"]} />
            <Input label="Stream / Subject" value={data.education_stream} onChange={v => update("education_stream", v)} />
          </Section>}

          {step === 4 && <Section title="Occupation & Income">
            <Input label="Occupation" value={data.occupation} onChange={v => update("occupation", v)} />
            <Radio label="Employer Type" value={data.employer_type} onChange={v => update("employer_type", v)} options={["SELF", "GOVT", "PRIVATE", "NONE"]} />
            <div>
              <label className="text-sm font-medium">Monthly Income: <span className="text-saffron font-bold">₹{data.monthly_income.toLocaleString()}</span></label>
              <input type="range" min={0} max={100000} step={1000} value={data.monthly_income} onChange={e => update("monthly_income", +e.target.value)} className="w-full accent-saffron mt-2" />
            </div>
          </Section>}

          {step === 5 && <Section title="Family">
            <Input label="Household Size" type="number" value={data.household_size} onChange={v => update("household_size", +v)} />
            <Toggle label="BPL Status" value={data.bpl_status} onChange={v => update("bpl_status", v)} />
            <Select label="Ration Card Type" value={data.ration_card_type} onChange={v => update("ration_card_type", v)} options={["APL", "BPL", "AAY", "NONE"]} />
          </Section>}

          {step === 6 && <Section title="Assets">
            <Input label="Land Holding (acres)" type="number" value={data.land_holding_acres} onChange={v => update("land_holding_acres", +v)} />
            <Select label="Bank Account Type" value={data.bank_account_type} onChange={v => update("bank_account_type", v)} options={["SAVINGS", "JAN_DHAN", "CURRENT", "NONE"]} />
          </Section>}

          {step === 7 && <Section title="Health & Special">
            <Toggle label="Has Disability" value={!!data.disability} onChange={v => update("disability", v)} />
            <Toggle label="Has Health Insurance" value={!!data.insurance} onChange={v => update("insurance", v)} />
          </Section>}

          {step === 8 && <Section title="Preferences">
            <Select label="Preferred Language" value={data.preferred_language} onChange={v => update("preferred_language", v)} options={LANGS} />
          </Section>}

          <div className="flex justify-between mt-8">
            {step > 1 ? <button onClick={() => setStep(step - 1)} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Back</button> : <span />}
            {step < 8 ? (
              <button onClick={() => setStep(step + 1)} className="bg-navy-deep text-white px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2">Next <ArrowRight className="w-3 h-3" /></button>
            ) : (
              <button onClick={submit} className="bg-saffron text-white px-6 py-3 rounded-lg text-sm font-semibold inline-flex items-center gap-2"><Check className="w-4 h-4" /> Find My Schemes</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: any) { return <div><h2 className="text-2xl font-bold mb-4">{title}</h2><div className="space-y-4">{children}</div></div>; }
function Row({ children }: any) { return <div className="grid grid-cols-2 gap-4">{children}</div>; }
function Input({ label, value, onChange, type = "text" }: any) {
  return <div><label className="text-sm font-medium block mb-1.5">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-saffron outline-none" /></div>;
}
function Select({ label, value, onChange, options }: any) {
  return <div><label className="text-sm font-medium block mb-1.5">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
      {options.map((o: string) => <option key={o} value={o}>{o.replaceAll("_", " ")}</option>)}
    </select></div>;
}
function Radio({ label, value, onChange, options }: any) {
  return <div><label className="text-sm font-medium block mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">{options.map((o: string) =>
      <button key={o} type="button" onClick={() => onChange(o)} className={`px-4 py-2 rounded-full text-sm border ${value === o ? "bg-navy-deep text-white border-navy-deep" : "bg-white hover:border-saffron"}`}>{o}</button>)}
    </div></div>;
}
function Toggle({ label, value, onChange }: any) {
  return <div className="flex items-center justify-between">
    <span className="text-sm font-medium">{label}</span>
    <button onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full relative transition ${value ? "bg-saffron" : "bg-muted"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${value ? "left-5" : "left-0.5"}`} />
    </button>
  </div>;
}
