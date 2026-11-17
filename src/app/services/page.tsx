import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { liveDb } from "@/lib/live";

export const metadata: Metadata = { title: "Services | Venture Mind" };

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="text-center">
        <p className="text-sm tracking-[0.3em] text-blush uppercase">Service menu</p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-gold-gradient">Our Services</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Choose a service and join the queue. Your waiting time is estimated from the length of each service
          ahead of you. Pay by bank transfer (upload your slip) or at the salon.
        </p>
      </div>
      <Suspense fallback={<div className="mt-12 h-96 rounded-3xl bg-panel" />}>
        <ServiceMenu />
      </Suspense>
    </div>
  );
}

async function ServiceMenu() {
  const db = await liveDb();
  const services = db.services.filter((s) => s.active !== false);
  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <div className="mt-12 space-y-12">
      {categories.map((category) => (
        <section key={category}>
          <h2 className="mb-5 flex items-center gap-4 font-display text-3xl text-gold-light">
            {category}
            <span className="h-px flex-1 bg-line" />
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {services
              .filter((s) => s.category === category)
              .map((s) => (
                <div key={s.id} className="flex flex-col rounded-2xl border border-line bg-panel p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-medium text-cream">{s.name}</h3>
                    <span className="shrink-0 font-medium text-gold">LKR {s.price.toLocaleString()}</span>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs tracking-wider text-blush uppercase">{s.duration} minutes</span>
                    <Link href={`/join?service=${s.id}`} className="text-sm text-gold-light hover:underline">
                      Join queue →
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
