import { readSlip } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/queue";

// Staff view an uploaded payment slip.
export async function GET(request: Request, ctx: RouteContext<"/api/admin/slips/[id]">) {
  if (!isAdmin(request)) return unauthorized();
  const { id } = await ctx.params;
  const dataUrl = await readSlip(id);
  if (!dataUrl) return Response.json({ error: "Slip not found (it may have expired)." }, { status: 404 });
  return Response.json({ dataUrl });
}
