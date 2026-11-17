"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Event the dashboard fires after saving settings, so the banner updates straight away. */
export const SETTINGS_CHANGED = "vm-settings-changed";

/**
 * Banner from Dashboard → Settings → Announcement, plus a notice when the queue is closed.
 * Checks for changes on every page change, every 20 seconds, and right after staff save settings.
 */
export default function Announcement() {
  const pathname = usePathname();
  const [state, setState] = useState<{ announcement: string; queueOpen: boolean } | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/settings", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => alive && setState({ announcement: d.settings.announcement, queueOpen: d.settings.queueOpen }))
        .catch(() => {});
    load();
    const timer = setInterval(load, 20000);
    window.addEventListener(SETTINGS_CHANGED, load);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener(SETTINGS_CHANGED, load);
    };
  }, [pathname]);

  if (!state || (!state.announcement && state.queueOpen)) return null;
  return (
    <div className="bg-gold-gradient px-4 py-2 text-center text-sm font-medium text-ink">
      {state.announcement}
      {!state.queueOpen && <span>{state.announcement ? " · " : ""}Online queue is closed right now.</span>}
    </div>
  );
}
