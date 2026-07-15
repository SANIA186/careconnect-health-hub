import { type ReactNode } from "react";

export function StatCard({ label, value, icon, tone = "primary" }: { label: string; value: string | number; icon?: ReactNode; tone?: "primary" | "success" | "warning" }) {
  const toneClass = tone === "success" ? "bg-success/10 text-success" : tone === "warning" ? "bg-warning/20 text-warning-foreground" : "bg-accent text-accent-foreground";
  return (
    <div className="rounded-2xl bg-card border border-border p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon && <span className={`h-8 w-8 grid place-items-center rounded-full ${toneClass}`}>{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-bold text-foreground tabular-nums">{value}</div>
    </div>
  );
}

export function StatusPill({ status }: { status: "waiting" | "in-consultation" | "completed" | "upcoming" | "active" }) {
  const map: Record<string, string> = {
    waiting: "bg-warning/25 text-warning-foreground",
    "in-consultation": "bg-primary/15 text-primary",
    completed: "bg-success/15 text-success",
    upcoming: "bg-accent text-accent-foreground",
    active: "bg-primary/15 text-primary",
  };
  const label: Record<string, string> = {
    waiting: "Waiting", "in-consultation": "In consultation", completed: "Completed", upcoming: "Upcoming", active: "Active",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label[status]}
    </span>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-6 first:mt-0">
      <h2 className="text-sm font-semibold text-foreground tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-card border border-border p-4 ${className}`} style={{ boxShadow: "var(--shadow-card)" }}>
      {children}
    </div>
  );
}