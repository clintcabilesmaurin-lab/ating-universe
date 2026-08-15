import { VisitState } from '../types';

const STORAGE_KEY = 'ating-universe:visit-state';

const DEFAULT_STATE: VisitState = {
  hasVisitedBefore: false,
  lastVisitTimestamp: null,
  lastScrollPosition: null,
  visitCount: 0,
  unlockedWishes: [],
};

export function readState(): VisitState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_STATE };
    }

    const parsed = JSON.parse(raw);
    return {
      hasVisitedBefore: parsed.hasVisitedBefore === true,
      lastVisitTimestamp: typeof parsed.lastVisitTimestamp === 'string' ? parsed.lastVisitTimestamp : null,
      lastScrollPosition: typeof parsed.lastScrollPosition === 'string' ? parsed.lastScrollPosition : null,
      visitCount: Number.isFinite(parsed.visitCount) ? parsed.visitCount : 0,
      unlockedWishes: Array.isArray(parsed.unlockedWishes) ? parsed.unlockedWishes : [],
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function recordVisitStart(): VisitState {
  try {
    const current = readState();
    const next: VisitState = {
      hasVisitedBefore: true,
      lastVisitTimestamp: new Date().toISOString(),
      lastScrollPosition: current.lastScrollPosition,
      visitCount: current.visitCount + 1,
      unlockedWishes: current.unlockedWishes,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return { ...DEFAULT_STATE, hasVisitedBefore: true, visitCount: 1 };
  }
}

export function setLastScrollPosition(worldId: string): void {
  if (!worldId) return;
  try {
    const current = readState();
    const next: VisitState = { ...current, lastScrollPosition: worldId };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Fail soft
  }
}

export function saveUnlockedWish(wish: string): string[] {
  try {
    const current = readState();
    if (!current.unlockedWishes.includes(wish)) {
      const updated = [...current.unlockedWishes, wish];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, unlockedWishes: updated }));
      return updated;
    }
    return current.unlockedWishes;
  } catch {
    return [wish];
  }
}

export function resetVisitState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Fail soft
  }
}
