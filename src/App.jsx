import { useEffect, useRef, useState } from "react";
import { Timer, X } from "lucide-react";
import Home from "./screens/Home.jsx";
import Plan from "./screens/Plan.jsx";
import Prove from "./screens/Prove.jsx";
import Review from "./screens/Review.jsx";
import Declared from "./screens/Declared.jsx";
import RiskConsole from "./screens/RiskConsole.jsx";
import { Toggle } from "./components/ui.jsx";
import { merchant, LAST_YEAR_LIFT, buildFacts, decideStatus, fmtTimer, parseDate, isoDate } from "./lib/spikepass.js";
import { extractInvoice, draftNote, SIMULATED_BY_DEFAULT } from "./lib/ai.js";
import { toJpegDataUrl } from "./lib/image.js";

const params = new URLSearchParams(location.search);
const FAST_FORWARD_DATE = "2026-10-30"; // day 11 of the sale, for the actual-vs-declared meter

const initialPlan = () => ({
  start: merchant.proposedSale.start,
  end: merchant.proposedSale.end,
  lift: LAST_YEAR_LIFT,
  biggestOrder: 150000,
  raiseLimit: true,
  source: "lastYear",
});
// "Start a Pass anytime": no history to lean on, so the merchant enters new numbers
const newPlan = (today) => {
  const d = (n) => isoDate(new Date(today.getTime() + n * 86400000));
  return { start: d(7), end: d(20), lift: 2, biggestOrder: 50000, raiseLimit: false, source: "new" };
};
const initialProof = () => ({ image: null, isSample: false, loading: false, fields: null, source: null, sellingPrice: merchant.avgSellingPricePerDiya });
const initialNote = () => ({ en: "", hi: "", lang: "en", loading: false, source: null, key: null });

const toNum = (v) => (v == null || v === "" ? null : Number(String(v).replace(/[^\d.]/g, "")) || null);
const normalize = (f) => ({ ...f, quantity: toNum(f.quantity), unitCost: toNum(f.unitCost), invoiceTotal: toNum(f.invoiceTotal) });

