import { describe, expect, it } from "vitest";
import { completedAtForStatus } from "@/lib/domain/status";

describe("completedAt behavior", () => {
  it("sets completedAt when marking completed", () => {
    const at = completedAtForStatus("COMPLETED", null);
    expect(at).toBeTruthy();
  });

  it("clears completedAt when not completed", () => {
    expect(completedAtForStatus("IN_PROGRESS", "2026-01-01T00:00:00.000Z")).toBeNull();
  });

  it("preserves completedAt when already completed", () => {
    const existing = "2026-01-01T00:00:00.000Z";
    expect(completedAtForStatus("COMPLETED", existing)).toBe(existing);
  });
});
