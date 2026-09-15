// =========================================================================
// ATING UNIVERSE - ADVANCED SEASONS & BLENDED ATMOSPHERE THEME ENGINE
// 1. Four Calendar Seasons (Summer, Winter, Autumn, Spring) - Auto-computed
// 2. Blended Atmospheric Mood Themes (Golden Hour, Romantic Dark, Twilight Velvet, etc.)
// 3. Random Occurrence Scheduler with smooth crossfades and interactive controls
// =========================================================================

export type SeasonId = 'summer' | 'winter' | 'autumn' | 'spring';

export type AtmosphereMoodId =
  | 'golden-hour'
  | 'romantic-dark'
  | 'twilight-velvet'
  | 'midnight-starlight'
  | 'ethereal-aurora'
  | 'celestial-dawn'
  | 'cosmic-love-haze';

export type RgbTuple = [number, number, number];

export interface SeasonThemeConfig {
  id: SeasonId;
  name: string;
  englishName: string;
  emoji: string;
  accentColor: string;
  tagline: string;
  seasonalParticleType: 'sakura' | 'firefly' | 'amber-leaf' | 'snowflake';
  seasonalParticleColor: string;
  calendarDateRange: string;
  skyBaseZenithRgb: RgbTuple;
  skyBaseUpperRgb: RgbTuple;
  skyBaseMidRgb: RgbTuple;
  skyBaseHorizonRgb: RgbTuple;
  ambientLightColor: string;
  sunDirLightColor: string;
  lumiAuraColor: string;
  whisper: string;
}

export interface AtmosphereMoodConfig {
  id: AtmosphereMoodId;
  name: string;
  tagline: string;
  emoji: string;
  accentColor: string;
  glowColor: string;
  badgeBg: string;
  badgeBorder: string;
  blendZenithRgb: RgbTuple;
  blendUpperRgb: RgbTuple;
  blendMidRgb: RgbTuple;
  blendHorizonRgb: RgbTuple;
  overlayGradientClass: string;
  overlayGradientInline: string;
  whisperTemplate: string;
}

export interface BlendedThemeState {
  // Season Data
  seasonId: SeasonId;
  isSeasonAutoCalendar: boolean;
  seasonConfig: SeasonThemeConfig;

  // Mood Overlay Data
  moodId: AtmosphereMoodId;
  isRandomMoodActive: boolean;
  moodConfig: AtmosphereMoodConfig;
  blendWeight: number; // 0 (pure season) to 1 (pure mood) - default 0.65

  // Blended Output Colors
  blendedZenithRgb: RgbTuple;
  blendedUpperRgb: RgbTuple;
  blendedMidRgb: RgbTuple;
  blendedHorizonRgb: RgbTuple;
  blendedAccentColor: string;
  blendedGlowColor: string;

  // Particle Settings
  seasonalParticleType: 'sakura' | 'firefly' | 'amber-leaf' | 'snowflake';
  seasonalParticleColor: string;

  // Timestamp of last change
  lastShiftTimestamp: number;
}

// =========================================================================
// 1. SEASON THEMES (SUMMER, WINTER, AUTUMN, SPRING)
// =========================================================================

