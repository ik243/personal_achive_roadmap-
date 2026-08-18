"use client";

import type { Step } from "@/lib/domain/types";
import { StatusDot } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

export function RoadmapStepNode({
  step,
  index,
  isLast,
  onSelect,
}: {
  step: Step;
  index: number;
  isLast: boolean;
  onSelect: () => void;
}) {
  const isCompleted = step.status === "COMPLETED";
  const isSkipped = step.status === "SKIPPED";
  const alignRight = index % 2 === 1;

  return (
    <div className={cn("relative flex", alignRight ? "justify-end" : "justify-start")}>
      <div className={cn("relative w-[90%]", alignRight ? "pr-3" : "pl-3")}>
        {!isLast && (
          <div
            className={cn(
              "absolute top-6 bottom-0 w-px",
              alignRight ? "right-4" : "left-4",
              "bg-border",
            )}
          />
        )}

        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "flex w-full items-start gap-3 border-b border-border py-3 text-left transition-colors hover:text-foreground",
            isSkipped && "opacity-50",
            step.status === "IN_PROGRESS" && "font-medium",
            isCompleted && "text-muted-foreground",
          )}
        >
          <div className="mt-1 shrink-0">
            {isCompleted ? (
              <span className="font-mono text-xs">✓</span>
            ) : (
              <StatusDot status={step.status} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("leading-snug", isSkipped && "line-through")}>
              {step.title}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {step.weight} pts
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
