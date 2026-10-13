// Shared server-side Claude helper. The API key only ever lives here (process.env), never in the browser.
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5-5";

export function hasKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// One JSON-returning call. Low effort keeps latency demo-friendly; the server-side
// fallback re-runs the request on another model if a safety classifier declines it.
export async function askForJson({ system, content, maxTokens = 4000, timeoutMs = 25000 }) {
  const client = new Anthropic({ timeout: timeoutMs, maxRetries: 0 });
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system,
    messages: [{ role: "user", content }],
  });
  if (response.stop_reason === "refusal") throw new Error("Model declined the request");
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON in model response");
  return { data: JSON.parse(text.slice(start, end + 1)), model: response.model };
}

export function bad(res, code, error) {
  res.status(code).json({ error });
}
