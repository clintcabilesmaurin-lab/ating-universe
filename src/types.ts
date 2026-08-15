export interface WorldStar {
  id: string;
  name: string;
  url: string;
  active: boolean;
  order: number;
  previewLine: string;
  acheLine?: string;
  starColor: string;
  unlockedDate: string | null;
  tagline: string;
  description: string;
  iconName: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  src?: string;
  ambientVibe: string;
  tempo: number;
}

export interface Letter {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string[];
  signature: string;
  tag: string;
  sealColor: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  quote?: string;
  imageType: 'selfie' | 'scenic' | 'skyview' | 'twilight';
  imageSrc?: string;
}

export interface TimelineMilestone {
  month: string;
  title: string;
  story: string;
  highlight: string;
  emoji: string;
}

export interface TravelDream {
  destination: string;
  tagline: string;
  activities: string[];
  status: 'planned' | 'dreaming' | 'sooner';
  note: string;
}

export interface VisitState {
  hasVisitedBefore: boolean;
  lastVisitTimestamp: string | null;
  lastScrollPosition: string | null;
  visitCount: number;
  unlockedWishes: string[];
}
