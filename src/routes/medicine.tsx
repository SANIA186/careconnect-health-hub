import { createFileRoute } from "@tanstack/react-router";
import { AppShell, VolunteerNav } from "@/components/care/AppShell";
import { Card, SectionTitle, StatCard } from "@/components/care/Cards";
import { medicines, patients } from "@/lib/care-data";
import { useState } from "react";
import { Pill, PackageCheck, AlertTriangle, Search, CheckCircle2, Boxes } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/medicine")({
  component: MedicinePage,
  head: () => ({ meta: [{ title: "Medicine — CareConnect" }] }),
});

function MedicinePage() {
  const [tab, setTab] = useState<"distribution" | "inventory">("distribution");
  const low = medicines.filter((m) => m.stock < m.minStock).length;
  const totalDistributed = medicines.reduce((s, m) => s + m.distributed, 0);
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

      {tab === "distribution" ? <Distribution /> : <Inventory />}
    </AppShell>
  );
}

function Distribution() {
  const pending = patients.filter((p) => p.status === "completed" || p.status === "in-consultation");
  return (
    <div className="mt-4 space-y-3">
      <SectionTitle>Pending dispense</SectionTitle>
      {pending.map((p) => (
        <Card key={p.id}>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="font-semibold truncate">#{p.token} · {p.name}</div>
              <div className="text-xs text-muted-foreground truncate">{p.age}y · {p.village}</div>
            </div>
            <button
              onClick={() => toast.success("Marked as dispensed", { description: `${p.name} · Token #${p.token}` })}
              className="h-9 px-3 rounded-full text-xs font-semibold text-white inline-flex items-center gap-1.5"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Dispense
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Paracetamol 500mg", "ORS Sachet"].map((m) => (
              <span key={m} className="inline-flex items-center gap-1 text-[11px] rounded-full bg-accent px-2 py-1 text-accent-foreground">
                <Pill className="h-3 w-3" /> {m}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function Inventory() {
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}