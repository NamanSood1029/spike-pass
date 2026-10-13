// Status rule tests: the Declared / Under review decision is plain code, so it is tested like code.
import test from "node:test";
import assert from "node:assert/strict";
import { decideStatus, supportedLift, fallbackNote, buildFacts, withinPlan, SAMPLE_FIELDS } from "../src/lib/spikepass.js";

const plan = { start: "2026-10-20", end: "2026-11-08", lift: 3.4, biggestOrder: 150000, raiseLimit: true, source: "lastYear" };
const proof = { ...SAMPLE_FIELDS, sellingPrice: 450 };

test("sample invoice supports about 4x a normal 20 days", () => {
  assert.equal(Math.round(supportedLift(plan, proof) * 10) / 10, 4);
});

const cases = [
  ["happy path: 3.4x with invoice", plan, proof, "declared"],
  ["4x with invoice (edge of the review trigger)", { ...plan, lift: 4 }, proof, "declared"],
  ["4.5x goes to Razorpay's team", { ...plan, lift: 4.5 }, proof, "review"],
  ["20x is above the automatic cap", { ...plan, lift: 20 }, proof, "review"],
  ["no proof goes to Razorpay's team", { ...plan, lift: 3.8 }, null, "review"],
  ["unreadable proof goes to Razorpay's team", plan, { ...proof, confidence: "low" }, "review"],
  ["thin proof: 200 pieces for 4x", { ...plan, lift: 4 }, { ...proof, quantity: 200 }, "review"],
  ["per-order limit ask above ₹2.5L", { ...plan, biggestOrder: 300000 }, proof, "review"],
];
for (const [name, p, pr, want] of cases) {
  test(name, () => assert.equal(decideStatus(p, pr).status, want));
}

test("note for a non-festival sale drops the Diwali and last-year lines", () => {
  const n = fallbackNote(buildFacts({ ...plan, lift: 2, source: "new" }, null, ""));
  assert.doesNotMatch(n.en, /Diwali|Last year/);
  assert.doesNotMatch(n.hi, /दिवाली/);
});

test("25% headroom: 4.25x is within a 3.4x plan, 4.4x is not, and 4.4x is within a 4x plan", () => {
  assert.equal(withinPlan(4.25, 3.4), true);
  assert.equal(withinPlan(4.4, 3.4), false);
  assert.equal(withinPlan(4.4, 4), true);
});
