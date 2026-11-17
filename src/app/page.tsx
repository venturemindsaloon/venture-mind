import Image from "next/image";
import Link from "next/link";
import LiveStatus from "@/components/LiveStatus";
import HeroBackground from "@/components/HeroBackground";
import { Suspense } from "react";
import { liveDb } from "@/lib/live";
import { site } from "@/lib/site";

const steps = [
  {
    title: "Book",
    text: "Pick your service and join the salon queue from your phone. No calls, no app to install.",
    icon: "M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  },
  {
    title: "Track",
    text: "See your place in line and your estimated waiting time update live.",
    icon: "M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Glow",
    text: "Arrive just before your turn, relax in the chair, and leave looking your best.",
    icon: "M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8-5-3.6-5 3.6 1.9-5.8L4 8.8h6.1z",
  },
];

const features = [
  { title: "Online queue", text: "Customers join remotely with just a name and phone number." },
  { title: "Live wait times", text: "Smart estimates based on each service's length and free chairs." },
  { title: "Salon dashboard", text: "Call the next customer, start and finish services in one tap." },
  { title: "Works on any phone", text: "A fast mobile website. Nothing to download." },
  { title: "Easy payments", text: "Customers pay by bank transfer and upload the slip, or pay at the desk." },
  { title: "Reports & history", text: "Revenue, popular services, stylist workload and daily history at a glance." },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    note: "for small salons",
    items: ["1–2 chairs", "Online queue & live tracking", "Basic salon dashboard", "Up to 300 tickets / month"],
  },
  {
    name: "Professional",
    price: "LKR 2,500",
    note: "per month",
    highlight: true,
    items: ["Up to 6 chairs", "Everything in Starter", "SMS reminder before your turn", "Unlimited tickets", "Daily reports"],
  },
  {
    name: "Premium",
    price: "LKR 5,000",
    note: "per month",
    items: ["Unlimited chairs & branches", "Everything in Professional", "Custom branding & domain", "Priority support"],
  },
];

async function FeaturedServices() {
  const db = await liveDb();
  const featured = db.services.filter((s) => s.active !== false).slice(0, 6);
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((s) => (
        <Link
          key={s.id}
          href={`/join?service=${s.id}`}
          className="group rounded-2xl border border-line bg-panel p-5 transition hover:border-gold/60"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-2xl text-cream group-hover:text-gold-light">{s.name}</h3>
            <span className="shrink-0 text-gold">LKR {s.price.toLocaleString()}</span>
          </div>
          <p className="mt-2 text-sm text-muted">{s.description}</p>
          <p className="mt-3 text-xs tracking-wider text-blush uppercase">{s.duration} min · Join queue →</p>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <HeroBackground />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm tracking-[0.3em] text-blush uppercase">{site.subtitle}</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] font-semibold md:text-7xl">
              <span className="text-gold-gradient">Book. Track. Glow.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Skip the crowded waiting room. Join your salon&apos;s queue online, watch your turn come up live,
              and walk in right on time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/join" className="btn-gold">Join the queue</Link>
              <Link href="/track" className="btn-outline">Track my ticket</Link>
            </div>
          </div>
          <div className="space-y-6">
            <div className="mx-auto w-56 md:w-72">
              <Image
                src="/logo.jpg"
                alt="Venture Mind logo"
                width={576}
                height={576}
                className="rounded-full shadow-2xl shadow-gold/10"
                priority
              />
            </div>
            <LiveStatus />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle eyebrow="How it works" title="Three simple steps" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-3xl gold-ring bg-panel p-7">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                </span>
                <span className="text-sm text-muted">Step {i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-3xl text-gold-light">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle eyebrow="Our partner salon" title="Popular services" />
        <Suspense fallback={<div className="mt-10 h-72 rounded-3xl bg-panel" />}>
          <FeaturedServices />
        </Suspense>
        <div className="mt-8 text-center">
          <Link href="/services" className="btn-outline">See all services</Link>
        </div>
      </section>

      {/* Features for salon owners */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle eyebrow="For salon owners" title="Why salons choose Venture Mind" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl bg-panel p-6">
              <span className="mb-4 block h-1 w-10 rounded-full bg-gold-gradient" />
              <h3 className="text-lg font-medium text-gold-light">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle eyebrow="Pricing" title="Plans for every salon" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`flex flex-col rounded-3xl p-7 ${p.highlight ? "bg-panel-2 ring-2 ring-gold" : "gold-ring bg-panel"}`}
            >
              {p.highlight && (
                <span className="mb-3 self-start rounded-full bg-blush px-3 py-1 text-xs font-medium text-ink">Most popular</span>
              )}
              <h3 className="font-display text-3xl text-gold-light">{p.name}</h3>
              <p className="mt-3">
                <span className="text-3xl font-semibold text-cream">{p.price}</span>{" "}
                <span className="text-sm text-muted">{p.note}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-muted">
                {p.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-gold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className={`mt-8 ${p.highlight ? "btn-gold" : "btn-outline"}`}>
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl bg-gold-gradient p-10 text-center text-ink md:p-14">
          <h2 className="font-display text-4xl font-semibold md:text-5xl">Your chair is waiting.</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink/75">Join the queue now and we&apos;ll show you exactly when to arrive.</p>
          <Link href="/join" className="mt-7 inline-flex rounded-full bg-ink px-7 py-3 font-medium text-gold-light">
            Join the queue
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-sm tracking-[0.3em] text-blush uppercase">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-semibold text-gold-gradient md:text-5xl">{title}</h2>
    </div>
  );
}
