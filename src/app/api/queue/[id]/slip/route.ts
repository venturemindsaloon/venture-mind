import { deleteSlip, saveSlip, updateDb } from "@/lib/db";
import { newId } from "@/lib/queue";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB after encoding
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

// Customer uploads a bank transfer slip for their ticket.
export async function POST(request: Request, ctx: RouteContext<"/api/queue/[id]/slip">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const dataUrl = String(body?.dataUrl ?? "");
  const reference = String(body?.reference ?? "").trim().slice(0, 60);

  const type = /^data:([^;]+);base64,/.exec(dataUrl)?.[1];
  if (!type || !ALLOWED.includes(type))
    return Response.json({ error: "Please upload a photo (JPG/PNG) or PDF of the slip." }, { status: 400 });
  if (dataUrl.length > MAX_BYTES)
    return Response.json({ error: "The file is too large. Please upload a file under 2 MB." }, { status: 400 });

  const slipId = newId() + newId();
  const result = await updateDb((db) => {
    const ticket = db.tickets.find((t) => t.id === id);
    if (!ticket) return { error: "Ticket not found." };
    if (ticket.status === "cancelled" || ticket.status === "no_show")
      return { error: "This ticket is no longer active." };
    if (ticket.payment.status === "paid") return { error: "This ticket is already paid." };
    const oldSlip = ticket.payment.slipId;
    ticket.payment = {
      ...ticket.payment,
      status: "pending",
      method: "bank",
      slipId,
      slipType: type,
      reference: reference || undefined,
      uploadedAt: new Date().toISOString(),
      reviewedAt: undefined,
      rejectReason: undefined,
    };
    return { oldSlip };
  });
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });

  await saveSlip(slipId, dataUrl);
  if (result.oldSlip) await deleteSlip(result.oldSlip);
  return Response.json({ ok: true }, { status: 201 });
}