export const SEASONS_CONFIG: Record<SeasonId, SeasonThemeConfig> = {
  summer: {
    id: 'summer',
    name: 'Tag-araw',
    englishName: 'Summer',
    emoji: '☀️',
    accentColor: '#f59e0b',
    tagline: 'Maliwanag na sikat ng araw at alitaptap sa payapang gabi',
    seasonalParticleType: 'firefly',
    seasonalParticleColor: '#fef08a',
    calendarDateRange: 'Hunyo 21 – Setyembre 21',
    skyBaseZenithRgb: [8, 16, 44],
    skyBaseUpperRgb: [22, 38, 92],
    skyBaseMidRgb: [44, 76, 142],
    skyBaseHorizonRgb: [82, 128, 196],
    ambientLightColor: '#fef3c7',
    sunDirLightColor: '#fde047',
    lumiAuraColor: 'rgba(251, 191, 36, 0.5)',
    whisper: "Mainit man ang tag-araw Lovey, mas nag-aalab naman ang pagmamahal ko sa'yo! ☀️✨",
  },
  autumn: {
    id: 'autumn',
    name: 'Taglagas',
    englishName: 'Autumn',
    emoji: '🍂',
    accentColor: '#f97316',
    tagline: 'Ginintuang mga dahon na sumasayaw sa romantikong simoy ng hangin',
    seasonalParticleType: 'amber-leaf',
    seasonalParticleColor: '#fdba74',
    calendarDateRange: 'Setyembre 22 – Disyembre 20',
    skyBaseZenithRgb: [12, 10, 36],
    skyBaseUpperRgb: [38, 24, 68],
    skyBaseMidRgb: [82, 44, 98],
    skyBaseHorizonRgb: [142, 78, 126],
    ambientLightColor: '#fed7aa',
    sunDirLightColor: '#fb923c',
    lumiAuraColor: 'rgba(249, 115, 22, 0.5)',
    whisper: 'Unti-unting nalalagas ang mga dahon ng taglagas... 🍂 pero ang pag-ibig ko sa iyo, kailanman ay hindi kukupas.',
  },
  winter: {
    id: 'winter',
    name: 'Taglamig',
    englishName: 'Winter',
    emoji: '❄️',
    accentColor: '#38bdf8',
    tagline: 'Crystalline starlight niyebe at yakap na nagpapainit ng puso',
    seasonalParticleType: 'snowflake',
    seasonalParticleColor: '#bae6fd',
    calendarDateRange: 'Disyembre 21 – Marso 19',
    skyBaseZenithRgb: [4, 8, 28],
    skyBaseUpperRgb: [10, 20, 58],
    skyBaseMidRgb: [22, 42, 96],
    skyBaseHorizonRgb: [46, 78, 148],
    ambientLightColor: '#e0f2fe',
    sunDirLightColor: '#bae6fd',
    lumiAuraColor: 'rgba(56, 189, 248, 0.5)',
    whisper: 'Malamig ang simoy ng hangin ngayong taglamig... ❄️ Halika rito, yayakapin kita nang mahigpit para uminit ka Lovey.',
  },
  spring: {
    id: 'spring',
    name: 'Tagsibol',
    englishName: 'Spring',
    emoji: '🌸',
    accentColor: '#ec4899',
    tagline: 'Namumukadkad na sakura at sariwang pag-asa sa bawat hakbang',
    seasonalParticleType: 'sakura',
    seasonalParticleColor: '#fbcfe8',
    calendarDateRange: 'Marso 20 – Hunyo 20',
    skyBaseZenithRgb: [10, 14, 38],
    skyBaseUpperRgb: [32, 28, 72],
    skyBaseMidRgb: [74, 52, 114],
    skyBaseHorizonRgb: [136, 88, 160],
    ambientLightColor: '#fce7f3',
    sunDirLightColor: '#f472b6',
    lumiAuraColor: 'rgba(244, 114, 182, 0.5)',
    whisper: 'Amoy tagsibol ang simoy ng hangin Lovey! 🌸 Ang sarap maglakad nang magkahawak-kamay sa ilalim ng mga bulaklak.',
  },
};

// =========================================================================
// 2. BLENDED ATMOSPHERIC MOOD THEMES
// =========================================================================

