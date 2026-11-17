import "server-only";
import { connection } from "next/server";
import { readDb } from "./db";

/**
 * Read the database while rendering a page. Marks the component as "render at request time"
 * so edits from the dashboard show up straight away. Use inside <Suspense>.
 */
export async function liveDb() {
  await connection();
  return readDb();
}
