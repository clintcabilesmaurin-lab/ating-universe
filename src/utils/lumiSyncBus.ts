import { SoulEmotion, LumiMood, LumiFlareType } from '../components/lumi22/types';
import { WeatherMoodId } from '../components/CosmicWeather';

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

export type LumiSyncEventType =
  | 'EMOTION_TRIGGER'
  | 'BEHAVIOR_TRIGGER'
  | 'AUDIO_STATE_CHANGE'
  | 'ZONE_CHANGE'
  | 'WEATHER_CHANGE'
  | 'MODAL_CHANGE'
  | 'USER_IDLE'
  | 'USER_ACTIVE'
  | 'TIME_AWARENESS'
  | 'SPEECH_TRIGGER'
  | 'PROXIMITY_PULSE'
  | 'PHOTO_SPAWN'
  | 'HEART_BURST';

export interface LumiSyncEvent {
  type: LumiSyncEventType;
  mood?: SoulEmotion | LumiMood;
  behavior?: LumiBehaviorState;
  speech?: string;
  flare?: LumiFlareType;
  playSound?: boolean;
  timestamp: number;
  data?: any;
}

type SyncListener = (event: LumiSyncEvent) => void;

class LumiSyncBus {
  private listeners: Set<SyncListener> = new Set();
  private currentEmotion: SoulEmotion | LumiMood = 'inlove';
  private currentBehavior: LumiBehaviorState = 'floating';
  private lastActivityTime: number = Date.now();

  /**
   * Subscribe to all real-time synchronization events from Lumi's nervous system
   */
  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Broadcast an event in real time to Lumi and all connected components
   */
  public publish(event: Omit<LumiSyncEvent, 'timestamp'>): void {
    const fullEvent: LumiSyncEvent = {
      ...event,
      timestamp: Date.now(),
    };

    if (event.mood) {
      this.currentEmotion = event.mood;
    }
    if (event.behavior) {
      this.currentBehavior = event.behavior;
    }

    this.listeners.forEach((listener) => {
      try {
        listener(fullEvent);
      } catch (err) {
        console.warn('Error in LumiSync listener:', err);
      }
    });
  }

  public getEmotion(): SoulEmotion | LumiMood {
    return this.currentEmotion;
  }

  public getBehavior(): LumiBehaviorState {
    return this.currentBehavior;
  }

  // --- Real-time convenience dispatchers ---

  public setEmotion(
    mood: SoulEmotion | LumiMood,
    speech?: string,
    flare: LumiFlareType = 'heart',
    playSound = true
  ) {
    this.publish({
      type: 'EMOTION_TRIGGER',
      mood,
      speech,
      flare,
      playSound,
    });
  }

  public setBehavior(behavior: LumiBehaviorState, mood?: SoulEmotion | LumiMood, speech?: string) {
    this.publish({
      type: 'BEHAVIOR_TRIGGER',
      behavior,
      mood,
      speech,
    });
  }

  public speak(text: string, mood: SoulEmotion | LumiMood = 'inlove', flare: LumiFlareType = 'heart') {
    this.publish({
      type: 'SPEECH_TRIGGER',
      speech: text,
      mood,
      flare,
    });
  }

  public notifyAudio(isPlaying: boolean, trackTitle: string, artist: string) {
    this.publish({
      type: 'AUDIO_STATE_CHANGE',
      behavior: isPlaying ? 'dancing' : 'floating',
      mood: isPlaying ? 'inlove' : 'curious',
      data: { isPlaying, trackTitle, artist },
    });
  }

  public notifyModal(modalName: 'pangilatan' | 'wish' | 'photos' | 'chat' | 'world' | string, isOpen: boolean, extraData?: any) {
    this.publish({
      type: 'MODAL_CHANGE',
      data: { modalName, isOpen, extraData },
    });
  }

  public notifyWeather(weatherMood: WeatherMoodId) {
    this.publish({
      type: 'WEATHER_CHANGE',
      data: { weatherMood },
    });
  }

  public notifyZone(zoneShift: number) {
    this.publish({
      type: 'ZONE_CHANGE',
      data: { zoneShift },
    });
  }

  public notifyIdle(isIdle: boolean) {
    if (isIdle) {
      this.publish({
        type: 'USER_IDLE',
        behavior: 'sleeping',
        mood: 'sleepy',
        speech: 'Zzz... andito lang ako sa tabi mo, Lovey... 🌙',
      });
    } else {
      this.publish({
        type: 'USER_ACTIVE',
        behavior: 'floating',
        mood: 'giggle',
        speech: 'Uyy gising na tayo! Hehehe, miss na kita agad Lovey! ✨',
      });
    }
  }

  public notifyTimeOfDay(hour: number) {
    this.publish({
      type: 'TIME_AWARENESS',
      data: { hour },
    });
  }

  public notifyProximity(distance: number) {
    this.publish({
      type: 'PROXIMITY_PULSE',
      data: { distance },
    });
  }
}

export const lumiSync = new LumiSyncBus();
