import { AUDIO_TRACKS } from '../data/universeData';
import { AudioTrack } from '../types';

class UniverseAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private isPlaying: boolean = false;
  private currentTrackIndex: number = 0;
  private masterGain: GainNode | null = null;
  private atmosphereFilter: BiquadFilterNode | null = null;
  private reverbDelayNode: DelayNode | null = null;
  private reverbFeedbackNode: GainNode | null = null;
  private reverbWetGain: GainNode | null = null;
  private currentZoneShift: number = 0.2;
  private targetVolume: number = 0.38;
  private timerId: number | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private listeners: Array<(state: { isPlaying: boolean; track: AudioTrack; volume: number }) => void> = [];

  constructor() {
    this.currentTrackIndex = Math.floor(Math.random() * AUDIO_TRACKS.length);
  }

  public init(): void {
    const unlockHandler = () => {
      this.unlock();
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
    };

    window.addEventListener('pointerdown', unlockHandler, { once: true });
    window.addEventListener('keydown', unlockHandler, { once: true });
    window.addEventListener('touchstart', unlockHandler, { once: true });
  }

  public subscribe(fn: (state: { isPlaying: boolean; track: AudioTrack; volume: number }) => void): () => void {
    this.listeners.push(fn);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify(): void {
    const track = AUDIO_TRACKS[this.currentTrackIndex];
    this.listeners.forEach((fn) =>
      fn({
        isPlaying: this.isPlaying,
        track,
        volume: this.targetVolume,
      })
    );
  }

  private ensureAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);

      // Warm dynamic atmospheric lowpass filter
      this.atmosphereFilter = this.audioCtx.createBiquadFilter();
      this.atmosphereFilter.type = 'lowpass';
      this.atmosphereFilter.frequency.setValueAtTime(10500, this.audioCtx.currentTime);
      this.atmosphereFilter.Q.setValueAtTime(0.8, this.audioCtx.currentTime);

      // Ambient space reverb / delay feedback chain
      this.reverbDelayNode = this.audioCtx.createDelay();
      this.reverbDelayNode.delayTime.setValueAtTime(0.26, this.audioCtx.currentTime);

      this.reverbFeedbackNode = this.audioCtx.createGain();
      this.reverbFeedbackNode.gain.setValueAtTime(0.38, this.audioCtx.currentTime);

      this.reverbWetGain = this.audioCtx.createGain();
      this.reverbWetGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);

      // Routing: AtmosphereFilter -> MasterGain, and AtmosphereFilter -> Reverb -> MasterGain
      this.atmosphereFilter.connect(this.masterGain);
      this.atmosphereFilter.connect(this.reverbDelayNode);
      this.reverbDelayNode.connect(this.reverbFeedbackNode);
      this.reverbFeedbackNode.connect(this.reverbDelayNode);
      this.reverbDelayNode.connect(this.reverbWetGain);
      this.reverbWetGain.connect(this.masterGain);

      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public unlock(): void {
    if (this.isUnlocked) return;
    this.isUnlocked = true;
    this.ensureAudioContext();
    if (!this.isPlaying) {
      this.play();
    }
  }

  public play(): void {
    const track = AUDIO_TRACKS[this.currentTrackIndex];
    this.isPlaying = true;

    // Clear any synthesized ambient loop when playing an actual audio file
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    if (track && track.src) {
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.addEventListener('ended', () => {
          this.nextTrack();
        });
        this.audioElement.addEventListener('error', (e) => {
          console.warn('Audio playback error, falling back to ambient synth:', e);
          this.playWebAudioAtmosphere();
        });
      }

      // Check if src needs updating
      const currentFullUrl = this.audioElement.src;
      const targetSrc = track.src;
      if (!currentFullUrl.endsWith(targetSrc)) {
        this.audioElement.src = targetSrc;
        this.audioElement.load();
      }

      this.audioElement.volume = this.targetVolume;
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('HTML5 Audio play was interrupted or blocked:', err);
          // Fallback to web audio if file cannot be played immediately
          this.playWebAudioAtmosphere();
        });
      }
    } else {
      this.playWebAudioAtmosphere();
    }
    this.notify();
  }

  public selectTrack(index: number): void {
    if (index < 0 || index >= AUDIO_TRACKS.length) return;
    this.currentTrackIndex = index;
    if (this.isPlaying) {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.play();
    } else {
      this.notify();
    }
  }

  private playWebAudioAtmosphere(): void {
    const ctx = this.ensureAudioContext();
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.targetVolume, ctx.currentTime + 2.5);
    }
    this.startAtmosphereLoop();
  }

  public pause(): void {
    if (!this.isPlaying) return;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.audioCtx && this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.2);
    }
    this.isPlaying = false;
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.notify();
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public nextTrack(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.currentTrackIndex = (this.currentTrackIndex + 1) % AUDIO_TRACKS.length;
    if (this.isPlaying) {
      this.play();
    }
    this.notify();
  }

  public prevTrack(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.currentTrackIndex = (this.currentTrackIndex - 1 + AUDIO_TRACKS.length) % AUDIO_TRACKS.length;
    if (this.isPlaying) {
      this.play();
    }
    this.notify();
  }

  public setVolume(vol: number): void {
    this.targetVolume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      const zoneVolScale = 0.92 + this.currentZoneShift * 0.22;
      this.audioElement.volume = Math.max(0, Math.min(1, this.targetVolume * zoneVolScale));
    }
    if (this.audioCtx && this.masterGain && this.isPlaying) {
      const zoneVolScale = 0.92 + this.currentZoneShift * 0.22;
      this.masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(
        this.targetVolume * zoneVolScale,
        this.audioCtx.currentTime + 0.3
      );
    }
    this.notify();
  }

  public setZoneShift(shift: number): void {
    const clamped = Math.max(0, Math.min(1, shift));
    this.currentZoneShift = clamped;

    // 1. Modulate HTML5 Audio volume dynamically with atmospheric depth
    if (this.audioElement) {
      const zoneVolScale = 0.92 + clamped * 0.22;
      this.audioElement.volume = Math.max(0, Math.min(1, this.targetVolume * zoneVolScale));
    }

    // 2. Modulate Web Audio Filter & Space Reverb
    if (this.audioCtx && this.atmosphereFilter && this.reverbWetGain) {
      const now = this.audioCtx.currentTime;

      // Deep Indigo (0.0): Crisp starlight, open filter (~12000Hz), subtle dry presence (0.06 wet)
      // Dusk Purple (1.0): Warm lush acoustic intimacy (~4200Hz warm cutoff), expanded cosmic reverb (0.28 wet)
      const targetFreq = 12000 - clamped * 7500;
      const targetWet = 0.06 + clamped * 0.22;
      const targetQ = 0.7 + clamped * 0.6;

      this.atmosphereFilter.frequency.cancelScheduledValues(now);
      this.atmosphereFilter.frequency.setTargetAtTime(targetFreq, now, 0.4);

      this.atmosphereFilter.Q.cancelScheduledValues(now);
      this.atmosphereFilter.Q.setTargetAtTime(targetQ, now, 0.4);

      this.reverbWetGain.gain.cancelScheduledValues(now);
      this.reverbWetGain.gain.setTargetAtTime(targetWet, now, 0.4);

      if (this.masterGain && this.isPlaying) {
        const zoneVolScale = 0.92 + clamped * 0.22;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setTargetAtTime(this.targetVolume * zoneVolScale, now, 0.3);
      }
    }
  }

  public getCurrentTrack(): AudioTrack {
    return AUDIO_TRACKS[this.currentTrackIndex];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startAtmosphereLoop(): void {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }

    const currentTrack = AUDIO_TRACKS[this.currentTrackIndex];
    // Chords based on tracks:
    // Track 1 (Say You Won't Let Go): Bb - F - Gm - Eb (in C: C - G - Am - F)
    // Track 2 (Supermarket Flowers): C - Em - F - C - G
    // Track 3 (Those Eyes): Db - Fm - Bbm - Gb
    const chordProgressions: Record<string, number[][]> = {
      'track-01': [
        [261.63, 329.63, 392.00, 523.25], // C major (C4, E4, G4, C5)
        [196.00, 246.94, 293.66, 392.00], // G major (G3, B3, D4, G4)
        [220.00, 261.63, 329.63, 440.00], // A minor (A3, C4, E4, A4)
        [174.61, 220.00, 261.63, 349.23], // F major (F3, A3, C4, F4)
      ],
      'track-02': [
        [261.63, 329.63, 392.00, 493.88], // C maj7
        [164.81, 246.94, 329.63, 392.00], // E minor
        [174.61, 220.00, 261.63, 329.63], // F maj7
        [196.00, 246.94, 293.66, 493.88], // G7
      ],
      'track-03': [
        [277.18, 349.23, 415.30, 554.37], // Db maj (warm reverb)
        [174.61, 261.63, 349.23, 415.30], // Fm
        [233.08, 277.18, 349.23, 466.16], // Bbm
        [185.00, 233.08, 277.18, 369.99], // Gb maj7
      ],
    };

    const chords = chordProgressions[currentTrack.id] || chordProgressions['track-01'];
    let step = 0;

    // Trigger initial pad
    this.playAmbientChord(chords[step]);

    this.timerId = window.setInterval(() => {
      if (!this.isPlaying) return;
      step = (step + 1) % chords.length;
      this.playAmbientChord(chords[step]);
    }, 4800);
  }

  private playAmbientChord(freqs: number[]): void {
    if (!this.audioCtx || !this.masterGain || !this.isPlaying) return;
    const now = this.audioCtx.currentTime;

    freqs.forEach((freq, i) => {
      if (!this.audioCtx || !this.masterGain) return;
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      // Warm acoustic pad / celestial chime
      osc.type = i === 0 ? 'sine' : i === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Low pass filter for warm organic night sky sound
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + i * 200, now);
      filter.Q.setValueAtTime(1.5, now);

      // Arpeggiate slightly for gentle strum feel
      const noteStart = now + i * 0.18;
      const duration = 4.2;

      noteGain.gain.setValueAtTime(0.0001, noteStart);
      noteGain.gain.exponentialRampToValueAtTime(0.12 / (i + 1), noteStart + 0.8);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(noteStart);
      osc.stop(noteStart + duration);
    });
  }

  public playStarGazeChime(): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      if (!this.audioCtx || !this.masterGain) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.2);
    });
  }

  public playPortalWarp(): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Resonant cosmic filter sweep
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.9);
    filter.Q.setValueAtTime(4.0, now);

    const warpGain = this.audioCtx.createGain();
    warpGain.gain.setValueAtTime(0.001, now);
    warpGain.gain.linearRampToValueAtTime(0.14, now + 0.35);
    warpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

    // Dual oscillator celestial portal shimmer (sine + saw with subtle detune)
    const osc1 = this.audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(587.33, now + 0.45); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.85); // A5

    const osc2 = this.audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(220, now);
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.5); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.9); // C6

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(warpGain);
    warpGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.95);
    osc2.stop(now + 0.95);

    // Stardust chimes accompanying the portal entry
    const chimeFrequencies = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    chimeFrequencies.forEach((freq, idx) => {
      if (!this.audioCtx || !this.masterGain) return;
      const chimeOsc = this.audioCtx.createOscillator();
      const chimeGain = this.audioCtx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.2 + idx * 0.1);

      chimeGain.gain.setValueAtTime(0.001, now + 0.2 + idx * 0.1);
      chimeGain.gain.linearRampToValueAtTime(0.06, now + 0.2 + idx * 0.1 + 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2 + idx * 0.1 + 0.7);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.masterGain);

      chimeOsc.start(now + 0.2 + idx * 0.1);
      chimeOsc.stop(now + 0.2 + idx * 0.1 + 0.7);
    });
  }
}

export const audioEngine = new UniverseAudioEngine();
