import { readDb, updateDb } from "@/lib/db";
import { publicSettings, toPublic } from "@/lib/queue";

// Live status of one ticket, plus the bank details for paying.
export async function GET(_request: Request, ctx: RouteContext<"/api/queue/[id]">) {
  const { id } = await ctx.params;
  const db = await readDb();
  const ticket = db.tickets.find((t) => t.id === id);
  if (!ticket)
    return Response.json(
      { error: "Ticket not found. Finished tickets are cleared at the end of each day." },
      { status: 404 },
    );
  return Response.json({ ticket: toPublic(db, ticket), bank: publicSettings(db).bank });
}

// Customer leaves the queue.
export async function DELETE(_request: Request, ctx: RouteContext<"/api/queue/[id]">) {
  const { id } = await ctx.params;
  const ok = await updateDb((db) => {
    const ticket = db.tickets.find((t) => t.id === id);
    if (!ticket || ticket.status !== "waiting") return false;
    ticket.status = "cancelled";
    ticket.finishedAt = new Date().toISOString();
    return true;
  });
  if (!ok) return Response.json({ error: "This ticket can no longer be cancelled." }, { status: 400 });
  return Response.json({ ok: true });
}
