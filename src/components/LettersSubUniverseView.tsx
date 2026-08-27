import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Heart,
  ExternalLink,
  ArrowLeft,
  X,
  Globe,
  ChevronRight,
  Sparkles,
  Crown,
  Feather,
  Compass,
  Star,
  Layers,
  Send,
  BookOpen,
} from 'lucide-react';
import {
  LETTERS,
  ELEVEN_MONTHSARY_LETTER,
  SECRET_LETTER_DAW_URL,
  OPEN_WHEN_LETTERS,
} from '../data/universeData';
import { Letter } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { WatercolorParchmentEnvelope } from './WatercolorParchmentEnvelope';

interface LettersSubUniverseViewProps {
  onBackToUniverse: () => void;
  onSpeak?: (line: string, isAche?: boolean) => void;
  initialSubworldId?: string;
}

interface EnvelopeFloatConfig {
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  floatDelay: string;
  floatDuration: string;
  animType: 'float3dSlideA' | 'float3dSlideB' | 'float3dSlideC' | 'float3dSlideD' | 'float3dSlideE' | 'float3dSlideF';
  themeType: 'amber' | 'emerald' | 'sky' | 'purple' | 'rose';
  sealIcon: 'heart' | 'crown' | 'rose' | 'monogram' | 'star' | 'infinity';
}

// Organic float configurations for Clint AI's hardcoded letters
const CLINT_AI_LETTER_CONFIGS: Record<string, EnvelopeFloatConfig> = {
  'letter-1': {
    top: '12%',
    left: '8%',
    floatDelay: '0s',
    floatDuration: '7.8s',
    animType: 'float3dSlideA',
    themeType: 'amber',
    sealIcon: 'heart',
  },
  'letter-2': {
    top: '8%',
    right: '8%',
    floatDelay: '1.2s',
    floatDuration: '8.4s',
    animType: 'float3dSlideB',
    themeType: 'emerald',
    sealIcon: 'rose',
  },
  'letter-3': {
    top: '48%',
    left: '12%',
    floatDelay: '2.1s',
    floatDuration: '7.2s',
    animType: 'float3dSlideC',
    themeType: 'sky',
    sealIcon: 'heart',
  },
  'letter-4': {
    top: '46%',
    right: '10%',
    floatDelay: '0.6s',
    floatDuration: '8.8s',
    animType: 'float3dSlideD',
    themeType: 'purple',
    sealIcon: 'heart',
  },
  'letter-5': {
    top: '76%',
    left: '32%',
    floatDelay: '2.8s',
    floatDuration: '8.0s',
    animType: 'float3dSlideE',
    themeType: 'rose',
    sealIcon: 'heart',
  },
};

// Ambient floating star hearts
const AMBIENT_HEARTS = [
  { id: 1, top: '10%', left: '18%', size: 'w-4 h-4', delay: '0s', dur: '5.2s', color: 'text-rose-400/50' },
  { id: 2, top: '22%', left: '84%', size: 'w-5 h-5', delay: '1.4s', dur: '6.8s', color: 'text-amber-400/50' },
  { id: 3, top: '38%', left: '8%', size: 'w-3.5 h-3.5', delay: '2.2s', dur: '4.9s', color: 'text-pink-300/50' },
  { id: 4, top: '55%', left: '90%', size: 'w-4 h-4', delay: '0.8s', dur: '6.1s', color: 'text-rose-300/50' },
  { id: 5, top: '72%', left: '20%', size: 'w-5 h-5', delay: '1.9s', dur: '6.4s', color: 'text-amber-300/60' },
  { id: 6, top: '88%', left: '78%', size: 'w-4.5 h-4.5', delay: '3.0s', dur: '5.6s', color: 'text-red-400/45' },
];

