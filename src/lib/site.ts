// Edit these values to change the business details shown across the site.
export const site = {
  name: "QSmart",
  subtitle: "Smart Salon Queue System",
  tagline: "Save Time • Book Online • Relax More",
  motto: "Your Time Matters...",
  description:
    "QSmart is a smart queue system for salons. Customers book their place online, watch their turn come up live, and walk in right on time.",
  contact: {
    email: "hello@qsmart.lk",
    phone: "076 460 5832",
    whatsapp: "076 460 5832",
    address: "No. 25, Main Street, Kuliyapitiya, Sri Lanka",
    // Shown as a badge across the site
    openLabel: "Open 24 hours · 7 days a week",
    hours: [{ days: "Monday – Sunday", time: "Open 24 hours" }],
    socials: [
      { label: "Facebook", href: "https://facebook.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "TikTok", href: "https://tiktok.com" },
    ],
  },
};

/** "076 460 5832" → "+94764605832" (Sri Lanka) for tel: links. */
export const telLink = (local: string) => `tel:+94${local.replace(/\D/g, "").replace(/^0/, "")}`;
/** "076 460 5832" → "https://wa.me/94764605832" */
export const whatsappLink = (local: string) => `https://wa.me/94${local.replace(/\D/g, "").replace(/^0/, "")}`;

/** Service price for customers: "Free" or "LKR 4,500". */
export const formatPrice = (price: number) => (price === 0 ? "Free" : `LKR ${price.toLocaleString("en-US")}`);

/** Ticket numbers look like "Q-007". */
export const TICKET_PREFIX = "Q";
export const ticketNumber = (n: number) => `${TICKET_PREFIX}-${String(n).padStart(3, "0")}`;

// Starting values for the salon settings. After the first run, change them from the
// Salon Dashboard → Settings tab instead of here.
export const defaultSettings = {
  salonName: "QSmart Partner Salon",
  // Number of stylists working at the same time. Used to estimate waiting time.
  chairs: 3,
  stylists: ["Any stylist", "Nethmi", "Kasun", "Dilani"],
  queueOpen: true,
  announcement: "",
  bank: {
    bankName: "Commercial Bank",
    branch: "Kuliyapitiya",
    accountName: "QSmart (Pvt) Ltd",
    accountNumber: "1234 5678 9012",
  },
};
