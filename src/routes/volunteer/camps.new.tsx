import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/care/AppShell";
import { Card } from "@/components/care/Cards";
import { toast } from "sonner";
import { CalendarDays, MapPin, Users, Stethoscope, Tent, Loader2 } from "lucide-react";
import { useState } from "react";
import { createCamp } from "@/api/camp.api";

export const Route = createFileRoute("/volunteer/camps/new")({
  component: NewCamp,
  head: () => ({ meta: [{ title: "Create camp — CareConnect" }] }),
});

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground flex items-center gap-1.5">{icon}{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function NewCamp() {
  const navigate = useNavigate();
  const [name, setName] = useState("Sunday Camp — Kotra");
  const [date, setDate] = useState("2026-07-19");
  const [location, setLocation] = useState("Kotra Health Sub-Centre");
  const [volunteers, setVolunteers] = useState(8);
  const [doctors, setDoctors] = useState(3);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCamp({
        name,
        date,
        location,
        description: notes,
        volunteersCount: volunteers,
        doctorsCount: doctors
      });
      toast.success("Camp scheduled", { description: "Camp details saved successfully." });
      navigate({ to: "/volunteer" });
    } catch (error) {
      toast.error("Failed to schedule camp", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Create medical camp" subtitle="Schedule the next Sunday session" back="/volunteer">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card className="space-y-4">
          <Field label="Camp name" icon={<Tent className="h-3.5 w-3.5" />}>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
          </Field>
          <Field label="Date" icon={<CalendarDays className="h-3.5 w-3.5" />}>
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
          </Field>
          <Field label="Location" icon={<MapPin className="h-3.5 w-3.5" />}>
            <input required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Volunteers" icon={<Users className="h-3.5 w-3.5" />}>
              <input required type="number" value={volunteers} onChange={(e) => setVolunteers(Number(e.target.value))} min={1} className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
            </Field>
            <Field label="Doctors" icon={<Stethoscope className="h-3.5 w-3.5" />}>
              <input required type="number" value={doctors} onChange={(e) => setDoctors(Number(e.target.value))} min={1} className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
            </Field>
          </div>
          <Field label="Notes" icon={<span className="h-3.5 w-3.5" />}>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special preparation, target communities…" className="w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm resize-none" />
          </Field>
        </Card>
        <button type="submit" disabled={loading} className="w-full h-12 rounded-2xl text-white font-semibold flex items-center justify-center gap-2" style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Schedule camp"
          )}
        </button>
      </form>
    </AppShell>
  );
}