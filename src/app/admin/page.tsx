"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatWait } from "@/components/LiveStatus";
import { SETTINGS_CHANGED } from "@/components/Announcement";
import { AdminContext, type AdminContextValue, type AdminData, Stat, lkr } from "./shared";
import QueueTab from "./QueueTab";
import PaymentsTab from "./PaymentsTab";
import MessagesTab from "./MessagesTab";
import ServicesTab from "./ServicesTab";
import ReportsTab from "./ReportsTab";
import SettingsTab from "./SettingsTab";

const TABS = ["queue", "payments", "messages", "services", "reports", "settings"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const [passcode, setPasscode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [loginError, setLoginError] = useState("");
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const [tab, setTab] = useState<Tab>("queue");

  useEffect(() => {
    try {
      setPasscode(sessionStorage.getItem("vm-admin"));
      const saved = sessionStorage.getItem("vm-admin-tab") as Tab | null;
      if (saved && TABS.includes(saved)) setTab(saved);
    } catch {}
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem("vm-admin");
    } catch {}
    setPasscode(null);
    setData(null);
  }, []);

  const request = useCallback(
    async <T,>(code: string, url: string, method = "GET", body?: unknown): Promise<T> => {
      const res = await fetch(url, {
        method,
        cache: "no-store",
        headers: { "Content-Type": "application/json", "x-admin-passcode": code },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) logout();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      return json as T;
    },
    [logout],
  );

  const load = useCallback(async () => {
    if (!passcode) return;
    try {
      setData(await request<AdminData>(passcode, "/api/admin"));
    } catch {}
  }, [passcode, request]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 8000);
    return () => clearInterval(timer);
  }, [load]);

  const showToast = useCallback((text: string, error?: boolean) => {
    setToast({ text, error });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ctx = useMemo<AdminContextValue | null>(() => {
    if (!data || !passcode) return null;
    return {
      data,
      api: (url, method, body) => request(passcode, url, method, body),
      run: async (fn, success) => {
        try {
          await fn();
          if (success) showToast(success);
          window.dispatchEvent(new Event(SETTINGS_CHANGED)); // refresh the website banner
          await load();
          return true;
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Something went wrong.", true);
          return false;
        }
      },
    };
  }, [data, passcode, request, load, showToast]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    try {
      setData(await request<AdminData>(input, "/api/admin"));
      try {
        sessionStorage.setItem("vm-admin", input);
      } catch {}
      setPasscode(input);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Error");
    }
  }

  function pickTab(t: Tab) {
    setTab(t);
    try {
      sessionStorage.setItem("vm-admin-tab", t);
    } catch {}
  }

  if (!ready) return null;

  if (!passcode) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <h1 className="text-center font-display text-4xl font-semibold text-gold-gradient">Salon Dashboard</h1>
        <p className="mt-2 text-center text-sm text-muted">Staff only. Enter the salon passcode.</p>
        <form onSubmit={login} className="mt-8 space-y-4 rounded-3xl gold-ring bg-panel p-6">
          <input
            className="input text-center"
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Passcode"
            autoFocus
          />
          {loginError && <p className="text-center text-sm text-red-300">{loginError}</p>}
          <button className="btn-gold w-full">Log in</button>
        </form>
      </div>
    );
  }

  if (!ctx) return <div className="mx-auto mt-10 h-96 max-w-6xl rounded-3xl bg-panel" />;

  const { summary, report, messages, settings } = ctx.data;
  const unread = messages.filter((m) => !m.read).length;
  const counts: Partial<Record<Tab, number>> = { payments: report.pendingPayments, messages: unread };

  return (
    <AdminContext.Provider value={ctx}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold text-gold-gradient">Salon Dashboard</h1>
            <p className="mt-1 text-sm text-muted">{settings.salonName} · refreshes every few seconds</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                ctx.run(
                  () => ctx.api("/api/admin/settings", "PATCH", { queueOpen: !settings.queueOpen }),
                  settings.queueOpen ? "Queue closed for new customers" : "Queue is open again",
                )
              }
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                settings.queueOpen ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
              }`}
              title="Open or close online joining"
            >
              ● {settings.queueOpen ? "Queue open" : "Queue closed"}
            </button>
            <button onClick={logout} className="rounded-full px-4 py-2 text-sm text-muted hover:text-cream">
              Log out
            </button>
          </div>
        </div>

        {ctx.data.storageMode === "tmp-file" && (
          <p className="mt-4 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Data is stored in temporary storage on this server and will reset when the site restarts. Add the free
            Upstash Redis settings (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) to keep it. See README.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Waiting" value={String(summary.waiting)} />
          <Stat label="In service" value={`${summary.inService} / ${summary.chairs}`} />
          <Stat label="New customer wait" value={formatWait(summary.nextWaitMinutes)} />
          <Stat label="Served today" value={String(summary.servedToday)} />
          <Stat label="Paid today" value={lkr(report.revenue)} tone="good" />
        </div>

        <div className="mt-8 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => pickTab(t)}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm capitalize ${
                tab === t ? "border-gold text-gold-light" : "border-transparent text-muted hover:text-cream"
              }`}
            >
              {t}
              {!!counts[t] && (
                <span className="rounded-full bg-blush px-1.5 text-[11px] font-semibold text-ink">{counts[t]}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "queue" && <QueueTab />}
          {tab === "payments" && <PaymentsTab />}
          {tab === "messages" && <MessagesTab />}
          {tab === "services" && <ServicesTab />}
          {tab === "reports" && <ReportsTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm shadow-2xl ${
            toast.error ? "bg-red-900 text-red-100" : "bg-gold text-ink"
          }`}
        >
          {toast.text}
        </div>
      )}
    </AdminContext.Provider>
  );
}
