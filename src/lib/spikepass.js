// Core Spike Pass logic: synthetic data, the plausibility maths and the Declared / Under review rule.
// Kept deliberately simple and deterministic: AI reads documents and drafts words, it never decides status.
import merchant from "../../data/merchant.json" with { type: "json" };
import sales from "../../data/weekly_sales.json" with { type: "json" };

export { merchant, sales };

const DAY = 86400000;
export const LAST_YEAR_LIFT = sales.summary.lastYearLift; // 3.4
export const WEEKLY_BASELINE = sales.summary.recentBaselineWeekly;
export const LIMIT = merchant.perTransactionLimit; // 50,000
export const SIMULATED_ACTUAL_LIFT = 4.4; // the "during the sale" demo: actual sales running at 4.4x normal

// The rule, in one place (also written into the product note):
export const RULES = {
  maxLift: 4, // the review trigger: Passes declaring more than 4x don't go live until Razorpay approves them
  planHeadroom: 1.25, // "within the plan" = actual sales up to 25% above the declared jump
  proofHeadroom: 1.5, // with proof, declared lift may be up to 1.5x what the stock supports
  minAccountMonths: 6, // only accounts with 6+ months of clean history can create a Pass (product note: "earned, not open to all")
  maxLimitAsk: 250000, // per-order limit asks above 5x the current limit go to a person
};

export const parseDate = (s) => new Date(`${s}T00:00:00`);
export const isoDate = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
export const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / DAY);

export function saleDays(plan) {
  return Math.max(1, daysBetween(plan.start, plan.end) + 1);
}

// What the merchant would normally sell over the same number of days
export function normalSales(plan) {
  return (WEEKLY_BASELINE * saleDays(plan)) / 7;
}

export function expectedSales(plan) {
  return normalSales(plan) * plan.lift;
}

// What the proof supports: units bought x the merchant's usual selling price
export function supportedSales(proof) {
  if (!proof?.quantity || !proof?.sellingPrice) return 0;
  return proof.quantity * proof.sellingPrice;
}

export function supportedLift(plan, proof) {
  const s = supportedSales(proof);
  return s ? s / normalSales(plan) : 0;
}

export function suggestedLimit(biggestOrder) {
  return Math.ceil(biggestOrder / 25000) * 25000;
}

// Returns { status: "declared" | "review", reasons: [...] }
export const isEligible = () => merchant.accountAgeMonths >= RULES.minAccountMonths;

// Is the actual jump still inside what was declared (plus headroom)? Drives the meter and the reviewer's first step.
export const withinPlan = (actualLift, declaredLift) => actualLift <= declaredLift * RULES.planHeadroom;

export function decideStatus(plan, proof) {
  const reasons = [];
  const hasProof = supportedSales(proof) > 0;
  const readable = hasProof && proof.confidence !== "low";
  const sLift = supportedLift(plan, proof);
  if (plan.lift > RULES.maxLift) reasons.push(`A ${fmtX(plan.lift)} lift is above the ${RULES.maxLift}x that we accept automatically.`);
  else if (hasProof && plan.lift > sLift * RULES.proofHeadroom)
    reasons.push(`Your proof supports about ${fmtX(sLift)}; you declared ${fmtX(plan.lift)}.`);
  // Product note: Passes with missing or unreadable proof don't go live until Razorpay approves them
  if (!hasProof) reasons.push("No proof attached. Razorpay's team will check your plan before the Pass goes live.");
  else if (!readable) reasons.push("Your proof couldn't be read clearly. Razorpay's team will check it before the Pass goes live.");
  if (plan.raiseLimit && plan.biggestOrder > LIMIT && suggestedLimit(plan.biggestOrder) > RULES.maxLimitAsk)
    reasons.push(`A per-order limit above ${fmtINR(RULES.maxLimitAsk)} needs a quick manual check.`);
  return { status: reasons.length ? "review" : "declared", reasons };
}

