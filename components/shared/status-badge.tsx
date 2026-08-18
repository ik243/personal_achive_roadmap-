import type { StepStatus } from "@/lib/domain/types";
import { STATUS_LABELS } from "@/lib/domain/status";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: StepStatus;
  className?: string;
}) {
  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function StatusDot({ status }: { status: StepStatus }) {
  const styles: Record<StepStatus, string> = {
    NOT_STARTED: "bg-transparent border border-muted-foreground/40",
    IN_PROGRESS: "bg-foreground",
    PAUSED: "bg-muted-foreground/60",
    COMPLETED: "bg-muted-foreground",
    SKIPPED: "bg-transparent border border-dashed border-muted-foreground/40",
  };

  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", styles[status])}
      aria-hidden
    />
  );
}
