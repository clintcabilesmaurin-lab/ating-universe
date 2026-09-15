import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, Mail, Calendar, Compass, ArrowLeft, CheckCircle2, Lock, BookOpen, Camera, ExternalLink, Globe, Mountain, ChevronRight } from 'lucide-react';
import { WorldStar, Letter } from '../types';
import { TIMELINE_MILESTONES, MEMORIES, LETTERS, TRAVEL_DREAMS, MEMORY_GALLERY_WALK_URL, SECRET_LETTER_DAW_URL, OUR_FIRST_YEAR_URL, WORLD_OF_LETTERS_URL, WORLDS } from '../data/universeData';
import { audioEngine } from '../utils/audioEngine';
import { CelestialMemoryVisual } from './CelestialMemoryVisual';
import { loadCustomPhotos, getDriveThumbnailUrl } from '../utils/driveHelper';
import { isFirstYearAnniversaryUnlocked, calculateCountdownToTarget } from '../utils/timeHelper';
import { openInParent } from '../utils/navigationHelper';

interface WorldDetailModalProps {
  world: WorldStar | null;
  onClose: () => void;
  onSpeak: (text: string, isAche?: boolean) => void;
  onOpenPhotoManager?: () => void;
  onNavigateWorld?: (world: WorldStar) => void;
  onOpenPangilatan?: (line: string) => void;
  onOpenLettersSubUniverse?: (subworldId?: string) => void;
}

