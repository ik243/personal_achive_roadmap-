"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
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
      <div className={cn("relative w-[85%]", alignRight ? "pr-4" : "pl-4")}>
        {!isLast && (
          <div
            className={cn(
              "absolute top-8 bottom-0 w-px -translate-x-1/2",
              alignRight ? "right-6" : "left-6",
              isCompleted ? "bg-emerald-500/60" : "bg-border",
            )}
          />
        )}

        <motion.button
          type="button"
          onClick={onSelect}
          className={cn(
            "group relative flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
            step.status === "IN_PROGRESS" && "border-blue-500/40 bg-blue-500/5",
            isCompleted && "border-emerald-500/30 bg-emerald-500/5",
            isSkipped && "opacity-60",
            !isCompleted && step.status !== "IN_PROGRESS" && "hover:bg-muted/50",
          )}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="relative mt-0.5">
            {isCompleted ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white"
              >
                <Check className="size-3.5" />
              </motion.div>
            ) : (
              <StatusDot status={step.status} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "font-medium leading-snug",
                isSkipped && "line-through text-muted-foreground",
              )}
            >
              {step.title}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{step.weight} pts</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
