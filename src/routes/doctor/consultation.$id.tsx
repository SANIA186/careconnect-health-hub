import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/care/AppShell";
import { Card, SectionTitle, StatusPill } from "@/components/care/Cards";
import { patients, buildAiSummary, medicines, type Patient } from "@/lib/care-data";
import { useState } from "react";
import { Sparkles, Pill, Plus, X, CalendarClock, ArrowRightCircle, ClipboardList, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/consultation/$id")({
  component: Consultation,
  loader: ({ params }) => {
    const patient = patients.find((p) => p.id === params.id);
    if (!patient) throw notFound();
    return { patient };
  },
  head: () => ({ meta: [{ title: "Consultation — CareConnect" }] }),
  notFoundComponent: () => (<div className="p-8 text-center text-sm text-muted-foreground">Patient not found.</div>),
  errorComponent: () => (<div className="p-8 text-center text-sm text-muted-foreground">Could not load.</div>),
});

type Tab = "diagnosis" | "prescription" | "followup" | "referral";
const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "diagnosis", label: "Diagnosis", icon: ClipboardList },
  { id: "prescription", label: "Rx", icon: Pill },
  { id: "followup", label: "Follow-up", icon: CalendarClock },
  { id: "referral", label: "Referral", icon: ArrowRightCircle },
];

function Consultation() {
  const { patient } = Route.useLoaderData() as { patient: Patient };
  const navigate = useNavigate();
  const ai = buildAiSummary(patient);
  const [tab, setTab] = useState<Tab>("diagnosis");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [rx, setRx] = useState<{ medicine: string; dosage: string; duration: string }[]>([
    { medicine: medicines[0].name, dosage: "1 tab TID", duration: "3 days" },
  ]);
  const [followUp, setFollowUp] = useState("2 weeks");
  const [referral, setReferral] = useState("");

  return (
    <AppShell title={`Consult #${patient.token}`} subtitle={`${patient.name} · ${patient.age}y ${patient.gender}`} back="/doctor">
      <Card className="!bg-primary/5 !border-primary/20">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">AI summary • not a diagnosis</span>
        </div>
        <div className="mt-2 font-semibold">{ai.headline}</div>
        <ul className="mt-2 space-y-1.5 text-sm">
          {ai.bullets.map((b, i) => (<li key={i} className="flex gap-2"><span className="mt-1 h-1 w-1 rounded-full bg-primary shrink-0" /><span>{b}</span></li>))}
        </ul>
        {ai.flags.length > 0 && (
          <div className="mt-3 rounded-xl bg-warning/15 p-3 text-xs text-warning-foreground flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div><div className="font-semibold">Attention</div><ul className="mt-1">{ai.flags.map((f) => <li key={f}>• {f}</li>)}</ul></div>
          </div>
        )}
      </Card>

      <div className="mt-5 grid grid-cols-4 gap-2 text-center">
        {[["BP", patient.vitals.bp], ["Pulse", patient.vitals.pulse], ["Temp", patient.vitals.temp], ["Wt", patient.vitals.weight]].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-card border border-border py-2">
            <div className="text-[10px] text-muted-foreground font-medium">{l}</div>
            <div className="text-sm font-bold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-1 bg-secondary rounded-2xl p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.id === tab;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all ${active ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
              <Icon className="h-3.5 w-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {tab === "diagnosis" && (
          <Card className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium">Primary diagnosis</span>
              <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Upper respiratory infection"
                className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-medium">Clinical notes</span>
              <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm resize-none"
                placeholder="Findings, differential considerations…" />
            </label>
          </Card>
        )}

        {tab === "prescription" && (
          <div className="space-y-3">
            {rx.map((r, i) => (
              <Card key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-primary">Medicine {i + 1}</div>
                  <button type="button" onClick={() => setRx(rx.filter((_, j) => j !== i))} className="text-muted-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <select value={r.medicine} onChange={(e) => setRx(rx.map((x, j) => j === i ? { ...x, medicine: e.target.value } : x))}
                  className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm">
                  {medicines.map((m) => <option key={m.id}>{m.name}</option>)}
                </select>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input value={r.dosage} onChange={(e) => setRx(rx.map((x, j) => j === i ? { ...x, dosage: e.target.value } : x))}
                    placeholder="1 tab TID" className="h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
                  <input value={r.duration} onChange={(e) => setRx(rx.map((x, j) => j === i ? { ...x, duration: e.target.value } : x))}
                    placeholder="5 days" className="h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
                </div>
              </Card>
            ))}
            <button type="button" onClick={() => setRx([...rx, { medicine: medicines[0].name, dosage: "", duration: "" }])}
              className="w-full h-11 rounded-2xl border border-dashed border-primary text-primary text-sm font-semibold inline-flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Add medicine
            </button>
          </div>
        )}

        {tab === "followup" && (
          <Card className="space-y-3">
            <div className="text-xs text-muted-foreground">Schedule a review</div>
            <div className="grid grid-cols-3 gap-2">
              {["1 week", "2 weeks", "1 month", "3 months", "Not required", "Custom"].map((f) => (
                <button key={f} type="button" onClick={() => setFollowUp(f)}
                  className={`h-11 rounded-xl text-xs font-semibold border ${followUp === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}`}>
                  {f}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="text-xs font-medium">Instructions for patient</span>
              <textarea rows={3} className="mt-1.5 w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm resize-none"
                placeholder="Return if symptoms worsen, continue medication, hydration…" />
            </label>
          </Card>
        )}

        {tab === "referral" && (
          <Card className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium">Refer to</span>
              <select value={referral} onChange={(e) => setReferral(e.target.value)}
                className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm">
                <option value="">— Select facility —</option>
                <option>District Hospital, Udaipur</option>
                <option>Community Health Centre, Kotra</option>
                <option>Eye Specialist, Rampur</option>
                <option>Cardiologist, Udaipur</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium">Reason & urgency</span>
              <textarea rows={3} className="mt-1.5 w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm resize-none"
                placeholder="Further investigation required…" />
            </label>
            <div className="rounded-xl bg-accent/60 p-3 text-xs text-accent-foreground">
              A referral slip with the patient's health passport ID will be generated for pickup.
            </div>
          </Card>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button className="h-12 rounded-2xl bg-card border border-border font-semibold text-sm" onClick={() => navigate({ to: "/doctor" })}>
          Save draft
        </button>
        <button
          className="h-12 rounded-2xl text-white font-semibold inline-flex items-center justify-center gap-2"
          style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}
          onClick={() => {
            toast.success("Consultation completed", { description: `Rx sent to medicine desk for ${patient.name}` });
            navigate({ to: "/doctor" });
          }}
        >
          <CheckCircle2 className="h-4 w-4" /> Complete
        </button>
      </div>
      <div className="mt-3 flex justify-center"><StatusPill status={patient.status} /></div>
    </AppShell>
  );
}