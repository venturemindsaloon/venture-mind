import Link from "next/link";
import { site, telLink } from "@/lib/site";
import { Logo, OpenBadge, Wordmark } from "./Brand";

export default function Footer() {
  const c = site.contact;
  return (
    <footer className="mt-20 border-t border-line/70 bg-panel">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Logo size={56} className="ring-2 ring-gold/60" />
            <div>
              <Wordmark className="block text-3xl" />
              <p className="font-script text-lg text-blush">{site.motto}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">{site.description}</p>
        </div>
        <div>
          <p className="mb-3 font-medium text-gold-light">Contact</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <a href={telLink(c.phone)} className="hover:text-cream">{c.phone}</a>
            </li>
            <li>
              <a href={`mailto:${c.email}`} className="hover:text-cream">{c.email}</a>
            </li>
            <li>{c.address}</li>
            <li className="pt-1">
              <OpenBadge />
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-medium text-gold-light">Explore</p>
          <ul className="grid grid-cols-2 gap-2 text-sm text-muted">
            <li><Link href="/services" className="hover:text-cream">Services</Link></li>
            <li><Link href="/join" className="hover:text-cream">Join Queue</Link></li>
            <li><Link href="/track" className="hover:text-cream">Track Ticket</Link></li>
            <li><Link href="/contact" className="hover:text-cream">Contact</Link></li>
            <li><Link href="/admin" className="hover:text-cream">Salon login</Link></li>
          </ul>
          <div className="mt-4 flex gap-3 text-sm">
            {c.socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="text-blush hover:text-cream">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="border-t border-line/50 py-5 text-center text-xs text-muted">
        © 2026 {site.name}. {site.tagline}
      </p>
    </footer>
  );
}
