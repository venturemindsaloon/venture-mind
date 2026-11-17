// Edit these values to change the business details shown across the site.
export const site = {
  name: "Venture Mind",
  tagline: "Book. Track. Glow.",
  subtitle: "Salon Queue Management",
  description:
    "Venture Mind is a smart queue management service for salons. Customers join the queue online, track their turn live, and walk in right on time.",
  contact: {
    email: "hello@venturemind.lk",
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

// Starting values for the salon settings. After the first run, change them from the
// Salon Dashboard → Settings tab instead of here.
export const defaultSettings = {
  salonName: "Venture Mind Partner Salon",
  // Number of stylists working at the same time. Used to estimate waiting time.
  chairs: 3,
  stylists: ["Any stylist", "Nethmi", "Kasun", "Dilani"],
  queueOpen: true,
  announcement: "",
  bank: {
    bankName: "Commercial Bank",
    branch: "Kuliyapitiya",
    accountName: "Venture Mind (Pvt) Ltd",
    accountNumber: "1234 5678 9012",
  },
};
