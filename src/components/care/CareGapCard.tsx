import { AlertCircle, HeartPulse, ShieldCheck } from "lucide-react";
import { Card } from "./Cards";
import type { Patient } from "@/types/patient";

interface CareGapCardProps {
  patient: Patient;
}

export default function CareGapCard({ patient }: CareGapCardProps) {
  const bp = Number.parseInt(patient.vitals.bp.split("/")[0] ?? "0", 10);
  const gaps = [] as { title: string; detail: string; tone: "warning" | "primary" }[];

  if (!Number.isNaN(bp) && bp >= 140) {
    gaps.push({ title: "BP follow-up", detail: "Systolic reading is above the care threshold.", tone: "warning" });
  }
  if (patient.visits.length === 0) {
    gaps.push({ title: "Previous history", detail: "No prior care record is attached yet.", tone: "primary" });
  }
  if (Number.parseFloat(patient.vitals.temp) >= 99) {
    gaps.push({ title: "Symptom escalation", detail: "Temp trend should be monitored closely.", tone: "warning" });
  }
  if (gaps.length === 0) {
    gaps.push({ title: "No gaps flagged", detail: "The patient looks clinically stable for now.", tone: "primary" });
  }

  return (
    <Card className="!border-accent/50">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <AlertCircle className="h-4 w-4 text-primary" /> Care gaps
      </div>
      <div className="mt-3 space-y-2">
        {gaps.map((gap) => (
          <div key={gap.title} className={`rounded-xl border p-3 ${gap.tone === "warning" ? "border-warning/30 bg-warning/10" : "border-border bg-card/70"}`}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {gap.tone === "warning" ? <HeartPulse className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {gap.title}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{gap.detail}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
