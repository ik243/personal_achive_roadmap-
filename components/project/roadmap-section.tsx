"use client";

import { getStepsForSectionSorted } from "@/lib/domain/aggregate";
import { formatDuration } from "@/lib/domain/time";
import type { SectionWithMetrics } from "@/lib/domain/types";
import { useAppData } from "@/providers/app-data-provider";
import { ProgressBar } from "@/components/shared/progress-bar";
import { RoadmapStepNode } from "./roadmap-step-node";

export function RoadmapSection({
  section,
  onSelectStep,
}: {
  section: SectionWithMetrics;
  onSelectStep: (stepId: string) => void;
}) {
  const { data } = useAppData();
  const steps = getStepsForSectionSorted(data, section.id);

  return (
    <section className="rounded-2xl border bg-card/50 p-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            {section.metrics.completedStepCount} / {section.metrics.stepCount} steps ·{" "}
            {formatDuration(section.metrics.totalSpentMinutes)}
          </p>
        </div>
        <div className="w-full max-w-xs">
          <ProgressBar value={section.metrics.progress} showLabel />
        </div>
      </div>

      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No steps in this section.</p>
      ) : (
        <div className="mx-auto max-w-md">
          {steps.map((step, index) => (
            <RoadmapStepNode
              key={step.id}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
              onSelect={() => onSelectStep(step.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
