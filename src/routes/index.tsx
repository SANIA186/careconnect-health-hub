import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="min-h-screen flex justify-center" style={{ backgroundImage: "var(--gradient-hero)" }}>
      <div className="w-full max-w-md flex flex-col items-center justify-between px-6 py-16 text-white">
        <div className="mt-16 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-24 w-24 rounded-3xl bg-white/15 backdrop-blur grid place-items-center border border-white/25">
            <HeartPulse className="h-12 w-12" strokeWidth={2.2} />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">NGO CareConnect</h1>
          <p className="mt-2 text-sm text-white/80 text-center max-w-xs">
            Smart Medical Camp Management for the volunteers, doctors and communities we serve.
          </p>
        </div>
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Every Sunday, better care.</span>
          </div>
          <Link
            to="/login"
            className={`w-full inline-flex items-center justify-center rounded-2xl bg-white text-primary font-semibold h-12 transition-all ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
          >
            Get Started
          </Link>
          <p className="text-[11px] text-white/60">v1.0 • Made with care</p>
        </div>
      </div>
    </div>
  );
}
