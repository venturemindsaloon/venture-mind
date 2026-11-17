"use client";

import { useState } from "react";
import type { PaymentStatus } from "@/lib/types";
import { Btn, Panel, PayBadge, Stat, lkr, time, useAdmin } from "./shared";
import TicketModal from "./TicketModal";

const FILTERS: { key: PaymentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Slips to check" },
  { key: "paid", label: "Paid" },
  { key: "unpaid", label: "Unpaid" },
  { key: "rejected", label: "Rejected" },
];

export default function PaymentsTab() {
  const { data } = useAdmin();
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const { report } = data;

  const relevant = data.tickets.filter((t) => t.status !== "cancelled" && t.status !== "no_show");
  const pending = relevant.filter((t) => t.payment.status === "pending");
  const list = data.tickets.filter((t) => filter === "all" || t.payment.status === filter).slice().reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Received today" value={lkr(report.revenue)} tone="good" />
        <Stat label="Still to collect" value={lkr(report.unpaidAmount)} />
        <Stat label="Slips to check" value={String(pending.length)} tone={pending.length ? "warn" : undefined} />
        <Stat
          label="Paid customers"
          value={`${relevant.filter((t) => t.payment.status === "paid").length} / ${relevant.length}`}
        />
      </div>

      {pending.length > 0 && (
        <Panel title="Slips waiting for approval">
          <div className="grid gap-3 md:grid-cols-2">
            {pending.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-panel-2 p-4">
                <div>
                  <p className="text-cream">
                    <span className="font-display text-xl text-gold-light">{t.number}</span> · {t.name}
                  </p>
                  <p className="text-sm text-muted">
                    {lkr(t.payment.amount)} · uploaded {time(t.payment.uploadedAt)}
                    {t.payment.reference ? ` · ref ${t.payment.reference}` : ""}
                  </p>
                </div>
                <Btn primary onClick={() => setOpenId(t.id)}>View slip</Btn>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel
        title="Today's payments"
        action={
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1 text-xs ${filter === f.key ? "bg-gold text-ink" : "text-muted hover:text-cream"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Nothing here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs tracking-wider text-muted uppercase">
                <tr>
                  <th className="py-2 pr-3">Ticket</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Service</th>
                  <th className="py-2 pr-3 text-right">Amount</th>
                  <th className="py-2 pr-3">Payment</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id} className="border-t border-line/60">
                    <td className="py-2.5 pr-3 font-display text-lg text-gold-light">{t.number}</td>
                    <td className="py-2.5 pr-3 text-cream">
                      {t.name}
                      {(t.status === "cancelled" || t.status === "no_show") && (
                        <span className="ml-1 text-xs text-red-300">({t.status.replace("_", "-")})</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-muted">{t.serviceName}</td>
                    <td className="py-2.5 pr-3 text-right text-cream">{lkr(t.payment.amount)}</td>
                    <td className="py-2.5 pr-3"><PayBadge t={t} /></td>
                    <td className="py-2.5 text-right"><Btn onClick={() => setOpenId(t.id)}>Open</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {openId && <TicketModal ticketId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
