import { DailyQuoteLetter } from '../types';

export type { DailyQuoteLetter };

export interface LetterTopicTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const LETTER_THEMES: LetterTopicTheme[] = [
  {
    id: 'ldr',
    name: 'LDR & Distansya',
    emoji: '💫',
    description: 'Mga pangako, "Sooner", at pagmamahal sa kabila ng distansya',
  },
  {
    id: 'pangilatan',
    name: 'Alaala sa Pangilatan',
    emoji: '⛰️',
    description: 'Pag-akyat sa bundok, ulan, kanta sa gitara at liwayway',
  },
  {
    id: 'dreams',
    name: 'Japan & Siargao',
    emoji: '🌸',
    description: 'Mga pangarap nating biyahe, ramen, motor, at tabing-dagat',
  },
  {
    id: 'daily_care',
    name: 'Araw-araw na Pag-aalaga',
    emoji: '🍲',
    description: 'Paalala na kumain, uminom ng tubig, at huwag magpuyat',
  },
  {
    id: 'late_night',
    name: 'Late Night Talks',
    emoji: '🌙',
    description: 'Tawag sa madaling araw, pampatulog, at katahimikan',
  },
  {
    id: 'jokes',
    name: 'Kwentuhan & Tawanan',
    emoji: '😆',
    description: 'Mga corny jokes, lambing, at asaran nating dalawa',
  },
];

export const INITIAL_FALLBACK_LETTER: DailyQuoteLetter = {
  id: 'daily-ai-seed',
  quote: '"Kahit gaano kalayo ang distansya, iisang kalangitan at iisang buwan pa rin ang pinagmamasdan natin gabi-gabi."',
  author: 'Clint para kay Maica',
  theme: 'Distansya at Bituin',
  body: [
    'Dearest Lovey,',
    'Alam mo bang tuwing gabi bago ako matulog, tumitingin ako sa kalawakan at nagpapasalamat na ikaw ang tahanan ng puso ko.',
    'Mahirap man ang magkalayo kung minsan, naiisip ko na ang bawat kilometro sa pagitan natin ay nagpapatunay lang kung gaano katatag ang pagmamahal natin. "Sooner", Lovey... magkakasama rin tayo.',
    'Salamat sa pagiging aking lakas at inspirasyon araw-araw. Mahal na mahal kita!',
  ],
  closing: 'Palaging nagmamahal mula sa kabilang ibayo, Clint 💖',
  tag: 'LDR & Devotion',
  moodEmoji: '✨',
  generatedAt: new Date().toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' }),
};

const SAVED_LETTERS_KEY = 'maica_saved_ai_love_letters_v1';
const TODAY_LETTER_KEY = 'maica_today_ai_letter_v1';

export function getSavedLetters(): DailyQuoteLetter[] {
  try {
    const raw = localStorage.getItem(SAVED_LETTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLetterToArchive(letter: DailyQuoteLetter): boolean {
  try {
    const existing = getSavedLetters();
    if (existing.some((l) => l.id === letter.id || (l.quote === letter.quote && l.theme === letter.theme))) {
      return false; // already saved
    }
    const updated = [letter, ...existing];
    localStorage.setItem(SAVED_LETTERS_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.warn('Failed to save letter to archive:', e);
    return false;
  }
}

export function removeLetterFromArchive(id: string): void {
  try {
    const existing = getSavedLetters();
    const updated = existing.filter((l) => l.id !== id);
    localStorage.setItem(SAVED_LETTERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to remove letter from archive:', e);
  }
}

export function getTodayCachedLetter(): DailyQuoteLetter | null {
  try {
    const raw = localStorage.getItem(TODAY_LETTER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const todayStr = new Date().toDateString();
    if (parsed.savedDate === todayStr && parsed.letter) {
      return parsed.letter;
    }
    return null;
  } catch {
    return null;
  }
}

export function setTodayCachedLetter(letter: DailyQuoteLetter): void {
  try {
    localStorage.setItem(
      TODAY_LETTER_KEY,
      JSON.stringify({
        savedDate: new Date().toDateString(),
        letter,
      })
    );
  } catch (e) {
    console.warn('Failed to cache today letter:', e);
  }
}
