"use client";

import type { Step } from "@/lib/domain/types";
import { RoadmapStepNode } from "./roadmap-step-node";

export function RoadmapChain({
  steps,
  onSelectStep,
}: {
  steps: Step[];
  onSelectStep: (stepId: string) => void;
}) {
  if (steps.length === 0) return null;

  return (
    <div className="relative">
      {/* continuous chain line through all nodes */}
      <div
        className="absolute left-[7px] top-4 bottom-4 w-px bg-border"
        aria-hidden
      />
      <ul className="relative space-y-0">
        {steps.map((step) => (
          <RoadmapStepNode
            key={step.id}
            step={step}
            onSelect={() => onSelectStep(step.id)}
          />
        ))}
      </ul>
    </div>
  );
}
