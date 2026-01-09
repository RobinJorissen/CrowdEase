export function getDayOfWeek(timestamp: number): number {
  return new Date(timestamp).getDay();
}

export function getHourOfDay(timestamp: number): number {
  return new Date(timestamp).getHours();
}

export function getDayName(dayOfWeek: number): string {
  const days = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  return days[dayOfWeek];
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds} seconden geleden`;
  if (seconds < 120) return '1 minuut geleden';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minuten geleden`;
  if (seconds < 7200) return '1 uur geleden';
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} uur geleden`;
  return `${Math.floor(seconds / 86400)} dagen geleden`;
}
