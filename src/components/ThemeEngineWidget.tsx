import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SeasonId,
  AtmosphereMoodId,
  BlendedThemeState,
  SEASONS_CONFIG,
  ATMOSPHERE_MOODS,
  getCalendarAutoSeason,
} from '../utils/themeEngine';
import {
  Sun,
  Moon,
  CloudSun,
  Sparkles,
  Calendar,
  Shuffle,
  Volume2,
  X,
  Sliders,
  Check,
  Compass,
} from 'lucide-react';

interface ThemeEngineWidgetProps {
  blendedTheme: BlendedThemeState;
  onSeasonSelect: (seasonId: SeasonId, autoCalendar: boolean) => void;
  onMoodSelect: (moodId: AtmosphereMoodId) => void;
  onToggleRandomMood: (active: boolean) => void;
  onRandomizeNow: () => void;
  onBlendWeightChange: (weight: number) => void;
  onSpeak: (text: string) => void;
}

export const ThemeEngineWidget: React.FC<ThemeEngineWidgetProps> = ({
  blendedTheme,
  onSeasonSelect,
  onMoodSelect,
  onToggleRandomMood,
  onRandomizeNow,
  onBlendWeightChange,
  onSpeak,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'moods' | 'seasons'>('moods');

  const calendarSeason = getCalendarAutoSeason();
  const currentSeasonConfig = blendedTheme.seasonConfig;
  const currentMoodConfig = blendedTheme.moodConfig;

  // Romantic voice whisper for current atmosphere
  const handleSpeakAtmosphere = () => {
    const text = `${currentMoodConfig.name}, nakahalo sa ${currentSeasonConfig.name}. ${currentMoodConfig.whisperTemplate}`;
    onSpeak(text);
  };

  return (
    <>
      {/* Header Pill Button with Live Animated Indicators */}
      <button
        id="btn-open-theme-engine"
        onClick={() => setIsOpen(true)}
        title="Theme Engine: Apat na Panahon & Blended Moods"
        className="glass-pill group relative flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
        style={{
          borderColor: currentMoodConfig.badgeBorder,
          boxShadow: `0 0 16px ${currentMoodConfig.glowColor}`,
        }}
      >
        {/* Pulsing Aura Indicator */}
        <span
          className="w-2 h-2 rounded-full animate-ping absolute left-3 pointer-events-none"
          style={{ backgroundColor: currentMoodConfig.accentColor }}
        />
        <span
          className="w-2 h-2 rounded-full relative z-10"
          style={{ backgroundColor: currentMoodConfig.accentColor }}
        />

        {/* Current Mood & Season Badge */}
        <span className="font-serif font-medium text-slate-100 flex items-center gap-1.5">
          <span>{currentMoodConfig.emoji}</span>
          <span className="font-semibold hidden sm:inline">{currentMoodConfig.name}</span>
          <span className="text-slate-400 font-mono text-[10px]">×</span>
          <span>{currentSeasonConfig.emoji}</span>
          <span className="hidden md:inline text-amber-200/90 font-light text-[11px]">
            {currentSeasonConfig.name}
          </span>
        </span>

        {/* Random Occurrence Badge Indicator */}
        {blendedTheme.isRandomMoodActive && (
          <span
            className="flex items-center gap-0.5 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-emerald-300 font-mono border border-emerald-400/30"
            title="Random Occurrence Active: Kusa at random na nagbabago ang tema"
          >
            <Shuffle className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="hidden lg:inline">Random</span>
          </span>
        )}
      </button>

      {/* Main Theme Engine Configuration Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-white/20 shadow-2xl overflow-hidden z-10"
              style={{
                boxShadow: `0 0 50px ${currentMoodConfig.glowColor}`,
              }}
            >
              {/* Top specular highlight rim */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent pointer-events-none" />

              {/* Top Accent Gradient Banner */}
              <div
                className="h-2 w-full transition-all duration-700"
                style={{
                  background: `linear-gradient(90deg, ${currentSeasonConfig.accentColor}, ${currentMoodConfig.accentColor})`,
                }}
              />

              {/* Modal Header */}
              <div className="px-5 sm:px-7 pt-5 pb-3 border-b border-white/10 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentMoodConfig.emoji}</span>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
                      <span>Atmosphere & Seasons Theme Engine</span>
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300/80 mt-1">
                    Apat na Panahon (Calendar-Aware) at Randomly Blended Cosmic Moods
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="px-5 sm:px-7 pt-3 pb-2 flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-1.5 p-1 rounded-xl glass-card text-xs">
                  <button
                    onClick={() => setActiveTab('moods')}
                    className={`px-3.5 py-1.5 rounded-lg font-serif font-medium transition-all ${
                      activeTab === 'moods'
                        ? 'bg-amber-400/25 text-amber-200 border border-amber-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ✨ Blended Moods ({ATMOSPHERE_MOODS.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('seasons')}
                    className={`px-3.5 py-1.5 rounded-lg font-serif font-medium transition-all ${
                      activeTab === 'seasons'
                        ? 'bg-amber-400/25 text-amber-200 border border-amber-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📅 4 Panahon (Seasons)
                  </button>
                </div>

                {/* Instant Randomize Button */}
                <button
                  onClick={onRandomizeNow}
                  title="Randomize Blended Mood Now"
                  className="glass-pill flex items-center gap-1.5 text-xs font-serif font-semibold px-3 py-1.5 rounded-xl text-amber-200 border border-amber-300/40 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Shuffle className="w-3.5 h-3.5 text-amber-300" />
                  <span>Palitan (Random)</span>
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-200 custom-scrollbar">
                {/* TAB 1: BLENDED MOODS */}
                {activeTab === 'moods' && (
                  <div className="space-y-5">
                    {/* Random Occurrence Engine Setting Box */}
                    <div className="p-4 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Shuffle className="w-4 h-4 text-emerald-400" />
                          <h3 className="font-serif font-semibold text-slate-100 text-sm">
                            Random Occurrence Engine
                          </h3>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {blendedTheme.isRandomMoodActive ? 'Naka-ON' : 'Naka-OFF'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300/80 mt-1">
                          Kusang nagpapalit-palit ang mga blended theme (Golden Hour, Romantic Dark, etc.) tuwing 60-90 segundo nang may banayad na crossfade.
                        </p>
                      </div>

                      <button
                        onClick={() => onToggleRandomMood(!blendedTheme.isRandomMoodActive)}
                        className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all shadow-md shrink-0 ${
                          blendedTheme.isRandomMoodActive
                            ? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/35'
                            : 'glass-card border border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {blendedTheme.isRandomMoodActive ? 'I-pause ang Random' : 'Paganahin ang Random'}
                      </button>
                    </div>

                    {/* Blended Mood Cards Grid */}
                    <div>
                      <h4 className="text-xs font-serif uppercase tracking-widest text-slate-400 mb-2.5">
                        Pumili ng Blended Mood (Ihahalubilo sa Kalangitan):
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {ATMOSPHERE_MOODS.map((mood) => {
                          const isSelected = blendedTheme.moodId === mood.id;
                          return (
                            <button
                              key={mood.id}
                              onClick={() => onMoodSelect(mood.id)}
                              className={`text-left p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                                isSelected
                                  ? 'glass-card border-amber-300/80 shadow-lg scale-[1.01] bg-amber-500/10'
                                  : 'glass-card border-white/10 hover:border-white/30 hover:scale-[1.005]'
                              }`}
                              style={{
                                boxShadow: isSelected ? `0 0 20px ${mood.glowColor}` : undefined,
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-2xl group-hover:scale-110 transition-transform">
                                    {mood.emoji}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h5 className="font-serif font-semibold text-slate-100 text-sm">
                                        {mood.name}
                                      </h5>
                                      {isSelected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                      {mood.tagline}
                                    </p>
                                  </div>
                                </div>

                                {isSelected && (
                                  <span className="p-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Blend Weight Intensity Slider */}
                    <div className="p-4 rounded-2xl glass-card space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-serif text-slate-300 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>Lakas ng Blend (Season vs Mood Overlay):</span>
                        </span>
                        <span className="font-mono text-amber-300 font-semibold">
                          {Math.round(blendedTheme.blendWeight * 100)}% Mood
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="0.95"
                        step="0.05"
                        value={blendedTheme.blendWeight}
                        onChange={(e) => onBlendWeightChange(parseFloat(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Mas matingkad ang Season ({currentSeasonConfig.name})</span>
                        <span>Mas matingkad ang Mood ({currentMoodConfig.name})</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SEASONS (SUMMER, WINTER, AUTUMN, SPRING) */}
                {activeTab === 'seasons' && (
                  <div className="space-y-5">
                    {/* Calendar Auto Detection Switch Card */}
                    <div className="p-4 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <h3 className="font-serif font-semibold text-slate-100 text-sm">
                            Awtomatikong Batay sa Kalendaryo (Calendar Auto)
                          </h3>
                          <span
                            className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                              blendedTheme.isSeasonAutoCalendar
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {blendedTheme.isSeasonAutoCalendar ? 'Aktibo' : 'Manual Override'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300/80 mt-1">
                          Awtomatikong sinusuri ang kasalukuyang petsa ng kalendaryo. Kasalukuyang Panahon ngayon: <strong className="text-amber-200">{SEASONS_CONFIG[calendarSeason].name} ({SEASONS_CONFIG[calendarSeason].englishName})</strong>.
                        </p>
                      </div>

                      <button
                        onClick={() => onSeasonSelect(calendarSeason, true)}
                        className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all shadow-md shrink-0 ${
                          blendedTheme.isSeasonAutoCalendar
                            ? 'bg-amber-500/25 border border-amber-400/50 text-amber-200'
                            : 'glass-card border border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {blendedTheme.isSeasonAutoCalendar ? 'Naka-Sync sa Kalendaryo' : 'I-Sync sa Kalendaryo'}
                      </button>
                    </div>

                    {/* The 4 Seasons Cards */}
                    <div>
                      <h4 className="text-xs font-serif uppercase tracking-widest text-slate-400 mb-2.5">
                        Apat na Panahon ng Ating Uniberso:
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(Object.keys(SEASONS_CONFIG) as SeasonId[]).map((sId) => {
                          const season = SEASONS_CONFIG[sId];
                          const isSelected = blendedTheme.seasonId === sId;
                          const isCalendarMatch = calendarSeason === sId;

                          return (
                            <button
                              key={sId}
                              onClick={() => onSeasonSelect(sId, false)}
                              className={`text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                                isSelected
                                  ? 'glass-card border-amber-300/80 shadow-lg scale-[1.01] bg-amber-500/10'
                                  : 'glass-card border-white/10 hover:border-white/30 hover:scale-[1.005]'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl group-hover:scale-110 transition-transform">
                                    {season.emoji}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-serif font-bold text-slate-100 text-base">
                                        {season.name}
                                      </h5>
                                      <span className="text-xs text-slate-400 font-sans">
                                        ({season.englishName})
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-amber-200/80 font-mono mt-0.5">
                                      📅 {season.calendarDateRange}
                                    </p>
                                  </div>
                                </div>

                                {isSelected && (
                                  <span className="p-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-300 mt-2.5 line-clamp-2">
                                {season.tagline}
                              </p>

                              {isCalendarMatch && (
                                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-300 font-mono">
                                  <span>✨ Kasalukuyang Panahon sa Kalendaryo</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Romantic Atmosphere Whisper Bar */}
                <div
                  className="p-4 rounded-2xl border glass-card flex items-center justify-between gap-3 transition-colors duration-500"
                  style={{
                    borderColor: currentMoodConfig.badgeBorder,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">💬</span>
                    <div className="text-xs">
                      <span className="font-serif font-semibold text-slate-100 block">
                        Bulong ng Kalawakan ({currentMoodConfig.name} × {currentSeasonConfig.name}):
                      </span>
                      <span className="text-slate-300 italic">
                        "{currentMoodConfig.whisperTemplate}"
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSpeakAtmosphere}
                    title="Makinig sa bulong"
                    className="glass-pill p-2 rounded-xl text-amber-200 border border-white/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 sm:px-7 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Aktibo: {currentMoodConfig.name} + {currentSeasonConfig.name} ({currentSeasonConfig.englishName})
                  </span>
                </span>

                <button
                  onClick={() => setIsOpen(false)}
                  className="glass-pill px-4 py-1.5 rounded-xl text-amber-200 border border-amber-400/40 font-serif font-semibold transition-all hover:scale-105"
                >
                  Isara
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
