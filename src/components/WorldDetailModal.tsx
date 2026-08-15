import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, Mail, Calendar, Compass, ArrowLeft, CheckCircle2, Lock, BookOpen } from 'lucide-react';
import { WorldStar, Letter } from '../types';
import { TIMELINE_MILESTONES, MEMORIES, LETTERS, TRAVEL_DREAMS } from '../data/universeData';
import { audioEngine } from '../utils/audioEngine';

interface WorldDetailModalProps {
  world: WorldStar | null;
  onClose: () => void;
  onSpeak: (text: string, isAche?: boolean) => void;
}

export const WorldDetailModal: React.FC<WorldDetailModalProps> = ({
  world,
  onClose,
  onSpeak,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'moments'>('timeline');

  if (!world) return null;

  const handleOpenLetter = (letter: Letter) => {
    audioEngine.playStarGazeChime();
    setSelectedLetter(letter);
    onSpeak(`Binuksan mo ang liham: "${letter.title}"`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-2xl">
        <motion.div
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

            <button
              id="close-world-modal"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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

                {/* Photo Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MEMORIES.map((mem) => (
                    <div
                      key={mem.id}
                      className="rounded-2xl bg-slate-900/70 border border-purple-400/20 hover:border-purple-400/50 transition-all flex flex-col justify-between group shadow-lg overflow-hidden"
                    >
                      {mem.imageSrc && (
                        <div className="h-44 w-full overflow-hidden bg-slate-950">
                          <img
                            src={mem.imageSrc}
                            alt={mem.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                  ))}
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

          {/* Footer Bar */}
          <div className="px-6 py-4 border-t border-white/10 bg-slate-950 flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-400 font-serif italic">
              "Kahit anong layo, iisang kalawakan ang tahanan natin."
            </p>
            <button
              id="btn-return-constellation"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-sans tracking-wider border transition-all"
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
