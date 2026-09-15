// =========================================================================
// ATING UNIVERSE - ADAPTIVE 45-60 FPS PERFORMANCE ENGINE & PROFILER
// Controls frame pacing (capped between 45 to 60 FPS), dynamic pixel ratio,
// particle throttling, power saving on mobile/laptops, and tab visibility.
// =========================================================================

export type PerformanceTier = 'high' | 'medium' | 'low';
export type FpsCapMode = '60' | '45' | 'auto';

export interface PerformanceStats {
  fps: number;
  targetFps: number;
  capMode: FpsCapMode;
  tier: PerformanceTier;
  dpr: number;
  frameTimeMs: number;
  particleMultiplier: number;
  isTabVisible: boolean;
}

class PerformanceManager {
  private frameCount: number = 0;
  private lastFpsSampleTime: number = performance.now();
  private lastRenderTimestamp: number = 0;
  private fps: number = 60;
  private frameTimeMs: number = 16.6;
  private lowFpsStreak: number = 0;
  private highFpsStreak: number = 0;

  // FPS Cap Configuration (User-controllable: 60 FPS, 45 FPS, or Auto 45-60 FPS)
  private capMode: FpsCapMode = '60';
  private effectiveTargetFps: number = 60;

  private currentTier: PerformanceTier = 'high';
  private listeners: Set<(stats: PerformanceStats) => void> = new Set();
  private isTabVisible: boolean = true;
  private isMobile: boolean = false;
  private optimalDpr: number = 1.5;

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Hardware & Mobile Detection
      const ua = navigator.userAgent.toLowerCase();
      this.isMobile = /mobile|iphone|ipad|android|touch/i.test(ua);
      const cores = navigator.hardwareConcurrency || 4;
      const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;

      // Read stored user preferences
      try {
        const storedCap = localStorage.getItem('ating_universe_fps_cap') as FpsCapMode | null;
        if (storedCap === '45' || storedCap === '60' || storedCap === 'auto') {
          this.capMode = storedCap;
        } else if (this.isMobile) {
          // Mobile default to auto (45-60 FPS) to conserve battery
          this.capMode = 'auto';
        }

        const storedTier = localStorage.getItem('ating_universe_perf_tier') as PerformanceTier | null;
        if (storedTier === 'high' || storedTier === 'medium' || storedTier === 'low') {
          this.currentTier = storedTier;
        } else if (this.isMobile || cores <= 4 || deviceMemory < 4) {
          this.currentTier = 'medium';
        }
      } catch {
        // Fallback default
        if (this.isMobile) {
          this.capMode = 'auto';
          this.currentTier = 'medium';
        }
      }

      this.updateEffectiveTargetFps();
      this.optimalDpr = this.calculateOptimalDpr();

