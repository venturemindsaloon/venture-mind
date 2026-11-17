import { readDb } from "@/lib/db";

// Find today's ticket by ticket number (e.g. VM-004) or phone number.
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().toUpperCase();
  if (!q) return Response.json({ error: "Enter a ticket number or phone number." }, { status: 400 });

  const db = await readDb();
  const digits = q.replace(/\D/g, "");
  const asNumber = /^\d{1,3}$/.test(q) ? `VM-${q.padStart(3, "0")}` : q;
  const matches = db.tickets
    .filter(
      (t) =>
        t.number === asNumber ||
        (digits.length >= 9 && t.phone.replace(/\D/g, "").endsWith(digits.slice(-9))),
    )
    .reverse();

  if (!matches.length) return Response.json({ error: "No ticket found for today." }, { status: 404 });
  return Response.json({ id: matches[0].id });
}
