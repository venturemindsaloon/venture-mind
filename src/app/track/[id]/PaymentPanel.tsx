"use client";

import { useState } from "react";
import type { PublicTicket, Settings } from "@/lib/types";

/** Shrink photos before upload so slips stay small (max 1400px, JPEG). */
async function fileToDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
  if (!file.type.startsWith("image/")) return raw;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Could not open the image."));
    i.src = raw;
  });
  const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.75);
}

const badge: Record<PublicTicket["payment"]["status"], { label: string; cls: string }> = {
  unpaid: { label: "Not paid yet", cls: "bg-panel-2 text-muted" },
  pending: { label: "Slip received · checking", cls: "bg-amber-500/15 text-amber-200" },
  paid: { label: "Paid", cls: "bg-emerald-500/15 text-emerald-300" },
  rejected: { label: "Slip not accepted", cls: "bg-red-500/15 text-red-300" },
};

export default function PaymentPanel({
  ticket,
  bank,
  onChange,
}: {
  ticket: PublicTicket;
  bank: Settings["bank"];
  onChange: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const p = ticket.payment;
  const active = ticket.status !== "cancelled" && ticket.status !== "no_show";
  const canUpload = active && (p.status === "unpaid" || p.status === "rejected");

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Choose a photo or PDF of your slip.");
    if (file.type === "application/pdf" && file.size > 2 * 1024 * 1024)
      return setError("PDF is too large. Please upload a file under 2 MB.");
    setBusy(true);
    setError("");
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await fetch(`/api/queue/${ticket.id}/slip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, reference }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFile(null);
      setReference("");
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl gold-ring bg-panel p-6 text-left md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl text-gold-light">Payment</h2>
        <span className={`rounded-full px-3 py-1 text-sm ${badge[p.status].cls}`}>{badge[p.status].label}</span>
      </div>
      <p className="mt-2 text-muted">
        Amount: <span className="text-xl font-semibold text-cream">LKR {p.amount.toLocaleString()}</span>
      </p>

      {p.status === "paid" && (
        <p className="mt-4 text-sm text-emerald-300">
          Thank you! Your payment{p.method ? ` (${p.method === "bank" ? "bank transfer" : p.method})` : ""} is confirmed.
        </p>
      )}
      {p.status === "pending" && (
        <p className="mt-4 text-sm text-muted">
          We received your slip{p.reference ? ` (ref. ${p.reference})` : ""}. The salon will confirm it shortly. This page
          updates by itself.
        </p>
      )}
      {p.status === "rejected" && (
        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {p.rejectReason} Please upload the correct slip or pay at the salon.
        </p>
      )}

      {canUpload && (
        <>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-panel-2 p-5">
              <p className="text-xs tracking-wider text-blush uppercase">Option 1 · Bank transfer</p>
              <dl className="mt-3 space-y-1.5 text-sm">
                <BankRow label="Bank" value={bank.bankName} />
                <BankRow label="Branch" value={bank.branch} />
                <BankRow label="Account name" value={bank.accountName} />
                <BankRow label="Account no." value={bank.accountNumber} />
              </dl>
              <button
                type="button"
                className="mt-3 text-xs text-gold-light hover:underline"
                onClick={() => {
                  navigator.clipboard?.writeText(bank.accountNumber.replace(/\s/g, ""));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "Copied ✓" : "Copy account number"}
              </button>
              <p className="mt-2 text-xs text-muted">
                Use <span className="text-cream">{ticket.number}</span> as the payment reference/remark.
              </p>
            </div>
            <div className="rounded-2xl bg-panel-2 p-5">
              <p className="text-xs tracking-wider text-blush uppercase">Option 2 · Pay at the salon</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Prefer cash or card? Simply pay at the front desk after your service. No upload needed.
              </p>
            </div>
          </div>

          <form onSubmit={upload} className="mt-6 space-y-3">
            <p className="text-sm font-medium text-gold-light">Upload your payment slip</p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gold/40 bg-panel-2 px-4 py-6 text-center hover:border-gold">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-gold">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
              </svg>
              <span className="text-sm text-cream">{file ? file.name : "Tap to choose a photo, screenshot or PDF"}</span>
              <span className="text-xs text-muted">JPG, PNG or PDF</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <input
              className="input"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Bank reference number (optional)"
            />
            {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
            <button className="btn-gold w-full" disabled={busy || !file}>
              {busy ? "Uploading…" : "Submit slip"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-cream">{value}</dd>
    </div>
  );
}
