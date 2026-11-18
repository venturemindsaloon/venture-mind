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
    phone: "+94 77 123 4567",
    whatsapp: "+94 77 123 4567",
    address: "No. 25, Main Street, Kuliyapitiya, Sri Lanka",
    hours: [
      { days: "Monday – Friday", time: "9:00 AM – 7:00 PM" },
      { days: "Saturday", time: "9:00 AM – 8:00 PM" },
      { days: "Sunday", time: "10:00 AM – 4:00 PM" },
    ],
    socials: [
      { label: "Facebook", href: "https://facebook.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "TikTok", href: "https://tiktok.com" },
    ],
  },
};

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
