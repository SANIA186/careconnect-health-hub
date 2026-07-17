import { type ReactNode } from "react";

interface TimelineItem {
  title: string;
  detail: string;
  date: string;
  tone?: "primary" | "success" | "warning";
}

interface TimelineProps {
  items: TimelineItem[];
  title?: string;
}

export default function Timeline({ items, title = "Timeline" }: TimelineProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone === "success" ? "bg-success" : item.tone === "warning" ? "bg-warning" : "bg-primary"}`} />
            {index < items.length - 1 && <div className="mt-1 h-full w-px bg-border" />}
          </div>
          <div className="flex-1 rounded-xl border border-border bg-card/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">{item.title}</div>
              <div className="text-[11px] text-muted-foreground">{item.date}</div>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{item.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
