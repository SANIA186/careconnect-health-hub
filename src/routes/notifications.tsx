import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/care/AppShell";
import { Card } from "@/components/care/Cards";
import { Bell, UserPlus, Pill, CalendarClock, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
  head: () => ({ meta: [{ title: "Notifications — CareConnect" }] }),
});

const items = [
  { icon: UserPlus, tone: "bg-primary/15 text-primary", title: "New patient in queue", body: "Token #16 · Suman Devi added by volunteer Priya.", time: "2m ago" },
  { icon: AlertTriangle, tone: "bg-warning/20 text-warning-foreground", title: "Low stock: Cough Syrup", body: "24 bottles remaining, below threshold of 30.", time: "18m ago" },
  { icon: CalendarClock, tone: "bg-accent text-accent-foreground", title: "Follow-up due tomorrow", body: "Mohan Singh — GERD review scheduled.", time: "1h ago" },
  { icon: Pill, tone: "bg-success/15 text-success", title: "Medicine dispensed", body: "8 patients received prescriptions today.", time: "3h ago" },
  { icon: Bell, tone: "bg-secondary text-foreground", title: "Sunday Camp confirmed", body: "Kotra Health Sub-Centre · July 19", time: "Yesterday" },
];

function Notifications() {
  return (
    <AppShell title="Notifications" back="/volunteer">
      <div className="space-y-3">
        {items.map((n, i) => {
          const Icon = n.icon;
          return (
            <Card key={i}>
              <div className="flex gap-3">
                <span className={`h-10 w-10 rounded-2xl grid place-items-center shrink-0 ${n.tone}`}><Icon className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm truncate">{n.title}</div>
                    <div className="text-[11px] text-muted-foreground shrink-0">{n.time}</div>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}