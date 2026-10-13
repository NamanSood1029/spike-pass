import { Check, Sparkles, ShieldCheck, RotateCcw } from "lucide-react";
import { TopBar, Card, Label, BottomBar, Button, AiBadge } from "../components/ui.jsx";
import { fmtDay, fmtX, fmtINR, fmtLakh, expectedSales, LIMIT, suggestedLimit, wordCount } from "../lib/spikepass.js";

export default function Review({ plan, proof, campaignLink, note, setNote, onRedraft, onBack, onApprove }) {
  const lang = note.lang;
  const text = note[lang] || "";
  const limitAsk = plan.raiseLimit && plan.biggestOrder > LIMIT;
  const words = wordCount(text);
  const hasProof = Boolean(proof.fields && proof.image);

  const shared = [
    `Sale dates, ${fmtDay(plan.start)} – ${fmtDay(plan.end)}, and expected lift of ${fmtX(plan.lift)}`,
    `Biggest single order (${fmtINR(plan.biggestOrder)})${limitAsk ? ` and a per-order limit request of ${fmtINR(suggestedLimit(plan.biggestOrder))}` : ""}`,
    hasProof ? "Your invoice image and the fields you checked" : null,
    campaignLink ? "Your campaign link" : null,
    `This note, in ${lang === "hi" ? "Hindi" : "English"}`,
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Review and approve" step={3} onBack={onBack} />
      <div className="flex-1 scroll-y px-4 py-4 space-y-4">
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <Row k="Sale" v={`${fmtDay(plan.start)} – ${fmtDay(plan.end)}`} />
            <Row k="Expected" v={`${fmtX(plan.lift)} · ${fmtLakh(expectedSales(plan))}`} />
            <Row k="Biggest order" v={fmtINR(plan.biggestOrder)} />
            <Row k="Per-order limit" v={limitAsk ? `${fmtINR(LIMIT)} → ${fmtINR(suggestedLimit(plan.biggestOrder))}` : "No change"} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13px] font-semibold">Note to Razorpay's risk team</div>
            <div className="flex rounded-lg bg-canvas p-0.5 text-[13px]">
              {[["en", "English"], ["hi", "हिंदी"]].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setNote((n) => ({ ...n, lang: k }))}
                  className={`px-3 h-7 rounded-md font-medium ${lang === k ? "bg-white shadow-sm text-ink" : "text-muted"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <AiBadge source={note.loading ? null : note.source} live="Drafted by Claude" off="Simulated AI draft" />
            {!note.loading && <span className="text-[11px] text-muted">Edit anything before you approve</span>}
          </div>

          {note.loading ? (
            <div>
              <div className="flex items-center gap-1.5 text-sm text-brand font-medium mb-3">
                <Sparkles size={15} className="animate-pulse" /> Drafting in English and Hindi…
              </div>
              {[95, 88, 92, 60, 0, 90, 84, 70].map((w, i) => (
                <div key={i} className={w ? "skeleton h-3 mt-2" : "h-3"} style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setNote((n) => ({ ...n, [lang]: e.target.value }))}
              rows={14}
              className={`w-full text-[14px] leading-relaxed outline-none resize-none rounded-xl bg-canvas p-3 ${lang === "hi" ? "hi" : ""}`}
            />
          )}
          {!note.loading && (
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
              <span>
                {words} words
                {limitAsk && words >= 100 ? " · also covers the 100-word limit explanation" : ""}
              </span>
              <button onClick={onRedraft} className="flex items-center gap-1 text-brand font-medium">
                <RotateCcw size={12} /> Redraft
              </button>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <Label>Exactly what will be shared with Razorpay</Label>
          <ul className="space-y-2">
            {shared.map((s) => (
              <li key={s} className="flex gap-2 text-[13px]">
                <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted mt-3">Nothing else. You can edit or withdraw your Spike Pass anytime.</p>
        </Card>

        <div className="rounded-2xl bg-ink text-white p-4 text-[13px] leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-[14px] mb-1.5">
            <ShieldCheck size={17} /> How a Spike Pass works
          </div>
          <p className="text-white/85">
            It's a heads-up, not a free pass. Razorpay's team keeps monitoring your payments as usual. If a spike stays within your
            dates, expected jump and order size, they can ask you first instead of holding your money. Signs of fraud, like
            chargebacks or a changed bank account, still trigger normal holds.
          </p>
          <p className="text-white/60 mt-2">
            AI reads your invoice and drafts this note for you. Razorpay's team makes every hold and limit decision.
          </p>
        </div>
      </div>
      <BottomBar>
        <Button className="w-full" disabled={note.loading || !note.en} onClick={onApprove}>
          Approve and send to Razorpay
        </Button>
      </BottomBar>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div>
      <div className="text-[11px] text-muted">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}
