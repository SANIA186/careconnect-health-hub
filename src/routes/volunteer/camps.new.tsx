import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/care/AppShell";
import { Card } from "@/components/care/Cards";
import { toast } from "sonner";
import { CalendarDays, MapPin, Users, Stethoscope, Tent } from "lucide-react";

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
  return (
    <AppShell title="Create medical camp" subtitle="Schedule the next Sunday session" back="/volunteer">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Camp scheduled", { description: "Volunteers will be notified." });
          navigate({ to: "/volunteer" });
        }}
      >
        <Card className="space-y-4">
          <Field label="Camp name" icon={<Tent className="h-3.5 w-3.5" />}>
            <input required defaultValue="Sunday Camp — Kotra" className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
          </Field>
          <Field label="Date" icon={<CalendarDays className="h-3.5 w-3.5" />}>
            <input required type="date" defaultValue="2026-07-19" className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
          </Field>
          <Field label="Location" icon={<MapPin className="h-3.5 w-3.5" />}>
            <input required defaultValue="Kotra Health Sub-Centre" className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Volunteers" icon={<Users className="h-3.5 w-3.5" />}>
              <input required type="number" defaultValue={8} min={1} className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
            </Field>
            <Field label="Doctors" icon={<Stethoscope className="h-3.5 w-3.5" />}>
              <input required type="number" defaultValue={3} min={1} className="w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
            </Field>
          </div>
          <Field label="Notes" icon={<span className="h-3.5 w-3.5" />}>
            <textarea rows={3} placeholder="Special preparation, target communities…" className="w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm resize-none" />
          </Field>
        </Card>
        <button type="submit" className="w-full h-12 rounded-2xl text-white font-semibold" style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}>
          Schedule camp
        </button>
      </form>
    </AppShell>
  );
}