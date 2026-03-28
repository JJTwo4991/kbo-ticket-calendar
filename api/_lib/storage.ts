export interface Subscription {
  userId: string;
  team: string;
  timings: string[]; // "1d", "1h", "10m"
  enabled: boolean;
}

// In-memory store (dev only - resets on cold start)
const subscriptions = new Map<string, Subscription>();

export function subscribe(
  userId: string,
  team: string,
  timings: string[],
  enabled: boolean
): Subscription {
  const sub: Subscription = { userId, team, timings, enabled };
  subscriptions.set(userId, sub);
  return sub;
}

export function getSubscribers(teamId: string): Subscription[] {
  const result: Subscription[] = [];
  for (const sub of subscriptions.values()) {
    if (sub.team === teamId && sub.enabled) {
      result.push(sub);
    }
  }
  return result;
}

export function unsubscribe(userId: string): void {
  subscriptions.delete(userId);
}
