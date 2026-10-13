import { Bell, Link2, QrCode, ReceiptText, Landmark, ChevronRight, ShieldCheck, Clock, Sparkles, Eye, TrendingUp } from "lucide-react";
import { Card, Button } from "../components/ui.jsx";
import {
  merchant, sales, LAST_YEAR_LIFT, daysBetween, fmtDay, fmtX, fmtINR, fmtLakh, isoDate,
  normalSales, saleDays, suggestedLimit, LIMIT, SIMULATED_ACTUAL_LIFT, RULES, withinPlan, isEligible,
} from "../lib/spikepass.js";

const RECENT = [
  { who: "Ananya R.", what: "Payment link · 6 diya set", amt: 2700, t: "6:42 PM" },
  { who: "Kavya Events", what: "Checkout · hamper x4", amt: 9800, t: "4:15 PM" },
  { who: "Rohit M.", what: "Payment link · brass diya", amt: 1450, t: "1:03 PM" },
];

export default function Home({ today, pass, onStart, onStartNew, onUpdatePass, onOpenConsole }) {
  const daysToDiwali = daysBetween(isoDate(today), merchant.festival.date);
  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-white px-4 pt-3 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#fde7d6] text-[#a4471c] grid place-items-center font-semibold">M</div>
          <div className="flex-1">
            <div className="text-xs text-muted">Good evening, {merchant.owner}</div>
            <div className="font-semibold">{merchant.business}</div>
          </div>
          <button className="h-10 w-10 grid place-items-center rounded-full active:bg-canvas" aria-label="Notifications">
            <Bell size={20} />
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-navy text-white p-4">
          <div className="text-xs text-white/70">Today's collections</div>
          <div className="font-heading text-[30px] font-semibold">₹18,450</div>
          <div className="text-xs text-white/70">23 payments</div>
          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-sm">
            <span className="text-white/80">Next settlement ₹41,200</span>
            <span className="text-white/60 text-xs">Tomorrow, 9 AM</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            [Link2, "Payment link"],
            [QrCode, "QR code"],
            [ReceiptText, "Payments"],
            [Landmark, "Settlements"],
          ].map(([Icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand grid place-items-center">
                <Icon size={21} />
              </div>
              <span className="text-[11px] text-muted leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {pass ? (
          <PassCard pass={pass} today={today} onUpdatePass={onUpdatePass} onOpenConsole={onOpenConsole} />
        ) : (
          <>
            <InviteCard daysToDiwali={daysToDiwali} onStart={onStart} />
            <button onClick={onStartNew} className="w-full flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left active:bg-canvas">
              <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand grid place-items-center"><TrendingUp size={18} /></div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold">Planning another big sale?</div>
                <div className="text-xs text-muted">Launch, viral reel or bulk order: start a Spike Pass anytime</div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </button>
          </>
        )}

        <Card>
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <span className="font-semibold text-[15px]">Recent payments</span>
            <span className="text-brand text-sm font-medium">See all</span>
          </div>
          {RECENT.map((p) => (
            <div key={p.who} className="flex items-center gap-3 px-4 py-3 border-t border-line">
              <div className="h-9 w-9 rounded-full bg-canvas grid place-items-center text-xs font-semibold text-muted">
                {p.who[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.who}</div>
                <div className="text-xs text-muted truncate">{p.what}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{fmtINR(p.amt)}</div>
                <div className="text-[11px] text-muted">{p.t}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function InviteCard({ daysToDiwali, onStart }) {
  return (
    <Card className="overflow-hidden border-brand/25">
      <div className="p-4 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-center gap-1.5 text-brand text-xs font-semibold">
          <Sparkles size={14} /> NEW · SPIKE PASS
        </div>
        <div className="mt-2 font-heading text-[21px] font-semibold leading-snug">
          Diwali is {daysToDiwali} days away
        </div>
        <p className="mt-1.5 text-sm text-muted leading-relaxed">
          Last year your sales were <b className="text-ink">{fmtX(LAST_YEAR_LIFT)}</b> in the three weeks before it. Tell us
          about this year's sale so your money keeps moving.
        </p>
        <LastYearChart />
        <Button className="w-full mt-3" onClick={onStart}>
          Prepare my Spike Pass <span className="font-normal opacity-80">· 2 min</span>
        </Button>
        <p className="mt-2 text-[11px] text-muted text-center">
          {isEligible()
            ? `Available because your account has ${merchant.accountAgeMonths} months of clean history`
            : `Opens once your account has ${RULES.minAccountMonths} months of clean history`}
        </p>
      </div>
    </Card>
  );
}

// Tiny bar chart of last year's Aug–Nov weekly sales, ramp highlighted
function LastYearChart() {
  const weeks = sales.weeks.filter((w) => w.weekStart >= "2025-08-25" && w.weekStart <= "2025-11-17");
  const ramp = new Set(sales.summary.lastYearRampWeeks);
  const max = Math.max(...weeks.map((w) => w.sales));
  return (
    <div className="mt-3">
      <div className="flex items-end gap-[3px] h-14">
        {weeks.map((w) => (
          <div
            key={w.weekStart}
            className={`flex-1 rounded-t-[3px] ${ramp.has(w.weekStart) ? "bg-brand" : "bg-brand/20"}`}
            style={{ height: `${Math.max(6, (w.sales / max) * 100)}%` }}
            title={`${w.weekStart}: ${fmtINR(w.sales)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1">
        <span>Sep 2025</span>
        <span className="text-brand font-medium">3 weeks before Diwali</span>
        <span>Nov</span>
      </div>
    </div>
  );
}

function PassCard({ pass, today, onUpdatePass, onOpenConsole }) {
  const { plan } = pass;
  const t = isoDate(today);
  const review = pass.status === "review";
  const during = t >= plan.start && t <= plan.end;
  const startsIn = daysBetween(t, plan.start);
  return (
    <Card className={`overflow-hidden ${review ? "border-amber-300" : "border-emerald-300"}`}>
      <div className={`px-4 py-3 flex items-center gap-2 ${review ? "bg-amber-50" : "bg-emerald-50"}`}>
        {review ? <Clock size={18} className="text-amber-600" /> : <ShieldCheck size={18} className="text-emerald-600" />}
        <span className={`font-semibold text-[15px] ${review ? "text-amber-800" : "text-emerald-800"}`}>
          {review ? "Spike Pass under review" : "Spike Pass declared"}
        </span>
        <span className="ml-auto text-xs text-muted">
          {during ? "Live now" : startsIn > 0 ? `Starts in ${startsIn} days` : "Ended"}
        </span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Dates" value={`${fmtDay(plan.start)} – ${fmtDay(plan.end)}`} />
          <Stat label="Declared lift" value={fmtX(plan.lift)} />
          <Stat
            label={plan.raiseLimit && plan.biggestOrder > LIMIT ? "Per-order limit" : "Biggest order"}
            value={plan.raiseLimit && plan.biggestOrder > LIMIT ? fmtINR(suggestedLimit(plan.biggestOrder)) : fmtINR(plan.biggestOrder)}
            sub={plan.raiseLimit && plan.biggestOrder > LIMIT ? "requested" : null}
          />
        </div>

        {during && <Meter pass={pass} today={t} onUpdatePass={onUpdatePass} />}

        {review ? (
          <div className="mt-3 text-sm text-ink leading-relaxed">
            <p className="font-medium">Your Pass goes live once Razorpay's team approves it.</p>
            <ul className="mt-1.5 text-muted text-[13px] list-disc pl-4 space-y-0.5">
              {pass.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="mt-2 text-[13px] text-muted">Until then, standard monitoring applies. You can add proof or edit the Pass anytime.</p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-canvas p-3">
            <p className="text-[15px] font-semibold">If your sale looks unusual, we'll ask you first.</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              A heads-up, not a free pass. Monitoring stays on. Within your plan, Razorpay's team asks before holding money; signs
              of fraud, like chargebacks or a changed bank account, still trigger normal holds.
            </p>
          </div>
        )}

        <button onClick={onOpenConsole} className="mt-3 w-full flex items-center gap-2 text-sm text-brand font-medium">
          <Eye size={16} /> See what Razorpay's risk team sees <ChevronRight size={16} className="ml-auto" />
        </button>
      </div>
    </Card>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-canvas px-2 py-2.5">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="text-[14px] font-semibold mt-0.5 leading-tight">{value}</div>
      {sub && <div className="text-[10px] text-muted">{sub}</div>}
    </div>
  );
}

function Meter({ pass, today, onUpdatePass }) {
  const { plan } = pass;
  const day = daysBetween(plan.start, today) + 1;
  const total = saleDays(plan);
  const perDayNormal = normalSales(plan) / total;
  const actual = perDayNormal * day * SIMULATED_ACTUAL_LIFT;
  const declaredSoFar = perDayNormal * day * plan.lift;
  const scaleMax = Math.max(plan.lift, SIMULATED_ACTUAL_LIFT) * 1.3;
  const above = !withinPlan(SIMULATED_ACTUAL_LIFT, plan.lift);
  // Suggest the actual jump rounded up, capped at the review trigger so the update stays live
  const newLift = Math.min(RULES.maxLift, Math.ceil(SIMULATED_ACTUAL_LIFT * 2) / 2);
  return (
    <div className="mt-3 rounded-xl border border-line p-3">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-1"><TrendingUp size={14} /> Day {day} of {total}</span>
        <span>Actual vs declared</span>
      </div>
      <div className="mt-2 relative h-3 rounded-full bg-canvas">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${above ? "bg-amber-400" : "bg-emerald-500"}`}
          style={{ width: `${(SIMULATED_ACTUAL_LIFT / scaleMax) * 100}%` }}
        />
        <div className="absolute -top-1 -bottom-1 w-0.5 bg-ink" style={{ left: `${(plan.lift / scaleMax) * 100}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[13px]">
        <span><b>{fmtX(SIMULATED_ACTUAL_LIFT)}</b> so far · {fmtLakh(actual)}</span>
        <span className="text-muted">declared {fmtX(plan.lift)} · {fmtLakh(declaredSoFar)}</span>
      </div>
      {above ? (
        <div className="mt-3 rounded-lg bg-amber-50 p-2.5">
          <p className="text-[13px] text-amber-900">You're running more than 25% above your plan. Update your Pass so it still covers your sale.</p>
          <Button className="w-full mt-2 h-10 text-sm" onClick={() => onUpdatePass(newLift)}>
            Update my Pass to {fmtX(newLift)}
          </Button>
        </div>
      ) : (
        <p className="mt-2 text-[13px] text-emerald-700">Within your plan (up to 25% above it). Nothing to do.</p>
      )}
    </div>
  );
}