export const WorldDetailModal: React.FC<WorldDetailModalProps> = ({
  world,
  onClose,
  onSpeak,
  onOpenPhotoManager,
  onNavigateWorld,
  onOpenPangilatan,
  onOpenLettersSubUniverse,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'moments'>('timeline');
  const [imgLoadFailed, setImgLoadFailed] = useState<Record<string, boolean>>({});
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [isLettersPreviewOpen, setIsLettersPreviewOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updatePhotos = () => {
      setCustomPhotos(loadCustomPhotos());
    };
    updatePhotos();
    window.addEventListener('universe_custom_photos_updated', updatePhotos);
    return () => window.removeEventListener('universe_custom_photos_updated', updatePhotos);
  }, []);

  if (!world) return null;

  const isAnniversaryUnlocked = isFirstYearAnniversaryUnlocked(currentTime);
  const countdown = calculateCountdownToTarget(undefined, currentTime);
  const pad = (n: number) => String(n).padStart(2, '0');

  const handleOpenLetter = (letter: Letter) => {
    audioEngine.playStarGazeChime();
    setSelectedLetter(letter);
    onSpeak(`Binuksan mo ang liham: "${letter.title}"`);
  };

  return (
    <AnimatePresence>
      <div
        data-lenis-prevent
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/65 backdrop-blur-xl"
      >
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-white/20"
        >
          {/* Top specular highlight rim */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-10" />

          {/* Header Bar */}
          <div
            className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0 backdrop-blur-md"
            style={{
              backgroundColor: `${world.starColor}15`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner backdrop-blur-md"
                style={{
                  backgroundColor: `${world.starColor}25`,
                  borderColor: world.starColor,
                  color: world.starColor,
                }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-serif font-medium text-white tracking-wide">
                    {world.name}
                  </h2>
                  <span
                    className="text-[11px] px-2.5 py-0.5 rounded-full font-sans font-medium glass-pill"
                    style={{
                      color: world.starColor,
                    }}
                  >
                    World #{world.order}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans tracking-wide">
                  {world.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {world.id === 'our-first-year' && (
                isAnniversaryUnlocked ? (
                  <a
                    href={OUR_FIRST_YEAR_URL}
                    target="_parent"
                    id="header-our-first-year-portal-btn"
                    onClick={(e) => openInParent(OUR_FIRST_YEAR_URL, e)}
                    className="glass-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-amber-100 text-xs font-sans font-bold transition-all shadow-[0_0_20px_rgba(251,191,36,0.5)] hover:scale-105"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                    <span>Our First Year Website</span>
                    <ExternalLink className="w-3 h-3 text-amber-300 ml-0.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    id="header-our-first-year-locked-btn"
                    onClick={() => {
                      audioEngine.playLockedSound();
                      onSpeak("Hindi pa ito ang tamang oras hanggang sa Setyembre 22, 2026 nang 9:00 PM... Sabay nating bubuksan sa ating 1st Anniversary, Lovey! 🔒✨");
                    }}
                    className="glass-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-amber-200 text-xs font-sans font-medium transition-all shadow-md"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Naka-lock (Sept 22, 9PM)</span>
                  </button>
                )
              )}
              {world.id === 'memory-gallery' && (
                <a
                  href={MEMORY_GALLERY_WALK_URL}
                  target="_parent"
                  id="header-gallery-walk-btn"
                  onClick={(e) => openInParent(MEMORY_GALLERY_WALK_URL, e)}
                  className="glass-pill hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-purple-100 text-xs font-sans font-medium transition-all shadow-md hover:scale-102"
                >
                  <Globe className="w-3.5 h-3.5 text-purple-300" />
                  <span>3D Walk</span>
                  <ExternalLink className="w-3 h-3 text-purple-300 ml-0.5" />
                </a>
              )}
              {world.id === 'letters' && (
                <a
                  href={WORLD_OF_LETTERS_URL}
                  target="_parent"
                  id="header-world-of-letters-btn"
                  onClick={(e) => openInParent(WORLD_OF_LETTERS_URL, e)}
                  className="glass-pill hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-rose-100 text-xs font-sans font-medium transition-all shadow-md hover:scale-102 border border-rose-400/30"
                >
                  <Mail className="w-3.5 h-3.5 text-rose-300" />
                  <span>World of Letters</span>
                  <ExternalLink className="w-3 h-3 text-rose-300 ml-0.5" />
                </a>
              )}

              <button
                id="close-world-modal"
                onClick={onClose}
                className="w-9 h-9 rounded-full glass-pill text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Modal Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
            {/* World 1: Our First Year Experience */}
            {world.id === 'our-first-year' && (
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/70 via-rose-950/60 to-slate-950/90 border border-amber-400/40 p-5 sm:p-6 shadow-[0_0_40px_rgba(251,191,36,0.15)] text-center max-w-xl mx-auto space-y-3">
                  <Heart className="w-8 h-8 text-rose-400 mx-auto fill-rose-400/30" />
                  <h3 className="text-xl font-serif text-amber-100 font-medium">
                    365+ Araw ng Pagpili sa Isa't Isa
                  </h3>
                  <p className="text-xs text-amber-200/80 font-sans">
                    Ang patunay na ang tunay na pag-ibig ay lumalalim sa bawat pagsubok at distansya.
                  </p>
                  
                  <div className="pt-2">
                    {isAnniversaryUnlocked ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-300/40 text-amber-200 text-xs font-sans">
                          ✨ <strong>1st Anniversary Reached!</strong> Available na ang buong selebrasyon ng ating unang taon.
                        </div>
                        <a
                          href={OUR_FIRST_YEAR_URL}
                          target="_parent"
                          id="btn-unlocked-our-first-year"
                          onClick={(e) => openInParent(OUR_FIRST_YEAR_URL, e)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all hover:scale-105 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                          <span>Pumasok sa Our First Year Experience</span>
                          <ExternalLink className="w-4 h-4 text-slate-950" />
                        </a>
                      </div>
                    ) : (
                      <div className="p-5 rounded-3xl glass-card space-y-3">
                        <div className="flex items-center justify-center gap-2 text-amber-300 font-sans text-xs font-bold uppercase tracking-wider">
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span>Magbubukas sa Setyembre 22, 2026 (9:00 PM)</span>
                        </div>

                        {/* Live Countdown Grid */}
                        <div className="grid grid-cols-4 gap-2 py-1 max-w-xs mx-auto">
                          <div className="p-2 rounded-xl glass-card text-center">
                            <span className="block font-mono text-lg sm:text-xl font-bold text-amber-200">
                              {countdown.days}
                            </span>
                            <span className="text-[9px] uppercase font-sans tracking-wider text-amber-300/70">
                              Araw
                            </span>
                          </div>
                          <div className="p-2 rounded-xl glass-card text-center">
                            <span className="block font-mono text-lg sm:text-xl font-bold text-amber-200">
                              {pad(countdown.hours)}
                            </span>
                            <span className="text-[9px] uppercase font-sans tracking-wider text-amber-300/70">
                              Oras
                            </span>
                          </div>
                          <div className="p-2 rounded-xl glass-card text-center">
                            <span className="block font-mono text-lg sm:text-xl font-bold text-amber-200">
                              {pad(countdown.minutes)}
                            </span>
                            <span className="text-[9px] uppercase font-sans tracking-wider text-amber-300/70">
                              Minuto
                            </span>
                          </div>
                          <div className="p-2 rounded-xl glass-card text-center">
                            <span className="block font-mono text-lg sm:text-xl font-bold text-rose-300">
                              {pad(countdown.seconds)}
                            </span>
                            <span className="text-[9px] uppercase font-sans tracking-wider text-rose-300/70">
                              Segundo
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-amber-100/80 font-serif italic max-w-md mx-auto leading-relaxed">
                          "Hindi pa ito ang tamang oras hanggang sa Setyembre 22, 2026 nang 9:00 PM. Sabay nating bubuksan sa ating 1st Anniversary, Lovey!"
                        </p>

                        <button
                          type="button"
                          id="btn-check-first-year-status"
                          onClick={() => {
                            audioEngine.playLockedSound();
                            onSpeak(`Naka-lock pa hanggang Setyembre 22, 2026, 9:00 PM (${countdown.days} araw at ${countdown.hours} oras na lang)... Sabay nating bubuksan sa ating 1st Anniversary, Lovey! 🔒✨`);
                          }}
                          className="glass-pill w-full sm:w-auto px-5 py-2.5 rounded-full text-amber-200 text-xs font-sans font-medium transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer active:scale-95"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>I-check ang Status 🔒</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Milestones */}
                <div className="space-y-4">
                  <h4 className="text-xs font-sans uppercase tracking-widest text-amber-200/80 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-300" /> Mga Yugto ng Unang Taon
                  </h4>

                  <div className="relative pl-6 border-l-2 border-amber-400/30 space-y-6">
                    {TIMELINE_MILESTONES.map((item, idx) => (
                      <div key={idx} className="relative group">
                        {/* Dot indicator */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-400 border-4 border-slate-950 group-hover:scale-125 transition-transform" />

                        <div className="p-4 rounded-2xl glass-card transition-all hover:border-amber-300/40">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{item.emoji}</span>
                            <span className="text-xs text-amber-300 font-sans tracking-wider uppercase font-semibold">
                              {item.month}
                            </span>
                          </div>
                          <h5 className="text-lg font-serif text-white font-medium">
                            {item.title}
                          </h5>
                          <p className="text-sm text-slate-300/90 font-serif leading-relaxed mt-1">
                            {item.story}
                          </p>
                          <div className="mt-3 inline-block px-3 py-1 rounded-full glass-pill text-xs text-amber-200 font-sans">
                            ✨ {item.highlight}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* World 2: Memory Gallery Experience */}
            {world.id === 'memory-gallery' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl glass-card text-center">
                  <p className="text-sm sm:text-base font-serif italic text-purple-100 max-w-lg mx-auto leading-relaxed">
                    "{world.acheLine}"
                  </p>
                </div>

                {/* Featured 3D Memory Gallery Walk Portal */}
                <div className="relative overflow-hidden rounded-3xl glass-card p-5 sm:p-6 shadow-[0_0_40px_rgba(192,132,252,0.15)]">
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-lg">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-purple-200 text-xs font-sans font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                        <span>Interactive 3D Walkthrough Portal</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white font-medium flex items-center gap-2">
                        Memory Gallery Walk 3D
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-200/80 font-serif leading-relaxed">
                        Maglakad sa ating 3D virtual art gallery ng mga alaala sa <span className="text-amber-200 underline font-sans">memory-gallary-walk.vercel.app</span> — bawat likhang sining at litrato ay may kwento nating dalawa.
                      </p>
                    </div>

                    <a
                      href={MEMORY_GALLERY_WALK_URL}
                      target="_parent"
                      id="launch-gallery-walk-btn"
                      onClick={(e) => openInParent(MEMORY_GALLERY_WALK_URL, e)}
                      className="glass-pill inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-sans text-xs sm:text-sm font-semibold tracking-wide shadow-lg hover:scale-105 transition-all shrink-0 cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-purple-300" />
                      <span>Pumasok sa 3D Walk</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Photo Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MEMORIES.map((mem) => {
                    const itemSrc = customPhotos[mem.id] || mem.imageSrc;
                    const resolved = itemSrc ? getDriveThumbnailUrl(itemSrc, 800) : '';
                    const isFailed = imgLoadFailed[mem.id];
                    return (
                      <div
                        key={mem.id}
                        className="rounded-3xl glass-card transition-all flex flex-col justify-between group shadow-lg overflow-hidden border border-white/10 hover:border-purple-300/40"
                      >
                        {resolved && !isFailed ? (
                          <div className="h-44 w-full overflow-hidden bg-slate-950">
                            <img
                              src={resolved}
                              alt={mem.title}
                              referrerPolicy="no-referrer"
                              onError={() => {
                                setImgLoadFailed((prev) => ({ ...prev, [mem.id]: true }));
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="h-44 w-full overflow-hidden">
                            <CelestialMemoryVisual
                              title={mem.title}
                              location={mem.location}
                              date={mem.date}
                              theme="purple"
                              size="sm"
                            />
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs text-purple-300/70 font-sans mb-2">
                              <span>📍 {mem.location}</span>
                              <span>{mem.date}</span>
                            </div>
                            <h4 className="text-lg font-serif text-white font-medium group-hover:text-purple-200 transition-colors">
                              {mem.title}
                            </h4>
                            <p className="text-xs text-slate-300/90 font-serif leading-relaxed mt-2 italic">
                              {mem.description}
                            </p>
                          </div>

                          {mem.quote && (
                            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-200/90 font-serif">
                              {mem.quote}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* World 3: Letters Experience - World of Letters */}
            {world.id === 'letters' && (
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950/70 via-pink-950/60 to-slate-950/90 border border-rose-400/40 p-6 sm:p-8 shadow-[0_0_40px_rgba(244,63,94,0.15)] text-center max-w-xl mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full glass-card mx-auto flex items-center justify-center border border-rose-400/40 text-rose-300 shadow-[0_0_35px_rgba(244,63,94,0.3)]">
                    <Mail className="w-8 h-8 text-rose-300 fill-rose-300/20" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest font-sans text-rose-300/90 glass-pill px-3.5 py-1 rounded-full border border-rose-400/30">
                      Bukas Na &bull; World of Letters
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif text-rose-100 font-medium">
                      Mundo ng mga Liham 💌
                    </h3>
                    <p className="text-sm text-rose-200/90 font-serif italic leading-relaxed pt-1">
                      Dito nakatago ang bawat salita, pangako, at damdaming isinulat ni Clint mula sa kabilang ibayo para sa kanyang pinakamamahal na si Maica.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={WORLD_OF_LETTERS_URL}
                      target="_parent"
                      id="btn-open-world-of-letters-main"
                      onClick={(e) => openInParent(WORLD_OF_LETTERS_URL, e)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-amber-300 hover:from-rose-300 hover:to-amber-200 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_30px_rgba(244,63,94,0.5)] transition-all hover:scale-105 cursor-pointer"
                    >
                      <Mail className="w-4 h-4 fill-slate-950 text-slate-950" />
                      <span>Pumasok sa World of Letters</span>
                      <ExternalLink className="w-4 h-4 text-slate-950" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setIsLettersPreviewOpen(!isLettersPreviewOpen)}
                      className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-rose-200 border border-rose-400/40 text-xs transition-colors flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5 text-rose-300" />
                      <span>{isLettersPreviewOpen ? 'Itago ang Live Preview' : 'Silipin Dito (Live Preview)'}</span>
                    </button>
                  </div>
                </div>

                {/* Embedded Live Preview of World of Letters */}
                {isLettersPreviewOpen && (
                  <div className="w-full max-w-3xl mx-auto rounded-3xl overflow-hidden border-2 border-rose-400/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-slate-950">
                    <div className="p-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between text-xs text-rose-200/90 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-semibold text-rose-100">world-of-letters.vercel.app</span>
                      </div>
                      <a
                        href={WORLD_OF_LETTERS_URL}
                        target="_parent"
                        onClick={(e) => openInParent(WORLD_OF_LETTERS_URL, e)}
                        className="text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Pumasok sa Site</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="relative w-full h-[520px]">
                      <iframe
                        src={WORLD_OF_LETTERS_URL}
                        title="World of Letters Live Portal"
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media; fullscreen"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* World 4: Travel World Experience */}
            {world.id === 'travel-world' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl glass-card text-center max-w-xl mx-auto">
                  <Compass className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                  <h3 className="text-xl font-serif text-sky-100 font-medium">
                    Mga Bagong Mundong Sabay Nating Lalakbayin
                  </h3>
                  <p className="text-xs text-sky-200/80 font-sans mt-1">
                    Hindi dito nagtatapos ang ating uniberso — simula pa lang ito ng ating mga paglalakbay.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {TRAVEL_DREAMS.map((dest, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl glass-card flex flex-col justify-between hover:border-sky-300/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">✈️</span>
                          <span className="text-[10px] glass-pill text-sky-300 px-2 py-0.5 rounded-full font-sans uppercase">
                            {dest.status}
                          </span>
                        </div>
                        <h4 className="text-lg font-serif text-white font-medium">
                          {dest.destination}
                        </h4>
                        <p className="text-xs text-sky-200/80 font-sans mt-1">
                          {dest.tagline}
                        </p>

                        <div className="mt-4 space-y-1.5">
                          {dest.activities.map((act, aIdx) => (
                            <div key={aIdx} className="flex items-center gap-1.5 text-xs text-slate-300 font-serif">
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span>{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-200/80 font-serif italic">
                        "{dest.note}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar with Portal World Jumpers */}
          <div className="px-5 sm:px-6 py-4 border-t border-white/10 backdrop-blur-xl bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Quick Portal Switcher Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] font-sans text-slate-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Lipat ng Mundo:</span>
              </span>

              {WORLDS.map((w) => {
                const isCurrent = w.id === world.id;
                return (
                  <button
                    key={w.id}
                    id={`portal-jump-${w.id}`}
                    disabled={isCurrent}
                    onClick={() => {
                      if (!isCurrent && onNavigateWorld) {
                        onNavigateWorld(w);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-medium transition-all flex items-center gap-1 ${
                      isCurrent
                        ? 'glass-pill text-white ring-1 ring-white/30 cursor-default opacity-90'
                        : 'glass-pill text-slate-300 hover:text-white active:scale-95'
                    }`}
                    style={
                      !isCurrent
                        ? { borderColor: `${w.starColor}40`, color: `${w.starColor}dd` }
                        : {}
                    }
                  >
                    <span>{w.name}</span>
                  </button>
                );
              })}

              {onOpenPangilatan && (
                <button
                  id="portal-jump-pangilatan"
                  onClick={() =>
                    onOpenPangilatan('Papasok sa Tuktok ng Pangilatan... Ang ating paboritong tagpuan sa ulap! ⛰️')
                  }
                  className="glass-pill px-2.5 py-1 rounded-full text-[11px] font-sans font-medium text-emerald-300 transition-all flex items-center gap-1 active:scale-95"
                >
                  <Mountain className="w-3 h-3 text-emerald-400" />
                  <span>Pangilatan</span>
                </button>
              )}
            </div>

            <button
              id="btn-return-constellation"
              onClick={onClose}
              className="glass-pill px-5 py-2 rounded-full text-xs font-sans tracking-wider border transition-all hover:scale-105 shrink-0"
              style={{
                borderColor: `${world.starColor}50`,
                color: world.starColor,
              }}
            >
              Bumalik sa Kalawakan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
