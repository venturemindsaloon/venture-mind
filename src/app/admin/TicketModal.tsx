"use client";

import { useEffect, useRef, useState } from "react";
import { formatWait } from "@/components/LiveStatus";
import { type AdminTicket, Btn, Modal, PayBadge, lkr, time, useAdmin } from "./shared";

/** Full details of one ticket: edit service/stylist, payment, view slip. */
export default function TicketModal({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const { data, api, run } = useAdmin();
  const t = data.tickets.find((x) => x.id === ticketId);
  const [slip, setSlip] = useState<string | null>(null);
  const [slipError, setSlipError] = useState("");
  const [reason, setReason] = useState("");
  const slipId = t?.payment.slipId;

  // Keep the latest api function without refetching the slip on every dashboard refresh.
  const apiRef = useRef(api);
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  useEffect(() => {
    setSlip(null);
    setSlipError("");
    if (!slipId) return;
    apiRef.current<{ dataUrl: string }>(`/api/admin/slips/${slipId}`)
      .then((r) => setSlip(r.dataUrl))
      .catch((e) => setSlipError(e.message));
  }, [slipId]);

  if (!t) return null;
  const patch = (body: unknown, msg: string) => run(() => api(`/api/admin/tickets/${t.id}`, "PATCH", body), msg);
  const p = t.payment;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-4xl text-gold-gradient">{t.number}</p>
          <p className="text-lg text-cream">{t.name}</p>
          <a href={`tel:${t.phone}`} className="text-sm text-blush">{t.phone || "No phone (walk-in)"}</a>
        </div>
        <button onClick={onClose} className="text-2xl text-muted hover:text-cream" aria-label="Close">×</button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Info label="Status" value={t.status.replace("_", " ")} />
        <Info
          label="Joined"
          value={`${t.carriedFrom ? `${t.carriedFrom.day} ` : ""}${time(t.createdAt)}${t.walkIn ? " (walk-in)" : ""}`}
        />
        {t.carriedFrom && (
          <Info label="Carried over" value={`From ${t.carriedFrom.day}, was ${t.carriedFrom.number}`} />
        )}
        {t.status === "waiting" && <Info label="Position / wait" value={`#${t.position} · ${formatWait(t.waitMinutes)}`} />}
        {t.startedAt && <Info label="Started" value={time(t.startedAt)} />}
        {t.finishedAt && <Info label="Finished" value={time(t.finishedAt)} />}
        {t.note && <Info label="Note" value={t.note} />}
      </dl>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-muted">Service</span>
          <select
            className="input"
            value={t.serviceId}
            onChange={(e) => patch({ serviceId: e.target.value }, "Service changed")}
          >
            {data.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {lkr(s.price)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Stylist</span>
          <select className="input" value={t.stylist} onChange={(e) => patch({ stylist: e.target.value }, "Stylist changed")}>
            {[...new Set([...data.settings.stylists, t.stylist])].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-2xl bg-panel-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-gold-light">Payment · {lkr(p.amount)}</p>
          <PayBadge t={t} />
        </div>
        {p.reference && <p className="mt-1 text-sm text-muted">Bank reference: {p.reference}</p>}
        {p.uploadedAt && <p className="text-sm text-muted">Slip uploaded at {time(p.uploadedAt)}</p>}
        {p.rejectReason && p.status === "rejected" && <p className="text-sm text-red-300">Rejected: {p.rejectReason}</p>}

        {slipId && (
          <div className="mt-3">
            {slipError && <p className="text-sm text-red-300">{slipError}</p>}
            {!slip && !slipError && <div className="h-40 animate-pulse rounded-xl bg-panel" />}
            {slip && slip.startsWith("data:application/pdf") && (
              <a href={slip} download={`${t.number}-slip.pdf`} className="btn-outline">Download PDF slip</a>
            )}
            {slip && slip.startsWith("data:image") && (
              // eslint-disable-next-line @next/next/no-img-element
              <a href={slip} target="_blank" rel="noreferrer">
                <img src={slip} alt={`Payment slip for ${t.number}`} className="max-h-96 w-full rounded-xl bg-white object-contain" />
              </a>
            )}
          </div>
        )}

        {p.status === "pending" && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Btn primary onClick={() => patch({ payment: { action: "approve" } }, "Payment approved")}>
                Approve payment
              </Btn>
              <Btn danger onClick={() => patch({ payment: { action: "reject", reason } }, "Slip rejected")}>
                Reject slip
              </Btn>
            </div>
            <input
              className="input text-sm"
              placeholder="Reason for rejecting (shown to the customer)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {p.status !== "paid" && (
            <>
              <Btn onClick={() => patch({ payment: { action: "mark-paid", method: "cash" } }, "Marked paid (cash)")}>
                Paid by cash
              </Btn>
              <Btn onClick={() => patch({ payment: { action: "mark-paid", method: "card" } }, "Marked paid (card)")}>
                Paid by card
              </Btn>
            </>
          )}
          {p.status === "paid" && (
            <Btn onClick={() => patch({ payment: { action: "mark-unpaid" } }, "Marked unpaid")}>Undo payment</Btn>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-panel-2 px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-cream first-letter:uppercase">{value}</dd>
    </div>
  );
}
