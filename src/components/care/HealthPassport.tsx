import { Activity, Phone, MapPin, User, Stethoscope, ShieldAlert } from "lucide-react";
import { Card } from "./Cards";
import { QRPlaceholder } from "./QRCode";
import type { Patient } from "@/types/patient";

interface HealthPassportProps {
  patient: Patient;
}

export default function HealthPassport({ patient }: HealthPassportProps) {
  const bp = Number.parseInt(patient.vitals.bp.split("/")[0] ?? "0", 10);
  const flags = [] as string[];
  if (!Number.isNaN(bp) && bp >= 140) flags.push("Elevated BP");
  if (Number.parseFloat(patient.vitals.temp) >= 99) flags.push("Low-grade fever");
  if (patient.visits.length > 0) flags.push("Prior visit on record");

  return (
    <Card className="bg-gradient-to-br from-accent/60 to-card">
      <div className="flex items-center gap-4">
        <div className="shrink-0 text-primary">
          <QRPlaceholder value={patient.id} size={104} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">Health Passport</div>
          <div className="mt-1 truncate font-semibold">{patient.name}</div>
          <div className="text-xs text-muted-foreground">{patient.id} · Token #{patient.token}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{patient.age}y {patient.gender}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{patient.phone}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{patient.village}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-card/70 p-3">
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Current concern</div>
          <div className="mt-1 text-sm font-semibold">{patient.symptoms}</div>
        </div>
        <div className="rounded-xl border border-border bg-card/70 p-3">
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Vitals snapshot</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
            <Activity className="h-3.5 w-3.5 text-primary" /> {patient.vitals.bp}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Stethoscope className="h-3 w-3" /> {patient.vitals.pulse} · {patient.vitals.temp}
          </div>
        </div>
      </div>

      {flags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {flags.map((flag) => (
            <span key={flag} className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-semibold text-warning-foreground">
              <ShieldAlert className="h-3 w-3" /> {flag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
