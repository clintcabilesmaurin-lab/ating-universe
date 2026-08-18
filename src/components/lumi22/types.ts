export type SoulEmotion =
  | 'idle'
  | 'happy'
  | 'winking'
  | 'excited'
  | 'gentle'
  | 'emotional'
  | 'thinking'
  | 'serious'
  | 'cry'
  | 'laugh'
  | 'giggle'
  | 'inlove'
  | 'heart-eyes'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'blinking';

export type LumiMood =
  | 'happy'
  | 'loving'
  | 'starry'
  | 'playful'
  | 'giggle'
  | 'laugh'
  | 'tender'
  | 'ache'
  | 'angry'
  | 'curious'
  | 'sleepy'
  | 'inlove'
  | 'heart-eyes'
  | 'sad'
  | 'cry'
  | 'excited';

export type LumiFlareType = 'star' | 'heart' | 'wonder' | 'sparkle' | 'fire';

export type LumiBehaviorState =
  | 'idle'
  | 'floating'
  | 'dancing'
  | 'sleeping'
  | 'following'
  | 'pouting'
  | 'comforting'
  | 'star-watching'
  | 'gazing'
  | 'cheering'
  | 'waking';

export interface EmotionDialogueTitle {
  title: string;
  icon: string;
  themeColor: string;
}

export const EMOTION_TITLES: Record<string, EmotionDialogueTitle> = {
  inlove: { title: "Lumi's Heartbeat", icon: '💖', themeColor: '#f43f5e' },
  'heart-eyes': { title: "Lumi's Heartbeat", icon: '💘', themeColor: '#fb7185' },
  loving: { title: "Lumi's Heartbeat", icon: '💖', themeColor: '#f43f5e' },
  laugh: { title: "Lumi's Giggles", icon: '😆', themeColor: '#f59e0b' },
  giggle: { title: "Lumi's Giggles", icon: '✨', themeColor: '#f59e0b' },
  excited: { title: "Lumi's Excitement", icon: '🌟', themeColor: '#eab308' },
  happy: { title: "Lumi's Thoughts", icon: '😊', themeColor: '#38bdf8' },
  playful: { title: "Lumi's Playtime", icon: '😜', themeColor: '#ec4899' },
  starry: { title: "Lumi's Wonder", icon: '✨', themeColor: '#06b6d4' },
  gentle: { title: "Lumi's Warmth", icon: '🌸', themeColor: '#a855f7' },
  tender: { title: "Lumi's Deep Feelings", icon: '💜', themeColor: '#c084fc' },
  thinking: { title: "Lumi's Thoughts", icon: '💭', themeColor: '#64748b' },
  serious: { title: "Lumi's Focus", icon: '💫', themeColor: '#3b82f6' },
  cry: { title: "Lumi's Longing", icon: '💧', themeColor: '#60a5fa' },
  ache: { title: "Lumi's Longing", icon: '🥺', themeColor: '#38bdf8' },
  sad: { title: "Lumi's Longing", icon: '🌧️', themeColor: '#93c5fd' },
  angry: { title: "Lumi's Pout", icon: '😤', themeColor: '#ef4444' },
  surprised: { title: "Lumi's Wonder", icon: '😲', themeColor: '#14b8a6' },
  sleepy: { title: "Lumi's Dreams", icon: '🌙', themeColor: '#cbd5e1' },
  idle: { title: "Lumi's Thoughts", icon: '✨', themeColor: '#38bdf8' },
};
