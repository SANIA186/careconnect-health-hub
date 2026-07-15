import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Stethoscope, HeartHandshake, ShieldCheck, ArrowRight, HeartPulse } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — CareConnect" }] }),
});

const roles = [
  { id: "volunteer", label: "Volunteer", desc: "Register patients & dispense medicine", icon: HeartHandshake, to: "/volunteer" },
  { id: "doctor", label: "Doctor", desc: "Consult, diagnose and prescribe", icon: Stethoscope, to: "/doctor" },
  { id: "admin", label: "Admin", desc: "Camps, reports and settings", icon: ShieldCheck, to: "/reports" },
] as const;

function LoginPage() {
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("volunteer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const active = roles.find((r) => r.id === role)!;

  return (
    <div className="min-h-screen flex justify-center bg-background">
      <div className="w-full max-w-md px-6 pt-10 pb-8 flex flex-col">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <span className="h-9 w-9 rounded-2xl grid place-items-center text-white" style={{ backgroundImage: "var(--gradient-primary)" }}>
            <HeartPulse className="h-5 w-5" />
          </span>
          CareConnect
        </div>
        <h1 className="mt-8 text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue managing today's camp.</p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`rounded-2xl border p-3 flex flex-col items-center gap-1.5 transition-all ${isActive ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border bg-card text-muted-foreground"}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-semibold">{r.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{active.desc}</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: active.to });
          }}
        >
          <label className="block">
            <span className="text-xs font-medium text-foreground">Email or phone</span>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="volunteer@ngo.org"
              className="mt-1.5 w-full h-12 rounded-xl bg-input/60 border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full h-12 rounded-xl bg-input/60 border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            className="w-full h-12 rounded-2xl text-white font-semibold inline-flex items-center justify-center gap-2"
            style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}
          >
            Sign in as {active.label} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <Link to="/" className="mt-6 text-center text-xs text-muted-foreground">
          Back to splash
        </Link>
      </div>
    </div>
  );
}