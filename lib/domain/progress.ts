import type { ProgressMetrics, Step, TimeLog } from "./types";

export function calculateProgressFromSteps(steps: Step[]): Omit<
  ProgressMetrics,
  "totalSpentMinutes"
> {
  const activeSteps = steps.filter((step) => step.status !== "SKIPPED");
  const completedSteps = steps.filter((step) => step.status === "COMPLETED");

  const activeWeight = activeSteps.reduce((sum, step) => sum + step.weight, 0);
  const completedWeight = completedSteps.reduce((sum, step) => sum + step.weight, 0);
  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);

  const progress =
    activeWeight > 0 ? Math.round((completedWeight / activeWeight) * 100) : 0;

  return {
    progress,
    totalWeight,
    completedWeight,
    activeWeight,
    stepCount: steps.length,
    completedStepCount: completedSteps.length,
  };
}

export function calculateSpentMinutes(
  stepIds: string[],
  timeLogs: TimeLog[],
): number {
  const idSet = new Set(stepIds);
  return timeLogs
    .filter((log) => idSet.has(log.stepId))
    .reduce((sum, log) => sum + log.durationMinutes, 0);
}

export function buildProgressMetrics(
  steps: Step[],
  timeLogs: TimeLog[],
): ProgressMetrics {
  const progress = calculateProgressFromSteps(steps);
  const stepIds = steps.map((step) => step.id);
  const totalSpentMinutes = calculateSpentMinutes(stepIds, timeLogs);

  return {
    ...progress,
    totalSpentMinutes,
  };
}

export function isProjectComplete(metrics: ProgressMetrics): boolean {
  return metrics.activeWeight > 0 && metrics.completedWeight === metrics.activeWeight;
}
