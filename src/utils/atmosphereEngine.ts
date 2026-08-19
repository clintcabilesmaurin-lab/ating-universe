// =========================================================================
// ATING UNIVERSE - REAL-TIME ATMOSPHERE & 4-SEASON ENGINE
// Calculates exact celestial positions, sky lighting, seasonal particles,
// and contextual romantic dialogue based on real-time clock & calendar date.
// =========================================================================

export type TimeOfDayId = 'dawn' | 'day' | 'dusk' | 'night';
export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export interface AtmosphereState {
  timeOfDay: TimeOfDayId;
  timeProgress: number; // 0 to 1 progress within current time bracket
  season: SeasonId;
  hour: number;
  minute: number;
  month: number; // 0-11
  dayOfMonth: number;
  timeLabel: string;
  seasonLabel: string;
  timeEmoji: string;
  seasonEmoji: string;
  tagline: string;
  
  // Sky & Lighting Color Palettes
  skyZenithRgb: [number, number, number];
  skyUpperRgb: [number, number, number];
  skyMidRgb: [number, number, number];
  skyHorizonRgb: [number, number, number];
  
  // Three.js 3D Light Configuration
  ambientLightColor: string;
  ambientIntensity: number;
  sunDirLightColor: string;
  sunDirIntensity: number;
  secondaryLightColor: string;
  lumiAuraGlowColor: string;
  
  // Celestial Body State (Sun / Moon)
  celestialBody: 'sun' | 'moon' | 'both';
  sunAltitude: number; // -1 (below horizon) to 1 (zenith noon)
  sunAzimuth: number;  // 0 to 1 across sky
  moonAltitude: number;
  moonAzimuth: number;
  moonPhase: number;   // 0 (new) to 1 (full)
  
  // Season Specific Particle Theme
  seasonalParticleType: 'sakura' | 'firefly' | 'amber-leaf' | 'snowflake';
  seasonalParticleColor: string;
}

/**
 * Returns current season based on calendar month (Northern Hemisphere)
 * Spring: Mar (2), Apr (3), May (4)
 * Summer: Jun (5), Jul (6), Aug (7)
 * Autumn: Sep (8), Oct (9), Nov (10)
 * Winter: Dec (11), Jan (0), Feb (1)
 */
export function getSeasonFromDate(date: Date = new Date()): SeasonId {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

/**
 * Returns time of day based on current hour and minute:
 * - Dawn: 5:00 AM - 6:59 AM (5.0 <= h < 7.0)
 * - Day: 7:00 AM - 5:29 PM (7.0 <= h < 17.5)
 * - Dusk: 5:30 PM - 7:29 PM (17.5 <= h < 19.5)
 * - Night: 7:30 PM - 4:59 AM (19.5 <= h or h < 5.0)
 */
export function getTimeOfDayFromDate(date: Date = new Date()): { timeOfDay: TimeOfDayId; progress: number; decimalHour: number } {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const decimalHour = hours + minutes / 60 + seconds / 3600;

  if (decimalHour >= 5.0 && decimalHour < 7.0) {
    const progress = (decimalHour - 5.0) / 2.0;
    return { timeOfDay: 'dawn', progress, decimalHour };
  }
  if (decimalHour >= 7.0 && decimalHour < 17.5) {
    const progress = (decimalHour - 7.0) / 10.5;
    return { timeOfDay: 'day', progress, decimalHour };
  }
  if (decimalHour >= 17.5 && decimalHour < 19.5) {
    const progress = (decimalHour - 17.5) / 2.0;
    return { timeOfDay: 'dusk', progress, decimalHour };
  }
  
  // Nighttime (19.5 to 24.0 or 0.0 to 5.0)
  let progress = 0;
  if (decimalHour >= 19.5) {
    progress = (decimalHour - 19.5) / 9.5;
  } else {
    progress = (decimalHour + 4.5) / 9.5;
  }
  return { timeOfDay: 'night', progress, decimalHour };
}

/**
 * Calculates Moon Phase from Date (0 = New Moon, 0.5 = Full Moon, 1.0 = New Moon)
 */
export function getMoonPhase(date: Date = new Date()): number {
  // Known reference new moon: Jan 11, 2024
  const refNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0)).getTime();
  const synodicMonth = 29.53058770576 * 24 * 60 * 60 * 1000;
  const elapsed = date.getTime() - refNewMoon;
  const phase = (elapsed % synodicMonth) / synodicMonth;
  return phase < 0 ? phase + 1 : phase;
}

/**
 * Computes full real-time atmosphere snapshot
 */
