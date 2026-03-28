interface GameInfo {
  id: string;
  date: string;
  time: string;
  home: string;
  away: string;
  stadium?: string;
}

const scheduledTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function scheduleNotification(game: GameInfo, timing: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const gameDateTime = new Date(`${game.date}T${game.time}:00`);
  const now = new Date();

  let offsetMs = 0;
  if (timing === '1일 전') {
    offsetMs = 24 * 60 * 60 * 1000;
  } else if (timing === '1시간 전') {
    offsetMs = 60 * 60 * 1000;
  } else if (timing === '10분 전') {
    offsetMs = 10 * 60 * 1000;
  }

  const notifyAt = new Date(gameDateTime.getTime() - offsetMs);
  const delay = notifyAt.getTime() - now.getTime();

  if (delay <= 0) {
    return;
  }

  const timerId = setTimeout(() => {
    new Notification('KBO 경기 알림', {
      body: `${game.away} vs ${game.home} 경기가 ${timing} 시작됩니다!`,
      icon: '/favicon.ico',
      tag: `game-${game.id}-${timing}`,
    });
    scheduledTimers.delete(`${game.id}-${timing}`);
  }, delay);

  const key = `${game.id}-${timing}`;
  const existing = scheduledTimers.get(key);
  if (existing !== undefined) {
    clearTimeout(existing);
  }
  scheduledTimers.set(key, timerId);
}

export function cancelNotification(gameId: string): void {
  const prefixes = ['1일 전', '1시간 전', '10분 전'];
  for (const timing of prefixes) {
    const key = `${gameId}-${timing}`;
    const timerId = scheduledTimers.get(key);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      scheduledTimers.delete(key);
    }
  }
}
