import { readDb } from "@/lib/db";
import { queueSummary, toPublic } from "@/lib/queue";
import { createTicket } from "@/lib/tickets";

// Live queue summary for the public board.
export async function GET() {
  const db = await readDb();
  return Response.json({
    summary: queueSummary(db),
    tickets: db.tickets
      .filter((t) => t.status === "waiting" || t.status === "in_service")
      .map((t) => {
        const p = toPublic(db, t);
        // Show only the first name publicly.
        return { number: p.number, name: p.name.split(" ")[0], status: p.status, position: p.position };
      }),
  });
}

// Join the queue.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = await createTicket(body);
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });
  return Response.json(
    { id: result.ticket.id, number: result.ticket.number, existing: result.existing },
    { status: 201 },
  );
}
