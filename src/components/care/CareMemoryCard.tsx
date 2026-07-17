import { History, Pill, Stethoscope } from "lucide-react";
import { Card } from "./Cards";
import type { Patient } from "@/types/patient";

interface CareMemoryCardProps {
  patient: Patient;
}

export default function CareMemoryCard({
  patient,
}: CareMemoryCardProps) {

  const lastVisit = patient.visits[patient.visits.length - 1];

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            Care Memory
          </h3>

          <p className="text-xs text-muted-foreground">
            Previous health history
          </p>
        </div>

        <History className="h-5 w-5 text-primary" />
      </div>


      {lastVisit ? (
        <div className="mt-4 space-y-3">

          <div className="rounded-xl bg-primary/10 p-3">
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <Stethoscope className="h-4 w-4" />
              Last Diagnosis
            </div>

            <p className="mt-1 text-sm font-semibold">
              {lastVisit.diagnosis}
            </p>

            <p className="text-xs text-muted-foreground">
              {lastVisit.date}
            </p>
          </div>


          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Medicines
            </p>

            <div className="mt-2 space-y-2">
              {lastVisit.prescriptions.map((medicine, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-xl bg-muted/50 p-3"
                >
                  <Pill className="h-4 w-4 text-primary" />

                  <div>
                    <p className="text-sm font-medium">
                      {medicine.medicine}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {medicine.dosage} • {medicine.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {lastVisit.followUp && (
            <p className="text-xs text-muted-foreground">
              Follow-up:
              <span className="font-medium text-foreground ml-1">
                {lastVisit.followUp}
              </span>
            </p>
          )}

        </div>
      ) : (

        <div className="mt-4 rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No previous visits found
          </p>
        </div>

      )}

    </Card>
  );
}