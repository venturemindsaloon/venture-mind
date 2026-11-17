import { readDb } from "@/lib/db";
import { publicSettings } from "@/lib/queue";

// Settings customers can see: stylists, bank details, queue open/closed, announcement.
export async function GET() {
  const db = await readDb();
  return Response.json({ settings: publicSettings(db) });
}
