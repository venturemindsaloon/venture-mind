import "server-only";
import { promises as fs } from "fs";
import path from "path";
import servicesSeed from "@/data/services.json";
import { defaultSettings } from "./site";
import type { DaySummary, DB, Service, Ticket } from "./types";

/**
 * JSON storage.
 *
 * The whole database is one JSON document. Uploaded payment slips are kept apart from it
 * (one entry per slip) so the main document stays small.
 *
 * Where it is kept depends on the environment:
 *  - Local development: data/db.json and data/slips/ in the project folder.
 *  - Online (Render, Vercel, …) with a free Upstash Redis database: Redis keys.
 *    Hosting disks are wiped on every redeploy/restart, so files can't be kept there.
 *  - Online without Redis: a local file that works but can reset at any time
 *    (the dashboard shows a warning).
 */

const KEY = "venture-mind:db";
const SLIP_PREFIX = "venture-mind:slip:";

// Upstash's own names (Render, any host) or the names Vercel's integration creates.
const redisUrl = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "").trim();
const redisToken = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "").trim();

// Running on a hosting platform rather than on your own computer.
const hosted = Boolean(process.env.RENDER || process.env.VERCEL || process.env.NETLIFY);

// Vercel only allows writing to /tmp.
const dataDir = process.env.VERCEL ? "/tmp/venture-mind" : path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "db.json");
const slipDir = path.join(dataDir, "slips");

export const storageMode = redisUrl && redisToken ? "redis" : hosted ? "tmp-file" : "file";

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" });

/** Day in Sri Lanka time, e.g. "2026-11-17". */
export function dayOf(date: Date | string): string {
  return dayFormat.format(new Date(date));
}

export function today(): string {
  return dayOf(new Date());
}

async function redis(command: unknown[]): Promise<unknown> {
  const res = await fetch(redisUrl!, {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

const isActive = (t: Ticket) => t.status === "waiting" || t.status === "in_service";

/**
 * Totals for one day. A customer is counted on the day their ticket is closed, and a payment
 * on the day it was received, so a ticket carried over to the next day is never counted twice.
 */
export function summarizeDay(day: string, allTickets: Ticket[]): DaySummary {
  const tickets = allTickets.filter((t) => !isActive(t));
  // Waits that span overnight would distort the average, so carried tickets are left out.
  const started = allTickets.filter((t) => t.startedAt && !t.carriedFrom);
  const waits = started.map((t) => (new Date(t.startedAt!).getTime() - new Date(t.createdAt).getTime()) / 60000);
  return {
    day,
    carriedOver: allTickets.filter(isActive).length,
    customers: tickets.length,
    served: tickets.filter((t) => t.status === "done").length,
    cancelled: tickets.filter((t) => t.status === "cancelled").length,
    noShow: tickets.filter((t) => t.status === "no_show").length,
    revenue: allTickets
      .filter((t) => t.payment?.status === "paid" && t.payment.reviewedAt && dayOf(t.payment.reviewedAt) === day)
      .reduce((s, t) => s + t.payment.amount, 0),
    avgWaitMinutes: waits.length ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length) : 0,
  };
}

/** Fill in anything missing (older data files, first run). Does not change the day. */
function normalize(raw: Partial<DB> | null): DB {
  const db: DB = {
    day: raw?.day ?? today(),
    counter: raw?.counter ?? 0,
    tickets: raw?.tickets ?? [],
    messages: raw?.messages ?? [],
    services: raw?.services ?? (servicesSeed as Service[]).map((s) => ({ ...s, active: true })),
    settings: { ...defaultSettings, ...raw?.settings, bank: { ...defaultSettings.bank, ...raw?.settings?.bank } },
    history: raw?.history ?? [],
  };
  for (const t of db.tickets) {
    t.payment ??= {
      status: "unpaid",
      amount: db.services.find((s) => s.id === t.serviceId)?.price ?? 0,
    };
  }

  return db;
}

/**
 * Close the day if the date has changed (Sri Lanka time):
 *  - the day's totals are saved to history (finished tickets only),
 *  - finished tickets (done, cancelled, no-show) are cleared and their slips deleted,
 *  - unfinished tickets (waiting or in the chair) carry over to the new day in the same
 *    order, keeping their status and payment. They are renumbered VM-001, VM-002, … so
 *    numbers never repeat; the old number is kept in `carriedFrom` and shown to everyone.
 *  - new customers continue from the next number.
 * Returns the slip ids of the cleared tickets so they can be deleted.
 */
function rollOver(db: DB): string[] | null {
  if (db.day === today()) return null;
  if (db.tickets.length) db.history.unshift(summarizeDay(db.day, db.tickets));
  db.history = db.history.slice(0, 60);

  const finished = db.tickets.filter((t) => !isActive(t));
  const carried = db.tickets.filter(isActive);
  carried.forEach((t, i) => {
    // Keep the first original number if a ticket is carried more than once.
    t.carriedFrom ??= { day: db.day, number: t.number };
    t.number = `VM-${String(i + 1).padStart(3, "0")}`;
  });

  db.day = today();
  db.counter = carried.length;
  db.tickets = carried;
  return finished.map((t) => t.payment.slipId).filter(Boolean) as string[];
}

async function load(): Promise<{ db: DB; oldSlips: string[] | null }> {
  let raw: string | null = null;
  if (storageMode === "redis") {
    raw = (await redis(["GET", KEY])) as string | null;
  } else {
    raw = await fs.readFile(filePath, "utf8").catch(() => null);
  }
  const db = normalize(raw ? JSON.parse(raw) : null);
  return { db, oldSlips: rollOver(db) };
}

async function save(db: DB): Promise<void> {
  const json = JSON.stringify(db, null, 2);
  if (storageMode === "redis") {
    await redis(["SET", KEY, json]);
  } else {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, json, "utf8");
  }
}

export async function readDb(): Promise<DB> {
  const { db, oldSlips } = await load();
  // First visit of a new day: save the closed day straight away (through the write queue).
  if (oldSlips) return updateDb((fresh) => fresh);
  return db;
}

// Writes run one after another so two requests cannot overwrite each other's changes.
let queue: Promise<unknown> = Promise.resolve();

export function updateDb<T>(change: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const { db, oldSlips } = await load();
    const result = await change(db);
    await save(db);
    if (oldSlips?.length) await Promise.all(oldSlips.map((id) => deleteSlip(id).catch(() => {})));
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

// ---- Payment slips (stored as data URLs, one per key/file) ----

const safe = (id: string) => id.replace(/[^a-z0-9]/gi, "");

export async function saveSlip(id: string, dataUrl: string): Promise<void> {
  if (storageMode === "redis") {
    // Slips expire after 30 days to stay inside the free Redis limits.
    await redis(["SET", SLIP_PREFIX + safe(id), dataUrl, "EX", 60 * 60 * 24 * 30]);
  } else {
    await fs.mkdir(slipDir, { recursive: true });
    await fs.writeFile(path.join(slipDir, `${safe(id)}.txt`), dataUrl, "utf8");
  }
}

export async function readSlip(id: string): Promise<string | null> {
  if (storageMode === "redis") return (await redis(["GET", SLIP_PREFIX + safe(id)])) as string | null;
  return fs.readFile(path.join(slipDir, `${safe(id)}.txt`), "utf8").catch(() => null);
}

export async function deleteSlip(id: string): Promise<void> {
  if (storageMode === "redis") await redis(["DEL", SLIP_PREFIX + safe(id)]);
  else await fs.rm(path.join(slipDir, `${safe(id)}.txt`), { force: true });
}
