import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className,
  size = "md",
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative w-full bg-border",
          size === "sm" ? "h-px" : "h-0.5",
        )}
      >
        <div
          className="h-full bg-foreground transition-all duration-200"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {clamped}%
        </span>
      )}
    </div>
  );
}