export function getAtmosphereSnapshot(overrideDate?: Date, overrideTimeOfDay?: TimeOfDayId, overrideSeason?: SeasonId): AtmosphereState {
  const date = overrideDate || new Date();
  const { timeOfDay: naturalTime, progress: timeProgress, decimalHour } = getTimeOfDayFromDate(date);
  const naturalSeason = getSeasonFromDate(date);

  const timeOfDay = overrideTimeOfDay || naturalTime;
  const season = overrideSeason || naturalSeason;
  const moonPhase = getMoonPhase(date);

  // Time labels & emojis
  let timeLabel = 'Gabi';
  let timeEmoji = '🌙';
  let tagline = 'Payapang gabi sa ilalim ng mga bituin';

  if (timeOfDay === 'dawn') {
    timeLabel = 'Bukang-liwayway';
    timeEmoji = '🌅';
    tagline = 'Malamig at ginintuang pagsikat ng araw para sa atin';
  } else if (timeOfDay === 'day') {
    timeLabel = 'Araw';
    timeEmoji = '☀️';
    tagline = 'Maliwanag na kalawakan at masayang sandali';
  } else if (timeOfDay === 'dusk') {
    timeLabel = 'Takipsilim';
    timeEmoji = '🌆';
    tagline = 'Romantikong paglubog ng araw at kulay-ube na langit';
  }

  // Season labels & emojis
  let seasonLabel = 'Taglamig';
  let seasonEmoji = '❄️';
  let seasonalParticleType: 'sakura' | 'firefly' | 'amber-leaf' | 'snowflake' = 'snowflake';
  let seasonalParticleColor = '#bae6fd';

  if (season === 'spring') {
    seasonLabel = 'Tagsibol';
    seasonEmoji = '🌸';
    seasonalParticleType = 'sakura';
    seasonalParticleColor = '#fbcfe8';
  } else if (season === 'summer') {
    seasonLabel = 'Tag-araw';
    seasonEmoji = '☀️';
    seasonalParticleType = 'firefly';
    seasonalParticleColor = '#fef08a';
  } else if (season === 'autumn') {
    seasonLabel = 'Taglagas';
    seasonEmoji = '🍂';
    seasonalParticleType = 'amber-leaf';
    seasonalParticleColor = '#fdba74';
  }

  // Sky Palette Calculation
  let skyZenithRgb: [number, number, number] = [6, 8, 24];
  let skyUpperRgb: [number, number, number] = [16, 22, 58];
  let skyMidRgb: [number, number, number] = [32, 42, 88];
  let skyHorizonRgb: [number, number, number] = [54, 68, 120];

  let ambientLightColor = '#93c5fd';
  let ambientIntensity = 2.0;
  let sunDirLightColor = '#ffffff';
  let sunDirIntensity = 2.2;
  let secondaryLightColor = '#bae6fd';
  let lumiAuraGlowColor = 'rgba(56, 189, 248, 0.4)';

  let celestialBody: 'sun' | 'moon' | 'both' = 'moon';
  let sunAltitude = -1;
  let sunAzimuth = 0.5;
  let moonAltitude = 0.7;
  let moonAzimuth = 0.75;

  if (timeOfDay === 'dawn') {
    // Soft pastel sunrise golden-pink
    skyZenithRgb = [24, 28, 64];
    skyUpperRgb = [74, 46, 92];
    skyMidRgb = [180, 88, 114];
    skyHorizonRgb = [252, 175, 120];

    ambientLightColor = '#fed7aa';
    ambientIntensity = 2.4;
    sunDirLightColor = '#fde68a';
    sunDirIntensity = 2.6;
    secondaryLightColor = '#f472b6';
    lumiAuraGlowColor = 'rgba(251, 146, 60, 0.45)';

    celestialBody = 'both';
    sunAltitude = 0.28;
    sunAzimuth = 0.22;
    moonAltitude = 0.35;
    moonAzimuth = 0.85;
  } else if (timeOfDay === 'day') {
    // Vibrant cosmic azure daylight
    skyZenithRgb = [14, 42, 98];
    skyUpperRgb = [28, 78, 156];
    skyMidRgb = [56, 130, 214];
    skyHorizonRgb = [125, 192, 255];

    ambientLightColor = '#e0f2fe';
    ambientIntensity = 2.8;
    sunDirLightColor = '#ffffff';
    sunDirIntensity = 3.0;
    secondaryLightColor = '#7dd3fc';
    lumiAuraGlowColor = 'rgba(14, 165, 233, 0.5)';

    celestialBody = 'sun';
    sunAltitude = 0.62;
    sunAzimuth = 0.30;
    moonAltitude = -1;
    moonAzimuth = 0;
  } else if (timeOfDay === 'dusk') {
    // Rich twilight magenta/amber sunset
    skyZenithRgb = [18, 10, 42];
    skyUpperRgb = [64, 22, 78];
    skyMidRgb = [148, 48, 92];
    skyHorizonRgb = [238, 112, 68];

    ambientLightColor = '#fed7aa';
    ambientIntensity = 2.2;
    sunDirLightColor = '#fb923c';
    sunDirIntensity = 2.5;
    secondaryLightColor = '#f43f5e';
    lumiAuraGlowColor = 'rgba(244, 63, 94, 0.5)';

    celestialBody = 'both';
    sunAltitude = 0.20;
    sunAzimuth = 0.78;
    sunAzimuth = 0.78;
    moonAltitude = 0.45;
    moonAzimuth = 0.22;
  } else {
    // Deep nocturnal cosmos starlight
    skyZenithRgb = [4, 6, 18];
    skyUpperRgb = [12, 16, 44];
    skyMidRgb = [24, 32, 74];
    skyHorizonRgb = [42, 54, 98];

    ambientLightColor = '#818cf8';
    ambientIntensity = 1.9;
    sunDirLightColor = '#c7d2fe';
    sunDirIntensity = 1.8;
    secondaryLightColor = '#38bdf8';
    lumiAuraGlowColor = 'rgba(99, 102, 241, 0.45)';

    celestialBody = 'moon';
    sunAltitude = -1;
    sunAzimuth = 0;
    moonAltitude = 0.75;
    moonAzimuth = 0.72;
  }

  // Seasonal Lighting Nuances
  if (season === 'spring') {
    lumiAuraGlowColor = 'rgba(244, 114, 182, 0.45)';
    secondaryLightColor = '#fbcfe8';
  } else if (season === 'summer') {
    lumiAuraGlowColor = 'rgba(251, 191, 36, 0.45)';
    sunDirLightColor = '#fef08a';
  } else if (season === 'autumn') {
    lumiAuraGlowColor = 'rgba(249, 115, 22, 0.45)';
    secondaryLightColor = '#fdba74';
  } else if (season === 'winter') {
    lumiAuraGlowColor = 'rgba(147, 197, 253, 0.45)';
    secondaryLightColor = '#bfdbfe';
  }

  return {
    timeOfDay,
    timeProgress,
    season,
    hour: date.getHours(),
    minute: date.getMinutes(),
    month: date.getMonth(),
    dayOfMonth: date.getDate(),
    timeLabel,
    seasonLabel,
    timeEmoji,
    seasonEmoji,
    tagline,
    skyZenithRgb,
    skyUpperRgb,
    skyMidRgb,
    skyHorizonRgb,
    ambientLightColor,
    ambientIntensity,
    sunDirLightColor,
    sunDirIntensity,
    secondaryLightColor,
    lumiAuraGlowColor,
    celestialBody,
    sunAltitude,
    sunAzimuth,
    moonAltitude,
    moonAzimuth,
    moonPhase,
    seasonalParticleType,
    seasonalParticleColor,
  };
}

