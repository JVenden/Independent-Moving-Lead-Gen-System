# Google Business Profile + Local SEO Playbook

The highest-ROI free lead channel for a small mover. Most of the work is
consistency: real photos, steady reviews, matching business info everywhere.
Expect noticeable calls from Google within roughly 3–6 weeks if reviews and photos are strong.

> Where the website already supports a step, it's marked **[site]**.

## Week 1: Claim and optimize Google Business Profile

- [ ] Claim the profile at business.google.com with the exact business name, phone, and service area.
      Copy these into `src/lib/business.ts` **[site]** so the website matches character for character.
- [ ] Primary category: **Moving Company** (or "Moving and Storage Service").
      Secondary: **Laborer**, **Packing Service**.
- [ ] Service area: only the cities/ZIPs actually served. Don't overreach.
      Keep `areasServed` in `business.ts` and `src/lib/zips.ts` in sync **[site]**.
- [ ] Hours, website URL (the new landing page), and a description using natural keywords:
      "local labor-only movers", "same-day moving help", "apartment & house moves".
- [ ] Upload 15–20 **real** photos: truck, crew, uniforms, equipment, before/after. No stock photos.
- [ ] Turn on messaging; set the booking link to the site's form.
- [ ] Post 2–3 times a week: job photos, "available this weekend", specials.

## Weeks 2–4: Reviews and the Local Pack

- [ ] In GBP, get the "Ask for reviews" link and paste it into `googleReviewUrl` in `business.ts`.
      Then **yoursite.com/review** redirects straight to it **[site]**: short and easy to text.
- [ ] After every completed job, text the customer: *"Thanks for moving with us! Would you leave a quick
      review? yoursite.com/review"*. Same day works best.
- [ ] Goal: 10–15 reviews in the first 60 days. Reply to **every** review, good or bad.

## Local SEO pages **[site]**

Add entries in `src/content/locations.ts`; each becomes a page with the quote form pre-filled
(service + ZIP), FAQ structured data, and a footer link. Pages marked `draft: true` aren't
published, so you can prepare them safely.

Suggested URL patterns:
- `/labor-only-movers-<city>-<state>`
- `/apartment-movers-<city>-<state>`
- `/same-day-movers-<city>-<state>`

Each page needs a unique H1 and **300–500 words of genuinely local content** written from real
experience (neighborhoods, complexes, parking/stairs quirks, typical jobs), plus real photos.
Pages that only swap the city name are treated as spam by Google and can hurt the whole site.
Start with 2–3 strong pages for the main towns rather than 20 thin ones.

## Citations and NAP consistency

- [ ] List the business on Apple Business Connect (Apple Maps), Bing Places, Yelp, Nextdoor, Facebook.
- [ ] Name, Address, Phone must match **exactly** everywhere, including the site footer and
      structured data, both generated from `business.ts` **[site]**.
- [ ] Optional: a free BrightLocal or Moz Local check, or manually cover the top ~15 directories.

## Content and authority (low effort)

- Google Posts plus short phone videos of real moves (YouTube Shorts / Reels).
- Seed GBP Q&A with common questions: "Do you provide the truck?", "How much for a 2-bedroom?"
  Reuse the same answers in the `faqs` of the location pages **[site]**.

## Track what's working

Every lead stores `source` ("How did you hear about us?") in Supabase. Once a month:

```sql
select source, count(*) as leads,
       count(*) filter (where status = 'booked' or status = 'completed') as booked
from leads
where created_at > now() - interval '30 days'
group by source order by leads desc;
```
