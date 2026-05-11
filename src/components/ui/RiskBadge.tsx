type Risk = "A-" | "B+" | "B";

const riskStyles: Record<Risk, string> = {
  "A-": "bg-cyan-100/90 text-cyan-800 border-cyan-300/80",
  "B+": "bg-amber-100/90 text-amber-800 border-amber-300/80",
  B: "bg-rose-100/90 text-rose-800 border-rose-300/80",
};

type RiskBadgeProps = {
  risk: Risk;
};

export function RiskBadge({ risk }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${riskStyles[risk]}`}
    >
      {risk}
    </span>
  );
}
