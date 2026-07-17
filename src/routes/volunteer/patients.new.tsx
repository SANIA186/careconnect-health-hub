import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/care/AppShell";
import { Card } from "@/components/care/Cards";
import { getCurrentCamp } from "@/api/camp.api";
import { getNextQueueToken, registerPatient } from "@/api/patient.api";
import type { PatientRegistrationInput } from "@/types/patient";
import { User, Phone, MapPin, Activity, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/volunteer/patients/new")({
  component: NewPatient,
  head: () => ({ meta: [{ title: "Register patient — CareConnect" }] }),
});

type PatientFormState = {
  name: string;
  age: string;
  gender: PatientRegistrationInput["gender"];
  phone: string;
  village: string;
  bp: string;
  pulse: string;
  temp: string;
  weight: string;
  notes: string;
};

const initialFormState: PatientFormState = {
  name: "",
  age: "",
  gender: "Female",
  phone: "",
  village: "",
  bp: "",
  pulse: "",
  temp: "",
  weight: "",
  notes: "",
};

function NewPatient() {
  const navigate = useNavigate();
  const [currentCamp, setCurrentCamp] = useState<Awaited<ReturnType<typeof getCurrentCamp>> | null>(null);
  const [nextToken, setNextToken] = useState(1);
  const [form, setForm] = useState<PatientFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      const [camp, token] = await Promise.all([getCurrentCamp(), Promise.resolve(getNextQueueToken())]);
      setCurrentCamp(camp);
      setNextToken(token);
    })();
  }, []);

  if (!currentCamp) return null;

  const updateField = <K extends keyof PatientFormState>(field: K, value: PatientFormState[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const requiredFields = [
      { key: "name", label: "Full name", value: form.name.trim() },
      { key: "age", label: "Age", value: form.age.trim() },
      { key: "village", label: "Village", value: form.village.trim() },
      { key: "notes", label: "Symptoms & volunteer notes", value: form.notes.trim() },
    ].filter(({ value }) => !value);

    if (requiredFields.length > 0) {
      toast.error("Please complete the required fields", { description: requiredFields.map((item) => item.label).join(", ") });
      return;
    }

    const age = Number(form.age);
    if (!Number.isFinite(age) || age < 0 || age > 120) {
      toast.error("Please enter a valid age", { description: "Age must be between 0 and 120." });
      return;
    }

    setIsSubmitting(true);

    try {
      const patient = await registerPatient({
        name: form.name,
        age,
        gender: form.gender,
        phone: form.phone,
        village: form.village,
        symptoms: form.notes,
        volunteerNotes: form.notes,
        vitals: {
          bp: form.bp,
          pulse: form.pulse,
          temp: form.temp,
          weight: form.weight,
        },
      } satisfies PatientRegistrationInput);

      toast.success("Patient added to queue", { description: `Token #${patient.token}` });
      navigate({ to: "/volunteer/patients/$id", params: { id: patient.id } });
    } catch (error) {
      toast.error("Registration failed", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell title="Register patient" subtitle={currentCamp.name} back="/volunteer">
      <div className="rounded-2xl p-4 text-white flex items-center justify-between" style={{ backgroundImage: "var(--gradient-primary)" }}>
        <div>
          <div className="text-xs text-white/80">Next token number</div>
          <div className="text-3xl font-bold">#{nextToken}</div>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-white/15 grid place-items-center">
          <User className="h-7 w-7" />
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 block">
              <span className="text-xs font-medium flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Full name</span>
              <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" placeholder="e.g. Anita Sharma" />
            </label>
            <label className="block">
              <span className="text-xs font-medium">Age</span>
              <input required type="number" min={0} max={120} value={form.age} onChange={(event) => updateField("age", event.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-medium">Gender</span>
              <select value={form.gender} onChange={(event) => updateField("gender", event.target.value as PatientRegistrationInput["gender"])} className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm">
                <option value="Female">Female</option><option value="Male">Male</option><option value="Other">Other</option>
              </select>
            </label>
            <label className="col-span-2 block">
              <span className="text-xs font-medium flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Phone</span>
              <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" placeholder="+91" />
            </label>
            <label className="col-span-2 block">
              <span className="text-xs font-medium flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Village</span>
              <input required value={form.village} onChange={(event) => updateField("village", event.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
            </label>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-primary" />Vitals</div>
          <div className="grid grid-cols-2 gap-3">
            <label><span className="text-[11px] text-muted-foreground">BP</span><input value={form.bp} onChange={(event) => updateField("bp", event.target.value)} placeholder="120/80" className="w-full h-11 mt-1 rounded-xl border border-border bg-input/60 px-3 text-sm" /></label>
            <label><span className="text-[11px] text-muted-foreground">Pulse</span><input value={form.pulse} onChange={(event) => updateField("pulse", event.target.value)} placeholder="bpm" className="w-full h-11 mt-1 rounded-xl border border-border bg-input/60 px-3 text-sm" /></label>
            <label><span className="text-[11px] text-muted-foreground">Temp</span><input value={form.temp} onChange={(event) => updateField("temp", event.target.value)} placeholder="°F" className="w-full h-11 mt-1 rounded-xl border border-border bg-input/60 px-3 text-sm" /></label>
            <label><span className="text-[11px] text-muted-foreground">Weight</span><input value={form.weight} onChange={(event) => updateField("weight", event.target.value)} placeholder="kg" className="w-full h-11 mt-1 rounded-xl border border-border bg-input/60 px-3 text-sm" /></label>
          </div>
        </Card>

        <Card>
          <label className="block">
            <span className="text-xs font-medium flex items-center gap-1.5"><StickyNote className="h-3.5 w-3.5 text-primary" />Symptoms & volunteer notes</span>
            <textarea rows={4} required value={form.notes} onChange={(event) => updateField("notes", event.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm resize-none" placeholder="Chief complaint, allergies, medications, observations…" />
          </label>
        </Card>

        <button disabled={isSubmitting} type="submit" className="w-full h-12 rounded-2xl text-white font-semibold disabled:opacity-70" style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}>
          {isSubmitting ? "Saving..." : "Add to queue"}
        </button>
      </form>
    </AppShell>
  );
}