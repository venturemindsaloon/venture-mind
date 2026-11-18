import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Contact | QSmart" };

export default function ContactPage() {
  const c = site.contact;
  const items = [
    { label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    { label: "WhatsApp", value: c.whatsapp, href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}` },
    { label: "Email", value: c.email, href: `mailto:${c.email}` },
    { label: "Address", value: c.address },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="text-center">
        <p className="text-sm tracking-[0.3em] text-blush uppercase">Get in touch</p>
        <h1 className="mt-3 font-display text-5xl font-semibold text-gold-gradient">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Questions about a booking, or want QSmart for your own salon? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-3xl gold-ring bg-panel p-6 md:p-8">
            <dl className="space-y-5">
              {items.map((i) => (
                <div key={i.label}>
                  <dt className="text-xs tracking-wider text-blush uppercase">{i.label}</dt>
                  <dd className="mt-1 text-lg text-cream">
                    {i.href ? (
                      <a href={i.href} className="hover:text-gold-light" target={i.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                        {i.value}
                      </a>
                    ) : (
                      i.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-3xl gold-ring bg-panel p-6 md:p-8">
            <h2 className="font-display text-2xl text-gold-light">Opening hours</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {c.hours.map((h) => (
                <li key={h.days} className="flex justify-between border-b border-line/60 pb-2">
                  <span className="text-muted">{h.days}</span>
                  <span className="text-cream">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
