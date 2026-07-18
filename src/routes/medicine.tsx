import { createFileRoute } from "@tanstack/react-router";
import { AppShell, VolunteerNav } from "@/components/care/AppShell";
import { Card, SectionTitle, StatCard } from "@/components/care/Cards";
import { dispenseMedicines, getMedicines } from "@/api/medicine.api";
import { getPatients } from "@/api/patient.api";
import type { Medicine } from "@/types/medicine";
import type { Patient, Prescription } from "@/types/patient";
import { useEffect, useState } from "react";
import SMSPreview from "@/components/care/SMSPreview";
import { Pill, PackageCheck, AlertTriangle, Search, CheckCircle2, Boxes } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/medicine")({
  component: MedicinePage,
  head: () => ({ meta: [{ title: "Medicine — CareConnect" }] }),
});

function MedicinePage() {
  const [tab, setTab] = useState<"distribution" | "inventory">("distribution");
  const [medicines, setMedicines] = useState<Awaited<ReturnType<typeof getMedicines>>>([]);
  const [patients, setPatients] = useState<Awaited<ReturnType<typeof getPatients>>>([]);

  useEffect(() => {
    void (async () => {
      const [medicineData, patientData] = await Promise.all([getMedicines(), getPatients()]);
      setMedicines(medicineData);
      setPatients(patientData);
    })();
  }, []);

  const low = medicines.filter((m) => m.stock < m.minStock).length;
  const totalDistributed = medicines.reduce((s, m) => s + m.distributed, 0);

  async function handleDispense(patientId: string, prescriptions: Prescription[]) {
    const result = await dispenseMedicines(patientId, prescriptions);
    setPatients((previous) => previous.map((patient) => (patient.id === patientId ? result.patient : patient)));
    setMedicines(result.medicines);
  }

  return (
    <AppShell title="Medicine" subtitle="Distribution & inventory" back="/volunteer" bottomNav={<VolunteerNav />}>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Items" value={medicines.length} icon={<Boxes className="h-4 w-4" />} />
        <StatCard label="Dispensed" value={totalDistributed} tone="success" icon={<PackageCheck className="h-4 w-4" />} />
        <StatCard label="Low stock" value={low} tone="warning" icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="mt-5 flex gap-1 bg-secondary rounded-2xl p-1">
        {(["distribution", "inventory"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 h-10 rounded-xl text-xs font-semibold capitalize ${tab === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "distribution" ? <Distribution patients={patients} medicines={medicines} onDispense={handleDispense} /> : <Inventory medicines={medicines} />}
    </AppShell>
  );
}

function Distribution({ patients, medicines, onDispense }: { patients: Patient[]; medicines: Medicine[]; onDispense: (patientId: string, prescriptions: Prescription[]) => Promise<void> }) {
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<Record<string, Record<string, boolean>>>({});
  const [dispensingPatientId, setDispensingPatientId] = useState<string | null>(null);
  const [previewPatientId, setPreviewPatientId] = useState<string | null>(null);
  const pending = patients.filter((p) => (p.status === "completed" || p.status === "in-consultation") && !p.medicineDispensed);

  const toggleSelection = (patientId: string, medicineName: string) => {
    setSelectedPrescriptions((previous) => ({
      ...previous,
      [patientId]: {
        ...(previous[patientId] ?? {}),
        [medicineName]: !(previous[patientId]?.[medicineName] ?? false),
      },
    }));
  };

  const handleDispense = async (patient: Patient) => {
    setPreviewPatientId(patient.id);
    const latestVisit = patient.visits[patient.visits.length - 1];
    const selected = latestVisit?.prescriptions.filter((prescription) => selectedPrescriptions[patient.id]?.[prescription.medicine] ?? false) ?? [];
    if (selected.length === 0) {
      toast.error("Nothing selected", { description: "Select at least one medicine before dispensing." });
      return;
    }

    setDispensingPatientId(patient.id);
    try {
      await onDispense(patient.id, selected);
      setSelectedPrescriptions((previous) => ({ ...previous, [patient.id]: {} }));
      toast.success("Dispensed successfully", { description: `${patient.name} · Token #${patient.token}` });
    } catch (error) {
      toast.error("Dispense failed", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setDispensingPatientId(null);
    }
  };

  const previewPatient =
  patients.find((patient) => patient.id === previewPatientId) ?? pending[0];
  const previewVisit = previewPatient?.visits[previewPatient.visits.length - 1];
  const previewMedicines = previewVisit?.prescriptions.map((entry) => entry.medicine) ?? [];
  const previewDosage = previewVisit?.prescriptions.map((entry) => `${entry.medicine} · ${entry.dosage}`) ?? [];

  return (
    <div className="mt-4 space-y-3">
      <SectionTitle>Pending dispense</SectionTitle>
      {pending.map((p) => {
        const latestVisit = p.visits[p.visits.length - 1];
        return (
          <Card key={p.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">#{p.token} · {p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.age}y · {p.village}</div>
              </div>
              <button
                onClick={() => void handleDispense(p)}
                disabled={dispensingPatientId === p.id}
                className="h-9 px-3 rounded-full text-xs font-semibold text-white inline-flex items-center gap-1.5 disabled:opacity-70"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> {dispensingPatientId === p.id ? "Dispensing..." : "Dispense"}
              </button>
            </div>

            {latestVisit ? (
              <div className="mt-3 rounded-xl bg-accent/20 p-3 text-xs text-foreground">
                <div className="font-semibold">Latest consultation</div>
                <div className="mt-1 text-muted-foreground">Diagnosis: {latestVisit.diagnosis}</div>
                <div className="mt-1 text-muted-foreground">Advice: {latestVisit.advice ?? latestVisit.notes ?? "No advice recorded."}</div>
                <div className="mt-1 text-muted-foreground">Follow-up: {latestVisit.followUp ?? "Not required"}</div>
              </div>
            ) : null}

            <div className="mt-3 space-y-2">
              {latestVisit?.prescriptions.map((prescription) => {
                const inventoryItem = medicines.find((medicine) => medicine.name.toLowerCase() === prescription.medicine.toLowerCase());
                const lowStock = Boolean(inventoryItem && inventoryItem.stock < inventoryItem.minStock);
                return (
                  <label key={`${p.id}-${prescription.medicine}`} className="flex items-start justify-between gap-2 rounded-xl border border-border bg-card/70 p-3">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPrescriptions[p.id]?.[prescription.medicine] ?? false}
                        onChange={() => toggleSelection(p.id, prescription.medicine)}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-semibold">{prescription.medicine}</div>
                        <div className="text-[11px] text-muted-foreground">{prescription.dosage} · {prescription.duration}</div>
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <div className="font-semibold text-foreground">{inventoryItem?.stock ?? 0}</div>
                      <div className="text-muted-foreground">{inventoryItem?.unit ?? "units"}</div>
                      {lowStock && <div className="mt-1 text-warning-foreground bg-warning/20 px-2 py-0.5 rounded-full">Low stock</div>}
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>
        );
      })}
      {pending.length === 0 && <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No patients are waiting for pharmacy dispense.</div>}
      <SMSPreview
        patient={previewPatient}
        patientId={previewPatient?.id}
        patientName={previewPatient?.name ?? "patient"}
        pickupTime="today"
        note="Collect from the pharmacy desk after the consult is closed."
      />
    </div>
  );
}

function Inventory({ medicines }: { medicines: Medicine[] }) {
  const [q, setQ] = useState("");
  const list = medicines.filter((m) => !q || m.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mt-4">
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicine"
          className="w-full h-11 rounded-xl border border-border bg-card pl-9 pr-3 text-sm" />
      </div>
      <div className="mt-4 space-y-3">
        {list.map((m) => {
          const pct = Math.min(100, Math.round((m.stock / (m.minStock * 4 || 1)) * 100));
          const lowStock = m.stock < m.minStock;
          return (
            <Card key={m.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.category} · exp {m.expiry}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold tabular-nums">{m.stock}</div>
                  <div className="text-[10px] text-muted-foreground">{m.unit}</div>
                </div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full ${lowStock ? "bg-warning" : "bg-primary"}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Dispensed today: <b className="text-foreground">{m.distributed}</b></span>
                {lowStock && <span className="text-warning-foreground bg-warning/20 px-2 py-0.5 rounded-full font-semibold">Low stock</span>}
              </div>
              {lowStock && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-warning/10 p-2 text-[11px] text-warning-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" /> Restock recommended before the next camp.
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}