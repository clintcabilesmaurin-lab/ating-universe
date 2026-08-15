import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Check,
  RotateCcw,
  Info,
  Link,
  Trash2,
  Mountain,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { MEMORIES, RANDOM_MEMORY_PHOTOS } from '../data/universeData';
import {
  PANGILATAN_FOLDER_URL,
  RANDOM_MEMORIES_FOLDER_URL,
  PANGILATAN_FOLDER_ID,
  RANDOM_MEMORIES_FOLDER_ID,
  loadCustomPhotos,
  saveCustomPhoto,
  saveAllCustomPhotos,
  clearCustomPhotos,
  getDriveThumbnailUrl,
  fetchDriveFolderFiles,
  DriveFolderFile,
  getCachedFolderFiles,
  setCachedFolderFiles,
} from '../utils/driveHelper';

interface PhotoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'foldersync' | 'pangilatan' | 'random' | 'guide'>('foldersync');
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [inputLinks, setInputLinks] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState<Record<string, boolean>>({});

  // Google Drive folder live sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [pangilatanFiles, setPangilatanFiles] = useState<DriveFolderFile[]>([]);
  const [randomFolderFiles, setRandomFolderFiles] = useState<DriveFolderFile[]>([]);
  const [selectedFolderToInspect, setSelectedFolderToInspect] = useState<'pangilatan' | 'random'>('random');

  useEffect(() => {
    if (isOpen) {
      const stored = loadCustomPhotos();
      setCustomPhotos(stored);
      setInputLinks(stored);

      const cachedP = getCachedFolderFiles(PANGILATAN_FOLDER_ID);
      const cachedR = getCachedFolderFiles(RANDOM_MEMORIES_FOLDER_ID);
      if (cachedP.length > 0) setPangilatanFiles(cachedP);
      if (cachedR.length > 0) setRandomFolderFiles(cachedR);

      // Auto-trigger sync if empty
      if (cachedP.length === 0 && cachedR.length === 0) {
        handleSyncDriveFolders();
      }
    }
  }, [isOpen]);

  const handleSyncDriveFolders = async () => {
    setIsSyncing(true);
    setSyncStatus('Kinukuha ang mga larawan mula sa Google Drive Image API...');

    try {
      const [pFiles, rFiles] = await Promise.all([
        fetchDriveFolderFiles(PANGILATAN_FOLDER_ID),
        fetchDriveFolderFiles(RANDOM_MEMORIES_FOLDER_ID),
      ]);

      setPangilatanFiles(pFiles);
      setRandomFolderFiles(rFiles);
      setCachedFolderFiles(PANGILATAN_FOLDER_ID, pFiles);
      setCachedFolderFiles(RANDOM_MEMORIES_FOLDER_ID, rFiles);

      setSyncStatus(`Matagumpay! Nakuha ang ${pFiles.length + rFiles.length} na larawan mula sa inyong Google Drive.`);
      setTimeout(() => setSyncStatus(''), 4000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus('Paalala: Pakisiguradong "Anyone with the link can view" ang inyong Drive folder.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAutoApplyAllDrivePhotos = () => {
    const current = { ...customPhotos };

    // Map Pangilatan folder photos to Pangilatan memory items
    if (pangilatanFiles.length > 0) {
      MEMORIES.forEach((mem, index) => {
        const driveItem = pangilatanFiles[index % pangilatanFiles.length];
        if (driveItem) {
          current[mem.id] = driveItem.proxyUrl;
        }
      });
    }

    // Map Random folder photos to Random Floating memories
    if (randomFolderFiles.length > 0) {
      RANDOM_MEMORY_PHOTOS.forEach((mem, index) => {
        const driveItem = randomFolderFiles[index % randomFolderFiles.length];
        if (driveItem) {
          current[mem.id] = driveItem.proxyUrl;
        }
      });
    }

    saveAllCustomPhotos(current);
    setCustomPhotos(current);
    setInputLinks(current);
    alert('Matagumpay na nailapat ang lahat ng Google Drive photos sa inyong mga alaala at lumulutang na shards!');
  };

  const handleFileUpload = (memoryId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Pakipili ang isang valid na image file (JPG, PNG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        saveCustomPhoto(memoryId, result);
        setCustomPhotos((prev) => ({ ...prev, [memoryId]: result }));
        setInputLinks((prev) => ({ ...prev, [memoryId]: result }));
        setSavedSuccess((prev) => ({ ...prev, [memoryId]: true }));
        setTimeout(() => {
          setSavedSuccess((prev) => ({ ...prev, [memoryId]: false }));
        }, 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDriveLink = (memoryId: string) => {
    const rawVal = (inputLinks[memoryId] || '').trim();
    if (!rawVal) return;

    const converted = getDriveThumbnailUrl(rawVal);
    saveCustomPhoto(memoryId, converted);
    setCustomPhotos((prev) => ({ ...prev, [memoryId]: converted }));
    setSavedSuccess((prev) => ({ ...prev, [memoryId]: true }));
    setTimeout(() => {
      setSavedSuccess((prev) => ({ ...prev, [memoryId]: false }));
    }, 2500);
  };

  const handleAssignDriveFile = (memoryId: string, proxyUrl: string) => {
    saveCustomPhoto(memoryId, proxyUrl);
    setCustomPhotos((prev) => ({ ...prev, [memoryId]: proxyUrl }));
    setInputLinks((prev) => ({ ...prev, [memoryId]: proxyUrl }));
    setSavedSuccess((prev) => ({ ...prev, [memoryId]: true }));
    setTimeout(() => {
      setSavedSuccess((prev) => ({ ...prev, [memoryId]: false }));
    }, 2500);
  };

  const handleRemovePhoto = (memoryId: string) => {
    const next = { ...customPhotos };
    delete next[memoryId];
    saveAllCustomPhotos(next);
    setCustomPhotos(next);
    setInputLinks((prev) => ({ ...prev, [memoryId]: '' }));
  };

  const handleResetAll = () => {
    if (window.confirm('Sigurado ka bang nais mong i-reset ang lahat ng na-upload na larawan?')) {
      clearCustomPhotos();
      setCustomPhotos({});
      setInputLinks({});
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl rounded-3xl bg-slate-950/95 border border-amber-400/25 p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Subtle cosmic background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-medium text-amber-100 flex items-center gap-2">
                  <span>Google Drive Image Proxy &amp; Photo Manager</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Awtomatikong kumukuha ng mga larawan mula sa Google Drive folder links gamit ang high-speed proxy service.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 my-4 shrink-0 relative z-10">
            <button
              onClick={() => setActiveTab('foldersync')}
              className={`px-4 py-2 rounded-xl text-xs font-serif tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'foldersync'
                  ? 'bg-amber-500/25 text-amber-100 border border-amber-400/50 shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>Drive Folders Sync ({pangilatanFiles.length + randomFolderFiles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pangilatan')}
              className={`px-4 py-2 rounded-xl text-xs font-serif tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'pangilatan'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>Pangilatan Memories ({MEMORIES.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('random')}
              className={`px-4 py-2 rounded-xl text-xs font-serif tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'random'
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40 shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Floating Memories ({RANDOM_MEMORY_PHOTOS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 rounded-xl text-xs font-serif tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'guide'
                  ? 'bg-blue-500/20 text-blue-200 border border-blue-400/40 shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Gabay sa Drive</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 relative z-10">
            {/* DRIVE FOLDER LIVE SYNC TAB */}
            {activeTab === 'foldersync' && (
              <div className="space-y-4">
                {/* Sync Action Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-slate-900/80 border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-amber-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Google Drive Public Folder Proxy Scanner
                    </h4>
                    <p className="text-xs text-slate-300">
                      Kinukuha ng backend proxy ang lahat ng mga larawan sa loob ng inyong dalawang Google Drive folders.
                    </p>
                    {syncStatus && (
                      <p className="text-xs text-amber-300 font-sans mt-1 animate-pulse">
                        {syncStatus}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={handleSyncDriveFolders}
                      disabled={isSyncing}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-medium hover:bg-amber-300 transition-all flex items-center gap-2 text-xs shadow-md disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Nag-si-sync...' : 'I-sync ang Drive Folders'}</span>
                    </button>

                    {(pangilatanFiles.length > 0 || randomFolderFiles.length > 0) && (
                      <button
                        onClick={handleAutoApplyAllDrivePhotos}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs font-sans transition-colors flex items-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Gamitin sa Lahat</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Folder Sub-tabs */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <button
                    onClick={() => setSelectedFolderToInspect('random')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-colors flex items-center gap-1.5 ${
                      selectedFolderToInspect === 'random'
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Random Memories Folder ({randomFolderFiles.length} larawan)</span>
                  </button>
                  <button
                    onClick={() => setSelectedFolderToInspect('pangilatan')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-colors flex items-center gap-1.5 ${
                      selectedFolderToInspect === 'pangilatan'
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Mountain className="w-3 h-3" />
                    <span>Pangilatan Folder ({pangilatanFiles.length} larawan)</span>
                  </button>
                </div>

                {/* Display Grid of Extracted Drive Photos */}
                {(() => {
                  const currentList =
                    selectedFolderToInspect === 'random' ? randomFolderFiles : pangilatanFiles;

                  if (currentList.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                        <FolderOpen className="w-8 h-8 text-slate-500 mx-auto animate-bounce" />
                        <p className="text-sm text-slate-300 font-serif">
                          Walang na-detect na larawan o kasalukuyang naglo-load pa...
                        </p>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Siguraduhing naka-set sa "Anyone with the link can view" ang inyong Google Drive folder, o i-click ang <strong>"I-sync ang Drive Folders"</strong> button sa itaas.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {currentList.map((file, idx) => (
                        <div
                          key={file.id || idx}
                          className="group relative rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-amber-400/50 transition-all flex flex-col"
                        >
                          <div className="aspect-square w-full bg-black/60 relative overflow-hidden">
                            <img
                              src={file.proxyUrl}
                              alt={file.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback to direct google thumbnail
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('thumbnail?id=')) {
                                  target.src = file.thumbnailUrl;
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                              <span className="text-[10px] text-amber-200 truncate w-full font-serif">
                                {file.title}
                              </span>
                            </div>
                          </div>

                          <div className="p-2 flex items-center justify-between bg-slate-950/80 text-[10px]">
                            <span className="text-slate-400 truncate">Photo #{idx + 1}</span>
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Proxy OK
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* PANGILATAN & RANDOM TAB CONFIGURATIONS */}
            {(activeTab === 'pangilatan' || activeTab === 'random') && (
              <div className="space-y-4">
                {(activeTab === 'pangilatan' ? MEMORIES : RANDOM_MEMORY_PHOTOS).map((mem) => {
                  const currentSrc = customPhotos[mem.id] || mem.imageSrc || ('src' in mem ? (mem as any).src : '');
                  const isSaved = savedSuccess[mem.id];

                  return (
                    <div
                      key={mem.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-400/30 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                    >
                      {/* Photo Thumbnail Preview */}
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/15 shrink-0 flex items-center justify-center relative">
                          {currentSrc ? (
                            <img
                              src={getDriveThumbnailUrl(currentSrc, 300)}
                              alt={mem.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-serif font-medium text-amber-100 truncate">
                            {mem.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">
                            {mem.location} &bull; {mem.date}
                          </p>
                          {customPhotos[mem.id] && (
                            <span className="inline-block text-[10px] text-emerald-300 font-sans mt-0.5">
                              ✓ Naka-link / Na-customize
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls: Upload & Link Paste */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                        {/* Paste Google Drive Link Input */}
                        <div className="relative flex-1 sm:w-64">
                          <input
                            type="text"
                            placeholder="I-paste ang Drive file link / ID..."
                            value={inputLinks[mem.id] || ''}
                            onChange={(e) =>
                              setInputLinks((prev) => ({
                                ...prev,
                                [mem.id]: e.target.value,
                              }))
                            }
                            className="w-full text-xs bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <button
                          onClick={() => handleSaveDriveLink(mem.id)}
                          title="I-save ang Drive Link"
                          className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/40 text-amber-200 text-xs font-sans transition-colors flex items-center gap-1 shrink-0"
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link className="w-3.5 h-3.5" />}
                          <span>{isSaved ? 'Na-save!' : 'I-apply'}</span>
                        </button>

                        {/* Direct File Upload */}
                        <label
                          title="Mag-upload ng File"
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 text-xs font-sans transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(mem.id, file);
                            }}
                          />
                        </label>

                        {/* Remove custom photo */}
                        {customPhotos[mem.id] && (
                          <button
                            onClick={() => handleRemovePhoto(mem.id)}
                            title="Ibalik sa default"
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* GUIDE TAB */}
            {activeTab === 'guide' && (
              <div className="space-y-4 text-xs leading-relaxed text-slate-300 font-sans p-2">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-100 space-y-2">
                  <h4 className="font-semibold text-amber-200 text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Paano gumagana ang Google Drive Image Proxy?
                  </h4>
                  <p>
                    Gumagamit ang ating server ng espesyal na backend image proxy na awtomatikong kumukuha ng mga larawan mula sa Google Drive nang walang CORS block o loading errors.
                  </p>
                  <p>
                    Kahit na <strong>Folder Link</strong> ang ibinigay, awtomatikong ini-scan ng proxy ang lahat ng files sa loob ng folder upang ma-display ang mga litrato sa buong kalawakan!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                  <h5 className="font-medium text-amber-100">Paano siguraduhing mababasa ang folder:</h5>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-1">
                    <li>
                      Buksan ang inyong Google Drive folder.
                    </li>
                    <li>
                      I-click ang pangalan ng folder sa itaas &gt; <strong>Share &gt; Share</strong>.
                    </li>
                    <li>
                      Sa General access, piliin ang <strong>"Anyone with the link"</strong> (Viewer).
                    </li>
                    <li>
                      Bumalik dito at i-click ang <strong>"I-sync ang Drive Folders"</strong>.
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between pt-4 mt-4 border-t border-white/10 relative z-10 shrink-0 text-xs text-slate-400 gap-3">
            <div className="flex items-center gap-3">
              <a
                href={PANGILATAN_FOLDER_URL}
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-200 underline flex items-center gap-1"
              >
                <span>Pangilatan Folder</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>&bull;</span>
              <a
                href={RANDOM_MEMORIES_FOLDER_URL}
                target="_blank"
                rel="noreferrer"
                className="hover:text-purple-200 underline flex items-center gap-1"
              >
                <span>Random Folder</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              {Object.keys(customPhotos).length > 0 && (
                <button
                  onClick={handleResetAll}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>I-reset Lahat</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-5 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-medium transition-colors shadow-lg"
              >
                Tapos Na
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
