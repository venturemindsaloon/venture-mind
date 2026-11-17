"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatWait } from "@/components/LiveStatus";
import type { PublicTicket, Settings } from "@/lib/types";
import PaymentPanel from "./PaymentPanel";

const statusText: Record<PublicTicket["status"], { label: string; color: string }> = {
  waiting: { label: "In the queue", color: "bg-gold/15 text-gold-light" },
  in_service: { label: "It's your turn!", color: "bg-emerald-500/15 text-emerald-300" },
  done: { label: "Completed", color: "bg-blush/15 text-blush" },
  cancelled: { label: "Cancelled", color: "bg-red-500/15 text-red-300" },
  no_show: { label: "Missed", color: "bg-red-500/15 text-red-300" },
};

export default function TicketView({ id }: { id: string }) {
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [bank, setBank] = useState<Settings["bank"] | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/queue/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTicket(data.ticket);
      setBank(data.bank);
      setUpdatedAt(new Date());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load ticket.");
    }
  }, [id]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [load]);

  async function cancel() {
    if (!confirm("Leave the queue? Your place will be given to the next customer.")) return;
    await fetch(`/api/queue/${id}`, { method: "DELETE" });
    load();
  }

  if (error && !ticket) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-muted">{error}</p>
        <Link href="/track" className="btn-outline mt-6">Search again</Link>
      </div>
    );
  }
  if (!ticket) return <div className="mx-auto mt-14 h-96 max-w-xl rounded-3xl bg-panel" />;

  const s = statusText[ticket.status];

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <div className="rounded-3xl gold-ring bg-panel p-6 text-center md:p-10">
        <p className="text-sm tracking-[0.3em] text-blush uppercase">Your ticket</p>
        <p className="mt-2 font-display text-7xl font-semibold text-gold-gradient">{ticket.number}</p>
        <span className={`mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-medium ${s.color}`}>{s.label}</span>

        {ticket.carriedFrom && (
          <p className="mx-auto mt-4 max-w-sm rounded-xl bg-blush/10 px-4 py-2 text-sm text-blush">
            Your booking from {ticket.carriedFrom.day} (ticket {ticket.carriedFrom.number}) has moved to today
            with this new number. You keep your place at the front of the queue.
          </p>
        )}

        {ticket.status === "waiting" && (
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-panel-2 p-5">
              <p className="text-xs tracking-wider text-muted uppercase">Position</p>
              <p className="mt-1 font-display text-5xl text-gold-light">#{ticket.position}</p>
            </div>
            <div className="rounded-2xl bg-panel-2 p-5">
              <p className="text-xs tracking-wider text-muted uppercase">Estimated wait</p>
              <p className="mt-1 font-display text-4xl text-gold-light">{formatWait(ticket.waitMinutes)}</p>
            </div>
          </div>
        )}

        {ticket.status === "waiting" && (
          <p className="mt-6 text-sm text-muted">
            {ticket.waitMinutes <= 15
              ? "Please make your way to the salon now."
              : "Relax. Come to the salon about 15 minutes before your estimated time."}
          </p>
        )}
        {ticket.status === "in_service" && (
          <p className="mt-6 text-muted">Please go to the front desk. Your stylist is ready for you.</p>
        )}
        {ticket.status === "done" && <p className="mt-6 text-muted">Thank you for visiting. Keep glowing! ✨</p>}

        <dl className="mt-8 space-y-3 border-t border-line pt-6 text-left text-sm">
          <Row label="Name" value={ticket.name} />
          <Row label="Service" value={ticket.serviceName} />
          <Row label="Stylist" value={ticket.stylist} />
          <Row
            label="Joined at"
            value={new Date(ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          />
        </dl>

        {ticket.status === "waiting" && (
          <button onClick={cancel} className="mt-8 text-sm text-red-300 hover:underline">
            Leave the queue
          </button>
        )}
      </div>

      {bank && <PaymentPanel ticket={ticket} bank={bank} onChange={load} />}

      <p className="mt-4 text-center text-xs text-muted">
        <span className="live-dot mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
        Updates automatically every 10 seconds
        {updatedAt && ` · last checked ${updatedAt.toLocaleTimeString()}`}
      </p>
      <p className="mt-2 text-center text-xs text-muted">Bookmark this page to come back to your ticket.</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-cream">{value}</dd>
    </div>
  );
}
