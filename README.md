# Independent Moving Lead Gen System

A near-zero-cost web app for a small moving company to capture its own local leads
instead of paying a moving-labor marketplace for dispatched jobs. Customers get an
instant price estimate; the lead is saved to a database and dispatch gets an
instant phone alert.

## How it works

```
Customer fills 3-step form ──▶ POST /api/leads
                                 1. Validate (same Zod schema as the browser)
                                 2. Price it   (src/lib/pricing.ts)
                                 3. Save it    (Supabase — never lose a lead)
                                 4. Alert      (Telegram and/or email-to-SMS)
                               ◀── returns quote → shown to customer
```

## Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + lightweight Shadcn-style primitives (no Radix dependency)
- **Validation:** Zod + React Hook Form (shared client/server schema, per-step validation)
- **Backend / API:** Next.js serverless API route
- **Storage:** Supabase (free tier), via its REST API — no SDK needed
- **Notifications:** Telegram bot (free, recommended) and/or email-to-SMS via Resend (backup)

## Project layout

| Path | What it does |
|---|---|
| `src/lib/schema.ts` | Form fields + validation rules (shared by browser and API) |
| `src/lib/pricing.ts` | Quote formula — **all numbers are placeholders, tune to real rates** |
| `src/lib/zips.ts` | ZIP → coordinates for the service area (used for distance pricing) |
| `src/lib/db.ts` | Saves leads to Supabase |
| `src/lib/notify.ts` | Sends the lead alert to dispatch |
| `src/app/api/leads/route.ts` | Validate → price → save → alert |
| `src/components/lead-form/*` | The 3-step wizard |
| `supabase/schema.sql` | Run once in Supabase to create the `leads` table |

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in:
   - **Supabase:** create a free project, run `supabase/schema.sql` in the SQL editor,
     then copy the project URL and **service role** key (Settings → API).
   - **Telegram alerts:** message `@BotFather` → `/newbot` → copy the token. Send your bot
     a message, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` to find your `chat.id`.
   - **Email-to-SMS (optional):** needs a domain verified in Resend. Note AT&T shut its
     gateway down in 2025 and others are unreliable — use as a backup only.
3. `npm run dev` → http://localhost:3000

Without Supabase/alert settings, dev mode still works: leads are printed to the terminal.
In production, a missing Supabase config makes the API return an error rather than silently drop leads.

## Before launch

- [ ] Replace the placeholder prices in `src/lib/pricing.ts` with the owner's real rates
- [ ] Fill `src/lib/zips.ts` with the ZIP codes actually served (unknown ZIPs get flagged `needs_review`)
- [ ] Set `NEXT_PUBLIC_BUSINESS_PHONE`
- [ ] Deploy on a host whose free tier allows commercial use (e.g. Netlify, Cloudflare).
      Vercel's free Hobby plan is non-commercial only.
- [ ] Send a test lead and confirm it lands in Supabase and on the phone

## Roadmap ideas
- Owner dashboard to move leads through `new → contacted → quoted → booked → completed`
- Auto-text the customer their quote (Twilio; requires A2P 10DLC registration)
- Deposit / booking calendar to lock in dates
- Review requests after completed jobs (Google reviews drive free leads)
- Compare `quote_min/max` vs `final_price` to tune the pricing formula