export default function App() {
  const [screen, setScreen] = useState("home");
  const [plan, setPlan] = useState(initialPlan);
  const [proof, setProof] = useState(initialProof);
  const [campaignLink, setCampaignLink] = useState("");
  const [note, setNote] = useState(initialNote);
  const [pass, setPass] = useState(null);
  const [showConsole, setShowConsole] = useState(false);
  const [timer, setTimer] = useState({ start: null, stop: null });
  const [, tick] = useState(0);
  const [panel, setPanel] = useState(false);
  const [fastForward, setFastForward] = useState(false);
  const [simulated, setSimulated] = useState(SIMULATED_BY_DEFAULT);
  const [frameScale, setFrameScale] = useState(1);
  const taps = useRef([]);
  const extractId = useRef(0);
  const draftId = useRef(0);

  const today = fastForward ? parseDate(FAST_FORWARD_DATE) : params.get("today") ? parseDate(params.get("today")) : new Date();
  const proofForCalc = proof.fields ? { ...proof.fields, sellingPrice: proof.sellingPrice } : null;

  // Shrink the desktop phone frame to fit short laptop screens (handy for screen recording)
  useEffect(() => {
    const fit = () => setFrameScale(innerWidth >= 640 ? Math.min(1, (innerHeight - 70) / 868) : 1);
    fit();
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, []);

  // Visible timer: runs from the first tap on the Home card until the Pass is declared
  useEffect(() => {
    if (!timer.start || timer.stop) return;
    const i = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(i);
  }, [timer]);
  const elapsed = timer.start ? (timer.stop || Date.now()) - timer.start : 0;

  // Draft the note when the merchant moves to Review (again only if the facts changed)
  function goToReview() {
    const facts = buildFacts(plan, proofForCalc, campaignLink);
    const key = JSON.stringify(facts);
    if (note.key !== key) runDraft(facts, key);
    setScreen("review");
  }

  async function runDraft(facts, key) {
    const id = ++draftId.current;
    setNote((n) => ({ ...n, loading: true, key }));
    const r = await draftNote(facts, { simulated });
    if (id !== draftId.current) return;
    setNote((n) => ({ ...n, en: r.en, hi: r.hi, source: r.source, loading: false }));
  }

  async function runExtract(dataUrl, isSample) {
    const id = ++extractId.current;
    setProof((p) => ({ ...p, image: dataUrl, isSample, loading: true, fields: null, source: null }));
    const r = await extractInvoice(dataUrl, { isSample, simulated });
    if (id !== extractId.current) return;
    setProof((p) => ({ ...p, loading: false, fields: normalize(r.fields), source: r.source }));
  }

  async function useSample() {
    const blob = await (await fetch("/sample-invoice.png")).blob();
    runExtract(await toJpegDataUrl(blob), true);
  }

  async function pickFile(file) {
    try {
      runExtract(await toJpegDataUrl(file), false);
    } catch {
      alert("Couldn't open that image. Try a JPG or PNG photo.");
    }
  }

  function approve() {
    const { status, reasons } = decideStatus(plan, proofForCalc);
    const stop = Date.now();
    setTimer((t) => ({ ...t, stop }));
    setPass({ status, reasons, plan: { ...plan }, elapsedMs: timer.start ? stop - timer.start : 0 });
    setScreen("declared");
  }

  function updatePass(newLift) {
    const p2 = { ...pass.plan, lift: newLift };
    const { status, reasons } = decideStatus(p2, proofForCalc);
    setPass({ ...pass, plan: p2, status, reasons });
  }

  function reset() {
    setScreen("home");
    setPlan(initialPlan());
    setProof(initialProof());
    setCampaignLink("");
    setNote(initialNote());
    setPass(null);
    setTimer({ start: null, stop: null });
    setShowConsole(false);
    extractId.current++;
    draftId.current++;
  }

  // Triple-tap the "Concept prototype" label to open the hidden demo controls
  function tapLabel() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 700), now];
    if (taps.current.length >= 3) {
      taps.current = [];
      setPanel(true);
    }
  }

  const screens = {
    home: (
      <div className="h-full scroll-y">
        <Home
          today={today}
          pass={pass}
          onStart={() => {
            if (!timer.start) setTimer({ start: Date.now(), stop: null });
            if (plan.source !== "lastYear") setPlan(initialPlan());
            setScreen("plan");
          }}
          onStartNew={() => {
            if (!timer.start) setTimer({ start: Date.now(), stop: null });
            setPlan(newPlan(today));
            setScreen("plan");
          }}
          onUpdatePass={updatePass}
          onOpenConsole={() => setShowConsole(true)}
        />
      </div>
    ),
    plan: <Plan plan={plan} setPlan={setPlan} onBack={() => setScreen("home")} onNext={() => setScreen("prove")} />,
    prove: (
      <Prove
        plan={plan}
        proof={proof}
        setProof={setProof}
        onPickFile={pickFile}
        onUseSample={useSample}
        campaignLink={campaignLink}
        setCampaignLink={setCampaignLink}
        onBack={() => setScreen("plan")}
        onNext={goToReview}
      />
    ),
    review: (
      <Review
        plan={plan}
        proof={proof}
        campaignLink={campaignLink}
        note={note}
        setNote={setNote}
        onRedraft={() => runDraft(buildFacts(plan, proofForCalc, campaignLink), note.key)}
        onBack={() => setScreen("prove")}
        onApprove={approve}
      />
    ),
    declared: pass && <Declared pass={pass} today={today} onHome={() => setScreen("home")} />,
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center sm:py-6">
      <div style={frameScale < 1 ? { zoom: frameScale } : undefined} className="relative w-full h-dvh sm:w-[390px] sm:h-[844px] sm:rounded-[52px] sm:border-[12px] sm:border-[#11141a] sm:shadow-2xl overflow-hidden bg-canvas flex flex-col">
        {/* Fake status bar, desktop frame only */}
        <div className="hidden sm:flex h-11 shrink-0 items-center justify-between px-7 bg-white text-[13px] font-semibold">
          <span>9:41</span>
          <span className="absolute left-1/2 -translate-x-1/2 top-2 h-7 w-28 rounded-full bg-[#11141a]" />
          <span className="tracking-tight">5G ▮▮▮</span>
        </div>
        {/* Prototype strip: label + visible timer */}
        <div className="shrink-0 flex items-center justify-between px-4 py-1.5 bg-white border-b border-line text-[11px]">
          <button onClick={tapLabel} className="rounded-full bg-[#fff4e5] text-[#9a5b00] px-2 py-0.5 font-medium select-none">
            Concept prototype
          </button>
          {timer.start && (
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold tabular-nums ${timer.stop ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-700"}`}>
              <Timer size={12} /> {fmtTimer(elapsed)}
            </span>
          )}
        </div>
        <div className="flex-1 min-h-0">{screens[screen]}</div>

        {panel && (
          <DemoPanel
            onClose={() => setPanel(false)}
            fastForward={fastForward}
            setFastForward={setFastForward}
            simulated={simulated}
            setSimulated={setSimulated}
            onReset={() => { reset(); setPanel(false); }}
            onConsole={pass ? () => { setShowConsole(true); setPanel(false); } : null}
          />
        )}
      </div>
      <p className="hidden sm:block mt-4 text-xs text-muted max-w-[390px] text-center leading-relaxed">
        Spike Pass: a concept prototype for the Razorpay AI x PM Build Challenge. Not an official Razorpay product. All merchant data is
        synthetic.
      </p>
      {showConsole && pass && (
        <RiskConsole pass={pass} proof={proof} note={note} campaignLink={campaignLink} onClose={() => setShowConsole(false)} />
      )}
    </div>
  );
}

function DemoPanel({ onClose, fastForward, setFastForward, simulated, setSimulated, onReset, onConsole }) {
  return (
    <div className="absolute inset-0 z-40 bg-black/40 flex items-end" onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">Demo controls</span>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <Row label="Simulated AI (no API calls)" hint="Off = call the reference Claude routes (needs a key)">
          <Toggle on={simulated} onChange={setSimulated} label="Simulated AI" />
        </Row>
        <Row label="Fast-forward to 30 Oct" hint="Shows the live actual-vs-declared meter">
          <Toggle on={fastForward} onChange={setFastForward} label="Fast-forward" />
        </Row>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={onReset} className="h-11 rounded-xl border border-line text-sm font-medium">Reset demo</button>
          <button disabled={!onConsole} onClick={onConsole} className="h-11 rounded-xl border border-line text-sm font-medium disabled:opacity-40">
            Risk console
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, hint, children }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-line">
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted">{hint}</div>
      </div>
      {children}
    </div>
  );
}