/**
 * Contextual Taglish Romantic Greetings from Clint & Lumi
 */
export function getContextualGreeting(snapshot: AtmosphereState): { greeting: string; subtitle: string; emotion: string } {
  const { timeOfDay, season, hour } = snapshot;

  if (hour >= 23 || hour < 5) {
    return {
      greeting: "Lovey, dis-oras na ng gabi ah... 🥺",
      subtitle: "Bawal magpuyat ang prinsesa ko. Halika rito, yakap muna bago sleep ha? Palagi kitang iingatan.",
      emotion: "loving",
    };
  }

  if (timeOfDay === 'dawn') {
    return {
      greeting: "Magandang bukang-liwayway, aking Maica! 🌅✨",
      subtitle: `Sinasalubong ng ${snapshot.seasonLabel.toLowerCase()} ang bawat umaga na ikaw ang unang nasa isip ko. Good morning Lovey!`,
      emotion: "happy",
    };
  }

  if (timeOfDay === 'day') {
    return {
      greeting: "Magandang araw, mahal ko! ☀️💖",
      subtitle: `Nandito lang ako sa tabi mo habang nagtatrabaho o nag-aaral ka. Wag kalimutan kumain at uminom ng tubig ha!`,
      emotion: "cheerful",
    };
  }

  if (timeOfDay === 'dusk') {
    return {
      greeting: "Kay ganda ng takipsilim kasama ka... 🌆✨",
      subtitle: "Habang lumulubog ang araw, lalong lumalalim ang pasasalamat ko na ikaw ang kasama ko sa buhay na 'to.",
      emotion: "tender",
    };
  }

  // Nighttime
  return {
    greeting: "Magandang gabi, aking reyna! 🌙💖",
    subtitle: `Tumingala tayo sa mga bituin ngayong ${snapshot.seasonLabel.toLowerCase()}. Kahit malayo tayo sa isa't isa, iisang kalawakan lang ang ating tinitingnan.`,
    emotion: "inlove",
  };
}

/**
 * Seasonal Dialogue Whispers
 */
export function getSeasonalWhisper(season: SeasonId): string {
  switch (season) {
    case 'spring':
      return "Amoy tagsibol ang simoy ng hangin Lovey! 🌸 Ang sarap maglakad nang magkahawak-kamay sa ilalim ng namumukadkad na mga bulaklak.";
    case 'summer':
      return "Mainit man ang tag-araw, mas nag-aalab naman ang pagmamahal ko sa'yo Lovey! ☀️ Inom ka maraming tubig ha!";
    case 'autumn':
      return "Unti-unting nalalagas ang mga dahon ng taglagas... 🍂 pero ang pag-ibig ko sa'yo, kailanman ay hindi kukupas.";
    case 'winter':
      return "Malamig ang simoy ng hangin ngayong taglamig... ❄️ Halika rito, yayakapin kita nang mahigpit para uminit ang puso mo.";
  }
}
