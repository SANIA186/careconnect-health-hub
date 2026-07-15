import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, VolunteerNav } from "@/components/care/AppShell";
import { Card, SectionTitle } from "@/components/care/Cards";
import { Bell, Shield, Globe, HelpCircle, LogOut, ChevronRight, User, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({ meta: [{ title: "Settings — CareConnect" }] }),
});

function Settings() {
  const navigate = useNavigate();
  const [notif, setNotif] = useState({ queue: true, followup: true, lowStock: true, weekly: false });
  return (
    <AppShell title="Settings" subtitle="Profile & preferences" back="/volunteer" bottomNav={<VolunteerNav />}>
      <Card>
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl text-white grid place-items-center" style={{ backgroundImage: "var(--gradient-primary)" }}>
            <User className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">Priya Nair</div>
            <div className="text-xs text-muted-foreground truncate">Volunteer · Rampur Team</div>
            <div className="mt-1 text-[11px] text-primary font-semibold">ID: VOL-0421</div>
          </div>
          <button className="text-xs text-primary font-semibold">Edit</button>
        </div>
      </Card>

      <SectionTitle>Notifications</SectionTitle>
      <Card>
        {[
          ["queue", "New patient in queue"],
          ["followup", "Follow-up reminders"],
          ["lowStock", "Low medicine stock"],
          ["weekly", "Weekly camp summary"],
        ].map(([k, l]) => (
          <label key={k} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-accent grid place-items-center"><Bell className="h-4 w-4 text-primary" /></span>
              <span className="text-sm">{l}</span>
            </div>
            <input
              type="checkbox"
              checked={(notif as any)[k]}
              onChange={(e) => setNotif({ ...notif, [k]: e.target.checked })}
              className="h-5 w-9 appearance-none rounded-full bg-secondary checked:bg-primary transition-colors relative before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:left-4 before:transition-all"
            />
          </label>
        ))}
      </Card>

      <SectionTitle>Preferences</SectionTitle>
      <Card className="!p-0">
        <Row icon={<Globe className="h-4 w-4 text-primary" />} label="Language" value="English" />
        <Row icon={<Sun className="h-4 w-4 text-primary" />} label="Appearance" value="Light" />
        <Row icon={<Shield className="h-4 w-4 text-primary" />} label="Privacy & security" />
        <Row icon={<HelpCircle className="h-4 w-4 text-primary" />} label="Help & support" last />
      </Card>

      <button
        onClick={() => {
          toast.success("Signed out");
          navigate({ to: "/login" });
        }}
        className="mt-6 w-full h-12 rounded-2xl bg-destructive/10 text-destructive font-semibold inline-flex items-center justify-center gap-2"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>

      <div className="mt-6 text-center text-[11px] text-muted-foreground">
        NGO CareConnect v1.0 · <Link to="/" className="text-primary">About</Link>
      </div>
    </AppShell>
  );
}

function Row({ icon, label, value, last }: { icon: React.ReactNode; label: string; value?: string; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-4 ${last ? "" : "border-b border-border"}`}>
      <span className="h-8 w-8 rounded-full bg-accent grid place-items-center">{icon}</span>
      <span className="text-sm flex-1">{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}