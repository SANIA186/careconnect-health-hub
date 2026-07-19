import { createFileRoute } from "@tanstack/react-router";
import { AppShell, VolunteerNav } from "@/components/care/AppShell";
import { Card, SectionTitle, StatCard } from "@/components/care/Cards";
import { getReportAnalytics } from "@/api/report.api";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Users, HeartPulse, Pill, TrendingUp, Download, CalendarDays, MapPin, ShieldCheck, Clock3, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports — CareConnect" }] }),
});

const COLORS = ["oklch(0.55 0.18 250)", "oklch(0.7 0.15 235)", "oklch(0.78 0.14 75)", "oklch(0.65 0.15 155)", "oklch(0.6 0.22 27)"];

function Reports() {
  const [tab, setTab] = useState<"analytics" | "history" | "report">("analytics");
  const [report, setReport] = useState<Awaited<ReturnType<typeof getReportAnalytics>> | null>(null);

  useEffect(() => {
    void (async () => {
      setReport(await getReportAnalytics());
    })();
  }, []);

  if (!report) return null;

  return (
    <AppShell title="Reports" subtitle="Camp analytics & history" hero back="/volunteer" bottomNav={<VolunteerNav />}>
      <div className="-mt-3 flex gap-1 bg-white/15 rounded-2xl p-1">
        {(["analytics", "history", "report"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 h-10 rounded-xl text-xs font-semibold capitalize ${tab === t ? "bg-white text-primary" : "text-white/85"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "analytics" && <Analytics report={report} />}
      {tab === "history" && <PatientHistory report={report} />}
      {tab === "report" && <CampReport report={report} />}
    </AppShell>
  );
}

function Analytics({ report }: { report: Awaited<ReturnType<typeof getReportAnalytics>> }) {
  const analytics = report.analytics;

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total patients" value={report.totals.patients} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Consultations" value={report.totals.consultations} tone="success" icon={<HeartPulse className="h-4 w-4" />} />
        <StatCard label="Medicines" value={report.totals.medicines} icon={<Pill className="h-4 w-4" />} />
        {/* Referrals not tracked separately in backend — shown as 0 until backend support is added */}
        <StatCard label="Referrals" value={report.totals.referrals} tone="warning" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> Volunteer coverage
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums">{report.currentCamp?.volunteers ?? "—"}</div>
          <div className="mt-1 text-xs text-muted-foreground">Active volunteers rostered for this camp</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock3 className="h-4 w-4 text-primary" /> Avg. wait
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums">18 min</div>
          <div className="mt-1 text-xs text-muted-foreground">Improved from the previous weekend visit</div>
        </Card>
      </div>

      <Card className="!border-primary/20 !bg-primary/5">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" /> NGO insight
        </div>
        <div className="mt-2 text-sm font-semibold">Community reach is growing, with higher attendance and strong medicine utilization at the latest camp.</div>
      </Card>

      <SectionTitle>Camp performance</SectionTitle>
      <Card>
        <div className="h-48">
          <ResponsiveContainer>
            <LineChart data={analytics.campTrend}>
              <CartesianGrid stroke="oklch(0.92 0.015 240)" strokeDasharray="3 3" />
              <XAxis dataKey="camp" tick={{ fontSize: 10 }} stroke="oklch(0.5 0.03 250)" />
              <YAxis tick={{ fontSize: 10 }} stroke="oklch(0.5 0.03 250)" />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="patients" stroke="oklch(0.55 0.18 250)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionTitle>Age distribution</SectionTitle>
      <Card>
        <div className="h-44">
          <ResponsiveContainer>
            <BarChart data={analytics.ageDistribution}>
              <XAxis dataKey="group" tick={{ fontSize: 10 }} stroke="oklch(0.5 0.03 250)" />
              <YAxis tick={{ fontSize: 10 }} stroke="oklch(0.5 0.03 250)" />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" fill="oklch(0.55 0.18 250)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <SectionTitle>Gender split</SectionTitle>
        <Card>
          <div className="h-44 flex items-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={analytics.genderDistribution} dataKey="value" innerRadius={40} outerRadius={70} paddingAngle={4}>
                  {analytics.genderDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs">
            {analytics.genderDistribution.map((g, i) => (
              <div key={g.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-muted-foreground">{g.name}</span>
                <span className="font-semibold">{g.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionTitle>Common illnesses</SectionTitle>
      <Card>
        <div className="space-y-2">
          {analytics.commonIllnesses.map((c) => {
            const max = Math.max(...analytics.commonIllnesses.map((x) => x.count));
            return (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-muted-foreground tabular-nums">{c.count}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full" style={{ width: `${(c.count / max) * 100}%`, backgroundImage: "var(--gradient-primary)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <SectionTitle>Medicines distributed</SectionTitle>
      <Card>
        <div className="h-44">
          <ResponsiveContainer>
            <BarChart data={analytics.medicinesDistributed} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="oklch(0.5 0.03 250)" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} stroke="oklch(0.5 0.03 250)" />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" fill="oklch(0.7 0.15 235)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function PatientHistory({ report }: { report: Awaited<ReturnType<typeof getReportAnalytics>> }) {
  return (
    <div className="mt-6 space-y-3">
      <SectionTitle>Camp performance summary</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Total patients", report.totals.patients],
          ["Consultations", report.campStats.consultations],
          ["Completed", report.campStats.completedConsultations],
          ["Medicines dispensed", report.totals.medicines],
        ].map(([l, v]) => (
          <div key={String(l)} className="rounded-xl bg-secondary/60 p-3">
            <div className="text-[11px] text-muted-foreground">{l}</div>
            <div className="text-lg font-bold tabular-nums">{v}</div>
          </div>
        ))}
      </div>
      <SectionTitle>Common diagnoses</SectionTitle>
      {report.analytics.commonIllnesses.length === 0 ? (
        <Card><div className="text-xs text-muted-foreground text-center py-4">No consultation data yet</div></Card>
      ) : (
        <Card>
          <div className="space-y-2">
            {report.analytics.commonIllnesses.map((c) => {
              const max = Math.max(...report.analytics.commonIllnesses.map((x) => x.count));
              return (
                <div key={c.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground">{c.name}</span>
                    <span className="text-muted-foreground tabular-nums">{c.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full" style={{ width: `${(c.count / max) * 100}%`, backgroundImage: "var(--gradient-primary)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function CampReport({ report }: { report: Awaited<ReturnType<typeof getReportAnalytics>> }) {
  return (
    <div className="mt-6 space-y-4">
      <Card>
        <div className="text-xs font-semibold text-primary uppercase tracking-wide">Camp report</div>
        <div className="mt-1 font-bold text-lg">{report.currentCamp?.name ?? "No Camp Available"}</div>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{report.currentCamp?.date ?? "N/A"}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{report.currentCamp?.location ?? "N/A"}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            ["Patients served", report.currentCamp?.patientsServed ?? 0],
            ["Consultations", report.campStats.consultations],
            ["Prescriptions", report.campStats.prescriptions],
            ["Referrals", report.totals.referrals],
            ["Volunteers", report.currentCamp?.volunteers ?? "—"],
            ["Doctors", report.currentCamp?.doctors ?? "—"],
          ].map(([l, v]) => (
            <div key={String(l)} className="rounded-xl bg-secondary/60 p-3">
              <div className="text-[11px] text-muted-foreground">{l}</div>
              <div className="text-lg font-bold tabular-nums">{v}</div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full h-11 rounded-2xl text-white font-semibold inline-flex items-center justify-center gap-2" style={{ backgroundImage: "var(--gradient-primary)" }}>
          <Download className="h-4 w-4" /> Download PDF report
        </button>
      </Card>

      <SectionTitle>All camps</SectionTitle>
      {report.camps.map((c) => (
        <Card key={c.id}>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="font-semibold truncate">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.date} · {c.patientsServed} patients</div>
            </div>
            <span className="text-xs text-primary font-semibold">View →</span>
          </div>
        </Card>
      ))}
    </div>
  );
}