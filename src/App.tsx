import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { SkyCanvas } from './components/SkyCanvas';
import { CompanionGuide } from './components/CompanionGuide';
import { ConstellationLayer } from './components/ConstellationLayer';
import { PangilatanModal } from './components/PangilatanModal';
import { WorldDetailModal } from './components/WorldDetailModal';
import { AudioPlayerWidget } from './components/AudioPlayerWidget';
import { MeteorWishModal } from './components/MeteorWishModal';
import { RandomMemoriesDrifter } from './components/RandomMemoriesDrifter';
import { PhotoManagerModal } from './components/PhotoManagerModal';
import { PortalTransition, PortalConfig } from './components/PortalTransition';
import { CosmicWeather, WeatherMoodId } from './components/CosmicWeather';
import { DailyLetter } from './components/DailyLetter';
import { CharacterChatModal } from './components/CharacterChatModal';
import { LumiFlareType, LumiMood } from './components/LumiCompanion';
import { WorldStar, PersonalityContext } from './types';
import { DEFAULT_PERSONALITY_CONTEXT } from './data/personalityData';
import { readState, recordVisitStart, resetVisitState } from './utils/storage';
import { audioEngine } from './utils/audioEngine';
import { Sparkles, RotateCcw, Heart, Image as ImageIcon, MessageCircle } from 'lucide-react';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isReturnVisit, setIsReturnVisit] = useState(false);
  const [currentLine, setCurrentLine] = useState<string | null>(null);
  const [isAcheLine, setIsAcheLine] = useState(false);
  const [selectedWorld, setSelectedWorld] = useState<WorldStar | null>(null);
  const [isPangilatanOpen, setIsPangilatanOpen] = useState(false);
  const [isPhotoManagerOpen, setIsPhotoManagerOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [pangilatanSpokenLine, setPangilatanSpokenLine] = useState('');
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  const [portalConfig, setPortalConfig] = useState<PortalConfig | null>(null);
  const pendingDestinationRef = useRef<(() => void) | null>(null);
  const [previewedIds, setPreviewedIds] = useState<Set<string>>(new Set());
  const [zoneShift, setZoneShift] = useState(0.2);
  const [visitCount, setVisitCount] = useState(1);
  const [spawnPhotoTrigger, setSpawnPhotoTrigger] = useState(0);

  // Personality context state with local persistence
  const [personalityContext, setPersonalityContext] = useState<PersonalityContext>(() => {
    try {
      const saved = localStorage.getItem('universe_personality_context_v1');
      return saved ? JSON.parse(saved) : DEFAULT_PERSONALITY_CONTEXT;
    } catch {
      return DEFAULT_PERSONALITY_CONTEXT;
    }
  });

  // Save personalityContext to localStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem('universe_personality_context_v1', JSON.stringify(personalityContext));
    } catch (e) {
      console.warn('Failed to persist personality context to localStorage:', e);
    }
  }, [personalityContext]);

  const [floatingHearts, setFloatingHearts] = useState<Array<{
    id: number;
    x: number;
    y: number;
    scale: number;
    rotate: number;
    delay: number;
    duration: number;
    color: string;
    opacity: number;
  }>>([]);
  const [isTaraPressed, setIsTaraPressed] = useState(false);
  const [weatherMood, setWeatherMood] = useState<WeatherMoodId>('heart-rain');
  const [companionFlareTrigger, setCompanionFlareTrigger] = useState(0);
  const [companionFlareType, setCompanionFlareType] = useState<LumiFlareType>('star');
  const voiceTimeoutRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Trigger expressive 3D companion particle flare and reactions
  const triggerCompanionReaction = (type: LumiFlareType = 'star') => {
    setCompanionFlareType(type);
    setCompanionFlareTrigger((prev) => prev + 1);
  };

  // Initialize Lenis + GSAP smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });
    lenisRef.current = lenis;

    // Track scroll position to update zoneShift (deep indigo at top, dusk purple at bottom)
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
        setZoneShift(progress);
        audioEngine.setZoneShift(progress);
      }
    };

    lenis.on('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Sync Lenis with GSAP high performance RAF ticker
    const updateRaf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      gsap.ticker.remove(updateRaf);
      lenisRef.current = null;
    };
  }, []);

  // Pause / resume smooth scroll when modals open/close
  useEffect(() => {
    if (isPangilatanOpen || selectedWorld !== null || isWishModalOpen || isPhotoManagerOpen || !hasEntered) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
  }, [isPangilatanOpen, selectedWorld, isWishModalOpen, isPhotoManagerOpen, hasEntered]);

  // Initialize audio and visit state on load
  useEffect(() => {
    audioEngine.init();
    const state = readState();

    if (state.hasVisitedBefore) {
      setIsReturnVisit(true);
      setHasEntered(true);
      setVisitCount(state.visitCount + 1);
      recordVisitStart();

      // Return greeting line
      setTimeout(() => {
        speak("Uyy, nandito ka ulit, Lovey... heheh.");
      }, 1200);
    } else {
      setIsReturnVisit(false);
      setHasEntered(false);
    }
  }, []);

  // Voice speech coordinator with queue/auto-clear
  const speak = (line: string, isAche = false, duration = 4800) => {
    if (voiceTimeoutRef.current) {
      window.clearTimeout(voiceTimeoutRef.current);
    }
    setCurrentLine(line);
    setIsAcheLine(isAche);

    voiceTimeoutRef.current = window.setTimeout(() => {
      setCurrentLine(null);
    }, duration);
  };

  // Spawn floating heart particles on interaction
  const triggerFloatingHearts = (count = 14) => {
    const newHearts = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: (Math.random() - 0.5) * 180, // spread horizontally
      y: -100 - Math.random() * 120, // float upwards
      scale: 0.7 + Math.random() * 0.7,
      rotate: (Math.random() - 0.5) * 60,
      delay: i * 0.035,
      duration: 1.4 + Math.random() * 0.6,
      color: ['#f43f5e', '#fb7185', '#fda4af', '#fcd34d', '#f59e0b', '#fbbf24', '#f472b6'][i % 7],
      opacity: 0.85 + Math.random() * 0.15,
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);

    // Clean up heart items after animation finishes
    setTimeout(() => {
      setFloatingHearts([]);
    }, 2400);
  };

  // Handle first-visit Tara tap
  const handleTaraClick = () => {
    if (isTaraPressed) return;
    setIsTaraPressed(true);
    triggerFloatingHearts(18);
    triggerCompanionReaction('heart');

    audioEngine.unlock();
    audioEngine.play();
    recordVisitStart();

    // After brief warm heart animation, transition into the sky view
    setTimeout(() => {
      setHasEntered(true);
      setIsTaraPressed(false);
    }, 700);

    // After 2.8s when sky has built in, speak the sky reveal line
    setTimeout(() => {
      speak("Look, Lovey... ating Universe 'to, hahahah.");
    }, 3000);
  };

  // Handle star preview click
  const handleSpeakWorld = (text: string, isAche = false) => {
    speak(text, isAche);
  };

  // Trigger cosmic portal warp effect when navigating between worlds
  const triggerWorldPortal = (
    config: { title: string; tagline?: string; color: string; iconName?: string },
    onArrival: () => void
  ) => {
    // Automatically turn off/pause background music when entering a world
    try {
      audioEngine.pause();
    } catch (e) {
      console.warn('Audio pause on world warp:', e);
    }

    pendingDestinationRef.current = onArrival;
    setPortalConfig({
      destinationTitle: config.title,
      destinationTagline: config.tagline,
      color: config.color,
      iconName: config.iconName,
      durationMs: 1100,
    });
  };

  const handlePortalComplete = () => {
    if (pendingDestinationRef.current) {
      pendingDestinationRef.current();
      pendingDestinationRef.current = null;
    }
    setPortalConfig(null);
  };

  // Open Pangilatan Mountain Memory with Portal Warp
  const handleOpenPangilatan = (line: string) => {
    setSelectedWorld(null);
    setIsPangilatanOpen(false);
    triggerCompanionReaction('heart');
    triggerWorldPortal(
      {
        title: 'Tuktok ng Pangilatan',
        tagline: 'Ang Ating Paboritong Tagpuan sa Ibabaw ng mga Ulap',
        color: '#10b981',
        iconName: 'Mountain',
      },
      () => {
        setPangilatanSpokenLine(line);
        setIsPangilatanOpen(true);
        speak(line);
      }
    );
  };

  // Handle World Modal Open with Portal Warp
  const handleSelectWorld = (world: WorldStar) => {
    setIsPangilatanOpen(false);
    setSelectedWorld(null);
    triggerCompanionReaction('wonder');
    triggerWorldPortal(
      {
        title: world.name,
        tagline: world.tagline,
        color: world.starColor,
        iconName: world.iconName,
      },
      () => {
        setSelectedWorld(world);
        setPreviewedIds((prev) => new Set([...prev, world.id]));
      }
    );
  };

  // Replay entrance from start
  const handleReplayEntrance = () => {
    resetVisitState();
    setHasEntered(false);
    setIsReturnVisit(false);
    setPreviewedIds(new Set());
    setCurrentLine(null);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: false, duration: 1 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Pitch Black First-Time Entrance Screen */}
      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            id="entrance-stage"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Luminous Light Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, delay: 0.4 }}
              className="relative flex items-center justify-center mb-8"
            >
              <div className="w-16 h-16 rounded-full bg-radial from-amber-200/40 via-purple-400/20 to-transparent blur-lg animate-pulse" />
              <div className="absolute w-5 h-5 rounded-full bg-white shadow-[0_0_25px_rgba(244,213,141,1)]" />
            </motion.div>

            {/* Opening Taglish Dialogue */}
            <motion.p
              id="entity-line"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, delay: 0.8 }}
              className="text-xl sm:text-2xl font-serif italic text-amber-100 font-light max-w-md tracking-wide leading-relaxed mb-10"
            >
              "Uyy, nandito ka na, tara..."
            </motion.p>

            {/* "Tara" Call to Action Button with Floating Heart Animation */}
            <div className="relative flex flex-col items-center">
              {/* Floating Hearts Container */}
              <div className="absolute -top-6 inset-x-0 flex justify-center pointer-events-none z-10">
                <AnimatePresence>
                  {floatingHearts.map((heart) => (
                    <motion.div
                      key={heart.id}
                      initial={{
                        opacity: heart.opacity,
                        scale: 0.3,
                        x: 0,
                        y: 0,
                        rotate: 0,
                      }}
                      animate={{
                        opacity: [heart.opacity, heart.opacity * 0.9, 0],
                        scale: [0.3, heart.scale, heart.scale * 1.25],
                        x: heart.x,
                        y: heart.y,
                        rotate: heart.rotate,
                      }}
                      transition={{
                        duration: heart.duration,
                        delay: heart.delay,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute"
                    >
                      <Heart
                        className="w-5 h-5 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] fill-current"
                        style={{ color: heart.color }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Tara Button */}
              <motion.button
                id="tara-btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 1.8 }}
                onClick={handleTaraClick}
                onMouseEnter={() => {
                  if (!isTaraPressed && floatingHearts.length < 5) {
                    triggerFloatingHearts(4);
                  }
                }}
                className="relative group px-10 py-3.5 rounded-full bg-gradient-to-r from-amber-300 via-rose-200 to-amber-300 text-slate-950 font-serif text-sm tracking-[0.25em] uppercase font-semibold shadow-[0_0_35px_rgba(244,213,141,0.55)] hover:shadow-[0_0_45px_rgba(251,113,133,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2 overflow-hidden"
              >
                {/* Subtle warm shimmer gradient overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                
                <Sparkles className="w-4 h-4 fill-slate-950 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Tara</span>
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 opacity-80 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Interactive Sky Canvas Background */}
      <SkyCanvas
        zoneShift={zoneShift}
        onMeteorClick={() => setIsWishModalOpen(true)}
        isBuiltIn={hasEntered}
      />

      {/* 2.5 Dynamic Atmospheric Cosmic Weather (Rain of Hearts, Soft Snow, Embers, Petals, Aurora) */}
      {hasEntered && (
        <CosmicWeather
          activeMoodId={weatherMood}
          onMoodChange={(mood) => {
            setWeatherMood(mood);
            triggerCompanionReaction('wonder');
          }}
          onSpeakMood={(text) => speak(text)}
        />
      )}

      {/* 3. Top Navigation Bar */}
      {hasEntered && (
        <header className="fixed top-0 inset-x-0 z-30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3.5 sm:px-4 py-1.5 rounded-full pointer-events-auto shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-serif font-medium text-amber-100 tracking-wider">
              Our First Year
            </span>
            <span className="text-[10px] text-amber-300/60 font-sans">
              &bull; Cl &amp; Maica
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              id="btn-open-clint-chat"
              onClick={() => {
                triggerCompanionReaction('heart');
                setIsChatModalOpen(true);
              }}
              title="Kausapin si Clint (AI Copy)"
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-400/25 via-rose-400/25 to-amber-300/25 hover:from-amber-400/35 hover:to-rose-400/35 backdrop-blur-md border border-amber-300/60 px-3.5 py-1.5 rounded-full text-amber-100 font-serif font-semibold transition-all shadow-[0_0_16px_rgba(244,213,141,0.3)] hover:scale-105"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <MessageCircle className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Kausapin si Clint</span>
            </button>

            <button
              id="btn-open-photo-manager"
              onClick={() => setIsPhotoManagerOpen(true)}
              title="Ayusin o I-upload ang mga Larawan"
              className="flex items-center gap-1.5 text-xs bg-black/40 hover:bg-black/60 backdrop-blur-md border border-amber-400/30 px-3.5 py-1.5 rounded-full text-amber-200 hover:text-amber-100 transition-colors shadow-lg"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Mga Larawan</span>
            </button>

            {isReturnVisit && (
              <span className="hidden sm:inline-block text-[11px] text-amber-200/80 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                Visit #{visitCount}
              </span>
            )}
            <button
              id="btn-replay-opening"
              onClick={handleReplayEntrance}
              title="Balikan ang panimula"
              className="flex items-center gap-1.5 text-xs bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-slate-300 hover:text-amber-200 transition-colors shadow-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panimula</span>
            </button>
          </div>
        </header>
      )}

      {/* 4. Main Constellation Scroll Content */}
      {hasEntered && (
        <main className="relative z-10">
          <ConstellationLayer
            onSelectWorld={handleSelectWorld}
            onSpeak={handleSpeakWorld}
            onOpenPangilatan={handleOpenPangilatan}
            previewedIds={previewedIds}
          />
        </main>
      )}

      {/* 5. Living Companion & Guide System (Lumi ✨) */}
      <CompanionGuide
        currentLine={currentLine}
        isAche={isAcheLine}
        weatherMood={weatherMood}
        externalFlareTrigger={companionFlareTrigger}
        externalFlareType={companionFlareType}
        personalityContext={personalityContext}
        onOpenFullChat={() => {
          triggerCompanionReaction('heart');
          setIsChatModalOpen(true);
        }}
        onOpenPangilatan={() => {
          triggerCompanionReaction('heart');
          handleOpenPangilatan("Uyy, ito na siya... Pangilatan. Ang paborito nating tagpuan sa ibabaw ng mga ulap! ⛰️✨");
        }}
        onOpenWishModal={() => {
          triggerCompanionReaction('star');
          setIsWishModalOpen(true);
        }}
        onSpawnPhoto={() => {
          triggerCompanionReaction('sparkle');
          setSpawnPhotoTrigger((prev) => prev + 1);
        }}
        onTriggerHearts={(count) => {
          triggerCompanionReaction('heart');
          triggerFloatingHearts(count || 16);
        }}
      />

      {/* 6. Dedicated Interactive AI Copy Chat Box with Clint */}
      <CharacterChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        personalityContext={personalityContext}
        onUpdatePersonalityContext={setPersonalityContext}
        onTriggerReaction={(mood: LumiMood, flare: LumiFlareType) => {
          triggerCompanionReaction(flare);
        }}
      />

      {/* 6. Random Appearing Celestial Memory Shards */}
      <RandomMemoriesDrifter
        isSkyReady={hasEntered}
        manualSpawnTrigger={spawnPhotoTrigger}
        onSpeak={(line) => speak(line)}
        onOpenPhotoManager={() => setIsPhotoManagerOpen(true)}
      />

      {/* 7. Ambient Romantic Audio Player Widget */}
      <AudioPlayerWidget />

      {/* 7.5 Floating Origami Daily Love Letter */}
      <DailyLetter
        hasEntered={hasEntered}
        onLetterOpen={() => {
          triggerCompanionReaction('heart');
          speak("May munting liham ako para sa'yo ngayon, Lovey... 💌✨");
        }}
      />

      {/* 8. Pangilatan Mountain Signature Photo Modal */}
      <PangilatanModal
        isOpen={isPangilatanOpen}
        onClose={() => setIsPangilatanOpen(false)}
        spokenLine={pangilatanSpokenLine}
        onOpenPhotoManager={() => setIsPhotoManagerOpen(true)}
        onNavigateWorld={handleSelectWorld}
      />

      {/* 9. World Detail Explorer Modal */}
      <WorldDetailModal
        world={selectedWorld}
        onClose={() => setSelectedWorld(null)}
        onSpeak={(text, ache) => speak(text, ache)}
        onOpenPhotoManager={() => setIsPhotoManagerOpen(true)}
        onNavigateWorld={handleSelectWorld}
        onOpenPangilatan={handleOpenPangilatan}
      />

      {/* 10. Shooting Star / Meteor Wish Modal */}
      <MeteorWishModal
        isOpen={isWishModalOpen}
        onClose={() => setIsWishModalOpen(false)}
        onWishGranted={(wish) => {
          triggerCompanionReaction('star');
          speak(wish);
        }}
      />

      {/* 11. Photo & Google Drive Link Manager Modal */}
      <PhotoManagerModal
        isOpen={isPhotoManagerOpen}
        onClose={() => setIsPhotoManagerOpen(false)}
      />

      {/* 12. Cosmic World Portal Warp Transition Layer */}
      <PortalTransition
        portalConfig={portalConfig}
        onPortalComplete={handlePortalComplete}
      />
    </div>
  );
}
