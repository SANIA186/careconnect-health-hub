import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, BellButton, DoctorNav } from "@/components/care/AppShell";
import { Card, SectionTitle, StatCard, StatusPill } from "@/components/care/Cards";
import { currentCamp, patients } from "@/lib/care-data";
import { Clock, CheckCircle2, Users, ChevronRight, User, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/doctor/")({
  component: DoctorHome,
  head: () => ({ meta: [{ title: "Doctor — CareConnect" }] }),
});

function DoctorHome() {
  const waiting = patients.filter((p) => p.status === "waiting");
  const active = patients.filter((p) => p.status === "in-consultation");
  const done = patients.filter((p) => p.status === "completed").length;
  return (
    <AppShell title="Dr. Meera Iyer" subtitle="General Physician · Rampur" hero actions={<BellButton />} bottomNav={<DoctorNav />}>
      <div className="grid grid-cols-3 gap-3 -mt-3">
        <StatCard label="Waiting" value={waiting.length} tone="warning" icon={<Clock className="h-4 w-4" />} />
        <StatCard label="In consult" value={active.length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Seen" value={done} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <SectionTitle>Current camp</SectionTitle>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{currentCamp.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{currentCamp.date} · {currentCamp.location}</div>
          </div>
          <StatusPill status={currentCamp.status} />
        </div>
      </Card>

      {active.length > 0 && (
        <>
          <SectionTitle>Now consulting</SectionTitle>
          {active.map((p) => (
            <ConsultRow key={p.id} p={p} accent />
          ))}
        </>
      )}

      <SectionTitle action={<Link to="/volunteer/queue" className="text-xs text-primary font-medium">Full queue</Link>}>Next up</SectionTitle>
      <div className="space-y-3">
        {waiting.slice(0, 4).map((p) => <ConsultRow key={p.id} p={p} />)}
      </div>
    </AppShell>
  );
}

function ConsultRow({ p, accent }: { p: (typeof patients)[number]; accent?: boolean }) {
  return (
    <Link to="/doctor/consultation/$id" params={{ id: p.id }}>
      <Card className={accent ? "!border-primary/40 !bg-primary/5" : ""}>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-accent grid place-items-center shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold truncate">#{p.token} · {p.name}</div>
              <StatusPill status={p.status} />
            </div>
            <div className="text-xs text-muted-foreground truncate mt-0.5">{p.age}y · {p.gender} · {p.symptoms}</div>
          </div>
          {accent ? <Stethoscope className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </Card>
    </Link>
  );
}