import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music2, Disc3, ChevronDown, ChevronUp } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { AudioTrack } from '../types';
import { lumiSync } from '../utils/lumiSyncBus';

export const AudioPlayerWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [track, setTrack] = useState<AudioTrack>(audioEngine.getCurrentTrack());
  const [volume, setVolume] = useState(0.38);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const unsub = audioEngine.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setTrack(state.track);
      setVolume(state.volume);

      // Auto-sync Lumi with real-time audio playback & track changes
      lumiSync.notifyAudio(state.isPlaying, state.track.title, state.track.artist);
    });
    return unsub;
  }, []);

  const togglePlay = () => {
    audioEngine.unlock();
    audioEngine.togglePlay();
  };

  const nextTrack = () => {
    audioEngine.nextTrack();
  };

  const prevTrack = () => {
    audioEngine.prevTrack();
  };

  const toggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(volume || 0.38);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      <AnimatePresence>
        {isExpanded ? (
          /* Expanded Player Panel */
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.3 }}
            className="glass-panel relative w-72 sm:w-80 rounded-3xl p-5 shadow-2xl text-amber-50 border border-amber-300/35 overflow-hidden"
          >
            {/* Top specular highlight rim */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent pointer-events-none" />

            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-sans tracking-widest uppercase text-amber-200/80 font-semibold">
                  Ating Playlist
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 rounded-full glass-pill flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Disc & Track Info */}
            <div className="flex items-center gap-4 my-2">
              <div className="relative">
                <Disc3
                  className={`w-12 h-12 text-amber-300/90 transition-transform ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '6s' }}
                />
                <span className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-slate-900 border border-amber-300" />
              </div>

              <div className="overflow-hidden flex-1">
                <p className="text-sm font-serif font-medium text-white truncate">
                  {track.title}
                </p>
                <p className="text-xs text-amber-300/70 font-sans truncate">
                  {track.artist}
                </p>
                <p className="text-[10px] text-slate-400 font-sans italic truncate mt-0.5">
                  {track.ambientVibe}
                </p>
              </div>
            </div>

            {/* Tracklist selection */}
            <div className="my-3 space-y-1 max-h-36 overflow-y-auto pr-1">
              {[
                { title: "Say You Won't Let Go", artist: "James Arthur" },
                { title: "Supermarket Flowers", artist: "Ed Sheeran" },
                { title: "Those Eyes", artist: "New West" },
              ].map((t, idx) => (
                <button
                  key={t.title}
                  onClick={() => audioEngine.selectTrack(idx)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                    track.title === t.title
                      ? 'glass-card text-amber-200 border-amber-300/40 font-medium'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <span className="truncate">{idx + 1}. {t.title}</span>
                  {track.title === t.title && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-2 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 my-4">
              <button
                id="btn-prev-track"
                onClick={prevTrack}
                className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-amber-200 hover:text-white transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                id="btn-toggle-play"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full glass-pill text-amber-200 hover:text-amber-100 flex items-center justify-center shadow-[0_0_20px_rgba(244,213,141,0.3)] border border-amber-300/50 transition-transform hover:scale-108 active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-amber-300" /> : <Play className="w-5 h-5 fill-amber-300 ml-0.5" />}
              </button>

              <button
                id="btn-next-track"
                onClick={nextTrack}
                className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-amber-200 hover:text-white transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <button onClick={toggleMute} className="text-slate-400 hover:text-amber-200 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  setIsMuted(val === 0);
                  audioEngine.setVolume(val);
                }}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </motion.div>
        ) : (
          /* Minimized Floating Pill */
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="glass-pill flex items-center gap-3 rounded-full pl-3 pr-4 py-2 shadow-2xl cursor-pointer border border-amber-300/35 hover:border-amber-300/70 hover:scale-105 transition-all group"
            onClick={() => setIsExpanded(true)}
          >
            <div className="relative">
              <Disc3
                className={`w-7 h-7 text-amber-300 transition-transform ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '6s' }}
              />
            </div>

            <div className="max-w-[140px] sm:max-w-[180px]">
              <p className="text-xs font-serif font-medium text-white truncate">
                {track.title}
              </p>
              <p className="text-[10px] text-amber-300/70 font-sans truncate">
                {track.artist}
              </p>
            </div>

            <button
              id="mini-play-toggle"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-7 h-7 rounded-full glass-orb text-amber-200 flex items-center justify-center ml-1 transition-colors hover:scale-110"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-amber-200" /> : <Play className="w-3.5 h-3.5 fill-amber-200 ml-0.5" />}
            </button>

            <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-amber-200" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
