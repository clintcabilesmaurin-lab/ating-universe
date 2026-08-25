import { RELATIONSHIP_START_DATE_ISO, FIRST_YEAR_ANNIVERSARY_DATE_ISO } from '../data/universeData';

export interface CountdownBreakdown {
  isReached: boolean;
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TimeTogetherBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Checks if the 1st year anniversary date (September 22, 2026 at 9:00 PM PST) has been reached.
 */
export function isFirstYearAnniversaryUnlocked(now: Date = new Date()): boolean {
  const targetTime = new Date(FIRST_YEAR_ANNIVERSARY_DATE_ISO).getTime();
  return now.getTime() >= targetTime;
}

/**
 * Calculates countdown remaining until the target anniversary date.
 */
export function calculateCountdownToTarget(
  targetDate: Date = new Date(FIRST_YEAR_ANNIVERSARY_DATE_ISO),
  currentTime: Date = new Date()
): CountdownBreakdown {
  const diffMs = targetDate.getTime() - currentTime.getTime();

  if (diffMs <= 0) {
    return {
      isReached: true,
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    isReached: false,
    totalMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
  };
}

/**
 * Calculates total duration spent together since September 22, 2025 (9:00 PM PST).
 */
export function calculateTimeTogether(
  startDate: Date = new Date(RELATIONSHIP_START_DATE_ISO),
  currentTime: Date = new Date()
): TimeTogetherBreakdown {
  const diffMs = Math.max(0, currentTime.getTime() - startDate.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}
