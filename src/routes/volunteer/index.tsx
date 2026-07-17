import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, BellButton, VolunteerNav } from "@/components/care/AppShell";
import { Card, SectionTitle, StatCard, StatusPill } from "@/components/care/Cards";
import SmartQueue from "@/components/care/SmartQueue.tsx";
import { getCamps, getCurrentCamp } from "@/api/camp.api";
import { getPatients } from "@/api/patient.api";
import { useEffect, useState } from "react";
import { Users, Clock, CheckCircle2, Plus, UserPlus, QrCode, Tent, MapPin, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/volunteer/")({
  component: VolunteerHome,
  head: () => ({ meta: [{ title: "Volunteer — CareConnect" }] }),
});

function VolunteerHome() {
  const [patients, setPatients] = useState<Awaited<ReturnType<typeof getPatients>>>([]);
  const [currentCamp, setCurrentCamp] = useState<Awaited<ReturnType<typeof getCurrentCamp>> | null>(null);
  const [camps, setCamps] = useState<Awaited<ReturnType<typeof getCamps>>>([]);

  useEffect(() => {
    void (async () => {
      const [patientData, campData, campsData] = await Promise.all([getPatients(), getCurrentCamp(), getCamps()]);
      setPatients(patientData);
      setCurrentCamp(campData);
      setCamps(campsData);
    })();
  }, []);

  if (!currentCamp) return null;

  const waiting = patients.filter((p) => p.status === "waiting").length;
  const inConsult = patients.filter((p) => p.status === "in-consultation").length;
  const completed = patients.filter((p) => p.status === "completed").length;
  const past = camps.filter((c) => c.status === "completed").slice(0, 3);

  return (
    <AppShell title="Namaste, Priya" subtitle="Volunteer • Rampur Team" hero actions={<BellButton />} bottomNav={<VolunteerNav />}>
      <Card className="-mt-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Tent className="h-3 w-3" /> Active camp
            </div>
            <div className="mt-0.5 font-semibold truncate">{currentCamp.name}</div>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{currentCamp.date}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{currentCamp.location}</span>
            </div>
          </div>
          <StatusPill status={currentCamp.status} />
        </div>
      </Card>

      <SectionTitle>Today's snapshot</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Waiting" value={waiting} tone="warning" icon={<Clock className="h-4 w-4" />} />
        <StatCard label="In consult" value={inConsult} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Done" value={completed} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>
      <SectionTitle>Smart Queue</SectionTitle>

      <SmartQueue patients={patients} />

      <SectionTitle>Quick actions</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Link to="/volunteer/patients/new" className="rounded-2xl p-4 text-white flex flex-col justify-between h-32" style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}>
          <UserPlus className="h-6 w-6" />
          <div>
            <div className="text-sm font-semibold">Register patient</div>
            <div className="text-[11px] text-white/80">Add a new visitor to the queue</div>
          </div>
        </Link>
        <Link to="/volunteer/camps/new" className="rounded-2xl p-4 bg-card border border-border flex flex-col justify-between h-32">
          <Plus className="h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-semibold">Create camp</div>
            <div className="text-[11px] text-muted-foreground">Schedule next Sunday's camp</div>
          </div>
        </Link>
        <Link to="/volunteer/queue" className="rounded-2xl p-4 bg-card border border-border flex flex-col justify-between h-32">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-semibold">Patient queue</div>
            <div className="text-[11px] text-muted-foreground">{waiting + inConsult} active tokens</div>
          </div>
        </Link>
        <Link to="/volunteer/patients/$id" params={{ id: "P-1042" }} className="rounded-2xl p-4 bg-card border border-border flex flex-col justify-between h-32">
          <QrCode className="h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-semibold">Scan passport</div>
            <div className="text-[11px] text-muted-foreground">Lookup by QR health ID</div>
          </div>
        </Link>
      </div>

      <SectionTitle action={<Link to="/reports" className="text-xs text-primary font-medium">See all</Link>}>Recent camps</SectionTitle>
      <div className="space-y-3">
        {past.map((c) => (
          <Card key={c.id}>
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{c.name}</div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{c.date}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.patientsServed} patients</span>
                </div>
              </div>
              <StatusPill status={c.status} />
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}