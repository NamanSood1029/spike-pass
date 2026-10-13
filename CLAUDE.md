# Sale Pass — build brief for Claude Code

## What this is
A clickable, demo-ready mobile prototype for the **Razorpay AI x PM Build Challenge (ISB), Track 1: "Razorpay in Your Pocket"**.
Submission deadline: **13 Oct 2026, 11:59 PM IST** (aim to freeze the build by 12:00 on 13 Oct). Individual entry.
Deliverables besides this prototype: one-page product note, 90-second demo video, AI build log.

## The product in one line
Sale Pass lets a small merchant tell Razorpay about a big sale (e.g. Diwali) in under two minutes from the phone, so a legitimate sales spike gets a question instead of a frozen settlement.

## Why (context for copy and decisions)
- Razorpay's own blog says a 10x festive or launch spike can look like fraud if the gateway wasn't told in advance, and advises emailing your account manager before campaigns that lift volume more than 2x. Most small merchants have no account manager.
- RBI's 2025 Payment Aggregator Directions require ongoing monitoring of merchant transactions against their business profile, so unexplained spikes get flagged.
- Raising a per-transaction limit is a web-dashboard form needing 100+ words of explanation plus an invoice upload.
- The Razorpay mobile app (redesigned Aug–Oct 2026) covers payments, settlements, QR and payment links; nothing for risk or sale preparation.
- Diwali is 8 Nov 2026; Razorpay data shows orders peak in the three weeks before Diwali.

## Persona (synthetic — label as such)
Meera, 34, runs "Meera's Diya House", a handcrafted diya and gift-hamper brand in Jaipur. Sells via Instagram and Shopify, collects with Razorpay payment links and checkout, runs everything from her phone. Normal month ~₹3 lakh; Diwali month ₹10–14 lakh; corporate gifting orders of ₹80,000–₹2 lakh in single payments. No account manager. Account 26 months old. Current per-transaction limit ₹50,000.

## Core flow (target: tap to "Declared" in under 2 minutes, mostly taps)
1. **Home** — redesigned-style Home with a Sale Pass card: "Diwali is 28 days away. Last year your sales were 3.4x in the three weeks before it. Tell us about this year's sale so your money keeps moving."
2. **Plan** — sale dates pre-filled (20 Oct – 8 Nov); expected lift pre-filled from last year's weekly history, editable via slider; "biggest single order you expect" (₹). If above the current limit, show one toggle: "Also raise my per-order limit" (reuses the same evidence; no extra form).
3. **Prove** — snap or upload a supplier invoice / stock photo; paste campaign link. AI extracts supplier, quantity, amount, date, and shows a plausibility line, e.g. "2,000 diyas at about ₹450 each supports roughly ₹9 lakh of sales." Weak proof = gentle hint, never a block. All extracted fields editable.
4. **Review** — AI-drafted note for Razorpay's risk team (English / Hindi toggle), also satisfying the 100-word limit explanation. Clear list of exactly what will be shared. Approve button.
5. **Declared** — Sale Pass card on Home: dates, declared lift, the promise "If your sale looks unusual, we'll ask you first." During the sale: actual-vs-declared meter; one tap to update the Pass if running well above.
6. *(Optional, static)* **Risk console** — one screen showing how the declaration lands with a Razorpay reviewer (context + attached proof). Used for ~5 s in the video.

## Product rules (must be reflected in UI copy)
- A declaration is **context, not an exemption**. Monitoring never switches off; it changes the first response to a flagged spike within the declared envelope (dates, lift, ticket size) from "hold" to "ask".
- Implausible declarations (e.g. 20x with thin proof) show "Under review" instead of "Declared".
- Merchant approves everything before it's shared; AI never decides holds.

## Deliberately NOT building
Risk scoring; post-hold release flow; automatic spike detection by an agent; Amazon/Flipkart sales; web version; real Razorpay account data.

## Tech
- Mobile-first web app shown inside a phone frame (≈390×844), React + Tailwind (Vite or Next.js). Deploy to Vercel.
- **One real AI path**: Claude API with vision for (a) invoice field extraction and (b) drafting the risk note in English/Hindi. Keep the API key server-side (serverless route), never in client code.
- **Every AI call has a pre-baked fallback response** so the demo never breaks on camera (toggle via env or a hidden "demo mode").
- Visible timer from first tap on the Home card that stops on "Declared" (for the video: ~1 min 40 s).
- Look: calm white, one blue accent, matching the feel of the new Razorpay app. Label "Concept prototype". Do not copy Razorpay logo files.

## Synthetic data to generate
- `data/merchant.json` — profile above.
- `data/weekly_sales.json` — 18 months of weekly sales with a ~3.4x ramp in the three weeks before Diwali 2025 (20 Oct 2025).
- `public/sample-invoice.png` — supplier invoice for 2,000 diyas, clearly watermarked **SAMPLE**.
- A campaign link placeholder (Instagram post URL).
All data is synthetic and must be disclosed as such in the submission.

## Acceptance checklist
- [ ] Full flow runs end to end on a real phone via the Vercel URL
- [ ] Median run under 2 minutes, timer visible
- [ ] Invoice extraction + note drafting work live, with fallbacks
- [ ] Hindi toggle works on the note
- [ ] Limit toggle appears only when biggest order > ₹50,000
- [ ] "Under review" state reachable by entering an extreme lift
- [ ] No secrets in client bundle; README lists tools, APIs, and that data is synthetic

## Disclosures for the submission
Claude (research, code, copy), Claude Code (prototype), Claude API (live invoice reading and drafting), Vercel hosting, any design tool used; all merchant data synthetic.
