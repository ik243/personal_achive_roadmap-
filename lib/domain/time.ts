export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function sumMinutes(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

export function minutesFromHoursAndMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

export function parseDurationInput(hours: number, minutes: number): number {
  const total = minutesFromHoursAndMinutes(hours, minutes);
  return total > 0 ? total : 0;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return startOfDay(date);
}

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function groupMinutesByDay(
  entries: Array<{ loggedAt: string; durationMinutes: number }>,
  days: number,
): Array<{ date: string; minutes: number }> {
  const start = daysAgo(days - 1);
  const buckets = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.set(toLocalDateKey(d), 0);
  }

  for (const entry of entries) {
    const logged = new Date(entry.loggedAt);
    if (logged < start) continue;
    const key = toLocalDateKey(logged);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + entry.durationMinutes);
    }
  }

  return Array.from(buckets.entries()).map(([date, minutes]) => ({ date, minutes }));
}
