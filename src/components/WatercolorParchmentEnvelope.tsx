import React, { memo } from 'react';
import { Heart, Sparkles, Crown } from 'lucide-react';

export interface WatercolorEnvelopeProps {
  title: string;
  date?: string;
  isSpecialMilestone?: boolean;
  themeType?: 'amber' | 'emerald' | 'sky' | 'purple' | 'rose' | 'milestone';
  sealIcon?: 'heart' | 'crown' | 'rose' | 'monogram' | 'star' | 'infinity';
  recipient?: string;
  sender?: string;
  size?: 'normal' | 'large';
  className?: string;
}

export const WatercolorParchmentEnvelope: React.FC<WatercolorEnvelopeProps> = memo(({
  title,
  date,
  isSpecialMilestone = false,
  themeType = 'amber',
  sealIcon = 'heart',
  recipient = 'Maica "Lovey"',
  sender = 'Clint',
  size = 'normal',
  className = '',
}) => {
  // Theme color palettes for watercolor parchment and wax seals
  const colorProfiles = {
    milestone: {
      paperBase: 'from-[#FBF2E3] via-[#F3DEBD] to-[#E2C396]',
      paperTint: 'rgba(244, 63, 94, 0.08)',
      edgeShadow: '#6B3A1E',
      waxOuter: 'from-amber-600 via-rose-600 to-red-800',
      waxInner: 'from-amber-400 via-rose-500 to-red-700',
      waxEmboss: '#FFF2C5',
      glow: 'group-hover:shadow-[0_15px_45px_rgba(251,191,36,0.5)]',
      titleColor: 'text-amber-100',
      tagBg: 'bg-amber-950/70 border-amber-300/60 text-amber-200',
    },
    amber: {
      paperBase: 'from-[#FAF4E8] via-[#EFE0C3] to-[#DFC49D]',
      paperTint: 'rgba(245, 158, 11, 0.06)',
      edgeShadow: '#78461F',
      waxOuter: 'from-amber-700 via-amber-600 to-yellow-800',
      waxInner: 'from-amber-400 via-amber-500 to-yellow-600',
      waxEmboss: '#FEF3C7',
      glow: 'group-hover:shadow-[0_15px_40px_rgba(245,158,11,0.4)]',
      titleColor: 'text-amber-100',
      tagBg: 'bg-stone-950/70 border-amber-400/40 text-amber-200',
    },
    emerald: {
      paperBase: 'from-[#F7F6EE] via-[#E9E4CE] to-[#D5CFAF]',
      paperTint: 'rgba(16, 185, 129, 0.06)',
      edgeShadow: '#4A5328',
      waxOuter: 'from-emerald-800 via-teal-700 to-emerald-900',
      waxInner: 'from-emerald-500 via-teal-600 to-emerald-700',
      waxEmboss: '#D1FAE5',
      glow: 'group-hover:shadow-[0_15px_40px_rgba(16,185,129,0.4)]',
      titleColor: 'text-emerald-100',
      tagBg: 'bg-stone-950/70 border-emerald-400/40 text-emerald-200',
    },
    sky: {
      paperBase: 'from-[#F6F6FB] via-[#E6E7F2] to-[#D0D4E6]',
      paperTint: 'rgba(56, 189, 248, 0.06)',
      edgeShadow: '#364761',
      waxOuter: 'from-sky-800 via-blue-700 to-indigo-900',
      waxInner: 'from-sky-400 via-blue-500 to-sky-600',
      waxEmboss: '#E0F2FE',
      glow: 'group-hover:shadow-[0_15px_40px_rgba(56,189,248,0.4)]',
      titleColor: 'text-sky-100',
      tagBg: 'bg-stone-950/70 border-sky-400/40 text-sky-200',
    },
    purple: {
      paperBase: 'from-[#FAF5FB] via-[#EFE3F2] to-[#DFCCE6]',
      paperTint: 'rgba(168, 85, 247, 0.06)',
      edgeShadow: '#562E69',
      waxOuter: 'from-purple-900 via-violet-800 to-fuchsia-950',
      waxInner: 'from-purple-500 via-violet-600 to-purple-700',
      waxEmboss: '#F3E8FF',
      glow: 'group-hover:shadow-[0_15px_40px_rgba(168,85,247,0.4)]',
      titleColor: 'text-purple-100',
      tagBg: 'bg-stone-950/70 border-purple-400/40 text-purple-200',
    },
    rose: {
      paperBase: 'from-[#FDF4F6] via-[#F6E0E6] to-[#E9C4CF]',
      paperTint: 'rgba(244, 63, 94, 0.08)',
      edgeShadow: '#752A3B',
      waxOuter: 'from-rose-800 via-pink-700 to-rose-950',
      waxInner: 'from-rose-400 via-pink-500 to-rose-600',
      waxEmboss: '#FFE4E6',
      glow: 'group-hover:shadow-[0_15px_40px_rgba(244,63,94,0.4)]',
      titleColor: 'text-pink-100',
      tagBg: 'bg-stone-950/70 border-pink-400/40 text-rose-200',
    },
  };

  const palette = colorProfiles[themeType] || colorProfiles.amber;
  const isLg = size === 'large' || isSpecialMilestone;

  // Envelope SVG Dimensions
  const vbWidth = 340;
  const vbHeight = 220;
  const cx = vbWidth / 2; // 170
  const cy = vbHeight / 2; // 110

  return (
    <div
      className={`relative group flex flex-col items-center select-none transition-transform duration-300 ${className}`}
    >
      {/* Main Vintage Envelope Canvas Container */}
      <div
        className={`relative w-full rounded-2xl overflow-visible transition-all duration-300 group-hover:-translate-y-1.5 ${
          palette.glow
        }`}
        style={{
          filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.65))',
        }}
      >
        {/* SVG Folded Watercolor Envelope Architecture */}
        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="w-full h-auto block overflow-visible"
          style={{ transform: 'translateZ(0)' }}
        >
          <defs>
            {/* Soft watercolor paper texture gradient */}
            <linearGradient id={`paperGrad-${themeType}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF2E4" />
              <stop offset="35%" stopColor="#EFE0C2" />
              <stop offset="70%" stopColor="#E2C99F" />
              <stop offset="100%" stopColor="#D4B686" />
            </linearGradient>

            {/* Left Flap Shading Gradient */}
            <linearGradient id={`leftFlap-${themeType}`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#E7D3AE" />
              <stop offset="85%" stopColor="#DCC298" />
              <stop offset="100%" stopColor="#CDB083" />
            </linearGradient>

            {/* Right Flap Shading Gradient */}
            <linearGradient id={`rightFlap-${themeType}`} x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#E7D3AE" />
              <stop offset="85%" stopColor="#DCC298" />
              <stop offset="100%" stopColor="#CDB083" />
            </linearGradient>

            {/* Bottom Flap Gradient */}
            <linearGradient id={`bottomFlap-${themeType}`} x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#E2C79D" />
              <stop offset="60%" stopColor="#EDD8B6" />
              <stop offset="100%" stopColor="#F5E4C7" />
            </linearGradient>

            {/* Top Flap Gradient (Overlaps with shadow underneath) */}
            <linearGradient id={`topFlap-${themeType}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFF7EB" />
              <stop offset="40%" stopColor="#F7E6C8" />
              <stop offset="80%" stopColor="#EBD4AF" />
              <stop offset="100%" stopColor="#DFC396" />
            </linearGradient>

            {/* Watercolor Edge Bloom Radial Overlay */}
            <radialGradient id={`watercolorStain-${themeType}`} cx="75%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#9C6B37" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#7E4C1E" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#4A2608" stopOpacity="0.28" />
            </radialGradient>

            {/* Flap Drop Shadow Filter for Inked Creases */}
            <filter id={`creaseShadow-${themeType}`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#3F2108" floodOpacity="0.35" />
            </filter>

            {/* Top Flap Pronounced Shadow */}
            <filter id={`topShadow-${themeType}`} x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#2F1604" floodOpacity="0.45" />
            </filter>

            {/* Wax Seal Metallic Gradient */}
            <radialGradient id={`waxGloss-${themeType}`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFF8DB" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#FBBF24" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
            </radialGradient>
          </defs>

          {/* 1. Envelope Back Base with Rounded Corners */}
          <rect
            x="4"
            y="4"
            width={vbWidth - 8}
            height={vbHeight - 8}
            rx="12"
            ry="12"
            fill={`url(#paperGrad-${themeType})`}
            stroke="#8E5E2D"
            strokeWidth="1.2"
            strokeOpacity="0.65"
          />

          {/* Organic Watercolor Edge Vignette */}
          <rect
            x="4"
            y="4"
            width={vbWidth - 8}
            height={vbHeight - 8}
            rx="12"
            ry="12"
            fill={`url(#watercolorStain-${themeType})`}
          />

          {/* Subtle Watercolor Mottling/Tea Stains Flecks */}
          <g opacity="0.4">
            <ellipse cx="60" cy="50" rx="35" ry="22" fill="#B48247" opacity="0.12" />
            <ellipse cx="280" cy="170" rx="40" ry="25" fill="#8C551F" opacity="0.15" />
            <ellipse cx="290" cy="60" rx="25" ry="18" fill="#C1935A" opacity="0.1" />
            <ellipse cx="50" cy="180" rx="30" ry="20" fill="#9F6A31" opacity="0.12" />
          </g>

          {/* 2. Left Folding Flap */}
          <path
            d={`M 4,4 L ${cx - 5},${cy} L 4,${vbHeight - 4} Z`}
            fill={`url(#leftFlap-${themeType})`}
            stroke="#7C4B1E"
            strokeWidth="0.8"
            strokeOpacity="0.45"
          />

          {/* 3. Right Folding Flap */}
          <path
            d={`M ${vbWidth - 4},4 L ${cx + 5},${cy} L ${vbWidth - 4},${vbHeight - 4} Z`}
            fill={`url(#rightFlap-${themeType})`}
            stroke="#7C4B1E"
            strokeWidth="0.8"
            strokeOpacity="0.45"
          />

          {/* 4. Bottom Folding Flap */}
          <path
            d={`M 4,${vbHeight - 4} L ${cx},${cy - 8} L ${vbWidth - 4},${vbHeight - 4} Z`}
            fill={`url(#bottomFlap-${themeType})`}
            filter={`url(#creaseShadow-${themeType})`}
            stroke="#6B3A12"
            strokeWidth="1"
            strokeOpacity="0.5"
          />

          {/* 5. Top Folding Flap (With curved triangular tip overlapping at center) */}
          <path
            d={`M 4,4 L ${cx - 18},${cy + 8} Q ${cx},${cy + 22} ${cx + 18},${cy + 8} L ${vbWidth - 4},4 Z`}
            fill={`url(#topFlap-${themeType})`}
            filter={`url(#topShadow-${themeType})`}
            stroke="#592C07"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />

          {/* Handcrafted Watercolor Inked Crease Details */}
          <path
            d={`M 4,4 L ${cx - 18},${cy + 8} Q ${cx},${cy + 22} ${cx + 18},${cy + 8} L ${vbWidth - 4},4`}
            fill="none"
            stroke="#451E03"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* 6. Romantic Love Details on Paper (Subtle calligraphy stamp watermark) */}
          <g opacity="0.35" transform={`translate(${cx - 65}, ${cy + 42}) scale(0.65)`}>
            <text
              x="0"
              y="0"
              fontFamily="Caveat, cursive"
              fontSize="20"
              fill="#5A2E0C"
              fontWeight="bold"
            >
              ♥ Amor Vincit Omnia ♥
            </text>
          </g>

          {/* 7. Center Melted Wax Seal (Authentic watercolor wax with melted pooled edges) */}
          <g
            transform={`translate(${cx}, ${cy + 10})`}
            className="transition-transform duration-300 group-hover:scale-105"
            style={{ transformOrigin: `${cx}px ${cy + 10}px` }}
          >
            {/* Melted Wax Shadow */}
            <circle cx="0" cy="3" r="29" fill="#1C0B02" opacity="0.6" />

            {/* Irregular Melted Wax Perimeter (Organic pooled wax lip) */}
            <path
              d="M -26,-12 C -29,-5 -31,6 -26,16 C -21,26 -7,30 5,29 C 17,28 29,22 28,10 C 27,-2 30,-14 20,-22 C 10,-30 -2,-28 -14,-25 C -20,-22 -23,-17 -26,-12 Z"
              className={`fill-current ${
                isSpecialMilestone
                  ? 'text-amber-600'
                  : themeType === 'emerald'
                  ? 'text-emerald-700'
                  : themeType === 'sky'
                  ? 'text-sky-700'
                  : themeType === 'purple'
                  ? 'text-purple-800'
                  : themeType === 'rose'
                  ? 'text-rose-700'
                  : 'text-amber-700'
              }`}
            />

            {/* Inner Raised Wax Circle Ring */}
            <circle
              cx="0"
              cy="0"
              r="22"
              className={`fill-current ${
                isSpecialMilestone
                  ? 'text-amber-500'
                  : themeType === 'emerald'
                  ? 'text-emerald-600'
                  : themeType === 'sky'
                  ? 'text-sky-500'
                  : themeType === 'purple'
                  ? 'text-purple-600'
                  : themeType === 'rose'
                  ? 'text-rose-500'
                  : 'text-amber-500'
              }`}
              stroke="#FFF2C5"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />

            {/* Inset Stamped Wax Well */}
            <circle
              cx="0"
              cy="0"
              r="17"
              className={`fill-current ${
                isSpecialMilestone
                  ? 'text-amber-600'
                  : themeType === 'emerald'
                  ? 'text-emerald-700'
                  : themeType === 'sky'
                  ? 'text-sky-600'
                  : themeType === 'purple'
                  ? 'text-purple-700'
                  : themeType === 'rose'
                  ? 'text-rose-600'
                  : 'text-amber-600'
              }`}
            />

            {/* Inner Embossed Ring */}
            <circle
              cx="0"
              cy="0"
              r="15"
              fill="none"
              stroke="#FFF8E0"
              strokeWidth="0.75"
              strokeOpacity="0.5"
              strokeDasharray="2,1"
            />

            {/* 3D Wax Specular Sheen Overlay */}
            <circle cx="0" cy="0" r="22" fill={`url(#waxGloss-${themeType})`} />

            {/* Embossed Wax Motif in Center (Heart / Crown / Monogram) */}
            {sealIcon === 'crown' || isSpecialMilestone ? (
              <g transform="translate(-10, -11) scale(0.85)">
                <path
                  d="M2 4l3 12h14l3-12-6 7-4-11-4 11-6-7z"
                  fill="#FFF7D6"
                  opacity="0.95"
                />
                <circle cx="12" cy="18" r="1.5" fill="#FFE58F" />
              </g>
            ) : sealIcon === 'rose' || themeType === 'emerald' ? (
              <g transform="translate(-10, -10) scale(0.85)">
                {/* Interlocking Double Heart */}
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#FFF7D6"
                  opacity="0.9"
                />
              </g>
            ) : (
              <g transform="translate(-9, -9) scale(0.75)">
                {/* Romantic Embossed Heart Motif */}
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#FFF8E1"
                  opacity="0.95"
                />
              </g>
            )}
          </g>
        </svg>

        {/* Vintage Wax Stamp Glimmer Sparks on Hover */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-8 h-8 text-amber-200 animate-spin-slow" />
        </div>
      </div>

      {/* Romantic Title Plaque (Minimalist, Visual Focus) */}
      <div className="mt-3 w-full flex flex-col items-center text-center space-y-1 px-2 z-10">
        {/* Subtle Calligraphy Tag / Milestone Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-['Caveat'] tracking-wider backdrop-blur-md border shadow-sm ${
            palette.tagBg
          }`}
        >
          <Heart className="w-3 h-3 fill-rose-400 text-rose-400 animate-pulse" />
          <span>{isSpecialMilestone ? 'Ika-11 Buwan • Espesyal' : date || 'Liham ng Pag-ibig'}</span>
        </div>

        {/* Crisp Letter Title */}
        <h4
          className={`font-serif text-sm sm:text-base font-semibold leading-snug tracking-wide drop-shadow-md transition-colors ${
            palette.titleColor
          } group-hover:text-amber-200`}
        >
          {title}
        </h4>
      </div>
    </div>
  );
});

WatercolorParchmentEnvelope.displayName = 'WatercolorParchmentEnvelope';