// ---------- formatting ----------
export const fmtINR = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
export function fmtLakh(n) {
  const l = (n || 0) / 100000;
  return `₹${l >= 10 ? Math.round(l * 10) / 10 : Math.round(l * 100) / 100} lakh`;
}
export const fmtX = (x) => `${Math.round((x || 0) * 10) / 10}x`;
export function fmtDay(s, withYear = false) {
  return parseDate(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
}
export const fmtTimer = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
export const wordCount = (t) => (t || "").trim().split(/\s+/).filter(Boolean).length;

// ---------- the facts we send to the drafter (and use for the offline fallback) ----------
export function buildFacts(plan, proof, campaignLink) {
  const p = supportedSales(proof) ? proof : null;
  return {
    merchant: {
      owner: merchant.owner,
      business: merchant.business,
      category: merchant.category,
      city: merchant.city,
      sellsVia: merchant.channels,
      razorpayAccountAgeMonths: merchant.accountAgeMonths,
    },
    sale: { festival: plan.source === "new" ? null : merchant.festival.name, start: fmtDay(plan.start, true), end: fmtDay(plan.end, true), days: saleDays(plan) },
    lift: {
      declared: fmtX(plan.lift),
      lastYearSameWindow: plan.source === "new" ? null : fmtX(LAST_YEAR_LIFT),
      basis: plan.source === "new" ? "Merchant's own estimate" : "Razorpay weekly sales history, three weeks before Diwali 2025",
    },
    normalSalesSameWindow: fmtLakh(normalSales(plan)),
    expectedSales: fmtLakh(expectedSales(plan)),
    biggestSingleOrder: fmtINR(plan.biggestOrder),
    perOrderLimit: {
      current: fmtINR(LIMIT),
      increaseRequested: Boolean(plan.raiseLimit && plan.biggestOrder > LIMIT),
      requestedLimit: plan.raiseLimit && plan.biggestOrder > LIMIT ? fmtINR(suggestedLimit(plan.biggestOrder)) : null,
      reason: `Corporate ${plan.source === "new" ? "" : "Diwali "}gifting orders, usually ₹80,000 to ₹2 lakh, paid in a single payment`,
    },
    proof: p
      ? {
          type: "Supplier invoice",
          supplier: p.supplier,
          item: p.item,
          quantity: p.quantity,
          unitCost: fmtINR(p.unitCost),
          invoiceTotal: fmtINR(p.invoiceTotal),
          invoiceDate: p.invoiceDate ? fmtDay(p.invoiceDate, true) : null,
          usualSellingPrice: fmtINR(p.sellingPrice),
          salesThisStockSupports: fmtLakh(supportedSales(p)),
        }
      : null,
    campaignLink: campaignLink || null,
  };
}

// The simulated AI draft: a template filled with the merchant's own numbers. Also the fallback for live calls.
export function fallbackNote(f) {
  const lim = f.perOrderLimit;
  const pr = f.proof;
  const en = [
    `Hello Razorpay risk team, I'm ${f.merchant.owner} from ${f.merchant.business}, a ${f.merchant.category.toLowerCase()} business in ${f.merchant.city}. I've collected payments with Razorpay for ${f.merchant.razorpayAccountAgeMonths} months, through ${f.merchant.sellsVia.join(" and ")}.`,
    `I'm running a ${f.sale.festival ? `${f.sale.festival} ` : ""}sale from ${f.sale.start} to ${f.sale.end}. I expect sales of about ${f.lift.declared} my normal level, around ${f.expectedSales} against ${f.normalSalesSameWindow} usually.${f.lift.lastYearSameWindow ? ` Last year, in the same three weeks before ${f.sale.festival}, my sales were ${f.lift.lastYearSameWindow}.` : ""}`,
    pr
      ? `I've attached my supplier invoice from ${pr.supplier}${pr.invoiceDate ? ` dated ${pr.invoiceDate}` : ""}: ${pr.quantity.toLocaleString("en-IN")} pieces at ${pr.unitCost} each. At my usual price of ${pr.usualSellingPrice}, this stock supports about ${pr.salesThisStockSupports} of sales.${f.campaignLink ? " My campaign post is linked too." : ""}`
      : `${f.campaignLink ? "My campaign post is linked. " : ""}I can share supplier invoices if needed.`,
    lim.increaseRequested
      ? `I'd also like my per-order limit raised from ${lim.current} to ${lim.requestedLimit}. Corporate clients order ${f.sale.festival ? "Diwali " : ""}gift hampers in one payment, usually ₹80,000 to ₹2 lakh, and my biggest expected order is ${f.biggestSingleOrder}.`
      : null,
    `If anything looks unusual during the sale, please ask me first. I'm happy to share more details.`,
  ];
  const hi = [
    `नमस्ते Razorpay रिस्क टीम, मैं ${f.merchant.business} से ${f.merchant.owner} हूँ। ${f.merchant.city} में हाथ से बने दीये और गिफ्ट हैम्पर बेचती हूँ। पिछले ${f.merchant.razorpayAccountAgeMonths} महीनों से ${f.merchant.sellsVia.join(" और ")} के ज़रिए Razorpay से पेमेंट ले रही हूँ।`,
    `${f.sale.start} से ${f.sale.end} तक मेरी ${f.sale.festival ? "दिवाली " : ""}सेल है। मुझे उम्मीद है कि बिक्री सामान्य से लगभग ${f.lift.declared} होगी, यानी करीब ${f.expectedSales}, जबकि आम तौर पर इतने दिनों में ${f.normalSalesSameWindow} होती है।${f.lift.lastYearSameWindow ? ` पिछले साल दिवाली से पहले के इन्हीं तीन हफ़्तों में बिक्री ${f.lift.lastYearSameWindow} थी।` : ""}`,
    pr
      ? `मैंने ${pr.supplier} का सप्लायर इनवॉइस लगाया है${pr.invoiceDate ? ` (${pr.invoiceDate})` : ""}: ${pr.quantity.toLocaleString("en-IN")} पीस, ${pr.unitCost} प्रति पीस। मेरी सामान्य कीमत ${pr.usualSellingPrice} पर यह स्टॉक लगभग ${pr.salesThisStockSupports} की बिक्री के बराबर है।${f.campaignLink ? " कैंपेन पोस्ट का लिंक भी जोड़ा है।" : ""}`
      : `${f.campaignLink ? "कैंपेन पोस्ट का लिंक जोड़ा है। " : ""}ज़रूरत हो तो सप्लायर इनवॉइस भी भेज सकती हूँ।`,
    lim.increaseRequested
      ? `मेरी प्रति-ऑर्डर सीमा ${lim.current} से बढ़ाकर ${lim.requestedLimit} करने का अनुरोध है। कॉर्पोरेट ग्राहक ${f.sale.festival ? "दिवाली " : ""}गिफ्ट हैम्पर एक ही पेमेंट में मँगाते हैं, आम तौर पर ₹80,000 से ₹2 लाख तक, और मेरा सबसे बड़ा अपेक्षित ऑर्डर ${f.biggestSingleOrder} का है।`
      : null,
    `सेल के दौरान कुछ भी असामान्य लगे तो कृपया पहले मुझसे पूछ लें। मैं और जानकारी देने के लिए तैयार हूँ।`,
  ];
  return { en: en.filter(Boolean).join("\n\n"), hi: hi.filter(Boolean).join("\n\n").replace(/lakh/g, "लाख").replace(/(\d+(?:\.\d+)?)x/g, "$1 गुना") };
}

// Pre-baked extraction for the bundled sample invoice
export const SAMPLE_FIELDS = {
  documentType: "invoice",
  supplier: "Kumhar Clay Crafts, Molela",
  item: "Hand-painted terracotta diya, Diwali set",
  quantity: 2000,
  unitCost: 180,
  invoiceTotal: 396900,
  invoiceDate: "2026-10-02",
  invoiceNumber: "KCC/26-27/0412",
  billedTo: "Meera's Diya House",
  isSample: true,
  confidence: "high",
  note: "",
};
