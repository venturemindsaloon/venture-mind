"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setState("idle");
      return;
    }
    setState("sent");
    setForm({ name: "", email: "", message: "" });
  }

  if (state === "sent") {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl gold-ring bg-panel p-10 text-center">
        <p className="font-display text-4xl text-gold-gradient">Thank you!</p>
        <p className="mt-3 text-muted">Your message was sent. We&apos;ll reply within one working day.</p>
        <button onClick={() => setState("idle")} className="btn-outline mt-6">Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-3xl gold-ring bg-panel p-6 md:p-8">
      <h2 className="font-display text-3xl text-gold-light">Send us a message</h2>
      <input
        className="input"
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        className="input"
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <textarea
        className="input min-h-40"
        placeholder="How can we help?"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        required
      />
      {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <button className="btn-gold w-full" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
