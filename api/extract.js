// POST { image: "data:image/jpeg;base64,..." } -> extracted invoice / stock-photo fields
import { askForJson, hasKey, bad } from "./_claude.js";

export const config = { maxDuration: 30 };

const SYSTEM = `You read supplier invoices and stock photos for small Indian merchants preparing for a festive sale.
Extract only what is visible. Never invent values: use null when a field is missing or unreadable.
Return only a JSON object, no prose, with these keys:
{
  "documentType": "invoice" | "stock_photo" | "other",
  "supplier": string | null,
  "item": string | null,            // the main saleable product line, short
  "quantity": number | null,        // units of the main saleable product
  "unitCost": number | null,        // per-unit cost in INR for the main product
  "invoiceTotal": number | null,    // grand total in INR including tax
  "invoiceDate": "YYYY-MM-DD" | null,
  "invoiceNumber": string | null,
  "billedTo": string | null,
  "isSample": boolean,              // true if the document is watermarked SAMPLE or says it is synthetic
  "confidence": "high" | "medium" | "low",
  "note": string                    // one short sentence on anything unclear, or ""
}
Amounts are plain numbers in rupees (e.g. 360000), no commas or symbols. "Rs." and "₹" both mean INR.
For a stock photo, estimate quantity only if you can count or clearly estimate it, and set confidence accordingly.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, 405, "POST only");
  if (!hasKey()) return bad(res, 503, "No API key configured");
  const image = req.body?.image || "";
  const m = image.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
  if (!m) return bad(res, 400, "Expected a base64 image data URL");
  try {
    const { data, model } = await askForJson({
      system: SYSTEM,
      maxTokens: 2000,
      content: [
        { type: "image", source: { type: "base64", media_type: m[1], data: m[2] } },
        { type: "text", text: "Extract the fields from this document." },
      ],
    });
    res.status(200).json({ fields: data, model });
  } catch (e) {
    console.error("extract failed", e);
    bad(res, 502, String(e.message || e));
  }
}
