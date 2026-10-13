import { useRef } from "react";
import { Camera, Upload, FileText, Link2, Sparkles, Info, X } from "lucide-react";
import { TopBar, Card, Label, BottomBar, Button, AiBadge } from "../components/ui.jsx";
import { expectedSales, normalSales, supportedSales, saleDays, fmtLakh, fmtX, fmtINR, merchant } from "../lib/spikepass.js";

const FIELDS = [
  ["supplier", "Supplier", "text"],
  ["item", "Item", "text"],
  ["quantity", "Quantity", "number"],
  ["unitCost", "Cost per piece (₹)", "number"],
  ["invoiceTotal", "Total incl. boxes + GST (₹)", "number"],
  ["invoiceDate", "Invoice date", "date"],
];

export default function Prove({ plan, proof, setProof, onPickFile, onUseSample, campaignLink, setCampaignLink, onBack, onNext }) {
  const camRef = useRef();
  const fileRef = useRef();
  const f = proof.fields;
  const setField = (k, type) => (e) =>
    setProof((p) => ({ ...p, fields: { ...p.fields, [k]: type === "number" ? Number(e.target.value) || 0 : e.target.value } }));

  const pick = (e) => {
    const file = e.target.files?.[0];
    if (file) onPickFile(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Show what's behind it" step={2} onBack={onBack} />
      <div className="flex-1 scroll-y px-4 py-4 space-y-4">
        <Card className="p-4">
          <Label hint="A supplier invoice, handwritten bill or bulk order. AI reads it and fills in the details.">Proof</Label>

          {!proof.image ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => camRef.current.click()} className="h-24 rounded-xl border-2 border-dashed border-brand/30 bg-brand-50/50 flex flex-col items-center justify-center gap-1.5 text-brand active:bg-brand-50">
                  <Camera size={24} />
                  <span className="text-sm font-medium">Take photo</span>
                </button>
                <button onClick={() => fileRef.current.click()} className="h-24 rounded-xl border-2 border-dashed border-line flex flex-col items-center justify-center gap-1.5 text-ink active:bg-canvas">
                  <Upload size={22} />
                  <span className="text-sm font-medium">Upload</span>
                </button>
              </div>
              <button onClick={onUseSample} className="mt-3 w-full h-11 rounded-xl bg-canvas text-sm font-medium flex items-center justify-center gap-2 active:bg-line">
                <FileText size={16} /> Use the sample supplier invoice
              </button>
              <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
            </>
          ) : (
            <div className="flex gap-3">
              <img src={proof.image} alt="Your proof" className="h-24 w-20 object-cover object-top rounded-lg border border-line" />
              <div className="flex-1 min-w-0">
                {proof.loading ? (
                  <>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-brand">
                      <Sparkles size={15} className="animate-pulse" /> AI is reading your invoice…
                    </div>
                    <div className="skeleton h-3 w-4/5 mt-3" />
                    <div className="skeleton h-3 w-3/5 mt-2" />
                    <div className="skeleton h-3 w-2/3 mt-2" />
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium truncate">{f?.supplier || "Document"}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {f?.isSample ? "Supplier invoice" : "Your document"}
                      {f?.isSample ? " · synthetic sample" : ""}
                    </div>
                    <div className="mt-2"><AiBadge source={proof.source} /></div>
                  </>
                )}
              </div>
              <button onClick={() => setProof((p) => ({ ...p, image: null, fields: null, source: null }))} className="h-8 w-8 grid place-items-center rounded-full active:bg-canvas text-muted" aria-label="Remove">
                <X size={18} />
              </button>
            </div>
          )}

          {f && !proof.loading && (
            <>
              {f.confidence === "low" && (
                <p className="mt-3 text-[13px] text-amber-700 flex gap-1.5"><Info size={15} className="shrink-0 mt-0.5" />{f.note || "Some fields were hard to read. Please check them."}</p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {FIELDS.map(([k, label, type]) => (
                  <label key={k} className={`rounded-xl border border-line px-3 py-1.5 ${k === "supplier" || k === "item" ? "col-span-2" : ""}`}>
                    <span className="text-[11px] text-muted">{label}</span>
                    <input
                      type={type === "number" ? "text" : type}
                      inputMode={type === "number" ? "numeric" : undefined}
                      value={f[k] ?? ""}
                      onChange={setField(k, type)}
                      className="w-full text-[14px] font-medium outline-none bg-transparent"
                    />
                  </label>
                ))}
                <label className="col-span-2 rounded-xl border border-brand/30 bg-brand-50/40 px-3 py-1.5">
                  <span className="text-[11px] text-muted">Your usual selling price per piece (₹)</span>
                  <input
                    inputMode="numeric"
                    value={proof.sellingPrice || ""}
                    onChange={(e) => setProof((p) => ({ ...p, sellingPrice: Number(e.target.value.replace(/[^\d]/g, "")) || 0 }))}
                    className="w-full text-[14px] font-medium outline-none bg-transparent"
                  />
                </label>
              </div>
              <Plausibility plan={plan} proof={{ ...f, sellingPrice: proof.sellingPrice }} />
            </>
          )}
        </Card>

        <Card className="p-4">
          <Label hint="Your Instagram post or Shopify sale page">Campaign link</Label>
          <div className="flex items-center rounded-xl border border-line px-3 h-12 focus-within:border-brand">
            <Link2 size={16} className="text-muted mr-2" />
            <input
              value={campaignLink}
              onChange={(e) => setCampaignLink(e.target.value)}
              placeholder="Paste a link"
              className="flex-1 text-[14px] outline-none bg-transparent min-w-0"
            />
          </div>
          {!campaignLink && (
            <button onClick={() => setCampaignLink(merchant.campaignLinkPlaceholder)} className="mt-2 text-[13px] text-brand font-medium">
              Paste my latest Instagram post
            </button>
          )}
        </Card>

        {!f && !proof.loading && (
          <p className="text-[13px] text-muted px-1 leading-relaxed">
            You can continue without proof, but your Pass won't go live until Razorpay's team approves it.
          </p>
        )}
      </div>
      <BottomBar>
        <Button className="w-full" disabled={proof.loading} onClick={onNext}>
          {f || proof.loading ? "Continue" : "Continue without proof"}
        </Button>
      </BottomBar>
    </div>
  );
}

function Plausibility({ plan, proof }) {
  const supported = supportedSales(proof);
  if (!supported) {
    return <p className="mt-3 text-[13px] text-muted">Add the quantity and your selling price to see what this stock supports.</p>;
  }
  const sLift = supported / normalSales(plan);
  const covers = supported >= expectedSales(plan) * 0.9;
  const noun = /diya/i.test(proof.item || "") ? "diyas" : "pieces";
  return (
    <div className={`mt-3 rounded-xl p-3 text-[13px] leading-relaxed ${covers ? "bg-brand-50 text-ink" : "bg-amber-50 text-amber-900"}`}>
      <div className="flex gap-2">
        <Sparkles size={16} className={`shrink-0 mt-0.5 ${covers ? "text-brand" : "text-amber-600"}`} />
        <div>
          <b>{Number(proof.quantity).toLocaleString("en-IN")} {noun}</b> at about {fmtINR(proof.sellingPrice)} each supports roughly{" "}
          <b>{fmtLakh(supported)}</b> of sales, about {fmtX(sLift)} a normal {saleDays(plan)} days.{" "}
          {covers ? (
            <>That covers the {fmtX(plan.lift)} you're declaring.</>
          ) : (
            <>
              You're declaring {fmtX(plan.lift)}. Adding another invoice or a stock photo would help, or you can lower your estimate.
              You can still continue.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
