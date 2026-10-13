// Client side of the AI steps. By default the prototype SIMULATES the AI (no API calls): in a real
// product Razorpay would run its own models here. ?live=1 switches on the reference Claude routes in /api,
// and every live call still falls back to the simulated response if it is slow or fails.
import { SAMPLE_FIELDS, fallbackNote } from "./spikepass.js";

const BLANK_FIELDS = {
  documentType: "invoice", supplier: "", item: "", quantity: null, unitCost: null, invoiceTotal: null, invoiceDate: "",
  isSample: false, confidence: "low",
  note: "In the real product, AI fills these in from your photo. In this prototype, please type them in. Proof that can't be read goes to Razorpay's team before the Pass goes live.",
};

// Simulated unless the page is opened with ?live=1 (also switchable from the hidden demo panel)
export const SIMULATED_BY_DEFAULT = new URLSearchParams(location.search).get("live") !== "1";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(path, body, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(`${path} ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

// Returns { fields, source: "live" | "fallback" }
export async function extractInvoice(dataUrl, { isSample, simulated }) {
  // The simulation only "knows" the bundled sample. For any other photo, it hands the fields to the merchant.
  const offline = () => ({
    fields: isSample ? SAMPLE_FIELDS : { ...BLANK_FIELDS },
    source: "fallback",
  });
  if (simulated) {
    await sleep(1400);
    return offline();
  }
  try {
    const { fields } = await post("/api/extract", { image: dataUrl }, 12000);
    return { fields, source: "live" };
  } catch (e) {
    console.warn("extract fell back:", e.message);
    return offline();
  }
}

// Returns { en, hi, source }
export async function draftNote(facts, { simulated }) {
  if (simulated) {
    await sleep(1600);
    return { ...fallbackNote(facts), source: "fallback" };
  }
  try {
    const { en, hi } = await post("/api/draft", { facts }, 18000);
    return { en, hi, source: "live" };
  } catch (e) {
    console.warn("draft fell back:", e.message);
    return { ...fallbackNote(facts), source: "fallback" };
  }
}
