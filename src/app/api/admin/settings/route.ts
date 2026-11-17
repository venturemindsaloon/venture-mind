import { updateDb } from "@/lib/db";
import { isAdmin, unauthorized } from "@/lib/queue";

// Update salon settings. Any field left out stays as it is.
export async function PATCH(request: Request) {
  if (!isAdmin(request)) return unauthorized();
  const b = await request.json().catch(() => null);
  if (!b) return Response.json({ error: "Invalid data." }, { status: 400 });

  const error = await updateDb((db) => {
    const s = db.settings;
    if (b.salonName !== undefined) s.salonName = String(b.salonName).trim().slice(0, 60) || s.salonName;
    if (b.chairs !== undefined) {
      const chairs = Math.round(Number(b.chairs));
      if (!(chairs >= 1 && chairs <= 30)) return "Chairs must be between 1 and 30.";
      s.chairs = chairs;
    }
    if (b.stylists !== undefined) {
      const list = (Array.isArray(b.stylists) ? b.stylists : [])
        .map((x: unknown) => String(x).trim().slice(0, 30))
        .filter(Boolean);
      if (!list.length) return "Add at least one stylist.";
      s.stylists = [...new Set<string>(list)];
    }
    if (typeof b.queueOpen === "boolean") s.queueOpen = b.queueOpen;
    if (b.announcement !== undefined) s.announcement = String(b.announcement).trim().slice(0, 200);
    if (b.bank) {
      for (const k of ["bankName", "branch", "accountName", "accountNumber"] as const) {
        if (b.bank[k] !== undefined) s.bank[k] = String(b.bank[k]).trim().slice(0, 60);
      }
    }
    return null;
  });

  if (error) return Response.json({ error }, { status: 400 });
  return Response.json({ ok: true });
}
