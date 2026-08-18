import { formatDuration } from "@/lib/domain/time";

export function DurationText({
  minutes,
  className,
}: {
  minutes: number;
  className?: string;
}) {
  return <span className={className}>{formatDuration(minutes)}</span>;
}
