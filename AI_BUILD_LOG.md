# Spike Pass — AI Build Log

**Razorpay AI x PM Build Challenge · Track 1: Razorpay in Your Pocket · Naman Sood**
Prototype: [spike-pass.vercel.app](https://spike-pass.vercel.app)

Spike Pass was built through close collaboration between me and AI. Claude gave me speed: it researched, drafted and coded quickly. I gave the work its direction and its truth: I questioned its suggestions, checked them against my own research, spoke to real sellers, and made the product calls. Several of Claude's early ideas didn't survive that checking. The ones that did are stronger for it.

---

## 1. AI tools and models used

| Tool | Model | How I used it |
| --- | --- | --- |
| **Claude** (claude.ai, with web search) | Opus 5.5 | My main thinking partner: researching Razorpay, brainstorming and pressure-testing ideas, drafting the playbook, build brief and product note, and fact-checking |
| **Claude Code** | Opus 5.5 | Building the prototype with me from a brief we wrote together (`CLAUDE.md`) |
| **Claude API** | Opus 5.5 | A reference integration for the AI steps (reading the invoice and drafting the note to Razorpay's risk team). It's in the repo but switched off in the demo, which simulates these steps (see section 5). |
| **Gemini Pro** | Gemini Pro | An independent second opinion on the product note and the build, so the work wasn't only reviewed by the model that helped write it |
| **Vercel** | — | Hosting the prototype |

---

## 2. Key prompts, workflows and agent setup

### Workflow

```
My research + Claude's research on Razorpay and the merchant
   → Claude proposes ideas → I check them against what already exists → most are dropped
   → Spike Pass survives → I talk to 3 local sellers to confirm the pain
   → Claude and I write the CLAUDE.md brief → Claude Code and I build the prototype → deployed on Vercel
   → I review the prototype screen by screen at phone size and iterate
   → Claude and I draft the product note → line-by-line fact-check → one-page layout
   → Gemini Pro critiques the note and build → Claude and I triage → I decide what to take
```

### Agent setup: the CLAUDE.md brief

To carry our research into the coding agent, Claude and I wrote a brief. Claude Code built from it. It specified:

- **Persona:** a synthetic Jaipur diya and gift-hamper seller who runs the business from her phone, has no account manager and has a ₹50,000 per-order limit.
- **Core flow:** Home card → plan (pre-filled from past sales) → proof (invoice photo, campaign link) → AI-drafted note → approve → declared. Target: under 2 minutes.
- **Product rules for the UI copy:** a declaration is "context, not an exemption"; monitoring never switches off; implausible declarations show "Under review"; the merchant approves everything; AI never decides holds.
- **Not building:** risk scoring, a release flow after a hold (Razorpay already has one), automatic spike detection, a web version, real Razorpay data.
- **Tech constraints:** mobile-first web app in a phone frame. The API key stays server-side. Every AI call has a pre-written fallback so the demo never breaks.
- **Acceptance checklist:** the flow runs end to end on a real phone, a visible timer, a Hindi toggle, the limit toggle only above ₹50,000, and no secrets in the client bundle.

### Key prompts (verbatim)

| What I was doing | Prompt | Result |
| --- | --- | --- |
| Challenging a suggestion I suspected already existed | "Is this register to autopay good? I hope they already don't have the tech" | Confirmed it already existed; idea dropped (see section 3) |
| Raising the bar for every idea after that | "Find the holes, reconfirm they are actually holes, and also think whether this is so generic that you would recommend it to anyone that asked for it." | Each candidate tested against existing products; Spike Pass survived |
| Checking sources | "What even are your hyperlinks, like the review one … takes us to a course, nothing related to the actual sentence??" | Every link re-checked against its sentence; weak sources replaced |
| Demanding fresher evidence | "Do we not have like better data, than 2021 … Research on the web and come back." | Diwali 2025 data replaced old figures |
| Making it bulletproof | "Re-iterate over the document once more, fact checking every fact mentioned … no points of contention with actual facts." | Overstated claims softened or cut |
| Arguing the judge's side | "Can't the judges grill me on this for fraud … is there a way to make a more bullet-proof point?" | A layered fraud answer (see section 3) |
| Triaging Gemini's critique | I pasted Gemini Pro's teardown and asked Claude to "go through and analyze if there's good feedback to incorporate" | Taken: a fallback for missing proof, bust-out fraud eligibility, a business metric. Rejected: replacing the AI note with structured data |

---

## 3. AI outputs I rejected or corrected, and why

### Main example: Claude's early ideas were "gaps" that weren't gaps

**What AI suggested.** In the ideation phase, Claude proposed several product ideas framed as unmet needs. One was an **AutoPay onboarding flow**: helping merchants get customers registered for recurring payments.

**Why I rejected it.** It sounded too obvious to be unbuilt. I asked directly whether the technology already existed, and checked for myself. It did: **RocketPay, EduOpus and PhonePe already offer it.** The "gap" was a gap in the AI's research, not in the market.

The same pattern came up elsewhere. AI-powered recovery ideas for Track 2 overlapped with recovery agents Razorpay already offers in Agent Studio, so I didn't pursue that direction either.

**What I changed.** I stopped accepting "gaps" at face value and set a stricter test for every idea: *find the holes, reconfirm they're real, and admit whether it's generic.* Spike Pass came out of that process. Before building on it, I made sure each piece of the gap held up against Razorpay's own material:

| What we checked | What we found | Source |
| --- | --- | --- |
| Does Razorpay already offer a heads-up before a spike? | Only as advice: email your account manager before a campaign that more than doubles sales. Sellers without an account manager have no self-serve way to do it. | [Razorpay blog](https://razorpay.com/blog/what-to-do-when-your-payment-gateway-account-is-frozen/) |
| Could checks simply be switched off for festive sellers? | No. RBI's 2025 rules require ongoing monitoring, so a Pass must feed monitoring, not bypass it. | [AZB & Partners on RBI PA Directions 2025](https://www.azbpartners.com/bank/rbi-issues-consolidated-reserve-bank-of-india-regulation-of-payment-aggregators-directions-2025/) |
| How does a seller raise a limit today? | A dashboard form needing a 100-word reason and a sample invoice. | [Razorpay docs](https://razorpay.com/docs/payments/dashboard/account-settings/transaction-limits/) |
| Is Razorpay moving toward ask-first reviews? | Yes. Since February 2026, "Needs Clarification" is separate from "Funds on Hold". Spike Pass gives reviewers what they need to ask first. | [Razorpay Engineering](https://engineering.razorpay.com/our-obsession-with-merchant-experience-breaking-the-risk-review-black-box-7fa38d699ef1) |

I then spoke with 3 local sweets and Diwali-goods sellers myself to confirm the pain was real before writing a line of the product note.

### Second example: a fraud line that created the risk it was meant to remove

Claude wrote this for the product note:

> **A heads-up, not a free pass.** Risk rules don't change. A flag within the plan goes to Razorpay's existing "Needs Clarification" review, where settlements keep running, not a hold. Monitoring never switches off.

It was technically accurate, but I saw the question a judge would ask: *"So a fraudster gets a Pass, the money keeps settling, and they disappear before the chargebacks arrive?"* I pushed back. Together we rebuilt the point around separating a sales spike from fraud signals, and I finalised the wording:

> **Heads-up signal, not a free pass:** The Pass explains a sales jump but never excuses fraud. Within the plan, Razorpay's team can ask first instead of holding money. Signs of fraud itself, like chargebacks or a changed bank account, still trigger normal holds.

I also added an eligibility rule: only accounts with 6+ months of clean history can create a Pass, which blocks bust-out fraud.

### Other corrections, in brief

- **A link that didn't support its claim.** A claim about review times was backed by an online course page. I caught it, and it was replaced with Razorpay's own guide.
- **Stale data.** I pushed for figures newer than 2021; we moved to Diwali 2025 data.
- **Overstated claims.** "Small sellers don't have account managers", "laptop-only" and "reviews take 30+ days" were all softened to what the sources say.
- **A redundant rule.** "Passes above 4x get a human review first" repeated "humans make every decision". I spotted it, and it became the real control: those Passes don't go live until Razorpay approves them.
- **A Gemini suggestion I rejected.** Gemini proposed replacing the AI note with structured risk data (for example `Confidence_Score: 85%`). Without Razorpay's internal risk models I couldn't scope that honestly, so I kept the note and made it work in local languages.
- **Jargon.** I rejected phrases like "tracks against the plan" and "meter" in favour of plain words.

The checking ran both ways. Claude caught my mismatch between "2–3x" and the sellers' "200–300%", my missing source links, and grammar errors in my edits.

---

## 4. What AI contributed vs what I contributed

| Stage | Claude's contribution | My contribution |
| --- | --- | --- |
| Research | Fast, broad research on Razorpay, the tracks and merchant pain points | My own research, and deciding which findings mattered |
| Ideas | Proposed a range of ideas | Disproved several by confirming they already existed; set the stricter test; chose Spike Pass |
| User research | Helped frame what to ask | Spoke with 3 local sellers myself; their experience anchors the problem |
| Framing | Drafted the problem and the "why Razorpay" story | Made Diwali an example rather than the hook; renamed Sale Pass to Spike Pass; reframed "Razorpay's gaps" as "where Spike Pass fits" |
| Build | Co-wrote the brief; Claude Code wrote the code | Set the scope, product rules and not-building list; reviewed and iterated the prototype until the flow felt right |
| Product note | Drafted sections, fact-checked links, managed the one-page layout | Set the story; rewrote the solution and problem in my own words; collapsed the journey into one paragraph because the video shows it; made the final edits |
| Review | Triaged Gemini's critique with me | Ran the external review, stress-tested the fraud answer, and decided what to accept |

---

## 5. Known limitations, risks and verification steps

### Limitations

- **Prototype data is synthetic.** The merchant profile, 18 months of sales history and the invoice (watermarked SAMPLE) are all generated. No real Razorpay data is used.
- **AI steps are simulated in the demo.** Invoice reading and note drafting run on built-in sample responses, and the app labels them "Simulated AI". This was a deliberate scoping choice: in production, Razorpay would run these steps on its own models. Working Claude API routes are in the repo (`api/`), switched off by default.
- **Small, offline user research.** I spoke with 3 local sweets and Diwali-goods sellers. Their quote is about bank freezes; Razorpay's own guide describes the same pattern for payment gateways. I didn't interview online D2C sellers directly.

### Risks and untested assumptions

- **Riskiest assumption:** that Razorpay's risk system can actually use a seller's declaration. I'd validate this with Razorpay's risk team first, then pilot with a matched control group.
- **The thresholds are product choices, not Razorpay figures:** 6 months of clean history, 25% headroom over the plan, and the 4x review trigger. All are v1 starting points to tune.
- **Fraud risk:** someone could try to make fraudulent volume look planned. The safeguards are eligibility rules, proof requirements, fraud signals that still trigger holds, and human decisions. The guardrail metric checks that chargebacks during a Pass are no higher than in a control group.
- **AI reading errors:** handwritten bills may be misread. The user reviews and edits everything AI extracts before anything is shared.

### Verification steps

- Checked AI-proposed "gaps" against existing products before building; several were dropped.
- Opened every cited source and checked that it supports its exact sentence; replaced a weak one.
- Replaced old data with the most recent available (Diwali 2025).
- Ran line-by-line fact-checks of the product note and softened any claim stronger than its source.
- Rendered the note after each edit to confirm it stayed one page.
- Tested the deployed prototype at phone size, screen by screen.
- Used Gemini Pro as an independent reviewer, so the work wasn't only checked by the model that helped write it.

### Sources

- [Razorpay: what to do when your payment gateway account is frozen](https://razorpay.com/blog/what-to-do-when-your-payment-gateway-account-is-frozen/)
- [Razorpay docs: transaction limits](https://razorpay.com/docs/payments/dashboard/account-settings/transaction-limits/)
- [Razorpay Engineering: breaking the risk review black box (Feb 2026)](https://engineering.razorpay.com/our-obsession-with-merchant-experience-breaking-the-risk-review-black-box-7fa38d699ef1)
- [AZB & Partners: RBI Payment Aggregator Directions 2025](https://www.azbpartners.com/bank/rbi-issues-consolidated-reserve-bank-of-india-regulation-of-payment-aggregators-directions-2025/)
- [EasyEcom: Diwali 2025 report](https://www.easyecom.io/resources/reports/diwali-2025)

*No API keys, credentials, private data or proprietary information are included in this log.*
