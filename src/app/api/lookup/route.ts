import { readDb } from "@/lib/db";
import { ticketNumber } from "@/lib/site";

// Find today's ticket by ticket number (e.g. Q-004) or phone number.
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().toUpperCase();
  if (!q) return Response.json({ error: "Enter a ticket number or phone number." }, { status: 400 });

  const db = await readDb();
  const digits = q.replace(/\D/g, "");
  // "4" or "004" → "Q-004"; "Q4" / "Q-4" → "Q-004"
  const bare = /^(?:Q-?)?(\d{1,3})$/.exec(q)?.[1];
  const asNumber = bare ? ticketNumber(Number(bare)) : q;
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
