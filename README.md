# Spike Pass

**Grow fast without getting frozen.** A concept prototype for the **Razorpay AI x PM Build Challenge (ISB), Track 1: "Razorpay in Your Pocket"** by Naman Sood.

🔗 **Live prototype:** https://spike-pass.vercel.app (best on a phone; on a laptop it opens in a phone frame)
📓 **AI build log:** [AI_BUILD_LOG.md](AI_BUILD_LOG.md)

> Concept prototype, not an official Razorpay product. All merchant data is synthetic, and the AI steps are simulated in the demo (see [AI integration](#ai-integration)).

---

## Contents
1. [The problem](#the-problem)
2. [The solution](#the-solution)
3. [Product rules](#product-rules)
4. [Features](#features)
5. [Demo guide](#demo-guide)
6. [AI integration](#ai-integration)
7. [Tech stack and project structure](#tech-stack-and-project-structure)
8. [Run it locally](#run-it-locally)
9. [Synthetic data](#synthetic-data)
10. [Assumptions and limitations](#assumptions-and-limitations)
11. [Sources](#sources)
12. [Tools used](#tools-used)

---

## The problem
Small sellers grow in bursts: festive sales, launches, viral reels, big corporate orders. To a risk system, a sudden jump looks suspicious. Razorpay's own guide says a 10x festive or launch spike can look like fraud if the gateway wasn't told in advance, and it advises emailing your account manager before campaigns that more than double volume. Most small sellers don't have an account manager. Their best week of the year can become the week their money is held.

## The solution
**Spike Pass** is a two-minute flow in the Razorpay app. A seller tells Razorpay about a big sale *before* it starts, so a legitimate spike gets a question instead of a freeze.

| Step | What happens |
|---|---|
| **1. Home** | The app suggests a Pass ahead of a past spike ("Diwali is 26 days away, last year your sales were 3.4x"). Or the seller starts one anytime. |
| **2. Plan** | Last year's plan is pre-filled (dates, expected jump, biggest order) and editable. If the biggest order is above the per-order limit, one switch also requests a higher limit. |
| **3. Prove** | The seller adds a supplier invoice, handwritten bill or bulk order, plus an optional campaign link. AI reads it and fills in the details. A plausibility line checks that the stock supports the declared jump. |
| **4. Review** | AI drafts a note to Razorpay's risk team in English or Hindi. The note also serves as the 100-word limit-increase reason. The seller sees exactly what will be shared, edits, and approves. |
| **5. Declared** | "Spike Pass declared." Monitoring continues. Within the plan, Razorpay's team asks first instead of holding money. During the sale, a meter compares actual with declared sales, and one tap updates the Pass. |
| **6. Risk console** | A static view of how the Pass reaches a Razorpay reviewer: the plan, the proof, fraud signals, and a recommended first step. |

## Product rules
These are reflected in the UI copy and implemented as plain code in [`src/lib/spikepass.js`](src/lib/spikepass.js) (`RULES`, `decideStatus`, `withinPlan`). **AI never decides a status.**

| Rule | Value | Effect |
|---|---|---|
| Eligibility: earned, not open to all | 6+ months of clean history | Only eligible accounts can create a Pass (blocks bust-out fraud) |
| Review trigger | Declared jump above **4x** | The Pass doesn't go live until Razorpay approves it |
| Missing or unreadable proof | No proof, or proof that can't be read | The Pass doesn't go live until Razorpay approves it |
| Thin proof | Declared jump above 1.5x what the stock supports | The Pass doesn't go live until Razorpay approves it |
| Large limit request | Per-order limit above ₹2,50,000 | Needs a manual check |
| "Within the plan" | Actual jump up to **25%** above the declared jump | The reviewer's recommended first step is to ask the seller, not hold |
| Heads-up, not a free pass | Always | Signs of fraud, like chargebacks or a changed bank account, still trigger normal holds |
| Human in the loop | Always | AI reads and drafts; Razorpay's team makes every hold and limit decision |

**Plausibility maths.** An invoice shows *cost*, so supported sales = quantity × the seller's usual selling price. Example: 2,000 diyas bought at ₹180 and sold at ₹450 support about ₹9 lakh, or about 4x a normal 20 days.

## Features
- **Smart suggestion**: a Home card built from last year's weekly sales, with a bar chart of the festive ramp
- **Start anytime**: a Pass for launches, viral reels or bulk orders, without last year's numbers
- **Pre-filled plan**: dates, expected jump (slider) and biggest order, all editable
- **One-toggle limit request**: shown only when the biggest order is above the ₹50,000 limit; reuses the same proof
- **Proof reading**: invoice, handwritten bill or bulk order; every extracted field is editable
- **Plausibility check**: "2,000 diyas at about ₹450 each support roughly ₹9 lakh of sales"
- **Bilingual note**: English and Hindi (हिंदी), with a word count for the 100-word limit reason
- **Consent screen**: "Exactly what will be shared with Razorpay"
- **Declared and Under-review states** with the reasons spelled out
- **During-sale meter** with one-tap Pass update
- **Reviewer console**: within-plan → ask first; above plan → review against the proof
- **Visible timer** from the first tap to "Declared" (a full run takes about a minute)
- **Razorpay look**: colours and type from Razorpay's open-source [Blade](https://github.com/razorpay/blade) design tokens (azure #1364F1, Inter + TASA Orbiter). No Razorpay logos or assets are used.

## Demo guide
- **Hidden demo controls**: triple-tap the **Concept prototype** label to open them.
  - **Simulated AI**: on by default; turn it off to call the reference Claude routes
  - **Fast-forward to 30 Oct**: shows the during-sale meter (4.4x actual vs 3.4x declared, then "Update my Pass to 4x")
  - **Reset demo** and **Risk console**
- **URL parameters**: `?today=2026-10-13` pins the date for the "days away" line; `?live=1` starts with live AI on.
- **Shortcuts**: "Use the sample supplier invoice" and "Paste my latest Instagram post" keep a run under two minutes.

## AI integration
The two AI steps, reading the proof and drafting the note, are **simulated by default**. This was a deliberate scoping decision: the prototype shows the flow, the rules and the trust contract, and in production these steps would run on Razorpay's own models. The UI labels them honestly ("Simulated AI reading", "Simulated AI draft").

- **Simulated reading** knows the bundled sample invoice. For any other photo, it leaves the fields for the seller to type, and that Pass goes to review as unreadable proof.
- **Simulated draft** is a template in English and Hindi, filled with the seller's own numbers.
- **Reference live integration** (off by default) is in [`api/`](api), as Vercel serverless functions using the official Anthropic SDK:
  - [`api/extract.js`](api/extract.js): vision, reads the invoice into JSON fields
  - [`api/draft.js`](api/draft.js): drafts the English and Hindi notes in one call
  - [`api/_claude.js`](api/_claude.js): shared client (Claude Opus 5.5, low effort, server-side refusal fallback)
  - To enable it, set `ANTHROPIC_API_KEY` as a server-side environment variable and open the app with `?live=1`. The key is never sent to the browser. Every live call times out (12 s / 18 s) and falls back to the simulated response.

## Tech stack and project structure
**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · lucide-react icons · Vercel (hosting and serverless functions) · Node test runner · ESLint 9

```
├── api/                    Reference serverless AI routes (off by default)
│   ├── _claude.js          Shared Anthropic client helper
│   ├── extract.js          POST /api/extract: invoice → fields
│   └── draft.js            POST /api/draft: facts → { en, hi } note
├── data/                   Synthetic data (merchant profile, 79 weeks of sales)
├── public/
│   └── sample-invoice.png  Synthetic supplier invoice, watermarked SAMPLE
├── scripts/
│   ├── gen-data.mjs        Regenerates data/ (seeded, deterministic)
│   └── gen-invoice.py      Renders the sample invoice (Pillow, macOS fonts)
├── src/
│   ├── App.jsx             App shell: phone frame, state, timer, demo controls
│   ├── components/ui.jsx   Shared UI primitives (Button, Card, Toggle, …)
│   ├── lib/
│   │   ├── spikepass.js    Product rules, plausibility maths, formatting, note templates
│   │   ├── ai.js           AI client: simulated by default, live with fallback
│   │   └── image.js        In-browser photo resize before upload
│   └── screens/            Home, Plan, Prove, Review, Declared, RiskConsole
├── tests/rules.test.mjs    Tests for the status rules and note templates
├── AI_BUILD_LOG.md         How AI was used to build this
└── CLAUDE.md               The original build brief given to Claude Code
```

## Run it locally
Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173 (simulated AI, no key needed)
npm test           # status-rule tests (node:test)
npm run lint       # ESLint
npm run build      # production build in dist/
```

Optional live AI: `cp .env.example .env.local`, add `ANTHROPIC_API_KEY`, run `npm run dev`, and open `http://localhost:5173/?live=1`. In dev, `/api/*` is served by the same handlers Vercel deploys.

**Deploy:** import the repo into Vercel (framework preset: Vite). `api/` deploys as serverless functions automatically.

## Synthetic data
Everything is made up and disclosed as such.
- [`data/merchant.json`](data/merchant.json): Meera's Diya House, Jaipur. Handcrafted diyas and gift hampers; 26-month-old account; no account manager; ₹50,000 per-order limit.
- [`data/weekly_sales.json`](data/weekly_sales.json): 79 weeks (Apr 2025 – Oct 2026) with a measured 3.4x ramp in the three weeks before Diwali 2025. Regenerate with `npm run data`.
- [`public/sample-invoice.png`](public/sample-invoice.png): 2,000 terracotta diyas at ₹180 from a fictional supplier, watermarked SAMPLE, with a non-real GSTIN. Regenerate with `npm run invoice`.
- Campaign link: a placeholder Instagram URL.

## Assumptions and limitations
- The core proposal, that Razorpay changes its first response to a within-plan spike from "hold" to "ask", is a product proposal, not current policy.
- The thresholds (6 months, 4x, 25% headroom, 1.5x proof, ₹2.5L) are v1 product choices to tune with Razorpay's risk team, not Razorpay figures.
- A person at Razorpay reviews Under-review Passes and limit requests. No turnaround time is promised.
- The during-sale meter uses a simulated 4.4x actual jump; the risk console is a static concept view.
- AI steps are simulated in the demo (see above). Real-world reading of handwritten bills would need validation.

## Sources
- Razorpay blog: [What to do when your payment gateway account is frozen](https://razorpay.com/blog/what-to-do-when-your-payment-gateway-account-is-frozen/) (10x spikes can look like fraud; email your account manager before campaigns above 2x)
- Razorpay docs: [Transaction limits](https://razorpay.com/docs/payments/dashboard/account-settings/transaction-limits/) (a limit increase needs a 100+ word reason and a sample invoice)
- RBI: [Regulation of Payment Aggregators Directions, 2025](https://rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896), para 13(h) (monitor merchant transactions against their business profile)
- Razorpay Engineering: [Breaking the risk review black box](https://engineering.razorpay.com/our-obsession-with-merchant-experience-breaking-the-risk-review-black-box-7fa38d699ef1)
- Razorpay Blade design system: [github.com/razorpay/blade](https://github.com/razorpay/blade) (colour and type tokens)

## Tools used
Claude (research, writing, fact-checking) · Claude Code (built this prototype) · Claude API (reference integration in `api/`, off in the demo) · Gemini Pro (independent review) · Vercel (hosting). Full detail in the [AI build log](AI_BUILD_LOG.md).

*No API keys, credentials or real merchant data are included in this repository.*
