// Generates synthetic merchant data for the Sale Pass prototype.
// Everything here is made up. Run: npm run data
import { writeFileSync } from "node:fs";

// Seeded RNG so the data is stable across runs
let seed = 20261011;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const noise = (pct) => 1 + (rand() * 2 - 1) * pct;

const merchant = {
  _note: "SYNTHETIC persona for a concept prototype. Not a real merchant.",
  id: "acc_SYNTH_MDH01",
  owner: "Meera",
  ownerAge: 34,
  business: "Meera's Diya House",
  category: "Handcrafted diyas and gift hampers",
  city: "Jaipur",
  channels: ["Instagram", "Shopify"],
  razorpayProducts: ["Payment Links", "Checkout"],
  accountAgeMonths: 26,
  hasAccountManager: false,
  perTransactionLimit: 50000,
  avgSellingPricePerDiya: 450,
  normalMonthlySales: 300000,
  festiveMonthlySalesRange: [1000000, 1400000],
  corporateOrderRange: [80000, 200000],
  festival: { name: "Diwali", date: "2026-11-08", lastYearDate: "2025-10-20" },
  proposedSale: { start: "2026-10-20", end: "2026-11-08" },
  campaignLinkPlaceholder: "https://www.instagram.com/p/SAMPLE-diwali-2026/"
};

// 18 months of weekly sales (weeks start Monday), Apr 2025 -> Oct 2026
const start = new Date("2025-04-07T00:00:00Z");
const end = new Date("2026-10-05T00:00:00Z");
const diwali25 = new Date("2025-10-20T00:00:00Z");
const DAY = 86400000;
const weeks = [];
for (let t = start.getTime(); t <= end.getTime(); t += 7 * DAY) {
  const d = new Date(t);
  const monthsIn = (t - start.getTime()) / (30.4 * DAY);
  let base = 62000 * (1 + 0.012 * monthsIn); // ~15% YoY growth
  const m = d.getUTCMonth();
  if (m === 7) base *= 1.12; // Rakhi (Aug) gifting
  if (m === 0 || m === 1) base *= 1.1; // wedding season
  const weeksToDiwali = Math.round((diwali25 - d) / (7 * DAY));
  let mult = 1;
  if (weeksToDiwali >= 1 && weeksToDiwali <= 3) mult = 3.4; // the festive ramp
  if (weeksToDiwali === 4) mult = 1.6; // early buyers
  if (weeksToDiwali === 0) mult = 2.2; // Diwali week tail
  if (weeksToDiwali === -1) mult = 0.75; // post-festival lull
  weeks.push({ weekStart: d.toISOString().slice(0, 10), sales: Math.round((base * mult * noise(0.05)) / 100) * 100 });
}

// Nudge the three ramp weeks so the measured lift is exactly ~3.4x a normal week
// (baseline = the 8 weeks before the early-buyer week)
const idx = weeks.findIndex((w) => w.weekStart === "2025-09-29");
const prior = weeks.slice(idx - 9, idx - 1).reduce((s, w) => s + w.sales, 0) / 8;
const ramp = weeks.slice(idx, idx + 3);
const rampAvg = ramp.reduce((s, w) => s + w.sales, 0) / 3;
ramp.forEach((w) => (w.sales = Math.round((w.sales * (3.4 * prior)) / rampAvg / 100) * 100));
const lift = ramp.reduce((s, w) => s + w.sales, 0) / 3 / prior;
const recent = weeks.slice(-8).reduce((s, w) => s + w.sales, 0) / 8;

const out = {
  _note: "SYNTHETIC weekly sales (INR) for a concept prototype.",
  merchantId: merchant.id,
  currency: "INR",
  summary: {
    lastYearRampWeeks: ramp.map((w) => w.weekStart),
    lastYearBaselineWeekly: Math.round(prior),
    lastYearLift: Math.round(lift * 10) / 10,
    recentBaselineWeekly: Math.round(recent)
  },
  weeks
};

writeFileSync(new URL("../data/merchant.json", import.meta.url), JSON.stringify(merchant, null, 2));
writeFileSync(new URL("../data/weekly_sales.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(weeks.length, "weeks; summary", out.summary);
