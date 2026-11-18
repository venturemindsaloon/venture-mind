"use client";

import { useState } from "react";
import { Btn, useAdmin } from "./shared";

export default function MessagesTab() {
  const { data, api, run } = useAdmin();
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const list = data.messages.filter(
    (m) =>
      (filter === "all" || (filter === "unread" ? !m.read : m.replied)) &&
      (!q || [m.name, m.email, m.message].some((v) => v.toLowerCase().includes(q))),
  );

  const patch = (id: string, body: object, msg?: string) => run(() => api(`/api/admin/messages/${id}`, "PATCH", body), msg);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "unread", "replied"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${filter === f ? "bg-gold text-ink" : "border border-line text-muted"}`}
          >
            {f}
            {f === "unread" && ` (${data.messages.filter((m) => !m.read).length})`}
          </button>
        ))}
        <input className="input ml-auto max-w-xs" placeholder="Search messages…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-5 space-y-3">
        {list.length === 0 && <p className="py-10 text-center text-muted">No messages.</p>}
        {list.map((m) => {
          const reply =
            `mailto:${m.email}?subject=${encodeURIComponent("Re: your message to QSmart")}` +
            `&body=${encodeURIComponent(`Hi ${m.name},\n\n\n\n---\nYou wrote:\n${m.message}`)}`;
          return (
            <div
              key={m.id}
              className={`rounded-2xl border p-5 ${m.read ? "border-line bg-panel" : "border-gold/50 bg-panel-2"}`}
              onClick={() => !m.read && patch(m.id, { read: true })}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 font-medium text-gold-light">
                  {!m.read && <span className="h-2 w-2 rounded-full bg-blush" />}
                  {m.name} · <span className="text-blush">{m.email}</span>
                  {m.replied && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300">Replied</span>}
                </span>
                <span className="text-muted">{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-cream/90">{m.message}</p>
              <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                <a
                  href={reply}
                  onClick={() => patch(m.id, { replied: true, read: true })}
                  className="rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-ink hover:bg-gold-light"
                >
                  Reply by email
                </a>
                <Btn onClick={() => patch(m.id, { read: !m.read })}>{m.read ? "Mark unread" : "Mark read"}</Btn>
                {!m.replied && <Btn onClick={() => patch(m.id, { replied: true, read: true }, "Marked as replied")}>Mark replied</Btn>}
                <Btn
                  danger
                  onClick={() => {
                    if (confirm(`Delete the message from ${m.name}?`))
                      run(() => api(`/api/admin/messages/${m.id}`, "DELETE"), "Message deleted");
                  }}
                >
                  Delete
                </Btn>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
