import { updateDb } from "@/lib/db";
import { isAdmin, newId, unauthorized } from "@/lib/queue";
import type { Service } from "@/lib/types";

// Save the whole service list from the Services tab.
export async function PUT(request: Request) {
  if (!isAdmin(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.services)) return Response.json({ error: "Invalid data." }, { status: 400 });

  const services: Service[] = [];
  for (const s of body.services) {
    const name = String(s?.name ?? "").trim().slice(0, 60);
    const duration = Math.round(Number(s?.duration));
    const price = Math.round(Number(s?.price));
    if (!name) return Response.json({ error: "Every service needs a name." }, { status: 400 });
    if (!(duration >= 5 && duration <= 480))
      return Response.json({ error: `"${name}": duration must be 5–480 minutes.` }, { status: 400 });
    if (!(price >= 0)) return Response.json({ error: `"${name}": price must be 0 or more.` }, { status: 400 });
    services.push({
      id: String(s?.id || "").replace(/[^a-z0-9-]/gi, "") || newId(),
      name,
      category: String(s?.category ?? "Other").trim().slice(0, 30) || "Other",
      duration,
      price,
      description: String(s?.description ?? "").trim().slice(0, 200),
      active: s?.active !== false,
    });
  }
  if (!services.some((s) => s.active)) return Response.json({ error: "Keep at least one service visible." }, { status: 400 });

  await updateDb((db) => {
    db.services = services;
  });
  return Response.json({ ok: true });
}