export const ATMOSPHERE_MOODS: AtmosphereMoodConfig[] = [
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    tagline: 'Araw ng Ginto • Mainit na honeyed amber at kumikinang na sinag',
    emoji: '🌅',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    badgeBorder: 'rgba(245, 158, 11, 0.4)',
    blendZenithRgb: [26, 16, 40],
    blendUpperRgb: [88, 42, 62],
    blendMidRgb: [192, 92, 56],
    blendHorizonRgb: [255, 176, 92],
    overlayGradientClass: 'from-amber-500/25 via-orange-600/15 to-amber-900/35',
    overlayGradientInline:
      'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(234, 88, 12, 0.12) 50%, rgba(120, 53, 15, 0.32) 100%)',
    whisperTemplate: 'Kay ganda ng Golden Hour... para kang sinisinagan ng gintong pag-ibig, aking prinsesa. ✨',
  },
  {
    id: 'romantic-dark',
    name: 'Romantic Dark',
    tagline: 'Romantikong Karilagan • Malalim na wine velvet at rose starlight',
    emoji: '🌹',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.48)',
    badgeBg: 'rgba(244, 63, 94, 0.16)',
    badgeBorder: 'rgba(244, 63, 94, 0.4)',
    blendZenithRgb: [18, 4, 20],
    blendUpperRgb: [52, 14, 38],
    blendMidRgb: [108, 26, 64],
    blendHorizonRgb: [178, 52, 96],
    overlayGradientClass: 'from-rose-900/35 via-purple-950/25 to-slate-950/45',
    overlayGradientInline:
      'linear-gradient(160deg, rgba(136, 19, 55, 0.28) 0%, rgba(88, 28, 135, 0.16) 55%, rgba(15, 23, 42, 0.38) 100%)',
    whisperTemplate: 'Sa katahimikan ng Romantic Dark, naririnig ko ang tibok ng puso mo kahit gaano kalayo. 💖',
  },
  {
    id: 'twilight-velvet',
    name: 'Twilight Velvet',
    tagline: 'Ube na Takipsilim • Misteryosong amethyst at magenta ethereal mist',
    emoji: '💜',
    accentColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    badgeBg: 'rgba(192, 132, 252, 0.16)',
    badgeBorder: 'rgba(192, 132, 252, 0.4)',
    blendZenithRgb: [14, 8, 34],
    blendUpperRgb: [48, 22, 82],
    blendMidRgb: [112, 50, 142],
    blendHorizonRgb: [194, 98, 178],
    overlayGradientClass: 'from-purple-900/30 via-fuchsia-950/20 to-indigo-950/40',
    overlayGradientInline:
      'linear-gradient(145deg, rgba(88, 28, 135, 0.26) 0%, rgba(112, 26, 117, 0.16) 50%, rgba(30, 27, 75, 0.34) 100%)',
    whisperTemplate: 'Napakahiwaga ng Twilight Velvet... para tayong nasa sariling engkantadong panaginip. 🌙✨',
  },
  {
    id: 'midnight-starlight',
    name: 'Midnight Starlight',
    tagline: 'Hatinggabi ng mga Bituin • Malalim na sapphire at diamond glitter',
    emoji: '🌌',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    badgeBg: 'rgba(56, 189, 248, 0.16)',
    badgeBorder: 'rgba(56, 189, 248, 0.4)',
    blendZenithRgb: [3, 6, 18],
    blendUpperRgb: [8, 16, 42],
    blendMidRgb: [18, 36, 82],
    blendHorizonRgb: [36, 68, 132],
    overlayGradientClass: 'from-sky-950/40 via-blue-950/20 to-slate-950/50',
    overlayGradientInline:
      'linear-gradient(180deg, rgba(8, 47, 73, 0.28) 0%, rgba(15, 23, 42, 0.15) 50%, rgba(2, 6, 23, 0.42) 100%)',
    whisperTemplate: 'Sa ilalim ng Midnight Starlight, bawat kislap ng bituin ay pangakong mamahalin kita magpakailanman. 💫',
  },
  {
    id: 'ethereal-aurora',
    name: 'Ethereal Aurora',
    tagline: 'Sayaw ng Hilagang Liwanag • Cyan at emerald waves sa kalangitan',
    emoji: '✨',
    accentColor: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.48)',
    badgeBg: 'rgba(52, 211, 153, 0.16)',
    badgeBorder: 'rgba(52, 211, 153, 0.4)',
    blendZenithRgb: [4, 16, 26],
    blendUpperRgb: [14, 52, 68],
    blendMidRgb: [28, 118, 108],
    blendHorizonRgb: [62, 212, 162],
    overlayGradientClass: 'from-emerald-900/30 via-teal-950/20 to-cyan-950/35',
    overlayGradientInline:
      'linear-gradient(135deg, rgba(6, 78, 59, 0.26) 0%, rgba(19, 78, 74, 0.18) 50%, rgba(8, 47, 73, 0.32) 100%)',
    whisperTemplate: 'Sumasayaw ang Aurora sa ating kalawakan! Tanda ng walang katapusang himala ng pag-ibig natin. 💚✨',
  },
  {
    id: 'celestial-dawn',
    name: 'Celestial Dawn',
    tagline: 'Bukang-liwayway ng Puso • Mahinahong peach, lilac, at sariwang umaga',
    emoji: '🌄',
    accentColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.45)',
    badgeBg: 'rgba(251, 146, 60, 0.16)',
    badgeBorder: 'rgba(251, 146, 60, 0.4)',
    blendZenithRgb: [20, 24, 54],
    blendUpperRgb: [70, 54, 96],
    blendMidRgb: [156, 102, 138],
    blendHorizonRgb: [254, 176, 152],
    overlayGradientClass: 'from-orange-500/20 via-rose-500/15 to-purple-900/30',
    overlayGradientInline:
      'linear-gradient(135deg, rgba(251, 146, 60, 0.22) 0%, rgba(244, 114, 182, 0.14) 50%, rgba(88, 28, 135, 0.28) 100%)',
    whisperTemplate: 'Ang Celestial Dawn ang nagpapaalala sa akin kung gaano kasuwerte ang bawat bagong umagang kasama ka. 🌅💖',
  },
  {
    id: 'cosmic-love-haze',
    name: 'Cosmic Love Haze',
    tagline: 'Halimuyak ng Pag-ibig • Strawberry pink mist at lumulutang na pagmamahal',
    emoji: '💖',
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.48)',
    badgeBg: 'rgba(236, 72, 153, 0.16)',
    badgeBorder: 'rgba(236, 72, 153, 0.4)',
    blendZenithRgb: [24, 8, 30],
    blendUpperRgb: [76, 24, 64],
    blendMidRgb: [152, 56, 110],
    blendHorizonRgb: [240, 114, 162],
    overlayGradientClass: 'from-pink-900/30 via-rose-950/20 to-purple-950/35',
    overlayGradientInline:
      'linear-gradient(145deg, rgba(131, 24, 67, 0.26) 0%, rgba(159, 18, 57, 0.18) 50%, rgba(88, 28, 135, 0.32) 100%)',
    whisperTemplate: 'Punong-puno ng pag-ibig ang ating buong uniberso Lovey... ikaw at ikaw lang magpakailanman. 🌸💕',
  },
];

