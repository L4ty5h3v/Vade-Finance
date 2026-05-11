type Status = "Verified" | "Listed" | "Funded";

const statusStyles: Record<Status, string> = {
  Verified: "bg-emerald-100/80 text-emerald-800 border-emerald-300/80",
  Listed: "bg-blue-100/80 text-blue-800 border-blue-300/80",
  Funded: "bg-indigo-100/80 text-indigo-800 border-indigo-300/80",
};

type StatusBadgeProps = {
  status: Status;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${statusStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}
