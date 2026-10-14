const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function formatReadingTime(minutes: number | null): string {
  if (!minutes) return '1 min read';
  return `${minutes} min read`;
}
