import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import {
  Sparkles,
  Heart,
  MessageCircle,
  Compass,
  X,
  Send,
  Navigation,
  Smile,
  Music,
  Bot,
  Volume2,
  Feather,
  Flame,
  ChevronRight,
  RefreshCw,
  Crown,
  Moon,
  Sun,
  Activity,
} from 'lucide-react';
import { LumiCompanion, LumiMood, SoulEmotion, LumiFlareType, LumiBehaviorState } from './LumiCompanion';
import { EMOTION_TITLES } from './lumi22/types';
import { WeatherMoodId } from './CosmicWeather';
import { PersonalityContext } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { lumiSync, LumiSyncEvent } from '../utils/lumiSyncBus';

interface CompanionGuideProps {
  currentLine: string | null;
  isAche?: boolean;
  weatherMood?: WeatherMoodId;
  externalFlareTrigger?: number;
  externalFlareType?: LumiFlareType;
  personalityContext?: PersonalityContext;
  onOpenFullChat?: () => void;
  onOpenPangilatan?: () => void;
  onOpenWishModal?: () => void;
  onSpawnPhoto?: () => void;
  onTriggerHearts?: (count?: number) => void;
}

const FLOATING_WAYPOINTS = [
  { x: 84, y: 68, label: 'Bottom Right' },
  { x: 86, y: 30, label: 'Upper Right' },
  { x: 70, y: 16, label: 'Top Horizon' },
  { x: 16, y: 22, label: 'Top Left' },
  { x: 14, y: 64, label: 'Mid Left' },
  { x: 50, y: 72, label: 'Bottom Center' },
  { x: 82, y: 66, label: 'Home Base' },
];

const EMOTION_QUICK_RESPONSES: Record<
  string,
  { mood: SoulEmotion; behavior?: LumiBehaviorState; flare: LumiFlareType; speech: string; emoji: string; label: string }
> = {
  giggle: {
    mood: 'giggle',
    behavior: 'floating',
    flare: 'wonder',
    speech: "Hehe~ kinikilig ako sa'yo Lovey! Ang cute cute mo talaga! 🥰✨",
    emoji: '😆',
    label: 'Giggle',
  },
  laugh: {
    mood: 'laugh',
    behavior: 'cheering',
    flare: 'star',
    speech: "Hahaha! Ikaw talaga Maica, palagi mo akong napapangiti nang todo! 🤣💖",
    emoji: '🤣',
    label: 'Laugh',
  },
  cry: {
    mood: 'cry',
    behavior: 'comforting',
    flare: 'wonder',
    speech: "Uwahh... miss na miss na kita Lovey... yakap nang mahigpit please 💧🥺",
    emoji: '💧',
    label: 'Cry',
  },
  sad: {
    mood: 'sad',
    behavior: 'floating',
    flare: 'wonder',
    speech: "Malungkot ako kapag malayo ka... pero pangako, sooner magkakasama na tayo. 🥺🤍",
    emoji: '🥺',
    label: 'Sad',
  },
  happy: {
    mood: 'happy',
    behavior: 'cheering',
    flare: 'star',
    speech: "Yay! Sobrang saya ng puso ko kapag kasama kita Lovey! 😊✨",
    emoji: '😊',
    label: 'Happy',
  },
  angry: {
    mood: 'angry',
    behavior: 'pouting',
    flare: 'sparkle',
    speech: "Hmp! Nagpuyat ka na naman ba o hindi kumain sa oras? Lambingin mo muna ako! 😤💢",
    emoji: '😤',
    label: 'Angry',
  },
  inlove: {
    mood: 'inlove',
    behavior: 'dancing',
    flare: 'heart',
    speech: "I love you so much Maica! Ikaw lang ang buong universe at reyna ng puso ko. 💖🥰",
    emoji: '💖',
    label: 'In Love',
  },
};

