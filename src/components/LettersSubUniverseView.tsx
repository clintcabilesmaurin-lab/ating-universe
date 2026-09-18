import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, Heart, Lock } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface LettersSubUniverseViewProps {
  onBackToUniverse: () => void;
  onSpeak?: (line: string, isAche?: boolean) => void;
  initialSubworldId?: string;
}

export const LettersSubUniverseView: React.FC<LettersSubUniverseViewProps> = memo(({
  onBackToUniverse,
}) => {
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

        <div className="flex items-center gap-2 text-rose-300/80 text-xs glass-pill px-3.5 py-1.5 rounded-full border border-rose-400/20">
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>Naka-lock sa Kasalukuyan</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8 max-w-xl mx-auto space-y-6 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full text-center space-y-5"
        >
          <div className="w-20 h-20 rounded-full glass-card mx-auto flex items-center justify-center border border-rose-400/40 text-rose-300 shadow-[0_0_35px_rgba(244,63,94,0.3)]">
            <Lock className="w-9 h-9 text-rose-300" />
          </div>

          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-widest font-sans text-rose-300/80 glass-pill px-4 py-1.5 rounded-full border border-rose-400/25">
              Naka-lock sa Kasalukuyan &bull; Isusulat Pa
            </span>

            <h1 className="text-3xl sm:text-4xl font-serif text-rose-100 font-medium tracking-wide drop-shadow-md">
              Mundo ng mga Liham
            </h1>

            <p className="text-base sm:text-lg text-rose-200/80 font-serif italic leading-relaxed max-w-md mx-auto pt-1">
              Pansamantalang nakasara at walang laman sa ngayon ang mundong ito. Isusulat pa ng ating mga puso ang bawat salita bago natin sabay na buksan sa tamang panahon.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                audioEngine.playStarGazeChime();
                onBackToUniverse();
              }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30 text-rose-200 border border-rose-400/40 text-xs sm:text-sm font-sans font-medium transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Bumalik sa Kalawakan</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
});

LettersSubUniverseView.displayName = 'LettersSubUniverseView';
