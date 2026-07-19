import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, BellButton, DoctorNav } from "@/components/care/AppShell";
import { Card, SectionTitle, StatCard, StatusPill } from "@/components/care/Cards";
import { getCurrentCamp } from "@/api/camp.api";
import { getPatients } from "@/api/patient.api";
import type { Patient } from "@/types/patient";
import { Clock, CheckCircle2, Users, ChevronRight, User, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/doctor/")({
  component: DoctorHome,
  head: () => ({ meta: [{ title: "Doctor — CareConnect" }] }),
});

function DoctorHome() {
  const [patients, setPatients] = useState<Awaited<ReturnType<typeof getPatients>>>([]);
  const [currentCamp, setCurrentCamp] = useState<Awaited<ReturnType<typeof getCurrentCamp>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      try {
        const [patientData, campData] = await Promise.all([getPatients(), getCurrentCamp()]);
        setPatients(patientData);
        setCurrentCamp(campData);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <AppShell title="Doctor Dashboard" subtitle="Loading..." hero actions={<BellButton />} bottomNav={<DoctorNav />}>
        <div className="flex flex-col items-center justify-center mt-12 text-center p-6 border border-dashed rounded-2xl bg-card">
          <Stethoscope className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <h2 className="text-xl font-bold">Loading...</h2>
          <p className="text-sm text-muted-foreground mt-2">Checking for active camps...</p>
        </div>
      </AppShell>
    );
  }

  if (!currentCamp) {
    return (
      <AppShell title="Doctor Dashboard" subtitle="No active camp" hero actions={<BellButton />} bottomNav={<DoctorNav />}>
        <div className="flex flex-col items-center justify-center mt-12 text-center p-6 border border-dashed rounded-2xl bg-card">
          <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold">No Active Camp</h2>
          <p className="text-sm text-muted-foreground mt-2">There is no active camp right now. Please wait for a volunteer to start one.</p>
        </div>
      </AppShell>
    );
  }

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

function ConsultRow({ p, accent }: { p: Patient; accent?: boolean }) {
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