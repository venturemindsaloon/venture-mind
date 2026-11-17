import { readDb } from "@/lib/db";

// Services customers can book (hidden ones are left out).
export async function GET() {
  const db = await readDb();
  return Response.json({ services: db.services.filter((s) => s.active !== false) });
}
