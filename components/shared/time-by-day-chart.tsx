import { formatDuration } from "@/lib/domain/time";
import { cn } from "@/lib/utils";

interface TimeByDayChartProps {
  data: Array<{ date: string; minutes: number }>;
  className?: string;
  heightClass?: string;
}

export function TimeByDayChart({
  data,
  className,
  heightClass = "h-32",
}: TimeByDayChartProps) {
  const max = Math.max(...data.map((d) => d.minutes), 1);
  const hasData = data.some((d) => d.minutes > 0);

  if (!hasData) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No study time logged in this period.
      </p>
    );
  }

  return (
    <div className={cn("flex items-end gap-1", heightClass, className)}>
      {data.map((day, index) => {
        const barHeight = (day.minutes / max) * 100;
        const showLabel = data.length <= 14 || index % 5 === 0 || index === data.length - 1;

        return (
          <div
            key={day.date}
            className="flex h-full min-w-0 flex-1 flex-col items-center gap-1"
          >
            <div className="flex min-h-0 w-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-8 rounded-t bg-primary/90 transition-all hover:bg-primary"
                style={{
                  height: `${barHeight}%`,
                  minHeight: day.minutes > 0 ? "4px" : "0",
                }}
                title={`${day.date}: ${formatDuration(day.minutes)}`}
              />
            </div>
            {showLabel ? (
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {day.date.slice(5)}
              </span>
            ) : (
              <span className="shrink-0 text-[10px] text-transparent select-none">·</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
