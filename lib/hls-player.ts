import Hls, { type HlsConfig, Events, ErrorTypes } from 'hls.js';
import type { PlayerState, QualityLevel } from './types';
import { DEFAULTS } from './constants';

export type PlayerStateListener = (state: PlayerState) => void;

export class TimeshiftPlayer {
  private hls: Hls | null = null;
  private video: HTMLVideoElement;
  private listener: PlayerStateListener | null = null;
  private updateTimer: number | null = null;
  private _destroyed = false;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  /** Start playback of the given HLS manifest URL. */
  load(manifestUrl: string, backBufferSeconds = DEFAULTS.backBufferSeconds): void {
    this.destroy();
    this._destroyed = false;

    if (!Hls.isSupported()) {
      console.error('[Timeshift] hls.js is not supported in this browser.');
      return;
    }

    const config: Partial<HlsConfig> = {
      backBufferLength: backBufferSeconds,
      maxBufferLength: 60,
      maxMaxBufferLength: backBufferSeconds,
      liveDurationInfinity: true,
      liveSyncDuration: 3,
      liveMaxLatencyDuration: 10,
      lowLatencyMode: false,
      // Don't cap level on start so we pick best quality
      capLevelToPlayerSize: false,
    };

    this.hls = new Hls(config);
    this.hls.loadSource(manifestUrl);
    this.hls.attachMedia(this.video);

    this.hls.on(Events.MANIFEST_PARSED, () => {
      this.video.play().catch(() => {
        // Autoplay blocked — user will need to click play
      });
    });

    this.hls.on(Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case ErrorTypes.MEDIA_ERROR:
            console.warn('[Timeshift] Fatal media error, attempting recovery...');
            this.hls?.recoverMediaError();
            break;
          case ErrorTypes.NETWORK_ERROR:
            console.warn('[Timeshift] Fatal network error, attempting recovery...');
            this.hls?.startLoad();
            break;
          default:
            console.error('[Timeshift] Unrecoverable error:', data);
            this.destroy();
            break;
        }
      }
    });

    // Start state update polling
    this.startStateUpdates();
  }

  /** Update the manifest URL (e.g. after token refresh) without restarting. */
  updateManifest(url: string): void {
    if (this.hls) {
      this.hls.loadSource(url);
    }
  }

  play(): void {
    this.video.play().catch(() => {});
  }

  pause(): void {
    this.video.pause();
  }

  /** Seek to an absolute time in seconds. */
  seek(time: number): void {
    this.video.currentTime = time;
  }

  /** Jump to the live edge. */
  goLive(): void {
    if (this.hls) {
      this.video.currentTime = this.hls.liveSyncPosition ?? this.video.duration;
      this.video.play().catch(() => {});
    }
  }

  /** Set quality level by index. Pass -1 for auto. */
  setQuality(levelIndex: number): void {
    if (this.hls) {
      this.hls.currentLevel = levelIndex;
    }
  }

  /** Get available quality levels from the master playlist. */
  getQualityLevels(): QualityLevel[] {
    if (!this.hls) return [];
    return this.hls.levels.map((level, index) => ({
      index,
      height: level.height,
      bitrate: level.bitrate,
      label: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`,
    }));
  }

  /** Get the current player state snapshot. */
  getState(): PlayerState {
    const buffered = this.video.buffered;
    const bufferStart = buffered.length > 0 ? buffered.start(0) : 0;
    const bufferEnd = buffered.length > 0 ? buffered.end(buffered.length - 1) : 0;
    const liveEdge = this.hls?.liveSyncPosition ?? bufferEnd;
    const latency = Math.max(0, liveEdge - this.video.currentTime);

    return {
      playing: !this.video.paused,
      currentTime: this.video.currentTime,
      bufferStart,
      bufferEnd,
      latency,
      isLive: latency < 5,
      qualityLevels: this.getQualityLevels(),
      activeQuality: this.hls?.currentLevel ?? -1,
    };
  }

  /** Register a callback for periodic state updates (~250ms). */
  onStateUpdate(listener: PlayerStateListener): void {
    this.listener = listener;
  }

  private startStateUpdates(): void {
    this.stopStateUpdates();
    this.updateTimer = window.setInterval(() => {
      if (this.listener && !this._destroyed) {
        this.listener(this.getState());
      }
    }, 250);
  }

  private stopStateUpdates(): void {
    if (this.updateTimer !== null) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  get destroyed(): boolean {
    return this._destroyed;
  }

  /** Tear down the hls.js instance and stop all updates. */
  destroy(): void {
    this._destroyed = true;
    this.stopStateUpdates();
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this.listener = null;
  }
}
