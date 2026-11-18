import "server-only";
import { summarizeDay } from "./db";
import type { DB, PublicSettings, PublicTicket, Service, Ticket } from "./types";

export function findService(db: DB, id: string): Service | undefined {
  return db.services.find((s) => s.id === id);
}

function minutesLeft(db: DB, t: Ticket): number {
  const duration = findService(db, t.serviceId)?.duration ?? 30;
  if (t.status !== "in_service" || !t.startedAt) return duration;
  const spent = (Date.now() - new Date(t.startedAt).getTime()) / 60000;
  return Math.max(5, duration - spent);
}

/** Estimated minutes until this ticket is served, shared across all chairs. */
function estimateWait(db: DB, ticket: Ticket): { position: number; waitMinutes: number } {
  if (ticket.status !== "waiting") return { position: 0, waitMinutes: 0 };
  const chairs = Math.max(1, db.settings.chairs);
  const waiting = db.tickets.filter((t) => t.status === "waiting");
  const index = waiting.findIndex((t) => t.id === ticket.id);
  const ahead = waiting.slice(0, index);
  const inService = db.tickets.filter((t) => t.status === "in_service");

  // Free chairs serve the first people in line straight away.
  const freeChairs = Math.max(0, chairs - inService.length);
  if (index < freeChairs) return { position: index + 1, waitMinutes: 0 };

  const workAhead =
    inService.reduce((sum, t) => sum + minutesLeft(db, t), 0) +
    ahead.reduce((sum, t) => sum + minutesLeft(db, t), 0);
  return { position: index + 1, waitMinutes: Math.round(workAhead / chairs) };
}

export function toPublic(db: DB, ticket: Ticket): PublicTicket {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { phone, ...rest } = ticket;
  return {
    ...rest,
    ...estimateWait(db, ticket),
    // A service removed from the menu still shows a readable name, e.g. "kids-cut" → "Kids cut".
    serviceName:
      findService(db, ticket.serviceId)?.name ??
      ticket.serviceId.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()),
  };
}

export function queueSummary(db: DB) {
  const chairs = Math.max(1, db.settings.chairs);
  const waiting = db.tickets.filter((t) => t.status === "waiting");
  const inService = db.tickets.filter((t) => t.status === "in_service");
  const last = waiting[waiting.length - 1];
  return {
    waiting: waiting.length,
    inService: inService.length,
    servedToday: db.tickets.filter((t) => t.status === "done").length,
    // Wait for someone joining now = wait of a new person at the end of the line
    nextWaitMinutes: last
      ? estimateWait(db, last).waitMinutes + Math.round(minutesLeft(db, last) / chairs)
      : inService.length >= chairs
        ? Math.round(Math.min(...inService.map((t) => minutesLeft(db, t))))
        : 0,
    nowServing: inService.map((t) => t.number),
    chairs,
    queueOpen: db.settings.queueOpen,
  };
}

export function publicSettings(db: DB): PublicSettings {
  const { salonName, stylists, queueOpen, announcement, bank } = db.settings;
  return { salonName, stylists, queueOpen, announcement, bank };
}

/** Numbers for the Reports tab. */
export function todayReport(db: DB) {
  const t = db.tickets;
  const base = summarizeDay(db.day, t);
  const count = <K extends string>(keyOf: (x: Ticket) => K) =>
    Object.entries(
      t.reduce<Record<string, number>>((acc, x) => ((acc[keyOf(x)] = (acc[keyOf(x)] ?? 0) + 1), acc), {}),
    ).sort((a, b) => b[1] - a[1]);
  return {
    ...base,
    pendingPayments: t.filter((x) => x.payment.status === "pending").length,
    unpaidAmount: t
      .filter((x) => x.status !== "cancelled" && x.status !== "no_show" && x.payment.status !== "paid")
      .reduce((s, x) => s + x.payment.amount, 0),
    byService: count((x) => findService(db, x.serviceId)?.name ?? x.serviceId),
    byStylist: count((x) => x.stylist),
    byMethod: count((x) => (x.payment.status === "paid" ? x.payment.method ?? "other" : "not paid")),
  };
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function isAdmin(request: Request): boolean {
  const passcode = process.env.ADMIN_PASSCODE || "salon123";
  return request.headers.get("x-admin-passcode") === passcode;
}

export const unauthorized = () => Response.json({ error: "Wrong passcode." }, { status: 401 });
