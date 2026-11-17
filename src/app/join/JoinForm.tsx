"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Service } from "@/lib/types";

export default function JoinForm({ services, stylists }: { services: Service[]; stylists: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const preselected = services.some((s) => s.id === params.get("service")) ? params.get("service")! : "";

  const [form, setForm] = useState({ name: "", phone: "", serviceId: preselected, stylist: stylists[0], note: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = services.find((s) => s.id === form.serviceId);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      try {
        localStorage.setItem("vm-ticket", data.id);
      } catch {}
      router.push(`/track/${data.id}${data.existing ? "?existing=1" : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-5 rounded-3xl gold-ring bg-panel p-6 md:p-8">
      <Field label="Your name">
        <input className="input" value={form.name} onChange={set("name")} placeholder="e.g. Nimali Perera" required />
      </Field>
      <Field label="Mobile number" hint="Used to find your ticket and contact you if needed.">
        <input
          className="input"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          placeholder="07X XXX XXXX"
          required
        />
      </Field>
      <Field label="Service">
        <select className="input" value={form.serviceId} onChange={set("serviceId")} required>
          <option value="" disabled>
            Choose a service
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.duration} min · LKR {s.price.toLocaleString()}
            </option>
          ))}
        </select>
        {selected && <p className="mt-2 text-sm text-muted">{selected.description}</p>}
      </Field>
      <Field label="Preferred stylist">
        <select className="input" value={form.stylist} onChange={set("stylist")}>
          {stylists.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <Field label="Note (optional)">
        <textarea className="input min-h-20" value={form.note} onChange={set("note")} placeholder="Anything we should know?" />
      </Field>

      {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <button type="submit" className="btn-gold w-full" disabled={busy}>
        {busy ? "Joining…" : "Get my ticket"}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gold-light">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
