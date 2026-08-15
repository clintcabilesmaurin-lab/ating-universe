import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RANDOM_MEMORY_PHOTOS } from '../data/universeData';
import { RandomPhotoMemory } from '../types';
import { Sparkles, Heart, X, MapPin, Calendar, Eye, Compass, Camera, RefreshCw } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { CelestialMemoryVisual } from './CelestialMemoryVisual';
import { DriveDirectLinkNotice } from './DriveDirectLinkNotice';
import {
  loadCustomPhotos,
  getDriveThumbnailUrl,
  RANDOM_MEMORIES_FOLDER_ID,
  fetchDriveFolderFiles,
  getCachedFolderFiles,
  setCachedFolderFiles,
  DriveFolderFile,
} from '../utils/driveHelper';

interface ActiveShard {
  instanceId: string;
  memory: RandomPhotoMemory;
  xPercent: number; // 4% to 22% OR 78% to 94%
  yPercent: number; // 15% to 80%
  rotate: number;
  scale: number;
  duration: number;
  side: 'left' | 'right';
}

interface RandomMemoriesDrifterProps {
  isSkyReady: boolean;
  onSpeak?: (line: string, isAche?: boolean) => void;
  manualSpawnTrigger?: number;
  onOpenPhotoManager?: () => void;
}

