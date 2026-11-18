import Image from "next/image";
import { site } from "@/lib/site";

/** The round QSmart logo, cropped to a circle (the picture has a thin white edge). */
export function Logo({ size, className = "", priority }: { size: number; className?: string; priority?: boolean }) {
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.jpg"
        alt="QSmart logo"
        width={size * 2}
        height={size * 2}
        priority={priority}
        className="h-full w-full scale-[1.04] object-cover"
      />
    </span>
  );
}

/** Green "Open 24 hours" pill. */
export function OpenBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300 ring-1 ring-emerald-400/30 ${className}`}
    >
      <span className="live-dot h-2 w-2 rounded-full bg-emerald-400" />
      {site.contact.openLabel}
    </span>
  );
}

/** "QSmart" written like the logo: a gold Q followed by white "Smart". */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`}>
      <span className="text-gold-gradient">Q</span>
      <span className="text-cream">Smart</span>
    </span>
  );
}
