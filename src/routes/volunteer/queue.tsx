import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, VolunteerNav } from "@/components/care/AppShell";
import { Card, StatusPill } from "@/components/care/Cards";
import { currentCamp, patients, type QueueStatus } from "@/lib/care-data";
import { Search, Filter, ChevronRight, User } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/volunteer/queue")({
  component: Queue,
  head: () => ({ meta: [{ title: "Patient queue — CareConnect" }] }),
});

const filters: { id: "all" | QueueStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "waiting", label: "Waiting" },
  { id: "in-consultation", label: "In consult" },
  { id: "completed", label: "Done" },
];

function Queue() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const list = patients
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()) || String(p.token).includes(q));

  return (
    <AppShell title="Patient queue" subtitle={currentCamp.name} back="/volunteer" bottomNav={<VolunteerNav />}>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search token or name"
            className="w-full h-11 rounded-xl border border-border bg-card pl-9 pr-3 text-sm"
          />
        </div>
        <button className="h-11 w-11 rounded-xl bg-card border border-border grid place-items-center">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map((f) => {
          const active = f.id === filter;
          const count = f.id === "all" ? patients.length : patients.filter((p) => p.status === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 h-9 px-4 rounded-full text-xs font-semibold border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
            >
              {f.label} · {count}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {list.map((p) => (
          <Link key={p.id} to="/volunteer/patients/$id" params={{ id: p.id }}>
            <Card className="active:scale-[0.99] transition-transform">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-accent grid place-items-center shrink-0 relative">
                  <User className="h-5 w-5 text-primary" />
                  <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                    {p.token}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold truncate">{p.name}</div>
                    <StatusPill status={p.status} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground truncate">
                    {p.age}y · {p.gender} · {p.village} · {p.registeredAt}
                  </div>
                  <div className="mt-1 text-xs text-foreground truncate">{p.symptoms}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </Card>
          </Link>
        ))}
        {list.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">No patients match.</div>
        )}
      </div>
    </AppShell>
  );
}