import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/care/AppShell";
import { Card } from "@/components/care/Cards";
import { currentCamp } from "@/lib/care-data";
import { User, Phone, MapPin, Activity, StickyNote } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/volunteer/patients/new")({
  component: NewPatient,
  head: () => ({ meta: [{ title: "Register patient — CareConnect" }] }),
});

function NewPatient() {
  const navigate = useNavigate();
  const nextToken = 17;
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

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Patient added to queue", { description: `Token #${nextToken}` });
          navigate({ to: "/volunteer/queue" });
        }}
      >
        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 block">
              <span className="text-xs font-medium flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Full name</span>
              <input required className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" placeholder="e.g. Anita Sharma" />
            </label>
            <label className="block">
              <span className="text-xs font-medium">Age</span>
              <input required type="number" min={0} max={120} className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-medium">Gender</span>
              <select className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm">
                <option>Female</option><option>Male</option><option>Other</option>
              </select>
            </label>
            <label className="col-span-2 block">
              <span className="text-xs font-medium flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Phone</span>
              <input className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" placeholder="+91" />
            </label>
            <label className="col-span-2 block">
              <span className="text-xs font-medium flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Village</span>
              <input required className="mt-1.5 w-full h-11 rounded-xl border border-border bg-input/60 px-3 text-sm" />
            </label>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-primary" />Vitals</div>
          <div className="grid grid-cols-2 gap-3">
            <label><span className="text-[11px] text-muted-foreground">BP</span><input placeholder="120/80" className="w-full h-11 mt-1 rounded-xl border border-border bg-input/60 px-3 text-sm" /></label>
            <label><span className="text-[11px] text-muted-foreground">Pulse</span><input placeholder="bpm" className="w-full h-11 mt-1 rounded-xl border border-border bg-input/60 px-3 text-sm" /></label>
            <label><span className="text-[11px] text-muted-foreground">Temp</span><input placeholder="°F" className="w-full h-11 mt-1 rounded-xl border border-border bg-input/60 px-3 text-sm" /></label>
            <label><span className="text-[11px] text-muted-foreground">Weight</span><input placeholder="kg" className="w-full h-11 mt-1 rounded-xl border border-border bg-input/60 px-3 text-sm" /></label>
          </div>
        </Card>

        <Card>
          <label className="block">
            <span className="text-xs font-medium flex items-center gap-1.5"><StickyNote className="h-3.5 w-3.5 text-primary" />Symptoms & volunteer notes</span>
            <textarea rows={4} required className="mt-1.5 w-full rounded-xl border border-border bg-input/60 px-3 py-2 text-sm resize-none" placeholder="Chief complaint, allergies, medications, observations…" />
          </label>
        </Card>

        <button type="submit" className="w-full h-12 rounded-2xl text-white font-semibold" style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}>
          Add to queue
        </button>
      </form>
    </AppShell>
  );
}