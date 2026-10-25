const DAY_MS = 24 * 60 * 60 * 1000;

export interface ActivityPulseRow {
  [key: string]: string | number;
  day: string;
  label: string;
  events: number;
}

interface ActivityPulseEvent {
  at: string | null;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Builds exactly `days` UTC calendar buckets ending today, in ascending order.
 * The key includes the year; the label is display-only. Events outside the
 * window are ignored instead of being appended as an out-of-order bucket.
 */
export function buildActivityPulseRows(
  events: ActivityPulseEvent[],
  now: Date = new Date(),
  days = 30
): ActivityPulseRow[] {
  const end = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const keys: string[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    keys.push(dayKey(new Date(end - i * DAY_MS)));
  }

  const counts = new Map(keys.map((key) => [key, 0]));
  for (const event of events) {
    if (!event.at) continue;
    const date = new Date(event.at);
    if (Number.isNaN(date.getTime())) continue;
    const key = dayKey(date);
    if (!counts.has(key)) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return keys.map((key) => ({
    day: key,
    label: formatter.format(new Date(`${key}T00:00:00Z`)),
    events: counts.get(key) ?? 0,
  }));
}
