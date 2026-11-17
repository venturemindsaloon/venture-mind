import { updateDb } from "@/lib/db";
import { findService, isAdmin, unauthorized } from "@/lib/queue";
import type { PaymentMethod, TicketStatus } from "@/lib/types";

const statuses: TicketStatus[] = ["waiting", "in_service", "done", "cancelled", "no_show"];
const methods: PaymentMethod[] = ["bank", "cash", "card"];

/**
 * Update a ticket from the dashboard. Body can contain any of:
 *  status:  new queue status
 *  payment: { action: "approve" | "reject" | "mark-paid" | "mark-unpaid", method?, reason? }
 *  stylist, serviceId
 */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/tickets/[id]">) {
  if (!isAdmin(request)) return unauthorized();
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Nothing to change." }, { status: 400 });

  const error = await updateDb((db) => {
    const ticket = db.tickets.find((t) => t.id === id);
    if (!ticket) return "Ticket not found.";
    const now = new Date().toISOString();

    if (body.status !== undefined) {
      const status = body.status as TicketStatus;
      if (!statuses.includes(status)) return "Invalid status.";
      ticket.status = status;
      if (status === "in_service") ticket.startedAt = now;
      if (status === "waiting") {
        ticket.startedAt = undefined;
        ticket.finishedAt = undefined;
      }
      if (status === "done" || status === "cancelled" || status === "no_show") ticket.finishedAt = now;
    }

    if (body.stylist !== undefined) {
      if (!db.settings.stylists.includes(body.stylist)) return "Unknown stylist.";
      ticket.stylist = body.stylist;
    }

    if (body.serviceId !== undefined) {
      const service = findService(db, body.serviceId);
      if (!service) return "Unknown service.";
      ticket.serviceId = service.id;
      if (ticket.payment.status !== "paid") ticket.payment.amount = service.price;
    }

    if (body.payment) {
      const p = ticket.payment;
      switch (body.payment.action) {
        case "approve":
          if (p.status !== "pending") return "There is no slip waiting for approval.";
          p.status = "paid";
          p.reviewedAt = now;
          p.rejectReason = undefined;
          break;
        case "reject":
          if (p.status !== "pending") return "There is no slip waiting for approval.";
          p.status = "rejected";
          p.reviewedAt = now;
          p.rejectReason = String(body.payment.reason ?? "").slice(0, 200) || "The slip could not be verified.";
          break;
        case "mark-paid": {
          const method = body.payment.method as PaymentMethod;
          if (!methods.includes(method)) return "Choose cash, card or bank.";
          p.status = "paid";
          p.method = method;
          p.reviewedAt = now;
          p.rejectReason = undefined;
          break;
        }
        case "mark-unpaid":
          p.status = "unpaid";
          p.reviewedAt = undefined;
          p.rejectReason = undefined;
          break;
        default:
          return "Unknown payment action.";
      }
    }
    return null;
  });

  if (error) return Response.json({ error }, { status: 400 });
  return Response.json({ ok: true });
}
