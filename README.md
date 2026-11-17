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
  - Online it is saved in a free **Upstash Redis** database, because hosting disks are wiped on every
    redeploy or restart. Slips are kept there for 30 days.
- Starting service menu: `src/data/services.json` (after the first run, edit services in the dashboard)
- Business contact details (phone, email, address, hours): `src/lib/site.ts`
- Starting salon settings (stylists, chairs, bank details): `defaultSettings` in `src/lib/site.ts`
  (after the first run, change them in the dashboard)

## Run it on your computer

Needs Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Put it online for free (Render + Upstash)

The code is on GitHub. Render hosts the website and Upstash keeps the data. Both are free and need
no credit card.

### 1. Create the database (Upstash)

1. Go to https://upstash.com and sign up (Google or GitHub login works).
2. Click **Create Database** → type **Redis**. Name: `venture-mind`. Choose the region closest to
   your Render region (for example Singapore). Plan: **Free**. Create it.
3. Open the database and find the **REST API** section. Keep this page open; you need the
   `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` values in the next step.
   The token is a secret: don't share it or put it in the code.

### 2. Create the website (Render)

1. Go to https://render.com and sign up with **GitHub** (the account that owns the repository).
2. Click **New → Web Service**, connect GitHub if asked, and pick the `venture-mind` repository.
3. Fill in:
   - **Language / Runtime:** Node
   - **Branch:** `main`
   - **Region:** Singapore (closest to Sri Lanka)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** **Free**
4. Under **Environment Variables** add three:

   | Key | Value |
   |---|---|
   | `UPSTASH_REDIS_REST_URL` | copied from Upstash |
   | `UPSTASH_REDIS_REST_TOKEN` | copied from Upstash |
   | `ADMIN_PASSCODE` | your own dashboard passcode |

5. Click **Create Web Service**. The first build takes a few minutes. You get a link like
   `https://venture-mind-xxxx.onrender.com`.

### 3. Check it

- Open `/admin` and log in with your passcode. There should be **no** yellow "temporary storage"
  warning. If there is, check the two Upstash values in Render → **Environment**, then
  **Manual Deploy → Deploy latest commit**.

### Good to know

- **Free sites sleep** after 15 minutes without visitors. The next visit takes about a minute to wake
  it up, so open the site a minute before presenting.
- Every `git push` to `main` redeploys the site automatically.
- To change the passcode: Render → **Environment** → edit `ADMIN_PASSCODE` → save (it redeploys).
- Vercel also works (the code supports it), but its sign-up may ask for SMS verification, which is
  not available for Sri Lankan numbers.

## Before presenting

- Edit `src/lib/site.ts` with your group's real contact details (the current ones are placeholders).
- In Dashboard → Settings, put in the bank details you want to show (the defaults are placeholders).
- Log in to `/admin` and press **Reset today's queue** to start the demo at VM-001.
- At midnight (Sri Lanka time) the day closes automatically: totals go to Reports → Daily history,
  finished tickets are cleared, and unfinished customers carry over to the next day with new numbers.
