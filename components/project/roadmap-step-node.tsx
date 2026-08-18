"use client";

import type { Step } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
function ChainNode({ status }: { status: Step["status"] }) {
  const isCompleted = status === "COMPLETED";
  const isSkipped = status === "SKIPPED";
  const isActive = status === "IN_PROGRESS";
  const isPaused = status === "PAUSED";

  return (
    <div
      className={cn(
        "relative z-10 flex size-4 shrink-0 items-center justify-center rounded-full border border-foreground/40 bg-card",
        isActive && "border-foreground bg-foreground",
        isCompleted && "border-muted-foreground bg-muted-foreground",
        isPaused && "border-muted-foreground bg-muted-foreground/40",
        isSkipped && "border-dashed border-muted-foreground/50 bg-transparent",
      )}
      aria-hidden
    >
      {isCompleted && (
        <span className="text-[9px] font-mono text-card leading-none">✓</span>
      )}
      {isActive && <span className="size-1.5 rounded-full bg-card" />}
    </div>
  );
}

export function RoadmapStepNode({
  step,
  onSelect,
}: {
  step: Step;
  onSelect: () => void;
}) {
  const isCompleted = step.status === "COMPLETED";
  const isSkipped = step.status === "SKIPPED";

  return (
    <li className="relative flex gap-3">
      <div className="flex w-4 shrink-0 flex-col items-center pt-3">
        <ChainNode status={step.status} />
      </div>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "min-w-0 flex-1 border-b border-border py-3 text-left transition-colors hover:opacity-80",
          isSkipped && "opacity-50",
          step.status === "IN_PROGRESS" && "font-medium",
          isCompleted && "text-muted-foreground",
        )}
      >
        <p className={cn("leading-snug", isSkipped && "line-through")}>{step.title}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{step.weight} pts</p>
      </button>
    </li>
  );
}
