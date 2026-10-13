// POST { facts } -> { en, hi } note for Razorpay's risk team, drafted for the merchant to approve
import { askForJson, hasKey, bad } from "./_claude.js";

export const config = { maxDuration: 30 };

const SYSTEM = `You draft a short note from a small Indian merchant to their payment gateway's risk team, ahead of a festive sale.
The merchant will read, edit and approve it before anything is sent. You do not decide anything about holds or limits.

Write in the merchant's own voice (first person), plain and factual, like a capable shop owner would write.
Use only the facts given. Do not add numbers, claims, customers, or promises that are not in the facts.
Mention: who they are and how long they have used Razorpay; sale dates; expected lift and what it is based on (last year's history);
the proof attached (supplier, quantity, date, and what that stock supports); the campaign link if given.
If a per-order limit increase is requested, add a short paragraph explaining why (corporate gifting orders, the biggest single order expected, the new limit asked for).
End with a contact line inviting the team to ask questions before taking any action.
English version: 120 to 170 words. Use Indian number formatting (lakh) and the ₹ symbol.
Hindi version: the same content in natural, everyday Hindi in Devanagari (not a stiff literal translation); keep numbers, ₹ amounts, dates, brand and supplier names readable.
Return only JSON: {"en": string, "hi": string}. Use \\n\\n between paragraphs.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, 405, "POST only");
  if (!hasKey()) return bad(res, 503, "No API key configured");
  const facts = req.body?.facts;
  if (!facts || typeof facts !== "object") return bad(res, 400, "Expected { facts }");
  try {
    const { data, model } = await askForJson({
      system: SYSTEM,
      maxTokens: 4000,
      content: [{ type: "text", text: `Facts (JSON):\n${JSON.stringify(facts, null, 2)}` }],
    });
    if (typeof data.en !== "string" || typeof data.hi !== "string") throw new Error("Missing en/hi");
    res.status(200).json({ en: data.en, hi: data.hi, model });
  } catch (e) {
    console.error("draft failed", e);
    bad(res, 502, String(e.message || e));
  }
}
