import { updateDb } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/queue";

// Mark a contact message read / unread / replied.
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/messages/[id]">) {
  if (!isAdmin(request)) return unauthorized();
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const ok = await updateDb((db) => {
    const m = db.messages.find((x) => x.id === id);
    if (!m) return false;
    if (typeof body.read === "boolean") m.read = body.read;
    if (typeof body.replied === "boolean") m.replied = body.replied;
    return true;
  });
  if (!ok) return Response.json({ error: "Message not found." }, { status: 404 });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/admin/messages/[id]">) {
  if (!isAdmin(request)) return unauthorized();
  const { id } = await ctx.params;
  await updateDb((db) => {
    db.messages = db.messages.filter((m) => m.id !== id);
  });
  return Response.json({ ok: true });
}
