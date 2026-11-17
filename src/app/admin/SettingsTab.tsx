"use client";

import { useState } from "react";
import { Btn, Panel, useAdmin } from "./shared";

export default function SettingsTab() {
  const { data, api, run } = useAdmin();
  const s = data.settings;
  const [salonName, setSalonName] = useState(s.salonName);
  const [chairs, setChairs] = useState(s.chairs);
  const [announcement, setAnnouncement] = useState(s.announcement);
  const [stylists, setStylists] = useState(s.stylists);
  const [newStylist, setNewStylist] = useState("");
  const [bank, setBank] = useState(s.bank);

  const save = (body: object, msg = "Settings saved") => run(() => api("/api/admin/settings", "PATCH", body), msg);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Salon">
        <div className="space-y-4">
          <Label text="Salon name">
            <input className="input" value={salonName} onChange={(e) => setSalonName(e.target.value)} />
          </Label>
          <Label text="Chairs working at the same time" hint="Used to estimate waiting times.">
            <input className="input" type="number" min={1} max={30} value={chairs} onChange={(e) => setChairs(Number(e.target.value))} />
          </Label>
          <button className="btn-gold" onClick={() => save({ salonName, chairs })}>Save</button>
        </div>
      </Panel>

      <Panel title="Announcement">
        <div className="space-y-4">
          <Label text="Banner shown at the top of the website" hint="Leave empty to hide. E.g. “Closed on Poya day”.">
            <textarea className="input min-h-24" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} maxLength={200} />
          </Label>
          <div className="flex gap-2">
            <button className="btn-gold" onClick={() => save({ announcement }, "Announcement updated")}>Publish</button>
            {s.announcement && (
              <button className="btn-outline" onClick={() => { setAnnouncement(""); save({ announcement: "" }, "Announcement removed"); }}>
                Remove
              </button>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Stylists">
        <ul className="space-y-2">
          {stylists.map((name, i) => (
            <li key={name} className="flex items-center justify-between rounded-xl bg-panel-2 px-4 py-2">
              <span className="text-cream">{name}</span>
              {stylists.length > 1 && (
                <Btn danger onClick={() => setStylists(stylists.filter((_, j) => j !== i))}>Remove</Btn>
              )}
            </li>
          ))}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = newStylist.trim();
            if (n && !stylists.includes(n)) setStylists([...stylists, n]);
            setNewStylist("");
          }}
        >
          <input className="input" placeholder="New stylist name" value={newStylist} onChange={(e) => setNewStylist(e.target.value)} />
          <button className="btn-outline shrink-0" type="submit">Add</button>
        </form>
        <button className="btn-gold mt-4" onClick={() => save({ stylists }, "Stylists saved")}>Save stylists</button>
      </Panel>

      <Panel title="Bank details for payments">
        <p className="mb-4 text-sm text-muted">Customers see these on their ticket page when paying by bank transfer.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["bankName", "Bank"],
              ["branch", "Branch"],
              ["accountName", "Account name"],
              ["accountNumber", "Account number"],
            ] as const
          ).map(([key, label]) => (
            <Label key={key} text={label}>
              <input className="input" value={bank[key]} onChange={(e) => setBank({ ...bank, [key]: e.target.value })} />
            </Label>
          ))}
        </div>
        <button className="btn-gold mt-4" onClick={() => save({ bank }, "Bank details saved")}>Save bank details</button>
      </Panel>

      <Panel title="Danger zone">
        <p className="text-sm text-muted">Clear today&apos;s queue and all saved daily history (for a fresh demo).</p>
        <div className="mt-4">
          <Btn
            danger
            onClick={() => {
              if (confirm("Delete today's queue AND all daily history? This cannot be undone."))
                run(() => api("/api/admin", "POST", { action: "reset", clearHistory: true }), "Everything cleared");
            }}
          >
            Clear queue and history
          </Btn>
        </div>
      </Panel>
    </div>
  );
}

function Label({ text, hint, children }: { text: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-gold-light">{text}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
