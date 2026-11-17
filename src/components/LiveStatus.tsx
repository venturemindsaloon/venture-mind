"use client";

import { useEffect, useState } from "react";

type Summary = {
  waiting: number;
  inService: number;
  servedToday: number;
  nextWaitMinutes: number;
  nowServing: string[];
  chairs: number;
};

export function formatWait(minutes: number) {
  if (minutes <= 0) return "No wait";
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `~${h} h ${m ? `${m} min` : ""}`.trim();
}

export default function LiveStatus() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/queue", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => alive && setSummary(d.summary))
        .catch(() => {});
    load();
    const timer = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const stats = [
    { label: "Waiting now", value: summary ? String(summary.waiting) : "–" },
    { label: "Estimated wait", value: summary ? formatWait(summary.nextWaitMinutes) : "–" },
    { label: "Now serving", value: summary ? summary.nowServing.join(", ") || "–" : "–" },
    { label: "Served today", value: summary ? String(summary.servedToday) : "–" },
  ];

  return (
    <div className="rounded-3xl gold-ring bg-panel/80 p-5 shadow-2xl shadow-black/50">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted">
        <span className="live-dot inline-block h-2 w-2 rounded-full bg-emerald-400" />
        Live queue · updates every 10 seconds
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-panel-2 p-4">
            <p className="text-xs tracking-wider text-muted uppercase">{s.label}</p>
            <p className="mt-1 truncate font-display text-3xl font-semibold text-gold-light">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
