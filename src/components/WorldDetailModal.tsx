import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, Mail, Calendar, Compass, ArrowLeft, CheckCircle2, Lock, BookOpen, Camera, ExternalLink, Globe, Mountain } from 'lucide-react';
import { WorldStar, Letter } from '../types';
import { TIMELINE_MILESTONES, MEMORIES, LETTERS, TRAVEL_DREAMS, MEMORY_GALLERY_WALK_URL, WORLDS } from '../data/universeData';
import { audioEngine } from '../utils/audioEngine';
import { CelestialMemoryVisual } from './CelestialMemoryVisual';
import { loadCustomPhotos, getDriveThumbnailUrl } from '../utils/driveHelper';

interface WorldDetailModalProps {
  world: WorldStar | null;
  onClose: () => void;
  onSpeak: (text: string, isAche?: boolean) => void;
  onOpenPhotoManager?: () => void;
  onNavigateWorld?: (world: WorldStar) => void;
  onOpenPangilatan?: (line: string) => void;
}

export const WorldDetailModal: React.FC<WorldDetailModalProps> = ({
  world,
  onClose,
  onSpeak,
  onOpenPhotoManager,
  onNavigateWorld,
  onOpenPangilatan,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'moments'>('timeline');
  const [imgLoadFailed, setImgLoadFailed] = useState<Record<string, boolean>>({});
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    const updatePhotos = () => {
      setCustomPhotos(loadCustomPhotos());
    };
    updatePhotos();
    window.addEventListener('universe_custom_photos_updated', updatePhotos);
    return () => window.removeEventListener('universe_custom_photos_updated', updatePhotos);
  }, []);

  if (!world) return null;

  const handleOpenLetter = (letter: Letter) => {
    audioEngine.playStarGazeChime();
    setSelectedLetter(letter);
    onSpeak(`Binuksan mo ang liham: "${letter.title}"`);
  };

  return (
    <AnimatePresence>
      <div
        data-lenis-prevent
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-2xl"
      >
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 25 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-black rounded-3xl border shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
          style={{ borderColor: `${world.starColor}55` }}
        >
          {/* Header Bar */}
          <div
            className="flex items-center justify-between px-6 py-5 border-b shrink-0"
            style={{
              borderColor: `${world.starColor}30`,
              backgroundColor: `${world.starColor}15`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner"
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
                    className="text-[11px] px-2.5 py-0.5 rounded-full font-sans font-medium"
                    style={{
                      backgroundColor: `${world.starColor}30`,
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
              {world.id === 'memory-gallery' && (
                <a
                  href={MEMORY_GALLERY_WALK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="header-gallery-walk-btn"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/25 hover:bg-purple-500/40 border border-purple-300/40 text-purple-100 text-xs font-sans font-medium transition-all shadow-md hover:scale-102"
                >
                  <Globe className="w-3.5 h-3.5 text-purple-300" />
                  <span>3D Gallery Walk</span>
                  <ExternalLink className="w-3 h-3 text-purple-300 ml-0.5" />
                </a>
              )}
              <button
                id="close-world-modal"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
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
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-center max-w-xl mx-auto">
                  <Heart className="w-8 h-8 text-amber-300 mx-auto mb-2 fill-amber-300/30" />
                  <h3 className="text-xl font-serif text-amber-100 font-medium">
                    365+ Araw ng Pagpili sa Isa't Isa
                  </h3>
                  <p className="text-xs text-amber-200/80 font-sans mt-1">
                    Ang patunay na ang tunay na pag-ibig ay lumalalim sa bawat pagsubok at distansya.
                  </p>
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

                        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-300/40 transition-colors">
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
                          <div className="mt-3 inline-block px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200 font-sans">
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
                <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-400/30 text-center">
                  <p className="text-sm sm:text-base font-serif italic text-purple-100 max-w-lg mx-auto leading-relaxed">
                    "{world.acheLine}"
                  </p>
                </div>

                {/* Featured 3D Memory Gallery Walk Portal */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-950/90 border border-purple-400/40 p-5 sm:p-6 shadow-[0_0_40px_rgba(192,132,252,0.2)]">
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-lg">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-300/30 text-purple-200 text-xs font-sans font-medium">
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
                      target="_blank"
                      rel="noopener noreferrer"
                      id="launch-gallery-walk-btn"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-sans text-xs sm:text-sm font-semibold tracking-wide shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all shrink-0 cursor-pointer"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Pumasok sa 3D Gallery Walk</span>
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
                        className="rounded-2xl bg-slate-900/70 border border-purple-400/20 hover:border-purple-400/50 transition-all flex flex-col justify-between group shadow-lg overflow-hidden"
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

            {/* World 3: Letters Experience */}
            {world.id === 'letters' && (
              <div className="space-y-6">
                {!selectedLetter ? (
                  <>
                    <div className="text-center max-w-lg mx-auto">
                      <p className="text-xs uppercase tracking-widest text-rose-300/70 font-sans mb-1">
                        Sulat-Kamay Mula sa Puso
                      </p>
                      <h3 className="text-2xl font-serif text-rose-100">
                        Mga Liham para kay Lovey
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 font-serif italic">
                        Pumili ng selyadong sobre para basahin ang mga salitang nakalaan sa'yo.
                      </p>
                    </div>

                    {/* Sealed Envelopes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      {LETTERS.map((letter) => (
                        <div
                          key={letter.id}
                          id={`letter-card-${letter.id}`}
                          onClick={() => handleOpenLetter(letter)}
                          className="relative p-6 rounded-3xl bg-gradient-to-b from-rose-950/40 to-slate-950/80 border border-rose-400/30 hover:border-rose-400 cursor-pointer transition-all hover:scale-[1.03] group shadow-xl flex flex-col justify-between min-h-[220px]"
                        >
                          {/* Wax Seal Icon */}
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-full bg-rose-600/30 border border-rose-400/50 flex items-center justify-center text-rose-300 shadow-md">
                              <Mail className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] uppercase font-sans tracking-widest text-rose-300/60 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/20">
                              {letter.tag}
                            </span>
                          </div>

                          <div className="my-3">
                            <h4 className="text-base font-serif font-medium text-white group-hover:text-rose-200 transition-colors">
                              {letter.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-serif italic mt-1 line-clamp-2">
                              "{letter.excerpt}"
                            </p>
                          </div>

                          <div className="text-xs font-sans text-rose-300/80 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" /> Buksan ang Liham
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Expanded Letter Reading View */
                  <div className="p-6 sm:p-8 rounded-3xl bg-stone-900/90 border border-amber-300/30 text-amber-50 shadow-2xl space-y-6">
                    <button
                      id="back-to-letters"
                      onClick={() => setSelectedLetter(null)}
                      className="flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 font-sans tracking-wide transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Bumalik sa listahan ng mga liham
                    </button>

                    <div className="border-b border-amber-200/20 pb-4">
                      <span className="text-xs text-amber-300/70 uppercase tracking-widest font-sans">
                        {selectedLetter.tag} &bull; {selectedLetter.date}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-serif text-amber-100 font-medium mt-1">
                        {selectedLetter.title}
                      </h3>
                    </div>

                    <div className="space-y-4 font-serif text-base sm:text-lg leading-relaxed text-amber-50/90 italic">
                      {selectedLetter.content.map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-amber-200/20 text-right">
                      <p className="font-serif text-amber-200 italic font-medium">
                        {selectedLetter.signature}
                      </p>
                      <p className="text-xs text-amber-300/50 font-sans mt-1">
                        Ating Universe &bull; Forever Lovey
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* World 4: Travel World Experience */}
            {world.id === 'travel-world' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-sky-950/40 border border-sky-400/30 text-center max-w-xl mx-auto">
                  <Compass className="w-8 h-8 text-sky-300 mx-auto mb-2" />
                  <h3 className="text-xl font-serif text-sky-100 font-medium">
                    Mga Bagong Mundong Sabay Nating Lalakbayin
                  </h3>
                  <p className="text-xs text-sky-200/70 font-sans mt-1">
                    Hindi dito nagtatapos ang ating uniberso — simula pa lang ito ng ating mga paglalakbay.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {TRAVEL_DREAMS.map((dest, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-sky-400/20 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">✈️</span>
                          <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full font-sans uppercase">
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
          <div className="px-5 sm:px-6 py-4 border-t border-white/10 bg-slate-950/95 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
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
                        ? 'bg-white/15 text-white ring-1 ring-white/30 cursor-default opacity-90'
                        : 'bg-black/40 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-white/25 active:scale-95'
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
                  className="px-2.5 py-1 rounded-full text-[11px] font-sans font-medium bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center gap-1 active:scale-95"
                >
                  <Mountain className="w-3 h-3 text-emerald-400" />
                  <span>Pangilatan</span>
                </button>
              )}
            </div>

            <button
              id="btn-return-constellation"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-sans tracking-wider border transition-all hover:scale-105 shrink-0"
              style={{
                backgroundColor: `${world.starColor}20`,
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
