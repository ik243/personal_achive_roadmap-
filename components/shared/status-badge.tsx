import type { StepStatus } from "@/lib/domain/types";
import { STATUS_LABELS } from "@/lib/domain/status";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<StepStatus, string> = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  PAUSED: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  COMPLETED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  SKIPPED: "bg-muted text-muted-foreground opacity-70",
};

export function StatusBadge({
  status,
  className,
}: {
  status: StepStatus;
  className?: string;
}) {
  return (
    <Badge variant="secondary" className={cn(statusStyles[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function StatusDot({ status }: { status: StepStatus }) {
  const colors: Record<StepStatus, string> = {
    NOT_STARTED: "bg-muted-foreground/40",
    IN_PROGRESS: "bg-blue-500 ring-4 ring-blue-500/20",
    PAUSED: "bg-amber-500",
    COMPLETED: "bg-emerald-500",
    SKIPPED: "bg-muted-foreground/30",
  };

  return (
    <span
      className={cn("inline-block size-3 rounded-full shrink-0", colors[status])}
      aria-hidden
    />
  );
}
