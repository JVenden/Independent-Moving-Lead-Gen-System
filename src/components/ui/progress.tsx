import { cn } from "@/lib/utils";

/** Dependency-free progress bar (no @radix-ui/react-progress needed). */
export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn("w-full overflow-hidden rounded-full bg-slate-200", className)}
    >
      <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}
