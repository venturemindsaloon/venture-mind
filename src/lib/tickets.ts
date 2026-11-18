import "server-only";
import { updateDb } from "./db";
import { findService, newId } from "./queue";
import { ticketNumber } from "./site";
import type { Ticket } from "./types";

type Input = { name?: unknown; phone?: unknown; serviceId?: unknown; stylist?: unknown; note?: unknown };

/** Validate the form and add a ticket. Used by the public join form and by staff for walk-ins. */
export async function createTicket(body: Input | null, opts: { walkIn?: boolean; paidCash?: boolean } = {}) {
  const name = String(body?.name ?? "").trim().slice(0, 60);
  const phone = String(body?.phone ?? "").replace(/[^\d+]/g, "").slice(0, 15);
  const serviceId = String(body?.serviceId ?? "");
  const note = String(body?.note ?? "").trim().slice(0, 200);

  if (name.length < 2) return { error: "Please enter the customer's name." };
  if (!opts.walkIn && phone.replace(/\D/g, "").length < 9) return { error: "Please enter a valid phone number." };

  return updateDb((db) => {
    const service = findService(db, serviceId);
    if (!service || service.active === false) return { error: "Please choose a service." };
    if (!opts.walkIn && !db.settings.queueOpen)
      return { error: "Sorry, the queue is closed right now. Please try again later." };

    // One active ticket per phone number.
    const existing = phone
      ? db.tickets.find((t) => t.phone === phone && (t.status === "waiting" || t.status === "in_service"))
      : undefined;
    if (existing) return { ticket: existing, existing: true };

    const stylist = db.settings.stylists.includes(String(body?.stylist))
      ? String(body?.stylist)
      : (db.settings.stylists[0] ?? "Any stylist");

    db.counter += 1;
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: newId(),
      number: ticketNumber(db.counter),
      name,
      phone,
      serviceId,
      stylist,
      note: note || undefined,
      status: "waiting",
      createdAt: now,
      walkIn: opts.walkIn || undefined,
      payment: opts.paidCash
        ? { status: "paid", amount: service.price, method: "cash", reviewedAt: now }
        : { status: "unpaid", amount: service.price },
    };
    db.tickets.push(ticket);
    return { ticket, existing: false };
  });
}
