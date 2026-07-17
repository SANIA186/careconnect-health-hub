import { MessageSquareMore } from "lucide-react";
import { useEffect, useState } from "react";
import { getLatestConsultationSummary, getPatientById } from "@/api/patient.api";
import type { Patient } from "@/types/patient";
import { Card } from "./Cards";

interface SMSPreviewProps {
  patient?: Patient;
  patientId?: string;
  patientName?: string;
  medicines?: string[];
  dosage?: string[];
  followUp?: string;
  advice?: string;
  pickupTime?: string;
  note?: string;
}

export default function SMSPreview({ patient, patientId, patientName, medicines = [], dosage = [], followUp, advice, pickupTime = "today", note = "Please collect your medicines from the pharmacy desk." }: SMSPreviewProps) {
  const [resolvedPatient, setResolvedPatient] = useState<Patient | undefined>(patient);

  useEffect(() => {
    let ignore = false;

    if (patient) {
      setResolvedPatient(patient);
      return () => {
        ignore = true;
      };
    }

    if (!patientId) {
      setResolvedPatient(undefined);
      return () => {
        ignore = true;
      };
    }

    void (async () => {
      const fetchedPatient = await getPatientById(patientId);
      if (!ignore) {
        setResolvedPatient(fetchedPatient ?? undefined);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [patient, patientId]);

  const consultation = resolvedPatient ? getLatestConsultationSummary(resolvedPatient) : undefined;
  const displayName = resolvedPatient?.name ?? patientName ?? "patient";
  const displayDiagnosis = consultation?.diagnosis ?? "No consultation history available.";
  const displayMedicines = consultation?.prescriptions ?? [];
  const displayFollowUp = followUp ?? consultation?.followUp ?? "Not required";
  const displayAdvice = advice ?? consultation?.advice ?? "";

  return (
    <Card className="bg-secondary/50">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessageSquareMore className="h-4 w-4 text-primary" /> SMS preview
      </div>
      <div className="mt-3 rounded-2xl border border-border bg-card/80 p-3 text-sm text-foreground">
        <div className="font-semibold">Hi {displayName},</div>
        <div className="mt-2">Your consultation has been completed.</div>

        <div className="mt-3">
          <div className="font-semibold">Diagnosis:</div>
          <div className="mt-1 text-muted-foreground">{displayDiagnosis}</div>
        </div>

        <div className="mt-3">
          <div className="font-semibold">Medicines:</div>
          {displayMedicines.length > 0 ? (
            <div className="mt-1 space-y-2 text-muted-foreground">
              {displayMedicines.map((prescription) => (
                <div key={`${prescription.medicine}-${prescription.dosage}`}>
                  <div>• {prescription.medicine}</div>
                  <div className="mt-1 pl-3">Dosage: {prescription.dosage}</div>
                  <div className="pl-3">Duration: {prescription.duration}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-muted-foreground">No medicines prescribed.</div>
          )}
        </div>

        <div className="mt-3">
          <div className="font-semibold">Follow-up:</div>
          <div className="mt-1 text-muted-foreground">{displayFollowUp === "Not required" ? "No follow-up visit required." : displayFollowUp}</div>
        </div>

        {displayAdvice ? (
          <div className="mt-3">
            <div className="font-semibold">Advice:</div>
            <div className="mt-1 text-muted-foreground">{displayAdvice}</div>
          </div>
        ) : null}

        <div className="mt-3 text-muted-foreground">Please collect your medicines from the pharmacy desk.</div>
        <div className="mt-2 text-muted-foreground">Thank you for visiting NGO CareConnect.</div>
      </div>
    </Card>
  );
}
