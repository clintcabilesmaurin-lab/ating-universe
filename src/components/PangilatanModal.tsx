import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Mountain, Music, CloudRain, Heart } from 'lucide-react';
import { MEMORIES } from '../data/universeData';

interface PangilatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  spokenLine: string;
}

export const PangilatanModal: React.FC<PangilatanModalProps> = ({
  isOpen,
  onClose,
  spokenLine,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Photos from memories
  const photos = MEMORIES;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-gradient-to-b from-emerald-950/80 via-slate-900/90 to-black rounded-3xl border border-emerald-500/30 shadow-[0_0_50px_rgba(157,191,154,0.2)] overflow-hidden my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-500/20 bg-emerald-950/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Mountain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium text-emerald-100 tracking-wide">
                  Pangilatan Mountain Signature
                </h2>
                <p className="text-xs text-emerald-300/70 font-sans">
                  Ang lugar kung saan muling pinili ang isa't isa &bull; Cl &amp; Maica
                </p>
              </div>
            </div>

            <button
              id="close-pangilatan"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Spoken Quote Card */}
            <div className="p-5 rounded-2xl bg-emerald-900/30 border border-emerald-400/30 shadow-inner">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-base sm:text-lg font-serif italic text-emerald-50 leading-relaxed">
                    "{spokenLine}"
                  </p>
                  <p className="text-xs text-emerald-300/60 font-sans mt-2 tracking-wider">
                    — Alaala sa Bundok, Clint
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Memory Showcase */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-sans uppercase tracking-widest text-emerald-200/80 flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Mga Tagpo sa Pangilatan
                </h3>
                <span className="text-xs text-emerald-300/50">
                  Photo {selectedPhotoIndex + 1} of {photos.length}
                </span>
              </div>

              {/* Main Photo Card Display */}
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 bg-slate-950 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center group shadow-2xl">
                {/* Visual Representation Graphic / Artwork for each memory */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/50 to-emerald-950/30" />

                {/* Thematic Visual Scene or Real Image */}
                {photos[selectedPhotoIndex]?.imageSrc ? (
                  <div className="relative w-full h-full">
                    <img
                      src={photos[selectedPhotoIndex].imageSrc}
                      alt={photos[selectedPhotoIndex].title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-6">
                      <h4 className="text-xl font-serif text-amber-100 font-medium mb-1">
                        {photos[selectedPhotoIndex].title}
                      </h4>
                      <p className="text-xs text-emerald-300 font-sans tracking-wide mb-2">
                        {photos[selectedPhotoIndex].location} &bull; {photos[selectedPhotoIndex].date}
                      </p>
                      <p className="text-sm text-slate-200/95 font-serif italic leading-relaxed">
                        {photos[selectedPhotoIndex].description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedPhotoIndex === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-300/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(157,191,154,0.4)]">
                          <span className="text-3xl">🌄</span>
                        </div>
                        <h4 className="text-xl font-serif text-amber-100 font-medium mb-1">
                          {photos[0].title}
                        </h4>
                        <p className="text-xs text-emerald-300 font-sans tracking-wide mb-3">
                          {photos[0].location} &bull; {photos[0].date}
                        </p>
                        <p className="text-sm text-slate-200/90 max-w-md font-serif italic leading-relaxed">
                          {photos[0].description}
                        </p>
                      </div>
                    )}

                    {selectedPhotoIndex === 1 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-teal-500/20 border border-teal-300/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(45,212,191,0.4)]">
                          <span className="text-3xl">🌾</span>
                        </div>
                        <h4 className="text-xl font-serif text-teal-100 font-medium mb-1">
                          {photos[1].title}
                        </h4>
                        <p className="text-xs text-teal-300 font-sans tracking-wide mb-3">
                          {photos[1].location} &bull; {photos[1].date}
                        </p>
                        <p className="text-sm text-slate-200/90 max-w-md font-serif italic leading-relaxed">
                          {photos[1].description}
                        </p>
                      </div>
                    )}

                    {selectedPhotoIndex === 2 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-300/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(192,132,252,0.4)]">
                          <span className="text-3xl">🌧️</span>
                        </div>
                        <h4 className="text-xl font-serif text-purple-100 font-medium mb-1">
                          {photos[2].title}
                        </h4>
                        <p className="text-xs text-purple-300 font-sans tracking-wide mb-3">
                          {photos[2].location} &bull; {photos[2].date}
                        </p>
                        <p className="text-sm text-slate-200/90 max-w-md font-serif italic leading-relaxed">
                          {photos[2].description}
                        </p>
                      </div>
                    )}

                    {selectedPhotoIndex === 3 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-rose-500/20 border border-rose-300/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(251,113,133,0.4)]">
                          <span className="text-3xl">🌌</span>
                        </div>
                        <h4 className="text-xl font-serif text-rose-100 font-medium mb-1">
                          {photos[3].title}
                        </h4>
                        <p className="text-xs text-rose-300 font-sans tracking-wide mb-3">
                          {photos[3].location} &bull; {photos[3].date}
                        </p>
                        <p className="text-sm text-slate-200/90 max-w-md font-serif italic leading-relaxed">
                          {photos[3].description}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Quote Badge Bottom */}
                <div className="absolute bottom-3 inset-x-4 bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-center">
                  <p className="text-xs text-amber-200 font-serif italic">
                    {photos[selectedPhotoIndex].quote}
                  </p>
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {photos.map((item, idx) => (
                  <button
                    key={item.id}
                    id={`thumb-pangilatan-${idx}`}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedPhotoIndex === idx
                        ? 'bg-emerald-500/20 border-emerald-400 shadow-md scale-[1.02]'
                        : 'bg-black/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-serif text-emerald-100 font-medium truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans truncate">
                      {item.location}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Jamming Memory Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex items-start gap-3">
                <Music className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-sans uppercase tracking-wider text-amber-200">
                    Ating Tugtugan sa Bundok
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 font-serif leading-relaxed">
                    Kahit sintunado at walang microphone, ang sarap kumanta kasama ka habang dinadama ang simoy ng hangin.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex items-start gap-3">
                <CloudRain className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-sans uppercase tracking-wider text-sky-200">
                    Paglusong sa Ulan
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 font-serif leading-relaxed">
                    Basang-basa tayo noon pero walang reklamo — puro tawanan lang habang nagkukulitan sa daan.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-2">
              <button
                id="btn-return-sky"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs tracking-wider font-sans transition-all"
              >
                Bumalik sa Kalawakan &bull; Return to Sky
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
