// =========================================================================
// ATING UNIVERSE - ADAPTIVE 60FPS PERFORMANCE ENGINE & PROFILER
// Dynamic pixel ratio scaling, frame rate monitoring, particle count tuning,
// power saving for low-end mobile devices, and tab visibility management.
// =========================================================================

export type PerformanceTier = 'high' | 'medium' | 'low';

class PerformanceManager {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 60;
  private lowFpsCount: number = 0;
  private currentTier: PerformanceTier = 'high';
  private listeners: Set<(tier: PerformanceTier, fps: number) => void> = new Set();
  private isTabVisible: boolean = true;
  private isMobile: boolean = false;
  private optimalDpr: number = 1.5;

  constructor() {
    if (typeof window !== 'undefined') {
      // Mobile & low hardware detection
      const ua = navigator.userAgent.toLowerCase();
      this.isMobile = /mobile|iphone|ipad|android|touch/i.test(ua);
      const cores = navigator.hardwareConcurrency || 4;
      const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;

      if (this.isMobile || cores <= 4 || deviceMemory < 4) {
        this.currentTier = 'medium';
      }

      this.optimalDpr = this.calculateOptimalDpr();

      // Visibility state listener
      document.addEventListener(
        'visibilitychange',
        () => {
          this.isTabVisible = !document.hidden;
        },
        { passive: true }
      );
    }
  }

  public calculateOptimalDpr(): number {
    if (typeof window === 'undefined') return 1;
    const baseDpr = window.devicePixelRatio || 1;
    if (this.currentTier === 'low' || this.isMobile) {
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

  public getIsTabVisible(): boolean {
    return this.isTabVisible;
  }

  public getParticleMultiplier(): number {
    switch (this.currentTier) {
      case 'low':
        return 0.45;
      case 'medium':
        return 0.75;
      case 'high':
      default:
        return 1.0;
    }
  }

  public getFps(): number {
    return Math.round(this.fps);
  }

  /**
   * Call once per frame tick to track real-time FPS and downgrade quality if lagging
   */
  public recordFrame(): void {
    if (!this.isTabVisible) return;

    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = (this.frameCount * 1000) / elapsed;
      this.frameCount = 0;
      this.lastTime = now;

      // Adaptive degradation if FPS drops below 45 consistently
      if (this.fps < 45) {
        this.lowFpsCount++;
        if (this.lowFpsCount >= 3) {
          if (this.currentTier === 'high') {
            this.setTier('medium');
          } else if (this.currentTier === 'medium') {
            this.setTier('low');
          }
          this.lowFpsCount = 0;
        }
      } else if (this.fps >= 56 && this.lowFpsCount > 0) {
        this.lowFpsCount = Math.max(0, this.lowFpsCount - 1);
      }
    }
  }

  public setTier(tier: PerformanceTier): void {
    if (this.currentTier !== tier) {
      this.currentTier = tier;
      this.optimalDpr = this.calculateOptimalDpr();
      this.notifyListeners();
    }
  }

  public subscribe(callback: (tier: PerformanceTier, fps: number) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.currentTier, this.fps));
  }
}

export const performanceManager = new PerformanceManager();
