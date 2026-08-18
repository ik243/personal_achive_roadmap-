import type { StepStatus } from "./types";

export const STATUS_LABELS: Record<StepStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
};

export const WEIGHT_LABELS: Record<number, string> = {
  1: "Small",
  2: "Moderate",
  3: "Medium",
  4: "Large",
  5: "Major",
};

export function isCompletedStatus(status: StepStatus): boolean {
  return status === "COMPLETED";
}

export function isSkippedStatus(status: StepStatus): boolean {
  return status === "SKIPPED";
}

export function completedAtForStatus(
  status: StepStatus,
  previousCompletedAt: string | null,
): string | null {
  if (status === "COMPLETED") {
    return previousCompletedAt ?? new Date().toISOString();
  }
  return null;
}
