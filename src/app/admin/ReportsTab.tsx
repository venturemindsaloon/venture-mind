"use client";

import { Panel, Stat, lkr, useAdmin } from "./shared";

export default function ReportsTab() {
  const { data } = useAdmin();
  const r = data.report;
  const methodLabel: Record<string, string> = { bank: "Bank transfer", cash: "Cash", card: "Card", "not paid": "Not paid yet" };

  function exportCsv() {
    const rows = [
      ["Ticket", "Name", "Phone", "Service", "Stylist", "Status", "Joined", "Started", "Finished", "Amount", "Payment", "Method", "Carried from"],
      ...data.tickets.map((t) => [
        t.number, t.name, t.phone, t.serviceName, t.stylist, t.status, t.createdAt, t.startedAt ?? "", t.finishedAt ?? "",
        String(t.payment.amount), t.payment.status, t.payment.method ?? "",
        t.carriedFrom ? `${t.carriedFrom.day} ${t.carriedFrom.number}` : "",
      ]),
    ];
    const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `venture-mind-${r.day}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Finished / still in queue" value={`${r.customers} / ${r.carriedOver ?? 0}`} />
        <Stat label="Served" value={String(r.served)} tone="good" />
        <Stat label="Average wait" value={`${r.avgWaitMinutes} min`} />
        <Stat label="Cancelled / no-show" value={`${r.cancelled} / ${r.noShow}`} tone={r.cancelled + r.noShow ? "warn" : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Popular services">
          <Bars rows={r.byService} />
        </Panel>
        <Panel title="By stylist">
          <Bars rows={r.byStylist} />
        </Panel>
        <Panel title="Payment methods">
          <Bars rows={r.byMethod.map(([k, v]) => [methodLabel[k] ?? k, v])} />
        </Panel>
      </div>

      <Panel
        title="Daily history"
        action={
          <button className="btn-outline text-sm" onClick={exportCsv}>
            Download today as CSV
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs tracking-wider text-muted uppercase">
              <tr>
                <th className="py-2 pr-3">Day</th>
                <th className="py-2 pr-3 text-right">Finished</th>
                <th className="py-2 pr-3 text-right">Served</th>
                <th className="py-2 pr-3 text-right">Cancelled</th>
                <th className="py-2 pr-3 text-right">No-show</th>
                <th className="py-2 pr-3 text-right">Carried over</th>
                <th className="py-2 pr-3 text-right">Avg wait</th>
                <th className="py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[{ ...r, today: true }, ...data.history].map((d) => (
                <tr key={d.day} className="border-t border-line/60">
                  <td className="py-2.5 pr-3 text-cream">
                    {d.day} {"today" in d && <span className="text-xs text-blush">(today, live)</span>}
                  </td>
                  <td className="py-2.5 pr-3 text-right">{d.customers}</td>
                  <td className="py-2.5 pr-3 text-right">{d.served}</td>
                  <td className="py-2.5 pr-3 text-right">{d.cancelled}</td>
                  <td className="py-2.5 pr-3 text-right">{d.noShow}</td>
                  <td className="py-2.5 pr-3 text-right">{d.carriedOver ?? 0}</td>
                  <td className="py-2.5 pr-3 text-right">{d.avgWaitMinutes} min</td>
                  <td className="py-2.5 text-right text-gold-light">{lkr(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          At midnight the day is closed automatically and its totals are saved here. Unfinished customers (waiting
          or in the chair) move to the next day at the front of the queue and get new numbers from VM-001; their
          old number is shown next to them. A customer is counted on the day their ticket is finished, and a payment
          on the day it was received, so nobody is counted twice. Download the CSV before midnight if you need each
          customer&apos;s details.</p>
      </Panel>
    </div>
  );
}

function Bars({ rows }: { rows: [string, number][] }) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-muted">No data yet today.</p>;
  const max = Math.max(...rows.map(([, v]) => v));
  return (
    <ul className="space-y-3">
      {rows.map(([label, value]) => (
        <li key={label}>
          <div className="flex justify-between text-sm">
            <span className="text-cream">{label}</span>
            <span className="text-muted">{value}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-panel-2">
            <div className="h-2 rounded-full bg-gold-gradient" style={{ width: `${(value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
