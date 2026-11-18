"use client";

import Link from "next/link";
import { Logo, Wordmark } from "./Brand";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/join", label: "Join Queue" },
  { href: "/track", label: "Track" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Logo size={46} priority className="ring-2 ring-gold/60" />
          <span className="leading-none">
            <Wordmark className="block text-2xl" />
            <span className="font-script block text-sm text-blush">Smart Salon Queue System</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                isActive(l.href) ? "bg-gold/15 text-gold-light" : "text-muted hover:text-cream"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/admin" className="ml-2 rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-cream">
            Salon login
          </Link>
        </nav>

        <button
          className="rounded-lg border border-line p-2 md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-line/70 px-4 pb-4 md:hidden">
          {[...links, { href: "/admin", label: "Salon login" }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-3 ${isActive(l.href) ? "text-gold-light" : "text-muted"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
