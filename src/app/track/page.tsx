"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TrackPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSaved(localStorage.getItem("vm-ticket"));
    } catch {}
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch(`/api/lookup?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setBusy(false);
      return;
    }
    router.push(`/track/${data.id}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <div className="text-center">
        <p className="text-sm tracking-[0.3em] text-blush uppercase">Step 2 · Track</p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-gold-gradient">Track Your Ticket</h1>
        <p className="mt-3 text-muted">Enter your ticket number (e.g. VM-004) or the mobile number you used.</p>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-4 rounded-3xl gold-ring bg-panel p-6 md:p-8">
        <input
          className="input text-center text-lg"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="VM-004 or 07X XXX XXXX"
          required
        />
        {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
        <button className="btn-gold w-full" disabled={busy}>
          {busy ? "Searching…" : "Find my ticket"}
        </button>
      </form>

      {saved && (
        <p className="mt-6 text-center text-sm text-muted">
          Joined from this device?{" "}
          <Link href={`/track/${saved}`} className="text-gold-light underline">
            Open your last ticket
          </Link>
        </p>
      )}
    </div>
  );
}
