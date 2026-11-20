# P.I.L.O.T.

**Prospect Identification, Layout & Outreach Technology**: a lead engine for a local web design
and marketing agency. It finds local businesses with weak websites, builds each one a personalized
preview site, gives you the outreach scripts, and pings your phone when they look at it or ask for a quote.

> Working name. The product and agency names live in `src/lib/brand.ts`, so renaming is a one-line change.

## The four parts

| Part | Where | What it does |
|---|---|---|
| **P**rospect Identification | `/admin` → Find prospects | Searches Google Maps for a trade + city, checks every website, scores 0–100 |
| **L**ayout | `/p/<slug>` | A personalized preview of the business's new site (their name, phone, rating, trade) |
| **O**utreach | `/admin` → prospect card | Personalized cold email, call script, and follow-up text, plus pipeline status and notes |
| Inbound funnel | `/` | Your agency site: 3-step estimate form, server-side pricing, saved to DB, texted to you |

### How the pieces connect

```
Find "roofers in Columbus, WI"
   → Google Places: name, phone, website, rating, reviews
   → Website audit: loads? mobile? HTTPS? speed? quote form? tap-to-call? outdated?
   → Opportunity score (weak site + established business = high score)
   → Saved with a private preview link /p/abc123

You email/call using the generated script, which includes their preview link
   → They open it → 📱 "Sample Roofing just opened their preview. Good time to call."
   → They click "Make this my website" → estimate form pre-filled with their business name
   → 📱 "🔥 HOT NEW CLIENT LEAD (from your outreach!)" and the prospect moves to "Replied"
```

## Scoring

| Signal | Points |
|---|---|
| No website | +45 |
| Website is only a Facebook/Instagram page | +40 |
| Website doesn't load | +40 |
| Not mobile-friendly | +15 |
| No HTTPS | +12 |
| Loads slower than 3s | +10 |
| No quote/contact form | +10 |
| Copyright 3+ years old | +8 |
| No tap-to-call link | +5 |
| 25+ reviews / 10+ reviews (can afford you) | +12 / +8 |
| Fewer than 5 reviews (needs review help) | +5 |
| 4.5★+ with 10+ reviews (great reputation, weak site) | +3 |

Tune it in `src/lib/prospects/score.ts`. Each finding is written in plain English so it goes straight into the outreach.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in:
   - **Admin password:** `ADMIN_PASSWORD` (required in production; any username works).
   - **Supabase:** create a free project, run `supabase/schema.sql` in the SQL editor,
     then copy the project URL and the **service role** key.
   - **Google Places:** in Google Cloud, enable **Places API (New)**, create an API key, restrict
     it to that API, and **set a budget alert**. Requesting phone/website/rating fields is billed
     at a higher tier than a basic search. Google gives a monthly free allowance per tier, but check
     the current pricing page before running hundreds of searches.
   - **Alerts:** a Telegram bot (free, recommended) and/or Resend email.
3. Fill in `src/lib/brand.ts`, including `mailingAddress` (US law requires it in cold emails).
4. `npm run dev` → http://localhost:3000 (agency site) and http://localhost:3000/admin

Without a Places key in dev, "Find prospects" loads sample businesses so you can try the whole flow.

## Deploy (Netlify)

Same as the moving site: import the repo in Netlify, set the **base directory** to `pilot`,
and deploy. `netlify.toml` starts in **demo mode** (sample data, nothing saved or sent, admin open).
To go live, delete `NEXT_PUBLIC_DEMO_MODE` and add the environment variables.

## Outreach rules of the road (US)

- **Cold email** (CAN-SPAM): real name, honest subject, your mailing address, and honor "no thanks"
  right away. The template already does this. Send from your own mailbox, a few a day, personally.
  Don't blast hundreds from a fresh domain.
- **Cold calls** to business lines are fine. Check the National Do Not Call list if the number is a cell.
- **Cold texts**: don't. Texting a cell without consent can bring TCPA fines. The follow-up
  text template is for after they've said yes on a call or given you their number.
- Email security scanners sometimes open links automatically, so one preview view isn't always a human.
  Repeat views are a stronger signal.

## Before launch

- [ ] Fill in `src/lib/brand.ts` (agency name, phone, site URL, mailing address)
- [ ] Set real prices in `src/lib/inbound/pricing.ts`
- [ ] Add the moving site as your case study (`BRAND.caseStudy`) with real results once you have them
- [ ] Run `supabase/schema.sql`, set env vars, send yourself a test lead
- [ ] Search one trade in your town and contact your top 10 by score

## Roadmap

- Inbound leads view in `/admin` (they're saved in Supabase today)
- One-click "convert to client site": generate a real site from the preview template (reusing the moving-site codebase)
- Email sending + automatic follow-up sequence from the dashboard
- Multi-user / white-label: sell P.I.L.O.T. to other agencies as SaaS
