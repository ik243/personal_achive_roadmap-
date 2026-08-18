import { describe, expect, it } from "vitest";
import { buildProgressMetrics, calculateProgressFromSteps } from "@/lib/domain/progress";
import type { Step } from "@/lib/domain/types";

function step(
  overrides: Partial<Step> & Pick<Step, "id" | "status" | "weight">,
): Step {
  return {
    projectId: "p1",
    sectionId: null,
    title: "Test",
    position: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    completedAt: null,
    ...overrides,
  };
}

describe("weighted progress", () => {
  it("calculates completed weight over active weight", () => {
    const steps = [
      step({ id: "1", status: "COMPLETED", weight: 1 }),
      step({ id: "2", status: "COMPLETED", weight: 2 }),
      step({ id: "3", status: "NOT_STARTED", weight: 3 }),
    ];
    const result = calculateProgressFromSteps(steps);
    expect(result.completedWeight).toBe(3);
    expect(result.activeWeight).toBe(6);
    expect(result.progress).toBe(50);
  });

  it("excludes skipped steps from denominator", () => {
    const steps = [
      step({ id: "1", status: "COMPLETED", weight: 2 }),
      step({ id: "2", status: "SKIPPED", weight: 5 }),
      step({ id: "3", status: "NOT_STARTED", weight: 2 }),
    ];
    const result = calculateProgressFromSteps(steps);
    expect(result.activeWeight).toBe(4);
    expect(result.completedWeight).toBe(2);
    expect(result.progress).toBe(50);
  });

  it("handles empty project safely", () => {
    const result = calculateProgressFromSteps([]);
    expect(result.progress).toBe(0);
    expect(result.activeWeight).toBe(0);
  });
});

describe("time aggregation", () => {
  it("sums time logs for steps", () => {
    const steps = [step({ id: "1", status: "IN_PROGRESS", weight: 1 })];
    const metrics = buildProgressMetrics(steps, [
      {
        id: "l1",
        stepId: "1",
        durationMinutes: 30,
        loggedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "l2",
        stepId: "1",
        durationMinutes: 45,
        loggedAt: "2026-01-02T00:00:00.000Z",
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ]);
    expect(metrics.totalSpentMinutes).toBe(75);
  });
});