export const RandomMemoriesDrifter: React.FC<RandomMemoriesDrifterProps> = ({
  isSkyReady,
  onSpeak,
  manualSpawnTrigger,
  onOpenPhotoManager,
}) => {
  const [activeShards, setActiveShards] = useState<ActiveShard[]>([]);
  const [inspectedMemory, setInspectedMemory] = useState<RandomPhotoMemory | null>(null);
  const [failedImgMap, setFailedImgMap] = useState<Record<string, boolean>>({});
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [driveFolderFiles, setDriveFolderFiles] = useState<DriveFolderFile[]>([]);
  const [isHoveringAny, setIsHoveringAny] = useState(false);
  const lastIndexRef = useRef<number>(-1);
  const spawnTimerRef = useRef<number | null>(null);

  // Sync custom photos and Drive folder files
  useEffect(() => {
    const updatePhotos = () => {
      setCustomPhotos(loadCustomPhotos());
    };
    updatePhotos();

    // Check cached folder files
    const cached = getCachedFolderFiles(RANDOM_MEMORIES_FOLDER_ID);
    if (cached && cached.length > 0) {
      setDriveFolderFiles(cached);
    }

    // Fetch live from server Drive folder proxy
    fetchDriveFolderFiles(RANDOM_MEMORIES_FOLDER_ID).then((files) => {
      if (files && files.length > 0) {
        setDriveFolderFiles(files);
        setCachedFolderFiles(RANDOM_MEMORIES_FOLDER_ID, files);
      }
    });

    window.addEventListener('universe_custom_photos_updated', updatePhotos);
    window.addEventListener('universe_drive_folder_cache_updated', () => {
      setDriveFolderFiles(getCachedFolderFiles(RANDOM_MEMORIES_FOLDER_ID));
    });

    return () => {
      window.removeEventListener('universe_custom_photos_updated', updatePhotos);
    };
  }, []);

  // Build combined pool of memories (Curated + Drive Folder extracted photos)
  const getMemoriesPool = (): RandomPhotoMemory[] => {
    const pool: RandomPhotoMemory[] = [...RANDOM_MEMORY_PHOTOS];

    // If Google Drive folder returned files, inject them into the pool
    if (driveFolderFiles.length > 0) {
      driveFolderFiles.forEach((file, idx) => {
        // Only append if not already in curated set
        const exists = pool.some((p) => p.id === `drive-${file.id}`);
        if (!exists) {
          pool.push({
            id: `drive-${file.id}`,
            src: file.proxyUrl,
            title: file.title || `Alaala #${idx + 1}`,
            location: 'Drive Folder Alaala',
            date: 'Panahon ng Ating Puso',
            caption: 'Bawat kuha ng kamera ay saksi sa pag-ibig nating walang kapantay.',
            glowColor: idx % 2 === 0 ? '#f4d58d' : '#d8b4e2',
          });
        }
      });
    }

    return pool;
  };

  // Spawn a random memory shard into the sky
  const spawnRandomMemory = () => {
    if (!isSkyReady) return;
    const pool = getMemoriesPool();
    if (pool.length === 0) return;

    // Pick next memory avoiding exact immediate duplicate
    let nextIdx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && nextIdx === lastIndexRef.current) {
      nextIdx = (nextIdx + 1) % pool.length;
    }
    lastIndexRef.current = nextIdx;
    const memory = pool[nextIdx];

    // Determine random peripheral coordinates (flanking left or right of the screen)
    const side = Math.random() > 0.5 ? 'right' : 'left';
    const xPercent = side === 'left' ? 4 + Math.random() * 12 : 82 + Math.random() * 12;
    const yPercent = 18 + Math.random() * 60;
    const rotate = (Math.random() - 0.5) * 14;
    const duration = 12 + Math.random() * 6; // 12 - 18s drift duration

    const newShard: ActiveShard = {
      instanceId: `shard-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      memory,
      xPercent,
      yPercent,
      rotate,
      scale: 0.95 + Math.random() * 0.1,
      duration,
      side,
    };

    setActiveShards((prev) => {
      // Keep max 2 floating memories at a time for clean aesthetics
      const trimmed = prev.slice(-1);
      return [...trimmed, newShard];
    });

    // Automatically remove after lifespan
    window.setTimeout(() => {
      setActiveShards((prev) => prev.filter((s) => s.instanceId !== newShard.instanceId));
    }, duration * 1000);
  };

  // Watch manual external spawn trigger
  useEffect(() => {
    if (manualSpawnTrigger && manualSpawnTrigger > 0) {
      spawnRandomMemory();
    }
  }, [manualSpawnTrigger]);

  // Setup periodic spawning interval
  useEffect(() => {
    if (!isSkyReady) return;

    // Initial appearance after entering sky
    const initialTimeout = window.setTimeout(() => {
      spawnRandomMemory();
    }, 4000);

    // Random recurring interval
    const scheduleNext = () => {
      const randomInterval = 8500 + Math.random() * 9500; // 8.5-18 seconds
      spawnTimerRef.current = window.setTimeout(() => {
        if (!isHoveringAny && !inspectedMemory) {
          spawnRandomMemory();
        }
        scheduleNext();
      }, randomInterval);
    };

    scheduleNext();

    return () => {
      window.clearTimeout(initialTimeout);
      if (spawnTimerRef.current) {
        window.clearTimeout(spawnTimerRef.current);
      }
    };
  }, [isSkyReady, isHoveringAny, inspectedMemory, driveFolderFiles]);

  const handleShardClick = (memory: RandomPhotoMemory, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playStarGazeChime();
    setInspectedMemory(memory);
    if (onSpeak && memory.caption) {
      onSpeak(memory.caption);
    }
  };

  const handleDismissShard = (instanceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveShards((prev) => prev.filter((s) => s.instanceId !== instanceId));
  };

  return (
    <>
      {/* Floating Shards in Sky */}
      <div className="fixed inset-0 pointer-events-none z-25 overflow-hidden">
        <AnimatePresence>
          {activeShards.map((shard) => {
            const glow = shard.memory.glowColor || '#f4d58d';
            return (
              <motion.div
                key={shard.instanceId}
                initial={{
                  opacity: 0,
                  scale: 0.7,
                  y: 30,
                  rotate: shard.rotate * 1.5,
                }}
                animate={{
                  opacity: [0, 0.55, 0.55, 0],
                  scale: [0.7, shard.scale, shard.scale, 0.75],
                  y: [30, 0, -25, -60],
                  rotate: [shard.rotate * 1.5, shard.rotate, shard.rotate * 0.8, shard.rotate * 0.5],
                }}
                exit={{ opacity: 0, scale: 0.6, y: -30 }}
                transition={{
                  duration: shard.duration,
                  times: [0, 0.15, 0.85, 1],
                  ease: 'easeInOut',
                }}
                onMouseEnter={() => setIsHoveringAny(true)}
                onMouseLeave={() => setIsHoveringAny(false)}
                style={{
                  top: `${shard.yPercent}%`,
                  left: shard.side === 'left' ? `${shard.xPercent}%` : undefined,
                  right: shard.side === 'right' ? `${100 - shard.xPercent}%` : undefined,
                }}
                className="absolute pointer-events-auto cursor-pointer group"
                onClick={(e) => handleShardClick(shard.memory, e)}
              >
                {/* Outer Ambient Cosmic Glow */}
                <div
                  className="absolute -inset-3 rounded-3xl blur-xl opacity-25 group-hover:opacity-85 group-hover:scale-115 transition-all duration-500 pointer-events-none"
                  style={{ backgroundColor: glow }}
                />

                {/* Floating Polaroid Shard Card */}
                <div
                  className="relative w-32 sm:w-36 p-1.5 bg-slate-950/50 hover:bg-slate-950/95 backdrop-blur-md hover:backdrop-blur-xl border border-white/15 hover:border-amber-300/60 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-400 group-hover:scale-110 group-hover:-translate-y-2 opacity-65 hover:opacity-100"
                  style={{
                    borderColor: `${glow}40`,
                    boxShadow: `0 0 15px ${glow}20, 0 8px 20px rgba(0,0,0,0.6)`,
                  }}
                >
                  {/* Photo Frame */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                    {(() => {
                      const shardSrc = customPhotos[shard.memory.id] || shard.memory.src;
                      const resolved = shardSrc ? getDriveThumbnailUrl(shardSrc, 400) : '';
                      return resolved && !failedImgMap[shard.memory.id] ? (
                        <img
                          src={resolved}
                          alt={shard.memory.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Fallback to alternative google endpoint before failing
                            const target = e.target as HTMLImageElement;
                            if (shardSrc.includes('google') && !target.src.includes('thumbnail?id=')) {
                              target.src = getDriveThumbnailUrl(shardSrc, 400);
                            } else {
                              setFailedImgMap((prev) => ({ ...prev, [shard.memory.id]: true }));
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full">
                          <CelestialMemoryVisual
                            title={shard.memory.title}
                            location={shard.memory.location}
                            date={shard.memory.date}
                            theme="amber"
                            size="sm"
                          />
                        </div>
                      );
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 group-hover:from-black/80 pointer-events-none" />

                    {/* Sparkle badge */}
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 group-hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-200 pointer-events-none">
                      <Sparkles className="w-2.5 h-2.5 animate-spin-slow" />
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={(e) => handleDismissShard(shard.instanceId, e)}
                      title="Isara"
                      className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-900/80 text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Shard Label */}
                  <div className="pt-1.5 px-1 text-center">
                    <p className="text-[10px] font-serif font-medium text-amber-100/90 group-hover:text-amber-100 truncate tracking-wide">
                      {shard.memory.title}
                    </p>
                    <p className="text-[8.5px] text-slate-400/90 group-hover:text-slate-300 font-sans truncate flex items-center justify-center gap-0.5 mt-0.5">
                      <MapPin className="w-2 h-2 text-amber-300/80" />
                      <span>{shard.memory.location || 'Alaala ng Puso'}</span>
                    </p>
                  </div>

                  {/* Quick Peek Hint on Hover */}
                  <div className="mt-1 py-0.5 px-1.5 rounded-full bg-amber-400/10 border border-amber-300/20 text-center flex items-center justify-center gap-1 text-[8.5px] text-amber-200 font-sans opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-2.5 h-2.5" />
                    <span>I-tap para tingnan</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Manual Summon Memory Trigger Button */}
      <div className="fixed bottom-6 left-6 z-30 pointer-events-auto flex items-center gap-2">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            audioEngine.playStarGazeChime();
            spawnRandomMemory();
          }}
          title="Magpalipad ng random na alaala sa kalawakan"
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-amber-300/30 hover:border-amber-300/60 shadow-[0_0_20px_rgba(244,213,141,0.2)] text-amber-200 text-xs font-serif transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline">Alaala sa Bituin</span>
        </motion.button>
      </div>

      {/* Expanded Memory Inspector Modal */}
      <AnimatePresence>
        {inspectedMemory && (
          <div
            data-lenis-prevent
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl"
            onClick={() => setInspectedMemory(null)}
          >
            <motion.div
              data-lenis-prevent
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-black/95 to-slate-950 rounded-3xl border border-amber-300/40 p-6 sm:p-7 shadow-[0_0_50px_rgba(244,213,141,0.3)] overflow-hidden my-auto"
            >
              {/* Radiant Ambient Background Glow */}
              <div
                className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ backgroundColor: inspectedMemory.glowColor || '#f4d58d' }}
              />

              {/* Close Button */}
              <button
                onClick={() => setInspectedMemory(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs uppercase tracking-[0.25em] text-amber-200/80 font-sans font-medium">
                  Lumulutang na Alaala &bull; Photo Shard
                </span>
              </div>

              {/* Google Drive Notice inside Memory Inspector */}
              <DriveDirectLinkNotice folderType="random" onOpenPhotoManager={onOpenPhotoManager} />

              {/* Photo Display Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black/60 aspect-[4/3] mb-5 group">
                {(() => {
                  const inspectedSrc = customPhotos[inspectedMemory.id] || inspectedMemory.src;
                  const resolved = inspectedSrc ? getDriveThumbnailUrl(inspectedSrc, 1200) : '';
                  return resolved && !failedImgMap[inspectedMemory.id] ? (
                    <img
                      src={resolved}
                      alt={inspectedMemory.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setFailedImgMap((prev) => ({ ...prev, [inspectedMemory.id]: true }));
                      }}
                    />
                  ) : (
                    <CelestialMemoryVisual
                      title={inspectedMemory.title}
                      location={inspectedMemory.location}
                      date={inspectedMemory.date}
                      theme="amber"
                    />
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Location & Date Pill */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  {inspectedMemory.location && (
                    <span className="text-xs text-amber-100 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-300" />
                      {inspectedMemory.location}
                    </span>
                  )}
                  {inspectedMemory.date && (
                    <span className="text-xs text-slate-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-200/70" />
                      {inspectedMemory.date}
                    </span>
                  )}
                </div>
              </div>

              {/* Memory Caption & Title */}
              <div className="space-y-3">
                <h3 className="text-2xl font-serif font-medium text-amber-100">
                  {inspectedMemory.title}
                </h3>

                {inspectedMemory.caption && (
                  <p className="text-sm font-serif italic text-slate-200/90 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                    "{inspectedMemory.caption}"
                  </p>
                )}

                {/* Footer Controls */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-sans flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    Mananatiling bituin sa ating uniberso
                  </span>

                  <button
                    onClick={() => {
                      setInspectedMemory(null);
                      spawnRandomMemory();
                    }}
                    className="text-xs px-4 py-2 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/40 hover:border-amber-200 transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Susunod na Alaala</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
