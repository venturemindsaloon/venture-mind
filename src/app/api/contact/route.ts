import { updateDb } from "@/lib/db";
import { newId } from "@/lib/queue";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim().slice(0, 80);
  const email = String(body?.email ?? "").trim().slice(0, 120);
  const message = String(body?.message ?? "").trim().slice(0, 2000);

  if (name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email))
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (message.length < 5) return Response.json({ error: "Please write a message." }, { status: 400 });

  await updateDb((db) => {
    db.messages.unshift({ id: newId(), name, email, message, createdAt: new Date().toISOString() });
    db.messages = db.messages.slice(0, 200);
  });
  return Response.json({ ok: true }, { status: 201 });
}