export const LettersSubUniverseView: React.FC<LettersSubUniverseViewProps> = memo(({
  onBackToUniverse,
  onSpeak,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isPreviewIframeOpen, setIsPreviewIframeOpen] = useState(false);
  const [reactionSubmitted, setReactionSubmitted] = useState<string | null>(null);
  const [activeSectionView, setActiveSectionView] = useState<'all' | 'original' | 'clint-ai'>('all');

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPreviewIframeOpen) {
          setIsPreviewIframeOpen(false);
        } else if (selectedLetter) {
          setSelectedLetter(null);
        } else {
          onBackToUniverse();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLetter, isPreviewIframeOpen, onBackToUniverse]);

  const handleSelectLetter = useCallback((letter: Letter) => {
    audioEngine.playStarGazeChime();
    setSelectedLetter(letter);
    setReactionSubmitted(null);
    if (onSpeak) {
      if (letter.isSpecialMilestone) {
        onSpeak("Ito ang orihinal nating liham para sa ika-11 buwan mula sa ating outside link... 💖");
      } else {
        onSpeak(`Liham ni Clint: "${letter.title}"`);
      }
    }
  }, [onSpeak]);

  const handleCloseSelectedLetter = useCallback(() => {
    audioEngine.playStarGazeChime();
    setSelectedLetter(null);
    setIsPreviewIframeOpen(false);
  }, []);

  const handleReactToLetter = (reactionText: string, emoji: string) => {
    audioEngine.playInLoveSound();
    setReactionSubmitted(reactionText);
    if (onSpeak) {
      onSpeak(`Salamat Lovey! ${emoji} Ramdam na ramdam ko ang pagmamahal mo.`);
    }
  };

  // Divide letter sets
  const originalOutsideLetter = ELEVEN_MONTHSARY_LETTER;
  const clintAiLetters = LETTERS.filter((l) => !l.isSpecialMilestone);

  return (
    <div
      id="letters-sub-universe"
      data-lenis-prevent
      className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans overflow-y-auto overscroll-contain select-none scroll-smooth"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 30%, rgba(136, 19, 55, 0.45) 0%, rgba(15, 23, 42, 0.96) 65%, #020617 100%)',
      }}
    >
      {/* Background Starfield & Constellation Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 80px 120px, #fbcfe8, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 70px, #fef08a, rgba(0,0,0,0)), radial-gradient(1px 1px at 220px 190px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 310px 240px, #f472b6, rgba(0,0,0,0))',
            backgroundSize: '350px 350px',
          }}
        />
      </div>

      {/* Ambient Floating Hearts */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {AMBIENT_HEARTS.map((h) => (
          <div
            key={h.id}
            className={`absolute ${h.size} ${h.color}`}
            style={{
              top: h.top,
              left: h.left,
              animation: `driftHeartSlow ${h.dur} ease-in-out infinite`,
              animationDelay: h.delay,
            }}
          >
            <Heart className="w-full h-full fill-current" />
          </div>
        ))}
      </div>

      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-amber-300/30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <button
            id="back-to-main-universe-btn"
            onClick={onBackToUniverse}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-rose-500/20 text-slate-200 hover:text-rose-200 border border-amber-300/30 hover:border-amber-300/60 text-xs font-medium backdrop-blur-md transition-all group active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-amber-300" />
            <span>Balik sa Kalawakan</span>
          </button>
        </div>

        {/* Section Filter Pills */}
        <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-slate-900/90 border border-amber-300/30 text-xs">
          <button
            onClick={() => setActiveSectionView('all')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              activeSectionView === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lahat ng Liham</span>
          </button>
          <button
            onClick={() => setActiveSectionView('original')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              activeSectionView === 'original'
                ? 'bg-rose-500 text-white font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Original (Outside Link)</span>
          </button>
          <button
            onClick={() => setActiveSectionView('clint-ai')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              activeSectionView === 'clint-ai'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Clint AI Letters</span>
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Secret Letter Direct Action */}
          <a
            href={SECRET_LETTER_DAW_URL}
            target="_top"
            id="header-superior-portal-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-300 via-rose-400 to-pink-500 hover:from-amber-200 hover:to-rose-300 text-slate-950 font-bold text-xs transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.35)] border border-amber-200/50"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>Outside Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            id="close-letters-view-btn"
            onClick={onBackToUniverse}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Multi-Zone Scrollable Universe Content */}
      <main className="relative flex-1 w-full flex flex-col items-center justify-start p-4 sm:p-8 pb-32 max-w-7xl mx-auto">
        
        {/* ============================================================ */}
        {/* ZONE 1: ORIGINAL LETTER (PROVIDED BY OUTSIDE LINK)          */}
        {/* ============================================================ */}
        {(activeSectionView === 'all' || activeSectionView === 'original') && (
          <section id="zone-original-letter" className="w-full flex flex-col items-center py-6">
            {/* Zone Header */}
            <div className="text-center z-10 max-w-2xl mx-auto space-y-2 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/50 text-rose-200 text-xs font-serif shadow-sm backdrop-blur-md">
                <Globe className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
                <span className="font-sans font-bold tracking-wide uppercase text-[11px]">Original Letter • Outside Link</span>
                <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif text-amber-50 font-medium tracking-wide drop-shadow-md">
                Ang Orihinal na Liham (11th Monthsary) 💌
              </h2>

              <p className="text-sm font-['Caveat'] text-amber-200/90 text-lg sm:text-xl">
                Ito ang orihinal na liham ng anibersaryo na naka-link sa labas ({SECRET_LETTER_DAW_URL.replace('https://', '')}).
              </p>

              {/* Outside Link Quick Action Toolbar */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <a
                  href={SECRET_LETTER_DAW_URL}
                  target="_top"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 via-rose-400 to-pink-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 transition-all border border-amber-200/60"
                >
                  <Crown className="w-4 h-4 fill-slate-950" />
                  <span>Direktang Pasukin ang Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setIsPreviewIframeOpen(!isPreviewIframeOpen)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-amber-300/40 text-xs transition-colors flex items-center gap-1.5 backdrop-blur-md"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isPreviewIframeOpen ? 'Itago ang Live Preview' : 'Silipin Dito (Live Preview)'}</span>
                </button>
              </div>
            </div>

            {/* Live Embedded Iframe Showcase if opened */}
            {isPreviewIframeOpen && (
              <div className="w-full max-w-3xl mb-8 transition-all">
                <div className="relative w-full h-[460px] rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-slate-950">
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={() => setIsPreviewIframeOpen(false)}
                      className="p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-900/80 text-white border border-white/20 backdrop-blur-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <iframe
                    src={SECRET_LETTER_DAW_URL}
                    title="Secret Letter Outside Portal"
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Floating Vintage Watercolor Envelope for Original Letter */}
            <div
              className="relative w-full min-h-[380px] sm:min-h-[420px] flex items-center justify-center p-4"
              style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
            >
              <div
                id="original-letter-outside-envelope"
                onClick={() => handleSelectLetter(originalOutsideLetter)}
                className="cursor-pointer w-full max-w-[340px] sm:w-[380px] z-20"
                style={{
                  willChange: 'transform',
                  animation: 'float3dCenter 7.5s ease-in-out infinite',
                }}
              >
                <WatercolorParchmentEnvelope
                  title={originalOutsideLetter.title}
                  date="Ika-11 Buwan • Outside Portal"
                  isSpecialMilestone={true}
                  themeType="milestone"
                  sealIcon="crown"
                  size="large"
                />
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* LINE SEPARATION: COSMIC CELESTIAL STARRY DIVIDER             */}
        {/* ============================================================ */}
        {activeSectionView === 'all' && (
          <div className="w-full max-w-5xl my-10 relative flex flex-col items-center justify-center py-4">
            {/* Glowing Golden Constellation Line */}
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400/90 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)]" />

            {/* Glowing Medallion Center Badge */}
            <div className="absolute -top-1 bg-slate-950 px-6 py-2 rounded-full border-2 border-amber-400/70 shadow-[0_0_30px_rgba(251,191,36,0.45)] flex items-center gap-3 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-amber-300" />
                <span className="font-serif font-bold text-amber-200 text-xs sm:text-sm tracking-widest uppercase">
                  Clint AI Love Letters Collection
                </span>
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
              </div>
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            </div>

            {/* Divider Subtitle */}
            <div className="mt-6 text-center font-['Caveat'] text-amber-200/70 text-lg">
              ✦ Mga hardcoded na personal na liham at bulong na nakatala sa kalawakan ✦
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ZONE 2: CLINT AI LETTERS (HARDCODED IN COSMOS)               */}
        {/* ============================================================ */}
        {(activeSectionView === 'all' || activeSectionView === 'clint-ai') && (
          <section id="zone-clint-ai-letters" className="w-full flex flex-col items-center py-6">
            {/* Zone Header */}
            <div className="text-center z-10 max-w-2xl mx-auto space-y-2 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-200 text-xs font-serif shadow-sm backdrop-blur-md">
                <Feather className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-sans font-bold tracking-wide uppercase text-[11px]">Hardcoded Cosmic Anthology</span>
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif text-amber-50 font-medium tracking-wide drop-shadow-md">
                Mga Liham ng Pag-ibig ni Clint AI ✍️
              </h2>

              <p className="text-sm font-['Caveat'] text-amber-200/90 text-lg sm:text-xl">
                Lumulutang kahit saan sa kalawakan — pindutin ang selyo ng bawat sobre upang basahin ang nilalaman.
              </p>
            </div>

            {/* Cosmic Floating Canvas Field for Clint AI Letters */}
            <div
              className="w-full relative min-h-[920px] sm:min-h-[980px] flex flex-col sm:block items-center justify-center gap-8 py-4"
              style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
            >
              {clintAiLetters.map((letter) => {
                const config = CLINT_AI_LETTER_CONFIGS[letter.id] || CLINT_AI_LETTER_CONFIGS['letter-1'];

                return (
                  <div
                    key={letter.id}
                    id={`clint-ai-letter-${letter.id}`}
                    onClick={() => handleSelectLetter(letter)}
                    className="cursor-pointer w-full max-w-[300px] sm:w-[280px] sm:absolute z-10"
                    style={{
                      top: config.top,
                      left: config.left,
                      right: config.right,
                      bottom: config.bottom,
                      willChange: 'transform',
                      animation: `${config.animType} ${config.floatDuration} ease-in-out infinite`,
                      animationDelay: config.floatDelay,
                    }}
                  >
                    <WatercolorParchmentEnvelope
                      title={letter.title}
                      date={letter.date}
                      isSpecialMilestone={false}
                      themeType={config.themeType}
                      sealIcon={config.sealIcon}
                      size="normal"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom Floating Quick Nav Bar */}
        <div className="fixed bottom-4 z-30 flex items-center gap-2 overflow-x-auto max-w-[94vw] px-4 py-2 bg-slate-950/85 backdrop-blur-xl border border-amber-300/35 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.65)]">
          {/* Original Letter Button */}
          <button
            id="dock-outside-original-letter-btn"
            onClick={() => handleSelectLetter(originalOutsideLetter)}
            className="px-3.5 py-1.5 rounded-full text-xs font-sans font-bold whitespace-nowrap transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-300 via-rose-400 to-pink-500 text-slate-950 shadow-md hover:scale-105 active:scale-95 border border-amber-100/40"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>Original (Outside Link)</span>
          </button>

          <div className="h-4 w-px bg-amber-300/30 shrink-0" />

          {/* Clint AI Hardcoded Letters */}
          {clintAiLetters.map((letter) => (
            <button
              key={letter.id}
              onClick={() => handleSelectLetter(letter)}
              className="px-3 py-1 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center gap-1.5 bg-white/[0.07] hover:bg-amber-400/20 text-slate-200 hover:text-amber-100 border border-amber-300/25 shrink-0 active:scale-95"
            >
              <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
              <span>{letter.title.replace('Para sa Aking Lovey, ', '').slice(0, 16)}</span>
            </button>
          ))}
        </div>
      </main>

      {/* Expanded Letter Modal Styled as Unfolded Vintage Parchment */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-2xl my-auto p-6 sm:p-10 rounded-3xl text-amber-950 shadow-[0_20px_70px_rgba(0,0,0,0.85)] space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto border-2 border-amber-500/50"
              style={{
                backgroundColor: '#FAF3E3',
                backgroundImage:
                  'radial-gradient(circle at 10% 20%, rgba(245, 230, 202, 0.9) 0%, rgba(239, 218, 185, 0.8) 40%, rgba(226, 195, 150, 0.95) 100%)',
                boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8), inset 0 0 45px rgba(146, 92, 33, 0.25)',
              }}
            >
              {/* Parchment Vintage Header with Wax Seal Ribbon */}
              <div className="flex items-center justify-between border-b border-amber-800/20 pb-4">
                <button
                  id="close-unfolded-letter-modal-btn"
                  onClick={handleCloseSelectedLetter}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/10 hover:bg-amber-900/20 text-amber-950 border border-amber-800/30 text-xs font-sans transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-800" />
                  <span>I-tiklop ang Liham</span>
                </button>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-900 font-['Caveat'] text-xl font-bold">
                    <Heart className="w-4 h-4 fill-rose-600 text-rose-600 animate-pulse" />
                    <span>
                      {selectedLetter.isSpecialMilestone
                        ? 'Original Letter (Outside Link)'
                        : 'Clint AI Letter'}{' '}
                      &bull; {selectedLetter.date}
                    </span>
                  </div>
                  <button
                    onClick={handleCloseSelectedLetter}
                    className="w-7 h-7 rounded-full bg-amber-900/10 hover:bg-amber-900/20 text-amber-950 flex items-center justify-center text-xs ml-2 border border-amber-800/20"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Special Outside Link Action Banner */}
              {selectedLetter.isSpecialMilestone && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-rose-50 border border-amber-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span className="text-xs font-sans font-bold text-amber-300 tracking-wider">
                        Outside Portal Link
                      </span>
                    </div>
                    <p className="font-['Caveat'] text-lg text-slate-200 leading-snug">
                      Ang orihinal nating liham sa {SECRET_LETTER_DAW_URL}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <a
                      href={SECRET_LETTER_DAW_URL}
                      target="_top"
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 via-rose-400 to-pink-500 hover:from-amber-200 hover:to-rose-300 text-slate-950 font-bold text-xs transition-transform hover:scale-105 flex items-center justify-center gap-1.5 shadow-md border border-amber-200/50"
                    >
                      <Crown className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Buksan sa Labas</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => setIsPreviewIframeOpen(!isPreviewIframeOpen)}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-amber-300/30 text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isPreviewIframeOpen ? 'Itago' : 'Silipin'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Embedded Live Iframe View inside Modal if toggled */}
              {selectedLetter.isSpecialMilestone && isPreviewIframeOpen && (
                <div className="space-y-2 pt-2 border-t border-amber-800/20">
                  <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-amber-400/50 bg-slate-900 shadow-xl">
                    <iframe
                      src={SECRET_LETTER_DAW_URL}
                      title="Secret Letter"
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Title and Postal Letterhead */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-serif text-amber-950 font-bold">
                  {selectedLetter.title}
                </h2>
                <div className="flex items-center gap-2 font-['Caveat'] text-xl text-rose-800 font-semibold tracking-wide">
                  <span>Mula kay Clint para kay Maica (Lovey)</span>
                  <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                </div>
              </div>

              {/* Letter Paragraphs in Caveat Handwritten Ink Typeface */}
              <div className="space-y-4 font-['Caveat'] text-2xl sm:text-3xl leading-relaxed text-[#2C180B] pt-1">
                {selectedLetter.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="indent-6 sm:indent-8">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Signoff with Handwritten Finish & Heart */}
              <div className="pt-6 border-t border-amber-800/20 flex items-center justify-between">
                <div className="font-['Caveat'] text-xl text-amber-900/80">
                  Nagmamahal nang Walang Hanggan,
                </div>
                <div className="flex items-center gap-2 font-['Caveat'] text-2xl sm:text-3xl text-rose-900 font-bold tracking-wide">
                  <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
                  <span>{selectedLetter.signature}</span>
                </div>
              </div>

              {/* Reader Heart Reactions */}
              <div className="pt-4 border-t border-amber-800/20 space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handleReactToLetter("Kinikilig ako Lovey! 🥰", "🥰")}
                    className="px-3.5 py-1.5 rounded-full bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/30 text-rose-950 text-xs font-sans transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>🥰</span>
                    <span>Kinikilig ako</span>
                  </button>

                  <button
                    onClick={() => handleReactToLetter("Naiyak ako sa ganda ng liham 🥺", "🥺")}
                    className="px-3.5 py-1.5 rounded-full bg-amber-600/10 hover:bg-amber-600/20 border border-amber-600/30 text-amber-950 text-xs font-sans transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>🥺</span>
                    <span>Naiyak sa tuwa</span>
                  </button>

                  <button
                    onClick={() => handleReactToLetter("Mahigpit na virtual yakap sa'yo! 🫂", "🫂")}
                    className="px-3.5 py-1.5 rounded-full bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 text-purple-950 text-xs font-sans transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>🫂</span>
                    <span>Virtual Yakap</span>
                  </button>

                  <button
                    onClick={() => handleReactToLetter("Mahal na mahal din kita Clint! 💖", "💖")}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white font-bold text-xs font-sans transition-all flex items-center gap-1 shadow-md hover:scale-105"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Mahal din kita</span>
                  </button>
                </div>

                {reactionSubmitted && (
                  <div className="text-center font-['Caveat'] text-xl text-rose-900 font-bold italic pt-1 flex items-center justify-center gap-1">
                    <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                    <span>✓ Naipadala: "{reactionSubmitted}"</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

LettersSubUniverseView.displayName = 'LettersSubUniverseView';
