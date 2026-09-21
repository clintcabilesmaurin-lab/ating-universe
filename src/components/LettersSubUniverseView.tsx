import React, { useState, memo } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, Heart, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { WORLD_OF_LETTERS_URL } from '../data/universeData';
import { audioEngine } from '../utils/audioEngine';
import { openInParent } from '../utils/navigationHelper';

interface LettersSubUniverseViewProps {
  onBackToUniverse: () => void;
  onSpeak?: (line: string, isAche?: boolean) => void;
  initialSubworldId?: string;
}

export const LettersSubUniverseView: React.FC<LettersSubUniverseViewProps> = memo(({
  onBackToUniverse,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

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
      {/* Background Starfield */}
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

      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-slate-950/60">
        <button
          onClick={() => {
            audioEngine.playStarGazeChime();
            onBackToUniverse();
          }}
          className="glass-pill flex items-center gap-2 text-xs px-4 py-2 rounded-full text-rose-200 hover:text-white transition-all hover:scale-105 border border-rose-400/30 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Bumalik sa Kalawakan</span>
        </button>

        <div className="flex items-center gap-3">
          <a
            href={WORLD_OF_LETTERS_URL}
            target="_parent"
            onClick={(e) => openInParent(WORLD_OF_LETTERS_URL, e)}
            className="glass-pill flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full text-amber-200 hover:text-amber-100 transition-all border border-amber-400/40 shadow-sm cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Direktang Link:</span>
            <span>world-of-letters.vercel.app</span>
          </a>

          <div className="flex items-center gap-1.5 text-rose-300">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 w-full flex flex-col items-center justify-start p-4 sm:p-8 max-w-5xl mx-auto space-y-6 z-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full text-center space-y-3 pt-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/50 text-rose-200 text-xs font-serif shadow-sm backdrop-blur-md">
            <Mail className="w-3.5 h-3.5 text-rose-300" />
            <span className="font-sans font-bold tracking-wide uppercase text-[11px]">Bukas Na &bull; World of Letters</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif text-rose-100 font-medium tracking-wide drop-shadow-md">
            Mundo ng mga Liham 💌
          </h1>

          <p className="text-sm font-['Caveat'] text-rose-200/90 text-lg sm:text-xl max-w-2xl mx-auto">
            Bawat liham, bawat damdamin, at bawat panalangin mula sa puso ni Clint para sa kanyang pinakamamahal na si Maica.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href={WORLD_OF_LETTERS_URL}
              target="_parent"
              id="btn-open-letters-world-external"
              onClick={(e) => openInParent(WORLD_OF_LETTERS_URL, e)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-400 via-pink-500 to-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:scale-105 active:scale-95 transition-all border border-rose-300/60 cursor-pointer"
            >
              <Mail className="w-4 h-4 fill-slate-950" />
              <span>Direktang Pumasok sa Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 border border-rose-300/40 text-xs transition-colors flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-rose-300" />
              <span>{isPreviewOpen ? 'Itago ang Live Window' : 'Silipin Dito (Live Window)'}</span>
            </button>
          </div>
        </motion.div>

        {/* Live Interactive Embed Window */}
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full rounded-3xl overflow-hidden border-2 border-rose-400/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-slate-950"
          >
            <div className="p-3 bg-slate-900/95 border-b border-white/10 flex items-center justify-between text-xs text-rose-200/90 font-mono">
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
            <div className="relative w-full h-[620px]">
              <iframe
                src={WORLD_OF_LETTERS_URL}
                title="World of Letters Live Portal"
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
              />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
});

LettersSubUniverseView.displayName = 'LettersSubUniverseView';
