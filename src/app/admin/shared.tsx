"use client";

import { createContext, useContext } from "react";
import type { ContactMessage, DaySummary, PublicTicket, Service, Settings } from "@/lib/types";

export type AdminTicket = PublicTicket & { phone: string };

export type Report = DaySummary & {
  pendingPayments: number;
  unpaidAmount: number;
  byService: [string, number][];
  byStylist: [string, number][];
  byMethod: [string, number][];
};

export type AdminData = {
  summary: {
    waiting: number;
    inService: number;
    servedToday: number;
    nextWaitMinutes: number;
    chairs: number;
    queueOpen: boolean;
  };
  tickets: AdminTicket[];
  messages: ContactMessage[];
  services: Service[];
  settings: Settings;
  report: Report;
  history: DaySummary[];
  storageMode: string;
};

export type AdminContextValue = {
  data: AdminData;
  /** Call an admin API. Throws on error. */
  api: <T = unknown>(url: string, method?: string, body?: unknown) => Promise<T>;
  /** Run an action, show a message, refresh the data. */
  run: (fn: () => Promise<unknown>, success?: string) => Promise<boolean>;
};

export const AdminContext = createContext<AdminContextValue | null>(null);
export const useAdmin = () => useContext(AdminContext)!;

export const lkr = (n: number) => `LKR ${n.toLocaleString()}`;
export const time = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

export function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  const color = tone === "warn" ? "text-amber-200" : tone === "good" ? "text-emerald-300" : "text-gold-light";
  return (
    <div className="rounded-2xl gold-ring bg-panel p-4">
      <p className="text-xs tracking-wider text-muted uppercase">{label}</p>
      <p className={`mt-1 font-display text-2xl ${color}`}>{value}</p>
    </div>
  );
}

export function Btn({
  onClick,
  primary,
  danger,
  children,
  disabled,
  type = "button",
}: {
  onClick?: () => void;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  children: React.ReactNode;
}) {
  const cls = primary
    ? "bg-gold text-ink hover:bg-gold-light"
    : danger
      ? "border border-red-500/40 text-red-300 hover:bg-red-500/10"
      : "border border-line text-muted hover:text-cream";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}

const payBadge = {
  unpaid: "bg-panel text-muted border border-line",
  pending: "bg-amber-500/15 text-amber-200",
  paid: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
};
const payLabel = { unpaid: "Unpaid", pending: "Slip to check", paid: "Paid", rejected: "Slip rejected" };

export function PayBadge({ t }: { t: AdminTicket }) {
  const p = t.payment;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] ${payBadge[p.status]}`}>
      {payLabel[p.status]}
      {p.status === "paid" && p.method ? ` · ${p.method}` : ""}
    </span>
  );
}

export function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-panel/60 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl text-gold-light">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl gold-ring bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
