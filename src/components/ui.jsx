import { ArrowLeft } from "lucide-react";

export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-brand text-white active:bg-brand-700 disabled:bg-brand/40",
    secondary: "bg-white text-ink border border-line active:bg-canvas",
    ghost: "text-brand active:bg-brand-50",
  };
  return (
    <button
      className={`h-12 rounded-xl px-4 text-[15px] font-semibold transition-colors flex items-center justify-center gap-2 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "", ...props }) {
  return (
    <div className={`bg-white rounded-2xl border border-line ${className}`} {...props}>
      {children}
    </div>
  );
}

export function TopBar({ title, step, onBack }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-2 pb-3 bg-white border-b border-line">
      <button onClick={onBack} className="h-10 w-10 grid place-items-center rounded-full active:bg-canvas" aria-label="Back">
        <ArrowLeft size={22} />
      </button>
      <div className="flex-1">
        <div className="font-heading text-[18px] font-semibold leading-tight">{title}</div>
        {step && <div className="text-xs text-muted">Spike Pass · step {step} of 3</div>}
      </div>
      {step && (
        <div className="flex gap-1 pr-2">
          {[1, 2, 3].map((i) => (
            <span key={i} className={`h-1.5 w-5 rounded-full ${i <= step ? "bg-brand" : "bg-line"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Label({ children, hint }) {
  return (
    <div className="mb-2">
      <div className="text-[13px] font-semibold text-ink">{children}</div>
      {hint && <div className="text-xs text-muted mt-0.5">{hint}</div>}
    </div>
  );
}

export function Toggle({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-brand" : "bg-[#cfd5df]"}`}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function BottomBar({ children }) {
  return <div className="px-4 pt-3 pb-5 bg-white border-t border-line">{children}</div>;
}

export function AiBadge({ source, live = "Read by Claude", off = "Simulated AI reading" }) {
  if (!source) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        source === "live" ? "bg-brand-50 text-brand-700" : "bg-[#f1f2f5] text-muted"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${source === "live" ? "bg-brand" : "bg-[#9aa3b2]"}`} />
      {source === "live" ? live : off}
    </span>
  );
}
