import { RiskGrade } from "@/lib/app-data";

type Props = { risk: RiskGrade };

const map: Record<RiskGrade, string> = {
  "A-": "bg-cyan-100 text-cyan-800 border-cyan-300",
  "B+": "bg-amber-100 text-amber-800 border-amber-300",
  B: "bg-rose-100 text-rose-800 border-rose-300",
};

export function RiskBadge({ risk }: Props) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${map[risk]}`}>{risk}</span>;
}
