import { describe, expect, it } from "vitest";
import { formatDuration, groupMinutesByDay } from "@/lib/domain/time";

describe("duration formatting", () => {
  it("formats minutes only", () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
  });

  it("formats hours only", () => {
    expect(formatDuration(120)).toBe("2h");
  });
});

describe("groupMinutesByDay", () => {
  it("groups logs by calendar day", () => {
    const today = new Date().toISOString();
    const result = groupMinutesByDay(
      [{ loggedAt: today, durationMinutes: 60 }],
      7,
    );
    const total = result.reduce((sum, day) => sum + day.minutes, 0);
    expect(total).toBe(60);
  });
});
