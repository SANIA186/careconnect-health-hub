import { Sparkles, AlertTriangle, ClipboardList } from "lucide-react";
import { Card } from "./Cards";
import type { Patient } from "@/types/patient";

interface QuickCareSnapshotProps {
  patient: Patient;
  summary: { headline: string; bullets: string[]; flags: string[] };
}

export default function QuickCareSnapshot({ patient, summary }: QuickCareSnapshotProps) {
  return (
    <Card className="!border-primary/20 !bg-primary/5">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Quick care snapshot</span>
      </div>
      <div className="mt-2 font-semibold">{summary.headline}</div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-foreground">
        <div className="rounded-xl bg-card/70 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <ClipboardList className="h-3.5 w-3.5" /> Presenting issue
          </div>
          <div className="mt-1">{patient.symptoms}</div>
        </div>
        <div className="rounded-xl bg-card/70 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Care context</div>
          <div className="mt-1">{patient.visits.length > 0 ? `${patient.visits.length} past visit${patient.visits.length > 1 ? "s" : ""}` : "First visit today"}</div>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {summary.bullets.map((bullet, index) => (
          <li key={`${bullet}-${index}`} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      {summary.flags.length > 0 && (
        <div className="mt-3 flex gap-2 rounded-xl bg-warning/15 p-3 text-xs text-warning-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">Watchlist</div>
            <ul className="mt-1 space-y-0.5">
              {summary.flags.map((flag) => <li key={flag}>• {flag}</li>)}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
