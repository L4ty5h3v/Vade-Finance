import { InvoiceStatus } from "@/lib/app-data";

type Props = {
  status: InvoiceStatus | "Active" | "Defaulted" | "Open" | "Pending";
};

const map: Record<Props["status"], string> = {
  Verified: "bg-emerald-100 text-emerald-800 border-emerald-300",
  Listed: "bg-blue-100 text-blue-800 border-blue-300",
  Funded: "bg-indigo-100 text-indigo-800 border-indigo-300",
  Submitted: "bg-amber-100 text-amber-800 border-amber-300",
  Rejected: "bg-rose-100 text-rose-800 border-rose-300",
  Repaid: "bg-cyan-100 text-cyan-800 border-cyan-300",
  Defaulted: "bg-red-100 text-red-800 border-red-300",
  Pending: "bg-slate-100 text-slate-800 border-slate-300",
  Active: "bg-cyan-100 text-cyan-800 border-cyan-300",
  Open: "bg-blue-100 text-blue-800 border-blue-300",
};

export function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${map[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}
