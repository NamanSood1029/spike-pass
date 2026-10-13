// Static concept of how a Spike Pass lands with a Razorpay risk reviewer. Shown briefly in the demo video.
import { X, ShieldCheck, AlertTriangle, MessageSquare, FileSearch, PauseCircle, ExternalLink } from "lucide-react";
import { merchant, fmtDay, fmtX, fmtINR, fmtLakh, LIMIT, suggestedLimit, supportedSales, supportedLift, expectedSales, SIMULATED_ACTUAL_LIFT, withinPlan } from "../lib/spikepass.js";

export default function RiskConsole({ pass, proof, note, campaignLink, onClose }) {
  const { plan } = pass;
  const limitAsk = plan.raiseLimit && plan.biggestOrder > LIMIT;
  const p = proof.fields ? { ...proof.fields, sellingPrice: proof.sellingPrice } : null;
  // "Ask first" applies only inside what the merchant declared, and only once the Pass is active
  const inEnvelope = pass.status === "declared" && withinPlan(SIMULATED_ACTUAL_LIFT, plan.lift);
  const sLift = p ? supportedLift(plan, p) : 0;
  return (
    <div className="fixed inset-0 z-50 bg-[#eef1f6] overflow-auto">
      <div className="bg-navy text-white px-4 py-3 flex items-center gap-3 sticky top-0">
        <span className="font-semibold">Risk Ops</span>
        <span className="text-white/50 text-sm hidden sm:inline">Merchant context · concept view</span>
        <span className="ml-auto text-[11px] rounded-full bg-white/10 px-2 py-0.5 whitespace-nowrap">Concept · synthetic data</span>
        <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-3 sm:p-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <Panel>
            <div className="flex items-center gap-2 text-sm text-muted">
              <AlertTriangle size={16} className="text-amber-500" /> Volume alert · {fmtDay("2026-10-30", true)}
            </div>
            <div className="mt-1 font-heading text-lg font-semibold">
              {merchant.business}: 7-day volume at {fmtX(SIMULATED_ACTUAL_LIFT)} of baseline
            </div>
            <div className={`mt-3 rounded-lg p-3 text-sm flex gap-2 ${inEnvelope ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
              <ShieldCheck size={18} className="shrink-0" />
              <div className="min-w-0">
                {inEnvelope ? (
                  <>
                    <b>Within the active Spike Pass.</b> Dates, lift ({fmtX(SIMULATED_ACTUAL_LIFT)} vs {fmtX(plan.lift)} declared) and
                    ticket size are inside what the merchant declared (up to 25% headroom).
                    <div className="mt-1">
                      Recommended first action: <b>ask the merchant</b>, not hold. Monitoring continues, fraud signals still
                      trigger normal holds, and the reviewer decides.
                    </div>
                  </>
                ) : (
                  <>
                    <b>{pass.status === "declared" ? "Above the declared envelope." : "Spike Pass pending review."}</b>{" "}
                    {pass.status === "declared"
                      ? `Volume is ${fmtX(SIMULATED_ACTUAL_LIFT)} against ${fmtX(plan.lift)} declared, so the Pass doesn't cover it.`
                      : "The Pass isn't active yet, so it doesn't change the first response."}
                    <div className="mt-1">
                      Recommended: <b>review against the attached proof</b>
                      {sLift ? ` (stock supports about ${fmtX(sLift)})` : ""} under the standard process. The Pass is context for
                      the reviewer.
                    </div>
                  </>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Declared envelope">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <KV k="Sale window" v={`${fmtDay(plan.start)} – ${fmtDay(plan.end)}`} />
              <KV k="Declared lift" v={`${fmtX(plan.lift)} (${fmtLakh(expectedSales(plan))})`} />
              <KV k="Biggest order" v={fmtINR(plan.biggestOrder)} />
              <KV k="Limit request" v={limitAsk ? `${fmtINR(LIMIT)} → ${fmtINR(suggestedLimit(plan.biggestOrder))}` : "None"} />
            </div>
          </Panel>

          <Panel title="Merchant's note (approved by merchant, drafted with AI)">
            <p className={`text-sm leading-relaxed whitespace-pre-line ${note.lang === "hi" ? "hi" : ""}`}>{note[note.lang] || note.en}</p>
          </Panel>
        </div>

        <div className="space-y-4 min-w-0">
          <Panel title="Merchant">
            <div className="space-y-2 text-sm">
              <KV k="Account" v={`${merchant.id} · ${merchant.accountAgeMonths} months`} />
              <KV k="Category" v={`${merchant.category}, ${merchant.city}`} />
              <KV k="Channels" v={merchant.channels.join(", ")} />
              <KV k="Account manager" v="None" />
              <KV k="Pass eligibility" v={`Yes · ${merchant.accountAgeMonths} months clean history (min 6)`} />
              <KV k="Fraud signals" v="Chargebacks normal · bank account unchanged" />
            </div>
          </Panel>
          <Panel title="Attached proof">
            {proof.image ? (
              <div className="flex gap-3">
                <img src={proof.image} alt="Invoice" className="h-28 w-22 shrink-0 object-cover object-top rounded border border-line" />
                <div className="text-sm space-y-1 min-w-0">
                  <div className="font-medium truncate">{p.supplier}</div>
                  <div className="text-muted">{Number(p.quantity).toLocaleString("en-IN")} × {fmtINR(p.unitCost)}</div>
                  <div className="text-muted">Total {fmtINR(p.invoiceTotal)}</div>
                  <div className="text-muted">Supports ≈ {fmtLakh(supportedSales(p))}</div>
                  <div className="text-[11px] text-muted">Fields extracted by AI, checked by merchant</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">No proof attached.</p>
            )}
            {campaignLink && (
              <div className="mt-3 text-sm text-brand flex items-center gap-1 min-w-0">
                <ExternalLink size={14} className="shrink-0" /> <span className="truncate min-w-0">{campaignLink}</span>
              </div>
            )}
          </Panel>
          <Panel title="Reviewer actions">
            <div className="grid gap-2">
              <Action icon={MessageSquare} primary>Message merchant</Action>
              <Action icon={FileSearch}>Request more proof</Action>
              <Action icon={PauseCircle}>Hold settlement (reason required)</Action>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-line p-4">
      {title && <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">{title}</div>}
      {children}
    </div>
  );
}
function KV({ k, v }) {
  return (
    <div>
      <div className="text-[11px] text-muted">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}
function Action({ icon: Icon, children, primary }) {
  return (
    <button className={`h-10 rounded-lg px-3 text-sm font-medium flex items-center gap-2 ${primary ? "bg-brand text-white" : "border border-line"}`}>
      <Icon size={16} /> {children}
    </button>
  );
}
