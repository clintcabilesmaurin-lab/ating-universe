import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Mountain,
  Music,
  CloudRain,
  Heart,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { MEMORIES } from '../data/universeData';
import { CelestialMemoryVisual } from './CelestialMemoryVisual';
import {
  PANGILATAN_FOLDER_ID,
  PANGILATAN_FOLDER_URL,
  fetchDriveFolderFiles,
  getCachedFolderFiles,
  setCachedFolderFiles,
  DriveFolderFile,
  getDriveThumbnailUrl,
} from '../utils/driveHelper';

interface PangilatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  spokenLine: string;
  onOpenPhotoManager?: () => void;
}

interface DisplayMemoryItem {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  quote?: string;
  imageSrc: string;
}

export const PangilatanModal: React.FC<PangilatanModalProps> = ({
  isOpen,
  onClose,
  spokenLine,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [imgLoadFailed, setImgLoadFailed] = useState<Record<string, boolean>>({});
  const [driveFiles, setDriveFiles] = useState<DriveFolderFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-fetch photos from Pangilatan Google Drive Folder automatically
  useEffect(() => {
    if (!isOpen) return;

    // Load cached folder items first for instant display
    const cached = getCachedFolderFiles(PANGILATAN_FOLDER_ID);
    if (cached && cached.length > 0) {
      setDriveFiles(cached);
    }

    // Automatically fetch latest photos from Google Drive Public Folder
    setIsLoadingDrive(true);
    setSyncMessage('Awtomatikong kinukuha ang mga larawan mula sa Google Drive...');

    fetchDriveFolderFiles(PANGILATAN_FOLDER_ID)
      .then((files) => {
        if (files && files.length > 0) {
          setDriveFiles(files);
          setCachedFolderFiles(PANGILATAN_FOLDER_ID, files);
          setSyncMessage(`✓ Matagumpay na na-load ang ${files.length} larawan mula sa Pangilatan Drive`);
        } else {
          setSyncMessage('Naka-konekta sa Pangilatan Signature Album');
        }
      })
      .catch((err) => {
        console.warn('Pangilatan drive auto-fetch note:', err);
        setSyncMessage('Naka-konekta sa Pangilatan Signature Album');
      })
      .finally(() => {
        setIsLoadingDrive(false);
      });
  }, [isOpen]);

  // Combine curated Pangilatan memories with all auto-fetched Drive folder images
  const displayPhotos: DisplayMemoryItem[] = React.useMemo(() => {
    // If Drive folder returned images, map them into memories
    if (driveFiles.length > 0) {
      return driveFiles.map((file, idx) => {
        // Overlay standard narrative details if matching index
        const baseStory = MEMORIES[idx % MEMORIES.length];
        return {
          id: `drive-pangilatan-${file.id}`,
          title: file.title && !file.title.startsWith('Pangilatan Larawan')
            ? file.title
            : baseStory?.title || `Alaala sa Pangilatan #${idx + 1}`,
          location: baseStory?.location || 'Pangilatan Mountain Peak',
          date: baseStory?.date || 'Panahon ng Pagsasama',
          description:
            baseStory?.description ||
            'Bawat hakbang paakyat sa Pangilatan ay patunay ng ating wagas na pagtitiwala at pagmamahal sa isa’t isa.',
          quote: baseStory?.quote || '“Hawak-kamay nating inabot ang tuktok ng Pangilatan.”',
          imageSrc: file.proxyUrl,
        };
      });
    }

    // Default fallback to base memories
    return MEMORIES.map((m) => ({
      id: m.id,
      title: m.title,
      location: m.location,
      date: m.date,
      description: m.description,
      quote: m.quote,
      imageSrc: m.imageSrc,
    }));
  }, [driveFiles]);

  if (!isOpen) return null;

  const currentPhoto = displayPhotos[selectedPhotoIndex] || displayPhotos[0];
  const isCurrentFailed = currentPhoto ? imgLoadFailed[currentPhoto.id] : false;
  const resolvedSrc = currentPhoto?.imageSrc
    ? getDriveThumbnailUrl(currentPhoto.imageSrc, 1600)
    : '';

  return (
    <AnimatePresence>
      <div
        data-lenis-prevent
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl"
      >
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-gradient-to-b from-emerald-950/90 via-slate-900/95 to-black rounded-3xl border border-emerald-500/30 shadow-[0_0_50px_rgba(157,191,154,0.25)] overflow-hidden my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-emerald-500/20 bg-emerald-950/70 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
                <Mountain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-medium text-emerald-100 tracking-wide flex items-center gap-2">
                  <span>Pangilatan Mountain Signature</span>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                </h2>
                <p className="text-xs text-emerald-300/80 font-sans">
                  Awtomatikong naka-konekta sa Pangilatan Google Drive Folder &bull; Cl &amp; Maica
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="close-pangilatan"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Content Body - Scrollable */}
          <div
            data-lenis-prevent
            className="p-5 sm:p-7 space-y-5 overflow-y-auto flex-1 overscroll-contain"
          >
            {/* Spoken Quote Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-900/30 border border-emerald-400/30 shadow-inner">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-base sm:text-lg font-serif italic text-emerald-50 leading-relaxed">
                    "{spokenLine}"
                  </p>
                  <p className="text-xs text-emerald-300/70 font-sans mt-1.5 tracking-wider">
                    — Alaala sa Tuktok ng Pangilatan, Clint
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-Fetch Status Banner */}
            <div className="px-4 py-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                {isLoadingDrive ? (
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="font-sans">{syncMessage || 'Awtomatikong naka-sync sa Google Drive folder'}</span>
              </div>

              <a
                href={PANGILATAN_FOLDER_URL}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-300 hover:text-emerald-100 underline flex items-center gap-1 text-[11px] font-sans"
              >
                <span>Tingnan ang Drive Folder</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Main Photo Showcase */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-sans uppercase tracking-widest text-emerald-200/80 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> Mga Tagpo sa Pangilatan
                </h3>
                <span className="text-xs text-emerald-300/70 font-sans">
                  Litrato {selectedPhotoIndex + 1} / {displayPhotos.length}
                </span>
              </div>

              {/* Main Photo Card Display */}
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center group shadow-2xl">
                {resolvedSrc && !isCurrentFailed ? (
                  <div className="relative w-full h-full">
                    <img
                      src={resolvedSrc}
                      alt={currentPhoto.title}
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setImgLoadFailed((prev) => ({ ...prev, [currentPhoto.id]: true }));
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent flex flex-col justify-end p-5 sm:p-6 z-10 pointer-events-none">
                      <h4 className="text-xl sm:text-2xl font-serif text-amber-100 font-medium mb-1 drop-shadow-md">
                        {currentPhoto.title}
                      </h4>
                      <p className="text-xs text-emerald-300 font-sans tracking-wide mb-2 flex items-center gap-1.5">
                        <span>{currentPhoto.location}</span>
                        <span>&bull;</span>
                        <span>{currentPhoto.date}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-slate-200/95 font-serif italic leading-relaxed max-w-xl">
                        {currentPhoto.description}
                      </p>
                      {currentPhoto.quote && (
                        <p className="text-xs text-amber-200/90 font-serif italic mt-2.5 pt-2 border-t border-white/10">
                          {currentPhoto.quote}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center text-center z-10">
                    <CelestialMemoryVisual
                      title={currentPhoto?.title || 'Pangilatan Memory'}
                      location={currentPhoto?.location}
                      date={currentPhoto?.date}
                      theme="emerald"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end p-5 sm:p-6 z-10 pointer-events-none">
                      <h4 className="text-xl font-serif text-amber-100 font-medium mb-1">
                        {currentPhoto?.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-200/95 font-serif italic leading-relaxed max-w-xl mx-auto">
                        {currentPhoto?.description}
                      </p>
                      {currentPhoto?.quote && (
                        <p className="text-xs text-amber-200/90 font-serif italic mt-2.5 pt-2 border-t border-white/10">
                          {currentPhoto.quote}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Left / Right Carousel Navigation Arrows */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : displayPhotos.length - 1));
                  }}
                  title="Nakaraang Litrato"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 border border-white/20 text-white flex items-center justify-center transition-all z-20 backdrop-blur-md hover:scale-110 shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex((prev) => (prev < displayPhotos.length - 1 ? prev + 1 : 0));
                  }}
                  title="Susunod na Litrato"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 border border-white/20 text-white flex items-center justify-center transition-all z-20 backdrop-blur-md hover:scale-110 shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnails Strip */}
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
                {displayPhotos.map((item, idx) => {
                  const thumb = item.imageSrc ? getDriveThumbnailUrl(item.imageSrc, 200) : '';
                  return (
                    <button
                      key={item.id || idx}
                      id={`thumb-pangilatan-${idx}`}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border transition-all ${
                        selectedPhotoIndex === idx
                          ? 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg scale-105'
                          : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-950 flex items-center justify-center text-[10px] text-emerald-300">
                          #{idx + 1}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                        <span className="text-[9px] text-emerald-100 truncate font-sans">
                          #{idx + 1}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jamming Memory Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
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

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
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
                className="px-6 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs tracking-wider font-sans transition-all shadow-md"
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
