"use client";

import { useEffect, useState } from "react";
import type { Service } from "@/lib/types";
import { Btn, useAdmin } from "./shared";

export default function ServicesTab() {
  const { data, api, run } = useAdmin();
  const [list, setList] = useState<Service[]>(data.services);
  const [dirty, setDirty] = useState(false);

  // Take fresh data from the server unless there are unsaved edits.
  useEffect(() => {
    if (!dirty) setList(data.services);
  }, [data.services, dirty]);

  const update = (i: number, change: Partial<Service>) => {
    setList((l) => l.map((s, j) => (j === i ? { ...s, ...change } : s)));
    setDirty(true);
  };

  const add = () => {
    setList((l) => [
      ...l,
      { id: "", name: "New service", category: "Hair", duration: 30, price: 1000, description: "", active: true },
    ]);
    setDirty(true);
  };

  const remove = (i: number) => {
    if (!confirm(`Delete "${list[i].name}"? Tip: you can hide it instead.`)) return;
    setList((l) => l.filter((_, j) => j !== i));
    setDirty(true);
  };

  async function save() {
    const ok = await run(() => api("/api/admin/services", "PUT", { services: list }), "Services saved");
    if (ok) setDirty(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Edit prices, durations and descriptions. Hidden services don&apos;t appear on the website.
        </p>
        <div className="flex gap-2">
          {dirty && (
            <button className="btn-outline" onClick={() => { setList(data.services); setDirty(false); }}>
              Discard
            </button>
          )}
          <button className="btn-outline" onClick={add}>+ Add service</button>
          <button className="btn-gold" onClick={save} disabled={!dirty}>Save changes</button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {list.map((s, i) => (
          <div
            key={s.id || `new-${i}`}
            className={`grid gap-3 rounded-2xl border border-line bg-panel p-4 md:grid-cols-12 ${s.active === false ? "opacity-55" : ""}`}
          >
            <Field label="Name" className="md:col-span-3">
              <input className="input" value={s.name} onChange={(e) => update(i, { name: e.target.value })} />
            </Field>
            <Field label="Category" className="md:col-span-2">
              <input className="input" value={s.category} onChange={(e) => update(i, { category: e.target.value })} />
            </Field>
            <Field label="Minutes" className="md:col-span-1">
              <input className="input" type="number" min={5} value={s.duration} onChange={(e) => update(i, { duration: Number(e.target.value) })} />
            </Field>
            <Field label="Price (LKR)" className="md:col-span-2">
              <input className="input" type="number" min={0} step={50} value={s.price} onChange={(e) => update(i, { price: Number(e.target.value) })} />
            </Field>
            <Field label="Description" className="md:col-span-4">
              <input className="input" value={s.description} onChange={(e) => update(i, { description: e.target.value })} />
            </Field>
            <div className="flex flex-wrap items-center gap-2 md:col-span-12">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={s.active !== false} onChange={(e) => update(i, { active: e.target.checked })} />
                Visible to customers
              </label>
              <span className="ml-auto" />
              <Btn danger onClick={() => remove(i)}>Delete</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block text-xs text-muted ${className ?? ""}`}>
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
