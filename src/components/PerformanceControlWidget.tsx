import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gauge, Zap, Leaf, Sparkles, X, Check, Activity, ShieldCheck, Sliders } from 'lucide-react';
import {
  performanceManager,
  FpsCapMode,
  PerformanceTier,
  PerformanceStats,
} from '../utils/performanceManager';

interface PerformanceControlWidgetProps {
  onSpeak?: (text: string) => void;
}

export const PerformanceControlWidget: React.FC<PerformanceControlWidgetProps> = ({ onSpeak }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<PerformanceStats>(() => performanceManager.getStats());

  useEffect(() => {
    const unsub = performanceManager.subscribe((newStats) => {
      setStats(newStats);
    });
    return unsub;
  }, []);

  const handleSetCapMode = (mode: FpsCapMode) => {
    performanceManager.setFpsCapMode(mode);
    if (onSpeak) {
      if (mode === '60') {
        onSpeak("Naka-cap na sa 60 FPS ang universe para tuluy-tuloy at makinis ang mga bituin! ⚡✨");
      } else if (mode === '45') {
        onSpeak("Naka-cap sa 45 FPS ang universe para matipid sa baterya at napaka-steady ng pacing! 🌿🔋");
      } else {
        onSpeak("Adaptive 45-60 FPS mode: kusa nitong ia-adjust ang bilis batay sa iyong gamit na device! 💫");
      }
    }
  };

  const handleSetTier = (tier: PerformanceTier) => {
    performanceManager.setTier(tier);
    if (onSpeak) {
      onSpeak(`Quality tier binago sa: ${tier.toUpperCase()} graphics.`);
    }
  };

  // Status dot color based on real-time FPS
  const getFpsColor = () => {
    if (stats.fps >= 52) return 'bg-emerald-400 text-emerald-300';
    if (stats.fps >= 42) return 'bg-amber-400 text-amber-300';
    return 'bg-rose-400 text-rose-300';
  };

  return (
    <div className="relative pointer-events-auto select-none">
      {/* 1. Header Trigger Pill */}
      <button
        id="btn-performance-control"
        onClick={() => setIsOpen(!isOpen)}
        title="Performance & FPS Control (45-60 FPS Cap)"
        className="glass-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif text-slate-200 hover:text-white transition-all group"
      >
        <div className="relative flex items-center justify-center">
          <Activity className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
          <span
            className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
              stats.fps >= 42 ? 'bg-emerald-400' : 'bg-amber-400'
            } animate-pulse`}
          />
        </div>

        <span className="font-mono font-medium text-[11px] text-white">
          {stats.fps} <span className="text-[10px] text-slate-400 font-sans">FPS</span>
        </span>

        <span className="text-white/30 hidden sm:inline">&bull;</span>

        <span className="hidden sm:inline text-[11px] font-sans text-cyan-200/80 font-medium">
          {stats.capMode === '60' ? '60 Cap' : stats.capMode === '45' ? '45 Cap' : '45-60 Auto'}
        </span>
      </button>

      {/* 2. Frosted Translucent Control Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click barrier */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-3xl p-5 shadow-2xl text-slate-100 overflow-hidden"
            >
              {/* Subtle specular rim highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-semibold text-white tracking-wide">
                      Performance &amp; FPS Cap
                    </h4>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Frame pacing &amp; battery saver control
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live Performance Gauge Card */}
              <div className="glass-card rounded-2xl p-3.5 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-sans flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Real-Time Frame Rate
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${getFpsColor()}`}>
                    {stats.fps} FPS
                  </span>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-300"
                    style={{ width: `${Math.min(100, Math.max(10, (stats.fps / 60) * 100))}%` }}
                  />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-white/10 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                      Target Cap
                    </span>
                    <span className="font-mono text-xs font-semibold text-cyan-200">
                      {stats.targetFps} FPS
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                      Frame Time
                    </span>
                    <span className="font-mono text-xs font-semibold text-emerald-300">
                      {stats.frameTimeMs} ms
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                      Resolution
                    </span>
                    <span className="font-mono text-xs font-semibold text-amber-200">
                      {stats.dpr}x DPR
                    </span>
                  </div>
                </div>
              </div>

              {/* Frame Rate Cap Selector (45 to 60 FPS) */}
              <div className="space-y-2 mb-4">
                <label className="block text-xs font-serif font-medium text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                  FPS Cap Mode (45 - 60 FPS)
                </label>

                <div className="grid grid-cols-3 gap-1.5">
                  {/* 60 FPS */}
                  <button
                    onClick={() => handleSetCapMode('60')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      stats.capMode === '60'
                        ? 'bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-cyan-100'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      {stats.capMode === '60' && <Check className="w-3 h-3 text-cyan-300" />}
                    </div>
                    <span className="block text-xs font-serif font-bold text-white">60 FPS</span>
                    <span className="block text-[9px] text-slate-400 font-sans mt-0.5 leading-tight">
                      Fluid &amp; Silky
                    </span>
                  </button>

                  {/* 45 FPS */}
                  <button
                    onClick={() => handleSetCapMode('45')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      stats.capMode === '45'
                        ? 'bg-emerald-500/20 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-emerald-100'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      {stats.capMode === '45' && <Check className="w-3 h-3 text-emerald-300" />}
                    </div>
                    <span className="block text-xs font-serif font-bold text-white">45 FPS</span>
                    <span className="block text-[9px] text-slate-400 font-sans mt-0.5 leading-tight">
                      Cool &amp; Steady
                    </span>
                  </button>

                  {/* Auto 45-60 FPS */}
                  <button
                    onClick={() => handleSetCapMode('auto')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      stats.capMode === 'auto'
                        ? 'bg-purple-500/20 border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.25)] text-purple-100'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      {stats.capMode === 'auto' && <Check className="w-3 h-3 text-purple-300" />}
                    </div>
                    <span className="block text-xs font-serif font-bold text-white">Adaptive</span>
                    <span className="block text-[9px] text-slate-400 font-sans mt-0.5 leading-tight">
                      45-60 FPS Auto
                    </span>
                  </button>
                </div>
              </div>

              {/* Quality & Particle Multiplier */}
              <div className="space-y-2">
                <label className="block text-xs font-serif font-medium text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-300" />
                  Visual Quality Tier
                </label>

                <div className="grid grid-cols-3 gap-1.5">
                  {(['high', 'medium', 'low'] as PerformanceTier[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => handleSetTier(tier)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-sans capitalize transition-all border ${
                        stats.tier === tier
                          ? 'bg-amber-400/20 border-amber-300/60 text-amber-200 font-semibold'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400'
                      }`}
                    >
                      {tier === 'high' ? 'High (100%)' : tier === 'medium' ? 'Balanced' : 'Eco (Light)'}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-sans italic mt-4 pt-3 border-t border-white/10 text-center">
                Pinapanatili ang steady frame pacing upang maiwasan ang init at mabilis na pagkaubos ng baterya.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
