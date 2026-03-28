import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubscribers } from './_lib/storage.js';
import { sendPush } from './_lib/toss-push.js';

interface Game {
  date: string;   // "YYYY-MM-DD"
  time: string;   // "HH:MM"
  home: string;
  away: string;
  [key: string]: unknown;
}

// Alert windows in milliseconds before game time
const ALERT_OFFSETS: Record<string, number> = {
  '1d':  24 * 60 * 60 * 1000,
  '1h':       60 * 60 * 1000,
  '10m':      10 * 60 * 1000,
};

// How close |now - alertTime| must be to fire the alert (±30 min)
const WINDOW_MS = 30 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers['authorization'];
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Load schedule JSON at runtime (path resolved relative to this file)
  let games: Game[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const scheduleData = require('../src/data/schedule.json') as Game[] | { default: Game[] };
    games = Array.isArray(scheduleData) ? scheduleData : scheduleData.default;
  } catch {
    res.status(500).json({ error: 'Failed to load schedule data' });
    return;
  }

  const now = Date.now();
  let totalSent = 0;
  let totalFailed = 0;

  for (const game of games) {
    // Parse game time as KST (+09:00)
    const gameTime = new Date(`${game.date}T${game.time}:00+09:00`).getTime();
    if (isNaN(gameTime)) continue;

    for (const [timingKey, offsetMs] of Object.entries(ALERT_OFFSETS)) {
      const alertTime = gameTime - offsetMs;
      if (Math.abs(now - alertTime) > WINDOW_MS) continue;

      // Collect unique subscribers from both teams in the game
      const homeSubscribers = getSubscribers(game.home);
      const awaySubscribers = getSubscribers(game.away);

      // Deduplicate by userId
      const subscriberMap = new Map(
        [...homeSubscribers, ...awaySubscribers].map((s) => [s.userId, s])
      );

      for (const sub of subscriberMap.values()) {
        // Only send if user opted into this timing
        if (!sub.timings.includes(timingKey)) continue;

        const timingLabel =
          timingKey === '1d' ? '내일' : timingKey === '1h' ? '1시간 후' : '10분 후';

        const ok = await sendPush({
          userId: sub.userId,
          title: `⚾ ${game.away} vs ${game.home} 경기 알림`,
          body: `${timingLabel} 경기가 시작됩니다! (${game.date} ${game.time} KST)`,
          deepLink: `kbo://game?date=${game.date}&home=${encodeURIComponent(game.home)}&away=${encodeURIComponent(game.away)}`,
        });

        if (ok) {
          totalSent++;
        } else {
          totalFailed++;
        }
      }
    }
  }

  res.status(200).json({
    status: 'ok',
    sent: totalSent,
    failed: totalFailed,
    checkedAt: new Date().toISOString(),
  });
}
