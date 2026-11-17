# Venture Mind: Salon Queue Management

**Book. Track. Glow.** A small demo web app for the MGT 4124 Electronic Business assignment.

Customers join a salon's queue online, track their place live, and arrive on time.
Salon staff manage the queue from a dashboard.

## Pages

| Page | URL | What it does |
|---|---|---|
| Home | `/` | Hero, live queue status, how it works, services, salon features, pricing plans |
| Services | `/services` | Full service menu with prices and durations |
| Join Queue | `/join` | Form to get a ticket (VM-001, VM-002, …) |
| Track | `/track` | Find a ticket by number or phone, then see position and wait time live, and pay |
| Contact | `/contact` | Phone, WhatsApp, email, address, opening hours and a message form |
| Salon login | `/admin` | Staff dashboard (see below) |

**Dashboard passcode:** `salon123` (change it with the `ADMIN_PASSCODE` environment variable).

## Payments (no payment gateway)

On their ticket page the customer sees the amount and two options:

1. **Bank transfer**: the salon's bank details are shown. The customer uploads a photo, screenshot or PDF
   of the slip (photos are shrunk automatically) and can type the bank reference number.
2. **Pay at the salon**: cash or card at the front desk.

The salon checks each slip in the dashboard and **approves** or **rejects** it (with a reason the customer
sees). Staff can also mark a ticket as paid by cash or card.

## Salon dashboard tabs

| Tab | What staff can do |
|---|---|
| Queue | Call next, start, finish, no-show, cancel, restore; add walk-in customers; search; open ticket details to change service/stylist |
| Payments | Slips waiting for approval, view slip, approve/reject, mark cash/card, filter by status, today's totals |
| Messages | Unread badge, mark read/unread, reply by email, mark replied, delete, search |
| Services | Add, edit, delete or hide services; change prices and durations |
| Reports | Customers, served, average wait, cancellations; popular services, stylist workload, payment methods; daily history; CSV download |
| Settings | Salon name, number of chairs, stylists, bank details, website announcement banner, clear everything |

The **Queue open / closed** button at the top stops new online bookings (walk-ins can still be added).

## Tech

- **Next.js** (React UI and API routes in one project) with **Tailwind CSS**
- **JSON storage**: the whole database is one JSON document (`src/lib/db.ts`). Payment slips are
  stored separately, one entry each, so the main document stays small.
  - Locally it is saved in `data/db.json` and `data/slips/` (created automatically).
  - On Vercel it is saved in a free **Upstash Redis** store, because Vercel's disk is read-only and
    files written there are lost. Slips are kept there for 30 days.
- Starting service menu: `src/data/services.json` (after the first run, edit services in the dashboard)
- Business contact details (phone, email, address, hours): `src/lib/site.ts`
- Starting salon settings (stylists, chairs, bank details): `defaultSettings` in `src/lib/site.ts`
  (after the first run, change them in the dashboard)

## Run it on your computer

Needs Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Put it online for free (Vercel)

1. Create a free GitHub account and a new **empty** repository (for example `venture-mind`).
2. Push this folder to it:
   ```bash
   git add .
   git commit -m "Venture Mind salon queue app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/venture-mind.git
   git push -u origin main
   ```
3. Go to https://vercel.com, sign up with GitHub, click **Add New → Project**, pick the repository,
   and click **Deploy**. You get a link like `https://venture-mind.vercel.app`.
4. **Keep the data (recommended):** in the Vercel project open **Storage → Create / Connect Database →
   Upstash (Redis)**, choose the free plan, and connect it to the project. Vercel adds the
   `KV_REST_API_URL` and `KV_REST_API_TOKEN` variables automatically. Then go to **Deployments** and
   **Redeploy**.
   Without this step the site still works, but the queue can reset at any time (the dashboard shows a warning).
5. Optional: in **Settings → Environment Variables** add `ADMIN_PASSCODE` with your own passcode, then redeploy.

Every later `git push` redeploys the site automatically.

## Before presenting

- Edit `src/lib/site.ts` with your group's real contact details (the current ones are placeholders).
- In Dashboard → Settings, put in the bank details you want to show (the defaults are placeholders).
- Log in to `/admin` and press **Reset queue** to start the demo at VM-001.
- Queue numbers restart automatically each day (Sri Lanka time).
