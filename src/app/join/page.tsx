import type { Metadata } from "next";
import { Suspense } from "react";
import JoinForm from "./JoinForm";
import { liveDb } from "@/lib/live";

export const metadata: Metadata = { title: "Join the Queue | QSmart" };

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <div className="text-center">
        <p className="text-sm tracking-[0.3em] text-blush uppercase">Step 1 · Book</p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-gold-gradient">Join the Queue</h1>
        <p className="mt-3 text-muted">Get your ticket in seconds and track your turn live.</p>
      </div>
      <Suspense fallback={<div className="mt-10 h-96 rounded-3xl bg-panel" />}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  const db = await liveDb();
  if (!db.settings.queueOpen) {
    return (
      <div className="mt-10 rounded-3xl gold-ring bg-panel p-8 text-center">
        <p className="font-display text-3xl text-gold-light">The queue is closed right now</p>
        <p className="mt-3 text-muted">Please check back later, or contact the salon for help.</p>
      </div>
    );
  }
  return <JoinForm services={db.services.filter((s) => s.active !== false)} stylists={db.settings.stylists} />;
}