export const CompanionGuide: React.FC<CompanionGuideProps> = ({
  currentLine,
  isAche = false,
  weatherMood,
  externalFlareTrigger = 0,
  externalFlareType = 'heart',
  personalityContext,
  onOpenFullChat,
  onOpenPangilatan,
  onOpenWishModal,
  onSpawnPhoto,
  onTriggerHearts,
}) => {
  const [guideMood, setGuideMood] = useState<LumiMood | SoulEmotion>('inlove');
  const [guideBehavior, setGuideBehavior] = useState<LumiBehaviorState>('floating');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [isProximityActive, setIsProximityActive] = useState(false);
  const [showHalo, setShowHalo] = useState(true);
  const [interactionCount, setInteractionCount] = useState(0);
  const [internalFlareTrigger, setInternalFlareTrigger] = useState(0);
  const [internalFlareType, setInternalFlareType] = useState<LumiFlareType>('heart');

  // Viewport position in %
  const [position, setPosition] = useState({ x: 84, y: 68 });
  const [isFreeFloating, setIsFreeFloating] = useState(true);

  const guideContainerRef = useRef<HTMLDivElement>(null);
  const waypointIndexRef = useRef<number>(0);
  const speechTimerRef = useRef<number | null>(null);
  const wanderTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const lastUserActivityRef = useRef<number>(Date.now());
  const isIdleRef = useRef<boolean>(false);

  const triggerBounce = useCallback((flare: LumiFlareType = 'wonder') => {
    setIsBouncing(true);
    setInternalFlareTrigger((prev) => prev + 1);
    setInternalFlareType(flare);
    setTimeout(() => setIsBouncing(false), 900);
  }, []);

  const displaySpeech = useCallback((text: string, duration = 8000) => {
    setActiveSpeech(text);
    if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current);
    speechTimerRef.current = window.setTimeout(() => {
      setActiveSpeech(null);
    }, duration);
  }, []);

  // Trigger dedicated emotion reaction
  const triggerEmotionState = useCallback((emotionKey: string) => {
    const item = EMOTION_QUICK_RESPONSES[emotionKey];
    if (!item) return;

    setGuideMood(item.mood);
    if (item.behavior) setGuideBehavior(item.behavior);
    displaySpeech(item.speech, 7500);
    triggerBounce(item.flare);

    if (emotionKey === 'giggle') audioEngine.playGiggleSound();
    else if (emotionKey === 'laugh') audioEngine.playLaughSound();
    else if (emotionKey === 'cry') audioEngine.playCrySound();
    else if (emotionKey === 'sad') audioEngine.playSadSound();
    else if (emotionKey === 'angry') audioEngine.playAngrySound();
    else if (emotionKey === 'inlove') audioEngine.playInLoveSound();

    if (onTriggerHearts && (emotionKey === 'inlove' || emotionKey === 'giggle')) {
      onTriggerHearts(12);
    }
  }, [displaySpeech, triggerBounce, onTriggerHearts]);

  // Real-Time Event Bus Subscription: Auto-Sync emotions and behaviors instantaneously
  useEffect(() => {
    const unsubscribe = lumiSync.subscribe((event: LumiSyncEvent) => {
      switch (event.type) {
        case 'EMOTION_TRIGGER':
          if (event.mood) setGuideMood(event.mood);
          if (event.behavior) setGuideBehavior(event.behavior);
          if (event.speech) displaySpeech(event.speech);
          if (event.flare) triggerBounce(event.flare);
          break;

        case 'BEHAVIOR_TRIGGER':
          if (event.behavior) setGuideBehavior(event.behavior);
          if (event.mood) setGuideMood(event.mood);
          if (event.speech) displaySpeech(event.speech);
          break;

        case 'SPEECH_TRIGGER':
          if (event.speech) displaySpeech(event.speech);
          if (event.mood) setGuideMood(event.mood);
          if (event.flare) triggerBounce(event.flare);
          break;

        case 'AUDIO_STATE_CHANGE':
          if (event.data?.isPlaying) {
            setGuideBehavior('dancing');
            setGuideMood('inlove');
            triggerBounce('heart');
            displaySpeech(`Sumasayaw ang puso ko sa kanta nating "${event.data.trackTitle}"... 🎵💖`, 6000);
          } else {
            setGuideBehavior('floating');
            setGuideMood('curious');
          }
          break;

        case 'MODAL_CHANGE':
          if (event.data?.isOpen) {
            if (event.data.modalName === 'pangilatan') {
              setGuideMood('starry');
              setGuideBehavior('star-watching');
              triggerBounce('wonder');
              displaySpeech("Tuktok ng Pangilatan! Ang sarap balikan nung magkasama tayo sa ibabaw ng mga ulap... ⛰️✨", 7000);
            } else if (event.data.modalName === 'wish') {
              setGuideMood('excited');
              setGuideBehavior('cheering');
              triggerBounce('star');
              displaySpeech("Hiling ka na ng wish Lovey! Ipagpe-pray ko na matupad lahat ng pangarap natin. ⭐", 7000);
            } else if (event.data.modalName === 'photos') {
              setGuideMood('giggle');
              setGuideBehavior('floating');
              triggerBounce('heart');
              displaySpeech("Ayan ang mga paborito nating memories! Ang ganda-ganda mo palagi sa pictures. 📷💖", 7000);
            } else if (event.data.modalName === 'chat') {
              setGuideMood('inlove');
              setGuideBehavior('following');
              displaySpeech("Kwento ka lang Lovey, nakikinig ako sa'yo buong-puso. 🥰", 6000);
            }
          }
          break;

        case 'USER_IDLE':
          setGuideBehavior('sleeping');
          setGuideMood('sleepy');
          if (event.speech) displaySpeech(event.speech, 6000);
          break;

        case 'USER_ACTIVE':
          setGuideBehavior('floating');
          setGuideMood('giggle');
          audioEngine.playGiggleSound();
          triggerBounce('sparkle');
          if (event.speech) displaySpeech(event.speech, 6000);
          break;

        case 'WEATHER_CHANGE':
          if (event.data?.weatherMood) {
            const wm = event.data.weatherMood;
            if (wm === 'heart-rain') {
              setGuideMood('inlove');
              setGuideBehavior('dancing');
            } else if (wm === 'soft-snow') {
              setGuideMood('tender');
              setGuideBehavior('floating');
            } else if (wm === 'stardust-embers') {
              setGuideMood('starry');
              setGuideBehavior('star-watching');
            } else if (wm === 'sakura-breeze') {
              setGuideMood('playful');
              setGuideBehavior('cheering');
            } else if (wm === 'aurora-mist') {
              setGuideMood('curious');
              setGuideBehavior('floating');
            }
          }
          break;

        default:
          break;
      }
    });

    return unsubscribe;
  }, [displaySpeech, triggerBounce]);

  // Real-Time Inactivity & Idle Auto-Sync Detector (Auto Sleep & Wakeup)
  useEffect(() => {
    const handleUserInteraction = () => {
      lastUserActivityRef.current = Date.now();
      if (isIdleRef.current) {
        isIdleRef.current = false;
        lumiSync.notifyIdle(false);
      }
    };

    const interval = setInterval(() => {
      const idleElapsed = Date.now() - lastUserActivityRef.current;
      if (idleElapsed > 22000 && !isIdleRef.current && !isMenuOpen && !activeSpeech) {
        isIdleRef.current = true;
        lumiSync.notifyIdle(true);
      }
    }, 3000);

    window.addEventListener('mousemove', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
  }, [isMenuOpen, activeSpeech]);

  // Real-Time Cursor Proximity Detection (Reactive micro-expressions when pointer nears Lumi)
  useEffect(() => {
    const handlePointerProximity = (e: MouseEvent) => {
      if (!guideContainerRef.current) return;
      const rect = guideContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 140) {
        if (!isProximityActive) {
          setIsProximityActive(true);
          if (guideBehavior !== 'sleeping' && guideBehavior !== 'dancing') {
            setGuideMood('giggle');
          }
        }
      } else {
        if (isProximityActive) {
          setIsProximityActive(false);
        }
      }
    };

    window.addEventListener('mousemove', handlePointerProximity, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerProximity);
  }, [isProximityActive, guideBehavior]);

  // Real-Time Time of Day Awareness (Late Night vs Morning care routines)
  useEffect(() => {
    const checkTimeOfDay = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 23 || currentHour < 4) {
        // Late night care check
        if (Math.random() < 0.35 && !activeSpeech && !isIdleRef.current) {
          setGuideMood('angry');
          setGuideBehavior('pouting');
          triggerBounce('sparkle');
          displaySpeech("Lovey, late night na ah... bawal magpuyat ang prinsesa ko! Yakap muna bago sleep? 🥺💖", 8000);
        }
      }
    };

    const timer = setInterval(checkTimeOfDay, 45000);
    return () => clearInterval(timer);
  }, [activeSpeech, displaySpeech, triggerBounce]);

  // Sync Lumi mood with Cosmic Weather
  useEffect(() => {
    if (!weatherMood) return;
    if (weatherMood === 'heart-rain') {
      setGuideMood('inlove');
      setGuideBehavior('dancing');
    } else if (weatherMood === 'soft-snow') {
      setGuideMood('tender');
      setGuideBehavior('floating');
    } else if (weatherMood === 'stardust-embers') {
      setGuideMood('starry');
      setGuideBehavior('star-watching');
    } else if (weatherMood === 'sakura-breeze') {
      setGuideMood('playful');
      setGuideBehavior('cheering');
    } else if (weatherMood === 'aurora-mist') {
      setGuideMood('curious');
      setGuideBehavior('floating');
    }
  }, [weatherMood]);

  // Sync external speech from App
  useEffect(() => {
    if (currentLine) {
      displaySpeech(currentLine, 6500);
      setGuideMood(isAche ? 'cry' : 'inlove');
      triggerBounce('heart');
    }
  }, [currentLine, isAche, displaySpeech, triggerBounce]);

  // Handle external flare triggers
  useEffect(() => {
    if (externalFlareTrigger > 0) {
      triggerBounce(externalFlareType);
    }
  }, [externalFlareTrigger, externalFlareType, triggerBounce]);

  // Autonomous wandering & AI spontaneous whispers
  useEffect(() => {
    if (!isFreeFloating) return;

    const scheduleNextWander = () => {
      const interval = 24000 + Math.random() * 16000;
      wanderTimerRef.current = window.setTimeout(async () => {
        if (isIdleRef.current) {
          scheduleNextWander();
          return;
        }

        waypointIndexRef.current = (waypointIndexRef.current + 1) % FLOATING_WAYPOINTS.length;
        const nextWaypoint = FLOATING_WAYPOINTS[waypointIndexRef.current];
        flyTo(nextWaypoint.x, nextWaypoint.y);

        // Occasional AI spontaneous whisper
        if (Math.random() < 0.65 && !activeSpeech) {
          try {
            const res = await fetch('/api/companion/spontaneous', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ personalityContext }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.message) {
                displaySpeech(data.message, 8500);
                if (data.mood) setGuideMood(data.mood);
                triggerBounce(data.flareType || 'heart');
              }
            }
          } catch {
            // Ignore background whisper error
          }
        }

        scheduleNextWander();
      }, interval);
    };

    scheduleNextWander();

    return () => {
      if (wanderTimerRef.current) clearTimeout(wanderTimerRef.current);
    };
  }, [isFreeFloating, activeSpeech, personalityContext, displaySpeech, triggerBounce]);

  const flyTo = (targetX: number, targetY: number) => {
    setIsFlying(true);
    setGuideBehavior('following');
    gsap.to(position, {
      x: targetX,
      y: targetY,
      duration: 3.2,
      ease: 'power2.inOut',
      onUpdate: () => setPosition({ x: position.x, y: position.y }),
      onComplete: () => {
        setIsFlying(false);
        setGuideBehavior('floating');
        triggerBounce('star');
      },
    });
  };

  const handleCharacterClick = () => {
    setIsMenuOpen((prev) => !prev);
    setInteractionCount((c) => c + 1);
    audioEngine.playPopSound();
    triggerBounce('heart');
  };

  // Trigger quick action reaction from AI
  const handleQuickAction = async (actionName: string, promptText: string) => {
    setIsMenuOpen(false);
    setIsThinking(true);
    audioEngine.playStarGazeChime();
    triggerBounce('heart');

    try {
      const res = await fetch('/api/companion/activity-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: actionName,
          details: promptText,
          personalityContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setGuideMood((data.mood as LumiMood) || 'loving');
          displaySpeech(data.message, 8000);
          triggerBounce((data.flareType as LumiFlareType) || 'wonder');
        }
      }
    } catch {
      displaySpeech("Nandito lang ako sa tabi mo Lovey, palaging nagmamahal sa'yo! ✨💖");
    } finally {
      setIsThinking(false);
    }
  };

  const emotionTitle = EMOTION_TITLES[guideMood] || EMOTION_TITLES.happy;

  // Responsive Dialogue Placement (Left vs Right vs Above)
  const isRightSide = position.x > 65;
  const isLeftSide = position.x < 35;

  return (
    <>
      <div
        ref={guideContainerRef}
        id="living-companion-guide-container"
        className="fixed z-40 select-none pointer-events-none transition-all duration-300"
        style={{
          left: `${position.x}vw`,
          top: `${position.y}vh`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="relative pointer-events-auto flex flex-col items-center">
          {/* Celestial Attached Dialogue UI */}
          <AnimatePresence>
            {(activeSpeech || isThinking) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 8 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className={`absolute z-50 w-64 sm:w-76 max-w-[85vw] p-4 rounded-2xl bg-slate-950/92 backdrop-blur-xl border border-cyan-400/35 text-cyan-50 shadow-[0_12px_45px_rgba(0,0,0,0.8),0_0_25px_rgba(56,189,248,0.25)] ${
                  isRightSide
                    ? 'bottom-full sm:bottom-auto sm:right-full sm:mr-4 mb-3.5 sm:mb-0'
                    : isLeftSide
                    ? 'bottom-full sm:bottom-auto sm:left-full sm:ml-4 mb-3.5 sm:mb-0'
                    : 'bottom-full mb-3.5'
                }`}
              >
                {/* Header Tag with Emotion-Specific Title */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{emotionTitle.icon}</span>
                    <span
                      className="text-[11px] font-serif font-semibold tracking-wide"
                      style={{ color: emotionTitle.themeColor }}
                    >
                      {emotionTitle.title}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveSpeech(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content Body */}
                {isThinking ? (
                  <div className="flex items-center gap-2 text-xs font-serif text-cyan-200/80 py-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Iniisip ka ni Clint... ✨</span>
                  </div>
                ) : (
                  <p className="font-serif text-[13px] leading-relaxed text-cyan-50">
                    {activeSpeech}
                  </p>
                )}

                {/* Footer Quick Chat Shortcut */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-cyan-300/75 font-serif font-medium">Lumi • Celestial Guide</span>
                  <button
                    onClick={() => {
                      setActiveSpeech(null);
                      if (onOpenFullChat) onOpenFullChat();
                    }}
                    className="text-cyan-300 hover:text-cyan-100 font-serif font-medium flex items-center gap-0.5 underline transition-colors"
                  >
                    <span>Kausapin si Clint &rarr;</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Radial Action Wheel and Emotion Palette when Menu is Opened */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute -inset-20 z-30 pointer-events-auto flex flex-col items-center justify-between"
              >
                {/* 1. Kausapin si Clint (Chatbot) */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onOpenFullChat) onOpenFullChat();
                  }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-serif text-xs font-semibold shadow-[0_4px_20px_rgba(244,63,94,0.45)] hover:scale-110 active:scale-95 transition-all flex items-center gap-1.5 border border-white/30 whitespace-nowrap z-40"
                  title="Mag-usap tayo sa Chat"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Kausapin si Clint</span>
                </button>

                {/* 2. Magpa-hug / Lambing */}
                <button
                  onClick={() => {
                    if (onTriggerHearts) onTriggerHearts(18);
                    handleQuickAction('hug', 'Maica requested a warm virtual hug');
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 p-2.5 rounded-full bg-rose-500/90 text-white shadow-lg hover:scale-110 active:scale-95 transition-all border border-rose-300/40 z-40"
                  title="Magpa-hug kay Clint 🤗"
                >
                  <Heart className="w-4 h-4 fill-white" />
                </button>

                {/* 3. Lumipad sa Bituin */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    waypointIndexRef.current = (waypointIndexRef.current + 2) % FLOATING_WAYPOINTS.length;
                    const next = FLOATING_WAYPOINTS[waypointIndexRef.current];
                    flyTo(next.x, next.y);
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 p-2.5 rounded-full bg-indigo-600/90 text-white shadow-lg hover:scale-110 active:scale-95 transition-all border border-indigo-300/40 z-40"
                  title="Lumipad sa kabilang bituin"
                >
                  <Navigation className="w-4 h-4" />
                </button>

                {/* 4. Interactive Emotion Palette Bar */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-full bg-slate-950/95 backdrop-blur-xl border border-cyan-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_15px_rgba(56,189,248,0.3)] whitespace-nowrap z-40">
                  {Object.entries(EMOTION_QUICK_RESPONSES).map(([key, item]) => {
                    const isActive = guideMood === item.mood;
                    return (
                      <button
                        key={key}
                        onClick={() => triggerEmotionState(key)}
                        className={`px-2 py-1 rounded-full text-xs font-serif transition-all flex items-center gap-1 ${
                          isActive
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm scale-105'
                            : 'bg-white/5 hover:bg-white/15 text-slate-200 hover:scale-105'
                        }`}
                        title={`Lumi Emotion: ${item.label}`}
                      >
                        <span>{item.emoji}</span>
                        <span className="text-[10px] hidden sm:inline">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Living 3D Cute Ghost Lumi */}
          <div
            className="relative cursor-pointer group"
            onClick={handleCharacterClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Luminous Glow Halo */}
            <div
              className={`absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-400/35 via-pink-400/35 to-amber-300/35 blur-lg transition-all duration-300 ${
                isHovered || isBouncing || isProximityActive ? 'opacity-100 scale-125' : 'opacity-45 animate-pulse'
              }`}
            />

            {/* Living 3D Cute Ghost Lumi with Real-time Behavior and Mood */}
            <LumiCompanion
              mood={guideMood}
              behavior={guideBehavior}
              weatherMood={weatherMood}
              flareTrigger={internalFlareTrigger}
              flareType={internalFlareType}
              isBouncing={isBouncing}
              isFlying={isFlying}
              isHovered={isHovered || isProximityActive}
              showHalo={showHalo}
              size={105}
            />

            {/* Sparkle badge / Real-time activity indicator */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                guideBehavior === 'dancing' ? 'bg-pink-400' : guideBehavior === 'sleeping' ? 'bg-indigo-400' : 'bg-cyan-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                guideBehavior === 'dancing' ? 'bg-pink-400' : guideBehavior === 'sleeping' ? 'bg-indigo-400' : 'bg-cyan-400'
              }`} />
            </span>
          </div>

          {/* Name Tag & Status indicator */}
          <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-400/35 shadow-md">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              guideBehavior === 'dancing' ? 'bg-rose-400' : guideBehavior === 'sleeping' ? 'bg-indigo-400' : 'bg-pink-400'
            }`} />
            <span className="text-[11px] font-serif text-cyan-200 tracking-wider font-semibold flex items-center gap-1">
              <span>✦ Lumi</span>
            </span>
            <span className="text-[10px] text-cyan-400/70 font-sans">
              &bull; {guideBehavior === 'dancing' ? 'Dancing 🎵' : guideBehavior === 'sleeping' ? 'Resting 💤' : 'Celestial Spirit'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
