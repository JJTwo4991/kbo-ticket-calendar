import type { VercelRequest, VercelResponse } from '@vercel/node';
import { subscribe, unsubscribe } from './_lib/storage.js';

const VALID_TEAMS = new Set([
  'SSG', 'LG', '두산', '키움', 'KT', 'NC', '삼성', '롯데', '한화', 'KIA',
]);

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { userId, team, timings, enabled } = req.body as {
    userId?: string;
    team?: string;
    timings?: string[];
    enabled?: boolean;
  };

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  if (!team || !VALID_TEAMS.has(team)) {
    res.status(400).json({
      error: `team must be one of: ${[...VALID_TEAMS].join(', ')}`,
    });
    return;
  }

  if (enabled === false) {
    unsubscribe(userId);
    res.status(200).json({ status: 'unsubscribed', userId });
    return;
  }

  const resolvedTimings: string[] =
    Array.isArray(timings) && timings.length > 0 ? timings : ['1d', '1h', '10m'];

  const sub = subscribe(userId, team, resolvedTimings, true);
  res.status(200).json({ status: 'subscribed', subscription: sub });
}
