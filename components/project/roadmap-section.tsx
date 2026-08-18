"use client";

import { getStepsForSectionSorted } from "@/lib/domain/aggregate";
import { formatDuration } from "@/lib/domain/time";
import type { SectionWithMetrics } from "@/lib/domain/types";
import { useAppData } from "@/providers/app-data-provider";
import { ProgressBar } from "@/components/shared/progress-bar";
import { RoadmapChain } from "./roadmap-chain";

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
    <section className="border-l-2 border-border pl-5 sm:pl-6">
      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-heading text-base font-medium">{section.title}</h2>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {section.metrics.completedStepCount}/{section.metrics.stepCount} ·{" "}
            {formatDuration(section.metrics.totalSpentMinutes)}
          </span>
        </div>
        <ProgressBar value={section.metrics.progress} showLabel size="sm" />
      </div>

      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No steps yet.</p>
      ) : (
        <RoadmapChain steps={steps} onSelectStep={onSelectStep} />
      )}
    </section>
  );
}
