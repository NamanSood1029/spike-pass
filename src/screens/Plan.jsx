import { Calendar } from "lucide-react";
import { TopBar, Card, Label, Toggle, BottomBar, Button } from "../components/ui.jsx";
import {
  LAST_YEAR_LIFT, LIMIT, RULES, saleDays, normalSales, expectedSales, fmtLakh, fmtINR, fmtX, suggestedLimit, merchant,
} from "../lib/spikepass.js";

const MAX_LIFT = 20;

export default function Plan({ plan, setPlan, onBack, onNext }) {
  const set = (k) => (v) => setPlan((p) => ({ ...p, [k]: v }));
  const overLimit = plan.biggestOrder > LIMIT;
  const lastYearPct = ((LAST_YEAR_LIFT - 1) / (MAX_LIFT - 1)) * 100;
  const validDates = plan.start && plan.end && plan.end >= plan.start;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Plan your sale" step={1} onBack={onBack} />
      <div className="flex-1 scroll-y px-4 py-4 space-y-4">
        <Card className="p-4">
          <Label hint={plan.source === "lastYear" ? `Pre-filled for the three weeks before Diwali (${new Date(merchant.festival.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })})` : "When does your sale run?"}>
            Sale dates
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {[["start", "From"], ["end", "To"]].map(([k, l]) => (
              <label key={k} className="rounded-xl border border-line px-3 py-2 flex flex-col">
                <span className="text-[11px] text-muted flex items-center gap-1"><Calendar size={12} />{l}</span>
                <input
                  type="date"
                  value={plan[k]}
                  onChange={(e) => set(k)(e.target.value)}
                  className="text-[15px] font-medium bg-transparent outline-none w-full"
                />
              </label>
            ))}
          </div>
          {!validDates && <p className="text-xs text-red-600 mt-2">The end date should be after the start date.</p>}
        </Card>

        <Card className="p-4">
          <Label hint={plan.source === "lastYear" ? `Pre-filled from last year's plan: ${fmtX(LAST_YEAR_LIFT)} in the same window. Edit it if this year is different.` : "Your best guess. You can update the Pass during the sale."}>
            How much bigger than a normal week?
          </Label>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-[36px] font-semibold text-brand">{fmtX(plan.lift)}</span>
            <span className="text-sm text-muted">your normal sales</span>
          </div>
          <div className="relative mt-2">
            <input
              type="range"
              min={1}
              max={MAX_LIFT}
              step={0.1}
              value={plan.lift}
              onChange={(e) => set("lift")(Number(e.target.value))}
              className="w-full"
              aria-label="Expected lift"
            />
            <div className={`absolute -bottom-3 text-[10px] text-muted -translate-x-1/2 ${plan.source === "lastYear" ? "" : "hidden"}`} style={{ left: `${lastYearPct}%` }}>
              ▲ last year
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-muted mt-3">
            <span>1x</span>
            <span>{MAX_LIFT}x</span>
          </div>
          {validDates && (
            <div className="mt-3 rounded-xl bg-canvas p-3 text-sm">
              About <b>{fmtLakh(expectedSales(plan))}</b> over {saleDays(plan)} days, against{" "}
              {fmtLakh(normalSales(plan))} in a normal {saleDays(plan)} days.
            </div>
          )}
          {plan.lift > RULES.maxLift && (
            <p className="mt-2 text-[13px] text-amber-700">
              That's a very big jump. You can still declare it; a person at Razorpay will review it before it's active.
            </p>
          )}
        </Card>

        <Card className="p-4">
          <Label hint={`Your current per-order limit is ${fmtINR(LIMIT)}`}>Biggest single order you expect</Label>
          <div className="flex items-center rounded-xl border border-line px-3 h-12 focus-within:border-brand">
            <span className="text-muted mr-1">₹</span>
            <input
              inputMode="numeric"
              value={plan.biggestOrder ? plan.biggestOrder.toLocaleString("en-IN") : ""}
              onChange={(e) => set("biggestOrder")(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
              className="flex-1 text-[17px] font-medium outline-none bg-transparent"
              aria-label="Biggest single order"
            />
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {[25000, 50000, 100000, 150000, 200000].map((v) => (
              <button
                key={v}
                onClick={() => set("biggestOrder")(v)}
                className={`px-3 h-8 rounded-full text-[13px] border ${
                  plan.biggestOrder === v ? "bg-brand-50 border-brand text-brand-700" : "border-line text-muted"
                }`}
              >
                {v < 100000 ? `₹${v / 1000}k` : `₹${v / 100000}L`}
              </button>
            ))}
          </div>

          {overLimit && (
            <div className="mt-4 rounded-xl border border-brand/30 bg-brand-50/60 p-3 flex items-start gap-3">
              <div className="flex-1">
                <div className="text-[14px] font-semibold">Also raise my per-order limit</div>
                <div className="text-xs text-muted mt-0.5">
                  To {fmtINR(suggestedLimit(plan.biggestOrder))}. Uses the same proof, no extra form.
                </div>
              </div>
              <Toggle on={plan.raiseLimit} onChange={set("raiseLimit")} label="Also raise my per-order limit" />
            </div>
          )}
        </Card>
      </div>
      <BottomBar>
        <Button className="w-full" disabled={!validDates || !plan.biggestOrder} onClick={onNext}>
          Continue
        </Button>
      </BottomBar>
    </div>
  );
}
