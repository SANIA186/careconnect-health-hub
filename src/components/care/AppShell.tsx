import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { ArrowLeft, Bell } from "lucide-react";

interface AppShellProps {
  title: string;
  subtitle?: string;
  back?: string;
  actions?: ReactNode;
  bottomNav?: ReactNode;
  children: ReactNode;
  hero?: boolean;
}

export function AppShell({ title, subtitle, back, actions, bottomNav, children, hero }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen relative">
        <header
          className={
            hero
              ? "px-5 pt-6 pb-8 text-primary-foreground"
              : "px-5 pt-5 pb-4 bg-card border-b border-border"
          }
          style={hero ? { backgroundImage: "var(--gradient-hero)" } : undefined}
        >
          <div className="flex items-center gap-3">
            {back && (
              <Link
                to={back}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${hero ? "bg-white/15 text-white" : "bg-secondary text-foreground"}`}
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            )}
            <div className="min-w-0 flex-1">
              <h1 className={`truncate text-xl font-semibold tracking-tight ${hero ? "text-white" : "text-foreground"}`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`truncate text-xs mt-0.5 ${hero ? "text-white/80" : "text-muted-foreground"}`}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions}
          </div>
        </header>
        <main className={`flex-1 px-5 py-5 ${bottomNav ? "pb-24" : "pb-6"}`}>{children}</main>
        {bottomNav && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border">
            {bottomNav}
          </nav>
        )}
      </div>
    </div>
  );
}

export function BellButton() {
  return (
    <Link to="/notifications" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white relative" aria-label="Notifications">
      <Bell className="h-4 w-4" />
      <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-warning" />
    </Link>
  );
}

interface NavItem { to: string; icon: ReactNode; label: string }
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="grid grid-cols-5 h-16">
      {items.map((item) => {
        const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
          >
            <div className={`h-8 w-14 grid place-items-center rounded-full transition-colors ${active ? "bg-accent" : ""}`}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function VolunteerNav() {
  const { Home, Users, Pill, BarChart3, Settings } = require("lucide-react");
  return (
    <BottomNav
      items={[
        { to: "/volunteer", label: "Home", icon: <Home className="h-5 w-5" /> },
        { to: "/volunteer/queue", label: "Queue", icon: <Users className="h-5 w-5" /> },
        { to: "/medicine", label: "Medicine", icon: <Pill className="h-5 w-5" /> },
        { to: "/reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
        { to: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
      ]}
    />
  );
}

export function DoctorNav() {
  const { Stethoscope, Users, Pill, BarChart3, Settings } = require("lucide-react");
  return (
    <BottomNav
      items={[
        { to: "/doctor", label: "Consult", icon: <Stethoscope className="h-5 w-5" /> },
        { to: "/volunteer/queue", label: "Queue", icon: <Users className="h-5 w-5" /> },
        { to: "/medicine", label: "Medicine", icon: <Pill className="h-5 w-5" /> },
        { to: "/reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
        { to: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
      ]}
    />
  );
}