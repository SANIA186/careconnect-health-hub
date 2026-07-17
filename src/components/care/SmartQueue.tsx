import { Clock, UserRound, Stethoscope, AlertTriangle, ArrowRight } from "lucide-react";
import { Card } from "./Cards";
import type { Patient } from "@/types/patient";

interface SmartQueueProps {
  patients: Patient[];
}

export default function SmartQueue({ patients }: SmartQueueProps) {
  const currentPatient = patients.find(
    (p) => p.status === "in-consultation"
  );

  const waitingPatients = patients
    .filter((p) => p.status === "waiting")
    .sort((a, b) => a.token - b.token);

  const priorityPatients = waitingPatients.filter((patient) => patient.vitals.bp.includes("/"));
  const estimatedWait = Math.max(5, waitingPatients.length * 5);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            Smart Queue
          </h3>
          <p className="text-xs text-muted-foreground">
            Today's patient flow
          </p>
        </div>

        <Clock className="h-5 w-5 text-primary" />
      </div>


      {currentPatient && (
        <div className="mt-4 rounded-xl bg-primary/10 p-3">
          <div className="flex items-center gap-2 text-xs text-primary font-medium">
            <Stethoscope className="h-4 w-4" />
            Now Consulting
          </div>

          <p className="mt-1 font-semibold">
            Token #{currentPatient.token}
          </p>

          <p className="text-sm text-muted-foreground">
            {currentPatient.name}
          </p>
        </div>
      )}


      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">
          Waiting Queue
        </p>

        <div className="mt-2 space-y-2">
          {waitingPatients.slice(0, 3).map((patient) => (
            <div
              key={patient.id}
              className="flex items-center gap-3 rounded-xl bg-muted/50 p-3"
            >
              <UserRound className="h-4 w-4 text-primary" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">
                    {patient.name}
                  </p>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                    {patient.token}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Token #{patient.token}</span>
                  <span>•</span>
                  <span>{Math.max(3, 10 - patient.age / 10)} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      <div className="mt-4 flex items-center justify-between rounded-xl bg-accent/50 p-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Estimated wait</p>
          <p className="text-sm font-semibold text-foreground">{estimatedWait} minutes</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-primary">
          <AlertTriangle className="h-3.5 w-3.5" />
          {priorityPatients.length} priority
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Queue health is steady.</span>
        <span className="inline-flex items-center gap-1 font-semibold text-primary">
          Open queue <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>

    </Card>
  );
}