import { ShieldCheck, Clock } from "lucide-react";
import { Button, BottomBar } from "../components/ui.jsx";
import { fmtTimer, fmtDay, fmtX, fmtINR, fmtLakh, daysBetween, isoDate, expectedSales, LIMIT, suggestedLimit } from "../lib/spikepass.js";

export default function Declared({ pass, today, onHome }) {
  const review = pass.status === "review";
  const { plan } = pass;
  const startsIn = daysBetween(isoDate(today), plan.start);
  const limitAsk = plan.raiseLimit && plan.biggestOrder > LIMIT;
  const rows = [
    ["Sale", `${fmtDay(plan.start)} – ${fmtDay(plan.end)}`, startsIn > 0 ? `Starts in ${startsIn} days` : "Live now"],
    ["Declared lift", `${fmtX(plan.lift)} · ${fmtLakh(expectedSales(plan))}`, review ? "Under review" : "Active"],
    limitAsk ? ["Per-order limit", `${fmtINR(LIMIT)} → ${fmtINR(suggestedLimit(plan.biggestOrder))}`, "Request with Razorpay team"] : null,
    ["Monitoring", "Stays on", review ? "Standard process" : "Ask first, within your Pass"],
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 scroll-y flex flex-col items-center justify-center px-6 text-center">
        <div className={`pop h-20 w-20 rounded-full grid place-items-center ${review ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
          {review ? <Clock size={40} /> : <ShieldCheck size={40} />}
        </div>
        <h1 className="mt-5 font-heading text-[26px] font-semibold">{review ? "Sent to Razorpay's team" : "Spike Pass declared"}</h1>
        <p className="mt-2 text-muted text-[15px] leading-relaxed">
          {review
            ? "Razorpay's team will check your plan and proof first. Your Pass goes live once they approve it."
            : "If your sale looks unusual, we'll ask you first."}
        </p>

        <div className="mt-5 w-full rounded-2xl border border-line text-left divide-y divide-line">
          {rows.map(([k, v, s]) => (
            <div key={k} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="text-[11px] text-muted">{k}</div>
                <div className="text-[14px] font-semibold">{v}</div>
              </div>
              <span className="text-[12px] text-subtle text-right">{s}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-full bg-canvas px-4 py-2 text-sm">
          Done in <b>{fmtTimer(pass.elapsedMs)}</b>
        </div>
      </div>
      <BottomBar>
        <Button className="w-full" onClick={onHome}>Back to Home</Button>
      </BottomBar>
    </div>
  );
}
