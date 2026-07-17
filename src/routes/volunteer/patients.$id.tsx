import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/care/AppShell";
import { Card, SectionTitle, StatusPill } from "@/components/care/Cards";
import CareMemoryCard from "@/components/care/CareMemoryCard";
import HealthPassport from "@/components/care/HealthPassport";
import { getPatientById, buildAiSummary } from "@/api/patient.api";
import type { Patient, Visit, Prescription } from "@/types/patient";
import { Activity, Phone, MapPin, User, Stethoscope, Sparkles, AlertTriangle, FileText, Pill } from "lucide-react";

export const Route = createFileRoute("/volunteer/patients/$id")({
  component: PatientDetail,
  loader: async ({ params }) => {
    const patient = await getPatientById(params.id);
    if (!patient) throw notFound();
    return { patient };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.patient.name} — CareConnect` : "Patient — CareConnect" }],
  }),
  notFoundComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">Patient not found.</div>
  ),
  errorComponent: () => (
    <div className="p-8 text-center text-sm text-muted-foreground">Could not load patient.</div>
  ),
});

function PatientDetail() {
  const { patient } = Route.useLoaderData() as { patient: Patient };
  const ai = buildAiSummary(patient);
  return (
    <AppShell title={patient.name} subtitle={`Token #${patient.token} • ${patient.id}`} back="/volunteer/queue">
      <HealthPassport patient={patient} />
      <div className="mt-3"><StatusPill status={patient.status} /></div>

      <SectionTitle>Vitals</SectionTitle>
      <Card>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "BP", value: patient.vitals.bp },
            { label: "Pulse", value: patient.vitals.pulse },
            { label: "Temp", value: patient.vitals.temp },
            { label: "Weight", value: patient.vitals.weight },
          ].map((v) => (
            <div key={v.label} className="rounded-xl bg-secondary/60 py-2">
              <div className="text-[10px] text-muted-foreground font-medium">{v.label}</div>
              <div className="text-sm font-bold text-foreground tabular-nums">{v.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Symptoms & notes</SectionTitle>
      <Card>
        <p className="text-sm text-foreground">{patient.symptoms}</p>
        <p className="mt-2 text-xs text-muted-foreground">{patient.volunteerNotes}</p>
      </Card>
      <SectionTitle>Care Memory</SectionTitle>

      <CareMemoryCard patient={patient} />

      <SectionTitle>AI consultation summary</SectionTitle>
      <Card className="!bg-primary/5 !border-primary/20">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Summary • not a diagnosis</span>
        </div>
        <div className="mt-2 font-semibold text-foreground">{ai.headline}</div>
        <ul className="mt-2 space-y-1.5 text-sm text-foreground">
          {ai.bullets.map((b, i) => (<li key={i} className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" /><span>{b}</span></li>))}
        </ul>
        {ai.flags.length > 0 && (
          <div className="mt-3 rounded-xl bg-warning/15 p-3 text-xs text-warning-foreground flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">Points to review</div>
              <ul className="mt-1 space-y-0.5">{ai.flags.map((f) => <li key={f}>• {f}</li>)}</ul>
            </div>
          </div>
        )}
      </Card>

      <SectionTitle>Visit history</SectionTitle>
      {patient.visits.length === 0 && <Card><p className="text-sm text-muted-foreground">No previous visits recorded.</p></Card>}
      <div className="space-y-3">
        {patient.visits.map((v: Visit, i: number) => (
          <Card key={i}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {v.date} · {v.campName}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground">Diagnosis</div>
                <div className="text-sm">{v.diagnosis}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground">Follow-up</div>
                <div className="text-sm">{v.followUp ?? "—"}</div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {v.prescriptions.map((rx: Prescription) => (
                <span key={rx.medicine} className="inline-flex items-center gap-1 text-[11px] rounded-full bg-accent px-2 py-1 text-accent-foreground">
                  <Pill className="h-3 w-3" />{rx.medicine}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/doctor/consultation/$id" params={{ id: patient.id }} className="h-12 rounded-2xl text-white font-semibold inline-flex items-center justify-center gap-2" style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}>
          <Stethoscope className="h-4 w-4" /> Start consult
        </Link>
        <Link to="/medicine" className="h-12 rounded-2xl bg-card border border-border font-semibold inline-flex items-center justify-center gap-2">
          <FileText className="h-4 w-4" /> Dispense
        </Link>
      </div>
    </AppShell>
  );
}