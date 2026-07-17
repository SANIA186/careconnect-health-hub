import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/care/AppShell";
import { Card, SectionTitle, StatusPill } from "@/components/care/Cards";
import { getPatientById, buildAiSummary } from "@/api/patient.api";
import { saveConsultation } from "@/api/doctor.api";
import { getMedicines } from "@/api/medicine.api";
import type { Medicine } from "@/types/medicine";
import type { ConsultationInput, Patient } from "@/types/patient";
import { useEffect, useState } from "react";
import QuickCareSnapshot from "@/components/care/QuickCareSnapshot";
import CareGapCard from "@/components/care/CareGapCard";
import Timeline from "@/components/care/Timeline";
import { Sparkles, Pill, Plus, X, CalendarClock, ArrowRightCircle, ClipboardList, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/consultation/$id")({
  component: Consultation,
  loader: async ({ params }) => {
    const patient = await getPatientById(params.id);
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
  const [currentPatient, setCurrentPatient] = useState(patient);
  const ai = buildAiSummary(currentPatient);
  const [tab, setTab] = useState<Tab>("diagnosis");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [advice, setAdvice] = useState("");
  const [rx, setRx] = useState<{ medicine: string; dosage: string; duration: string; notes?: string }[]>([]);
  const [followUp, setFollowUp] = useState("2 weeks");
  const [referral, setReferral] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      const availableMedicines = await getMedicines();
      setMedicines(availableMedicines);
      setRx((previous) => previous.length > 0 ? previous : [{ medicine: availableMedicines[0]?.name ?? "", dosage: "1 tab TID", duration: "3 days" }]);
    })();
  }, []);

  async function handleComplete() {
    const prescriptions = rx
      .filter((entry) => entry.medicine?.trim() && entry.dosage?.trim() && entry.duration?.trim())
      .map((entry) => ({ medicine: entry.medicine.trim(), dosage: entry.dosage.trim(), duration: entry.duration.trim(), notes: entry.notes?.trim() }));

    if (!diagnosis.trim()) {
      toast.error("Diagnosis required", { description: "Please add a primary diagnosis before completing the consultation." });
      return;
    }

    if (prescriptions.length === 0) {
      toast.error("Prescription required", { description: "Please add at least one medicine prescription." });
      return;
    }

    if (!advice.trim()) {
      toast.error("Advice required", { description: "Please add patient instructions before completing the consultation." });
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedPatient = await saveConsultation(currentPatient.id, {
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || undefined,
        prescriptions,
        advice: advice.trim(),
        followUp: followUp.trim(),
        referral: referral.trim() || undefined,
      } satisfies ConsultationInput);

      setCurrentPatient(updatedPatient);
      toast.success("Consultation completed", { description: `Rx sent to medicine desk for ${updatedPatient.name}` });
      navigate({ to: "/doctor" });
    } catch (error) {
      toast.error("Consultation failed", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell title={`Consult #${currentPatient.token}`} subtitle={`${currentPatient.name} · ${currentPatient.age}y ${currentPatient.gender}`} back="/doctor">
      <QuickCareSnapshot patient={currentPatient} summary={ai} />

      <div className="mt-5 grid grid-cols-4 gap-2 text-center">
        {[["BP", currentPatient.vitals.bp], ["Pulse", currentPatient.vitals.pulse], ["Temp", currentPatient.vitals.temp], ["Wt", currentPatient.vitals.weight]].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-card border border-border py-2">
            <div className="text-[10px] text-muted-foreground font-medium">{l}</div>
            <div className="text-sm font-bold tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        <CareGapCard patient={currentPatient} />
        <Card>
          <Timeline items={[
            { title: "Volunteer intake", detail: currentPatient.volunteerNotes, date: currentPatient.registeredAt, tone: "primary" },
            { title: "Current vitals", detail: `${currentPatient.vitals.bp} • ${currentPatient.vitals.pulse}`, date: "Today", tone: currentPatient.visits.length > 0 ? "warning" : "primary" },
            { title: "Medication review", detail: currentPatient.visits.length > 0 ? "Prior prescriptions available" : "No prior prescriptions", date: currentPatient.visits.length > 0 ? currentPatient.visits[0]?.date : "Pending", tone: "success" },
          ]} title="Care timeline" />
        </Card>
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
                  <button type="button" onClick={() => setRx((previous) => previous.filter((_, j) => j !== i))} className="text-muted-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <select value={r.medicine} onChange={(event) => setRx((previous) => previous.map((entry, j) => j === i ? { ...entry, medicine: event.target.value } : entry))}
                  className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm">
                  {medicines.map((m) => <option key={m.id}>{m.name}</option>)}
                </select>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input value={r.dosage} onChange={(event) => setRx((previous) => previous.map((entry, j) => j === i ? { ...entry, dosage: event.target.value } : entry))}
                    placeholder="1 tab TID" className="h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
                  <input value={r.duration} onChange={(event) => setRx((previous) => previous.map((entry, j) => j === i ? { ...entry, duration: event.target.value } : entry))}
                    placeholder="5 days" className="h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
                </div>
              </Card>
            ))}
            <button type="button" onClick={() => setRx((previous) => [...previous, { medicine: medicines[0]?.name ?? "", dosage: "", duration: "" }])}
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
              <span className="text-xs font-medium">Advice for patient</span>
              <textarea rows={3} value={advice} onChange={(event) => setAdvice(event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm resize-none"
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
          disabled={isSubmitting}
          className="h-12 rounded-2xl text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
          style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}
          onClick={handleComplete}
        >
          <CheckCircle2 className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Complete"}
        </button>
      </div>
      <div className="mt-3 flex justify-center"><StatusPill status={currentPatient.status} /></div>
    </AppShell>
  );
}