// =========================================================================
// 3. CALENDAR AUTO-DETECTION HELPER
// =========================================================================

/**
 * Calculates current season automatically based on calendar date:
 * - Spring: Mar 20 – Jun 20
 * - Summer: Jun 21 – Sep 21
 * - Autumn: Sep 22 – Dec 20
 * - Winter: Dec 21 – Mar 19
 */
export function getCalendarAutoSeason(date: Date = new Date()): SeasonId {
  const month = date.getMonth(); // 0 = Jan, 8 = Sep, etc.
  const day = date.getDate();

  // Spring: March 20 - June 20
  if (
    (month === 2 && day >= 20) ||
    month === 3 ||
    month === 4 ||
    (month === 5 && day <= 20)
  ) {
    return 'spring';
  }

  // Summer: June 21 - September 21
  if (
    (month === 5 && day >= 21) ||
    month === 6 ||
    month === 7 ||
    (month === 8 && day <= 21)
  ) {
    return 'summer';
  }

  // Autumn: September 22 - December 20
  if (
    (month === 8 && day >= 22) ||
    month === 9 ||
    month === 10 ||
    (month === 11 && day <= 20)
  ) {
    return 'autumn';
  }

  // Winter: December 21 - March 19
  return 'winter';
}

// =========================================================================
// 4. COLOR BLENDING HELPERS
// =========================================================================

export function lerpRgbTuple(c1: RgbTuple, c2: RgbTuple, t: number): RgbTuple {
  const clampedT = Math.max(0, Math.min(1, t));
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * clampedT),
    Math.round(c1[1] + (c2[1] - c1[1]) * clampedT),
    Math.round(c1[2] + (c2[2] - c1[2]) * clampedT),
  ];
}

/**
 * Computes full blended theme snapshot
 */
export function computeBlendedTheme(
  seasonId: SeasonId,
  isSeasonAutoCalendar: boolean,
  moodId: AtmosphereMoodId,
  isRandomMoodActive: boolean,
  blendWeight: number = 0.65,
  lastShiftTimestamp: number = Date.now()
): BlendedThemeState {
  const seasonConfig = SEASONS_CONFIG[seasonId];
  const moodConfig =
    ATMOSPHERE_MOODS.find((m) => m.id === moodId) || ATMOSPHERE_MOODS[0];

  const blendedZenithRgb = lerpRgbTuple(
    seasonConfig.skyBaseZenithRgb,
    moodConfig.blendZenithRgb,
    blendWeight
  );
  const blendedUpperRgb = lerpRgbTuple(
    seasonConfig.skyBaseUpperRgb,
    moodConfig.blendUpperRgb,
    blendWeight
  );
  const blendedMidRgb = lerpRgbTuple(
    seasonConfig.skyBaseMidRgb,
    moodConfig.blendMidRgb,
    blendWeight
  );
  const blendedHorizonRgb = lerpRgbTuple(
    seasonConfig.skyBaseHorizonRgb,
    moodConfig.blendHorizonRgb,
    blendWeight
  );

  return {
    seasonId,
    isSeasonAutoCalendar,
    seasonConfig,
    moodId,
    isRandomMoodActive,
    moodConfig,
    blendWeight,
    blendedZenithRgb,
    blendedUpperRgb,
    blendedMidRgb,
    blendedHorizonRgb,
    blendedAccentColor: moodConfig.accentColor,
    blendedGlowColor: moodConfig.glowColor,
    seasonalParticleType: seasonConfig.seasonalParticleType,
    seasonalParticleColor: seasonConfig.seasonalParticleColor,
    lastShiftTimestamp,
  };
}

/**
 * Picks a random mood different from current mood
 */
export function pickNextRandomMood(currentMoodId: AtmosphereMoodId): AtmosphereMoodId {
  const candidates = ATMOSPHERE_MOODS.filter((m) => m.id !== currentMoodId);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex].id;
}