      // 2. Tab Visibility Listener (Pauses heavy animation loops when backgrounded)
      document.addEventListener(
        'visibilitychange',
        () => {
          this.isTabVisible = !document.hidden;
          if (this.isTabVisible) {
            this.lastFpsSampleTime = performance.now();
            this.lastRenderTimestamp = performance.now();
          }
          this.notifyListeners();
        },
        { passive: true }
      );
    }
  }

  /**
   * Internal helper to calculate target FPS based on mode
   */
  private updateEffectiveTargetFps(): void {
    if (this.capMode === '60') {
      this.effectiveTargetFps = 60;
    } else if (this.capMode === '45') {
      this.effectiveTargetFps = 45;
    } else {
      // Auto mode: default between 45 and 60 depending on active tier
      this.effectiveTargetFps = this.currentTier === 'low' ? 45 : 60;
    }
  }

  /**
   * Main throttler to cap frame execution between 45 and 60 FPS.
   * Call at the beginning of each requestAnimationFrame callback.
   * Returns true if the frame should be rendered, or false if it should be skipped.
   */
  public shouldRender(now: number = performance.now()): boolean {
    if (!this.isTabVisible) return false;

    const targetInterval = 1000 / this.effectiveTargetFps;
    const elapsed = now - this.lastRenderTimestamp;

    // Allow 1.5ms margin for browser timestamp jitter/quantization
    if (elapsed < targetInterval - 1.5) {
      return false;
    }

    // Record interval for accurate frame-time measurement
    if (this.lastRenderTimestamp > 0) {
      const instantaneousFrameTime = now - this.lastRenderTimestamp;
      this.frameTimeMs = this.frameTimeMs * 0.9 + instantaneousFrameTime * 0.1;
    }

    this.lastRenderTimestamp = now;
    this.recordFrame(now);
    return true;
  }

  /**
   * Record frame count and evaluate adaptive scaling
   */
  public recordFrame(now: number = performance.now()): void {
    if (!this.isTabVisible) return;

    this.frameCount++;
    const elapsed = now - this.lastFpsSampleTime;

    if (elapsed >= 1000) {
      this.fps = (this.frameCount * 1000) / elapsed;
      this.frameCount = 0;
      this.lastFpsSampleTime = now;

      // Dynamic Auto 45-60 FPS adjustment
      if (this.capMode === 'auto') {
        if (this.fps < 44) {
          this.lowFpsStreak++;
          this.highFpsStreak = 0;
          if (this.lowFpsStreak >= 2) {
            // Drop target to 45 FPS to stabilize frame pacing
            if (this.effectiveTargetFps !== 45) {
              this.effectiveTargetFps = 45;
            } else if (this.currentTier === 'high') {
              this.setTier('medium');
            } else if (this.currentTier === 'medium') {
              this.setTier('low');
            }
            this.lowFpsStreak = 0;
          }
        } else if (this.fps >= 56) {
          this.highFpsStreak++;
          this.lowFpsStreak = 0;
          if (this.highFpsStreak >= 5) {
            // Hardware has breathing room, raise target back to 60 FPS
            if (this.effectiveTargetFps !== 60) {
              this.effectiveTargetFps = 60;
            }
            this.highFpsStreak = 0;
          }
        }
      }

      this.notifyListeners();
    }
  }

  public calculateOptimalDpr(): number {
    if (typeof window === 'undefined') return 1;
    const baseDpr = window.devicePixelRatio || 1;
    if (this.currentTier === 'low' || this.isMobile) {
      return Math.min(baseDpr, 1.0);
    }
    if (this.currentTier === 'medium') {
      return Math.min(baseDpr, 1.25);
    }
    return Math.min(baseDpr, 1.5);
  }

  public getDpr(): number {
    return this.optimalDpr;
  }

  public getTier(): PerformanceTier {
    return this.currentTier;
  }

  public setTier(tier: PerformanceTier): void {
    if (this.currentTier !== tier) {
      this.currentTier = tier;
      this.optimalDpr = this.calculateOptimalDpr();
      try {
        localStorage.setItem('ating_universe_perf_tier', tier);
      } catch {}
      this.notifyListeners();
    }
  }

  public getFpsCapMode(): FpsCapMode {
    return this.capMode;
  }

  public setFpsCapMode(mode: FpsCapMode): void {
    this.capMode = mode;
    this.updateEffectiveTargetFps();
    try {
      localStorage.setItem('ating_universe_fps_cap', mode);
    } catch {}
    this.notifyListeners();
  }

  public getTargetFps(): number {
    return this.effectiveTargetFps;
  }

  public getFps(): number {
    return Math.round(this.fps);
  }

  public getFrameTimeMs(): number {
    return Math.round(this.frameTimeMs * 10) / 10;
  }

  public getIsTabVisible(): boolean {
    return this.isTabVisible;
  }

  public getParticleMultiplier(): number {
    // If running in 45 FPS mode, slightly decrease particle density to guarantee smooth pacing
    const capModifier = this.effectiveTargetFps === 45 ? 0.85 : 1.0;

    switch (this.currentTier) {
      case 'low':
        return 0.45 * capModifier;
      case 'medium':
        return 0.75 * capModifier;
      case 'high':
      default:
        return 1.0 * capModifier;
    }
  }

  public getStats(): PerformanceStats {
    return {
      fps: this.getFps(),
      targetFps: this.effectiveTargetFps,
      capMode: this.capMode,
      tier: this.currentTier,
      dpr: this.optimalDpr,
      frameTimeMs: this.getFrameTimeMs(),
      particleMultiplier: this.getParticleMultiplier(),
      isTabVisible: this.isTabVisible,
    };
  }

  public subscribe(callback: (stats: PerformanceStats) => void): () => void {
    this.listeners.add(callback);
    callback(this.getStats());
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach((cb) => cb(stats));
  }
}

export const performanceManager = new PerformanceManager();

