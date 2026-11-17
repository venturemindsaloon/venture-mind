import { deleteSlip, readDb, storageMode, updateDb } from "@/lib/db";
import { isAdmin, queueSummary, todayReport, toPublic, unauthorized } from "@/lib/queue";
import { createTicket } from "@/lib/tickets";

// Everything the salon dashboard needs.
export async function GET(request: Request) {
  if (!isAdmin(request)) return unauthorized();
  const db = await readDb();
  return Response.json({
    summary: queueSummary(db),
    tickets: db.tickets.map((t) => ({ ...toPublic(db, t), phone: t.phone })),
    messages: db.messages,
    services: db.services,
    settings: db.settings,
    report: todayReport(db),
    history: db.history,
    storageMode,
  });
}

// Dashboard actions: call-next | add-walkin | reset
export async function POST(request: Request) {
  if (!isAdmin(request)) return unauthorized();
  const body = await request.json().catch(() => null);

  switch (body?.action) {
    case "call-next": {
      const called = await updateDb((db) => {
        const next = db.tickets.find((t) => t.status === "waiting");
        if (!next) return null;
        next.status = "in_service";
        next.startedAt = new Date().toISOString();
        return next.number;
      });
      if (!called) return Response.json({ error: "Nobody is waiting." }, { status: 400 });
      return Response.json({ ok: true, number: called });
    }

    case "add-walkin": {
      const result = await createTicket(body.ticket, { walkIn: true, paidCash: !!body.paidCash });
      if ("error" in result) return Response.json({ error: result.error }, { status: 400 });
      return Response.json({ ok: true, number: result.ticket.number });
    }

    case "reset": {
      const slips = await updateDb((db) => {
        const ids = db.tickets.map((t) => t.payment.slipId).filter(Boolean) as string[];
        db.counter = 0;
        db.tickets = [];
        if (body.clearHistory) db.history = [];
        return ids;
      });
      await Promise.all(slips.map(deleteSlip));
      return Response.json({ ok: true });
    }
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
