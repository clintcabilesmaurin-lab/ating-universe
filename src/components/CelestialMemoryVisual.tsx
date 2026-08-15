import React from 'react';
import { Mountain, Image as ImageIcon, Heart, Sparkles } from 'lucide-react';

interface CelestialMemoryVisualProps {
  title: string;
  location?: string;
  date?: string;
  theme?: 'emerald' | 'amber' | 'purple' | 'rose' | 'sky';
  size?: 'sm' | 'md' | 'lg';
}

export const CelestialMemoryVisual: React.FC<CelestialMemoryVisualProps> = ({
  title,
  location,
  date,
  theme = 'emerald',
  size = 'lg',
}) => {
  const themeGradients = {
    emerald: 'from-emerald-950/90 via-teal-950/80 to-slate-950',
    amber: 'from-amber-950/90 via-stone-950/80 to-slate-950',
    purple: 'from-purple-950/90 via-slate-950/80 to-black',
    rose: 'from-rose-950/90 via-slate-950/80 to-black',
    sky: 'from-sky-950/90 via-slate-950/80 to-black',
  };

  const themeAccents = {
    emerald: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
    amber: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    purple: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
    rose: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
    sky: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
  };

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-b ${themeGradients[theme]} flex flex-col items-center justify-center p-6 text-center overflow-hidden select-none`}
    >
      {/* Background Starry Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,0,0,0.85))] pointer-events-none" />

      {/* Decorative Constellation Glyphs */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 opacity-40">
        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
        <span className="text-[10px] uppercase font-sans tracking-widest text-slate-300">
          Cl &amp; Maica Universe
        </span>
      </div>

      {/* Centerpiece Icon */}
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border ${themeAccents[theme]} flex items-center justify-center mb-3.5 shadow-xl backdrop-blur-md`}
      >
        {location?.toLowerCase().includes('pangilatan') || location?.toLowerCase().includes('mountain') || location?.toLowerCase().includes('peak') ? (
          <Mountain className="w-7 h-7 sm:w-8 sm:h-8" />
        ) : (
          <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-current opacity-80" />
        )}
      </div>

      {/* Memory Details */}
      <h3 className="text-lg sm:text-2xl font-serif font-medium text-amber-100 drop-shadow-md max-w-md px-2">
        {title}
      </h3>

      {(location || date) && (
        <p className="text-xs text-emerald-300/90 font-sans tracking-wider mt-1.5 flex items-center justify-center gap-2">
          {location && <span>{location}</span>}
          {location && date && <span>&bull;</span>}
          {date && <span>{date}</span>}
        </p>
      )}
    </div>
  );
};
