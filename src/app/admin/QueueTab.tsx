"use client";

import { useState } from "react";
import { formatWait } from "@/components/LiveStatus";
import type { TicketStatus } from "@/lib/types";
import { type AdminTicket, Btn, PayBadge, time, useAdmin } from "./shared";
import TicketModal from "./TicketModal";

export default function QueueTab() {
  const { data, api, run } = useAdmin();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showWalkIn, setShowWalkIn] = useState(false);

  const q = search.trim().toLowerCase();
  const tickets = data.tickets.filter(
    (t) => !q || [t.number, t.name, t.phone, t.serviceName, t.stylist].some((v) => v.toLowerCase().includes(q)),
  );
  const waiting = tickets.filter((t) => t.status === "waiting");
  const inService = tickets.filter((t) => t.status === "in_service");
  const finished = tickets.filter((t) => ["done", "cancelled", "no_show"].includes(t.status)).reverse();

  const setStatus = (t: AdminTicket, status: TicketStatus, msg: string) =>
    run(() => api(`/api/admin/tickets/${t.id}`, "PATCH", { status }), `${t.number}: ${msg}`);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn-gold"
          disabled={!data.summary.waiting}
          onClick={() =>
            run(async () => {
              const r = await api<{ number: string }>("/api/admin", "POST", { action: "call-next" });
              return r;
            }, "Next customer called")
          }
        >
          Call next customer
        </button>
        <button className="btn-outline" onClick={() => setShowWalkIn((v) => !v)}>
          + Add walk-in
        </button>
        <input
          className="input ml-auto max-w-xs"
          placeholder="Search name, phone, ticket…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showWalkIn && <WalkInForm onDone={() => setShowWalkIn(false)} />}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Column title="In service" count={inService.length}>
          {inService.map((t) => (
            <Card key={t.id} t={t} meta={`Started ${time(t.startedAt)} · ${t.stylist}`} onOpen={() => setOpenId(t.id)}>
              <Btn primary onClick={() => setStatus(t, "done", "finished")}>Finish</Btn>
              <Btn onClick={() => setStatus(t, "waiting", "moved back to queue")}>Back to queue</Btn>
            </Card>
          ))}
        </Column>
        <Column title="Waiting" count={waiting.length}>
          {waiting.map((t) => (
            <Card
              key={t.id}
              t={t}
              meta={`#${t.position} · wait ${formatWait(t.waitMinutes)} · joined ${time(t.createdAt)}`}
              onOpen={() => setOpenId(t.id)}
            >
              <Btn primary onClick={() => setStatus(t, "in_service", "service started")}>Start</Btn>
              <Btn onClick={() => setStatus(t, "no_show", "marked no-show")}>No-show</Btn>
              <Btn onClick={() => setStatus(t, "cancelled", "cancelled")}>Cancel</Btn>
            </Card>
          ))}
        </Column>
        <Column title="Finished today" count={finished.length}>
          {finished.map((t) => (
            <Card
              key={t.id}
              t={t}
              meta={`${t.status.replace("_", "-")} · ${time(t.finishedAt)}`}
              dim={t.status !== "done"}
              onOpen={() => setOpenId(t.id)}
            >
              {t.status !== "done" && <Btn onClick={() => setStatus(t, "waiting", "returned to queue")}>Restore</Btn>}
            </Card>
          ))}
        </Column>
      </div>

      <div className="mt-8 flex justify-end">
        <Btn
          danger
          onClick={() => {
            if (confirm("Clear today's whole queue (including payments) and restart at Q-001?"))
              run(() => api("/api/admin", "POST", { action: "reset" }), "Queue cleared");
          }}
        >
          Reset today&apos;s queue
        </Btn>
      </div>

      {openId && <TicketModal ticketId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function WalkInForm({ onDone }: { onDone: () => void }) {
  const { data, api, run } = useAdmin();
  const active = data.services.filter((s) => s.active !== false);
  const [f, setF] = useState({ name: "", phone: "", serviceId: active[0]?.id ?? "", stylist: data.settings.stylists[0] });
  const [paidCash, setPaidCash] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(
      () => api("/api/admin", "POST", { action: "add-walkin", ticket: f, paidCash }),
      `${f.name} added to the queue`,
    );
    if (ok) onDone();
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl gold-ring bg-panel p-4 md:grid-cols-6">
      <input className="input md:col-span-1" placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
      <input className="input md:col-span-1" placeholder="Phone (optional)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <select className="input md:col-span-2" value={f.serviceId} onChange={(e) => setF({ ...f, serviceId: e.target.value })}>
        {active.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select className="input md:col-span-1" value={f.stylist} onChange={(e) => setF({ ...f, stylist: e.target.value })}>
        {data.settings.stylists.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <div className="flex items-center gap-3 md:col-span-1">
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={paidCash} onChange={(e) => setPaidCash(e.target.checked)} /> Paid cash
        </label>
        <Btn primary type="submit">Add</Btn>
      </div>
    </form>
  );
}

function Column({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-panel/60 p-4">
      <h2 className="mb-3 flex items-center justify-between px-1 text-sm font-medium tracking-wider text-muted uppercase">
        {title}
        <span className="rounded-full bg-panel-2 px-2.5 py-0.5 text-gold-light">{count}</span>
      </h2>
      <div className="space-y-3">{count ? children : <p className="px-1 py-6 text-center text-sm text-muted">Empty</p>}</div>
    </section>
  );
}

function Card({
  t,
  meta,
  dim,
  onOpen,
  children,
}: {
  t: AdminTicket;
  meta: string;
  dim?: boolean;
  onOpen: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-panel-2 p-4 ${dim ? "opacity-60" : ""}`}>
      <div className="flex items-baseline justify-between gap-2">
        <button onClick={onOpen} className="font-display text-2xl text-gold-light hover:underline">
          {t.number}
        </button>
        <PayBadge t={t} />
      </div>
      <p className="mt-1 font-medium text-cream">
        {t.name} {t.walkIn && <span className="text-xs text-muted">(walk-in)</span>}
      </p>
      {t.carriedFrom && (
        <p className="mt-1 inline-block rounded-full bg-blush/15 px-2 py-0.5 text-[11px] text-blush">
          Carried over from {t.carriedFrom.day} · was {t.carriedFrom.number}
        </p>
      )}
      <p className="text-sm text-muted">{t.serviceName}</p>
      {t.note && <p className="mt-1 text-sm text-blush/80 italic">“{t.note}”</p>}
      <p className="mt-2 text-xs text-muted">{meta}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {children}
        <Btn onClick={onOpen}>Details</Btn>
      </div>
    </div>
  );
}
