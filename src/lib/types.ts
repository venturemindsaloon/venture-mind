export type Service = {
  id: string;
  name: string;
  category: string;
  duration: number; // minutes
  price: number; // LKR
  description: string;
  active?: boolean; // false = hidden from customers
};

export type TicketStatus = "waiting" | "in_service" | "done" | "cancelled" | "no_show";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "rejected";
export type PaymentMethod = "bank" | "cash" | "card";

export type Payment = {
  status: PaymentStatus;
  amount: number; // LKR
  method?: PaymentMethod;
  slipId?: string; // uploaded bank slip (stored separately)
  slipType?: string; // image/jpeg, application/pdf ...
  reference?: string; // bank reference typed by the customer
  uploadedAt?: string;
  reviewedAt?: string;
  rejectReason?: string;
};

export type Ticket = {
  id: string;
  number: string; // e.g. "VM-007"
  name: string;
  phone: string;
  serviceId: string;
  stylist: string;
  note?: string;
  status: TicketStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  walkIn?: boolean;
  payment: Payment;
  /** Set when an unfinished ticket was moved to a new day: the day it was booked and its number then. */
  carriedFrom?: { day: string; number: string };
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read?: boolean;
  replied?: boolean;
};

export type Settings = {
  salonName: string;
  chairs: number;
  stylists: string[];
  queueOpen: boolean;
  announcement: string;
  bank: { bankName: string; branch: string; accountName: string; accountNumber: string };
};

export type DaySummary = {
  day: string;
  carriedOver?: number; // unfinished tickets moved to the next day
  customers: number;
  served: number;
  cancelled: number;
  noShow: number;
  revenue: number;
  avgWaitMinutes: number;
};

export type DB = {
  day: string; // YYYY-MM-DD; queue numbers restart each day
  counter: number;
  tickets: Ticket[];
  messages: ContactMessage[];
  services: Service[];
  settings: Settings;
  history: DaySummary[]; // one row per finished day, newest first
};

// What the public API returns for a ticket (phone number is hidden).
export type PublicTicket = Omit<Ticket, "phone"> & {
  position: number; // 0 when not waiting
  waitMinutes: number;
  serviceName: string;
};

export type PublicSettings = Pick<Settings, "salonName" | "stylists" | "queueOpen" | "announcement" | "bank">;
