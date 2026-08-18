import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Active"
      ? "bg-success/12 text-success"
      : "bg-destructive/12 text-destructive";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        tone,
      )}
    >
      {status}
    </span>
  );
}
