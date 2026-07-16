import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Stethoscope,
  HeartHandshake,
  ShieldCheck,
  Pill,
  ArrowRight,
  HeartPulse,
} from "lucide-react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — CareConnect" }] }),
});

const roles = [
  {
    id: "volunteer",
    label: "Volunteer",
    desc: "Register patients, manage queue and camps",
    icon: HeartHandshake,
    to: "/volunteer",
    placeholder: "volunteer@ngo.org"
  },
  {
    id: "doctor",
    label: "Doctor",
    desc: "Consult patients and prescribe medicines",
    icon: Stethoscope,
    to: "/doctor",
    placeholder: "doctor@ngo.org"
  },
  {
    id: "pharmacy",
    label: "Pharmacist",
    desc: "Dispense medicines and send SMS",
    icon: Pill,
    to: "/medicine",
    placeholder: "pharmacy@ngo.org"
  },
  {
    id: "admin",
    label: "NGO Admin",
    desc: "Manage camps, reports and analytics",
    icon: ShieldCheck,
    to: "/reports",
    placeholder: "admin@ngo.org"
  },
];

function getPasswordStrength(value: string) {
  const score = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[a-z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length;

  if (score <= 2) {
    return {
      width: "w-1/3",
      color: "bg-red-500",
      label: "Weak",
      textClass: "text-red-500",
    };
  }

  if (score <= 4) {
    return {
      width: "w-2/3",
      color: "bg-yellow-500",
      label: "Medium",
      textClass: "text-yellow-500",
    };
  }

  return {
    width: "w-full",
    color: "bg-green-500",
    label: "Strong",
    textClass: "text-green-500",
  };
}

function validatePassword(value: string) {
  const issues = [] as string[];

  if (value.length < 8) {
    issues.push("at least 8 characters");
  }
  if (!/[A-Z]/.test(value)) {
    issues.push("an uppercase letter");
  }
  if (!/[a-z]/.test(value)) {
    issues.push("a lowercase letter");
  }
  if (!/\d/.test(value)) {
    issues.push("a number");
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    issues.push("a special character");
  }

  return issues;
}

function LoginPage() {
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("volunteer");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const active = roles.find((r) => r.id === role)!;
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const passwordStrength = getPasswordStrength(password);

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

        <div className="mt-6 grid grid-cols-2 gap-2">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`rounded-2xl border p-3 flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary shadow-lg scale-105"
                        : "border-border bg-card text-muted-foreground"
}`}
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

              const trimmedPhone = phone.trim();
              const trimmedEmail = email.trim();
              const passwordIssues = validatePassword(password);
              const nextPhoneError = trimmedPhone ? "" : "Phone number is required.";
              const nextPasswordError = passwordIssues.length
                ? `Password must include ${passwordIssues.join(", ")}.`
                : "";

              setPhoneError(nextPhoneError);
              setPasswordError(nextPasswordError);

              if (nextPhoneError || nextPasswordError) {
                return;
              }

              setLoading(true);

              setTimeout(() => {
                setLoading(false);
                navigate({ to: active.to });
              }, 1200);
            }}
          >
          <label className="block">
            <span className="text-xs font-medium text-foreground">Phone number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (e.target.value.trim()) {
                  setPhoneError("");
                }
              }}
              placeholder="+1 555 123 4567"
              className="mt-1.5 w-full h-12 rounded-xl bg-input/60 border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {phoneError ? <p className="mt-1 text-xs text-red-500">{phoneError}</p> : null}
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground">
              Email <span className="text-muted-foreground">(optional)</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={active.placeholder}
              className="mt-1.5 w-full h-12 rounded-xl bg-input/60 border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground">
              Password
            </span>

            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validatePassword(e.target.value).length === 0) {
                    setPasswordError("");
                  }
                }}
                placeholder="••••••••"
                className="w-full h-12 rounded-xl bg-input/60 border border-border px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Password Strength:
                  <span className={`font-semibold ml-1 ${passwordStrength.textClass}`}>
                    {passwordStrength.label}
                  </span>
                </p>
              </div>
              {passwordError ? <p className="mt-1 text-xs text-red-500">{passwordError}</p> : null}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </label>
          <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember Me
                </label>

                <button
                  type="button"
                  className="text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
          <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70 transition-all duration-300"
                style={{
                  backgroundImage: "var(--gradient-primary)",
                  boxShadow: "var(--shadow-elevated)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign in as {active.label}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
        </form>

        <Link to="/" className="mt-6 text-center text-xs text-muted-foreground">
          Back to splash
        </Link>
      </div>
    </div>
  );
}