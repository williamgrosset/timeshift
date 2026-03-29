import { SELECTORS } from './constants';

/**
 * Wait for an element matching `selector` to appear in the DOM.
 * Resolves immediately if the element already exists.
 * Rejects if the AbortSignal fires before the element appears.
 */
export function waitForElement(
  selector: string,
  signal?: AbortSignal,
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    signal?.addEventListener('abort', () => {
      observer.disconnect();
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

/** Get the Twitch video player outer container. */
export function getPlayerContainer(): Element | null {
  return document.querySelector(SELECTORS.VIDEO_PLAYER);
}

/** Get the inner player container. */
export function getPlayerInnerContainer(): Element | null {
  return document.querySelector(SELECTORS.VIDEO_PLAYER_CONTAINER);
}

/** Get the native Twitch <video> element. */
export function getNativeVideo(): HTMLVideoElement | null {
  const container = getPlayerContainer();
  if (!container) return null;
  return container.querySelector<HTMLVideoElement>(SELECTORS.VIDEO_ELEMENT);
}

/** Get the right control group in the player controls bar. */
export function getControlsRight(): Element | null {
  return document.querySelector(SELECTORS.CONTROLS_RIGHT);
}

/**
 * Extract the current channel name from the URL.
 * Handles paths like /channelname, /channelname/clip/xxx, etc.
 * Returns null if not on a channel page.
 */
export function getChannelFromUrl(): string | null {
  const path = window.location.pathname;
  // Skip known non-channel paths
  if (
    path === '/' ||
    path.startsWith('/directory') ||
    path.startsWith('/settings') ||
    path.startsWith('/downloads') ||
    path.startsWith('/search')
  ) {
    return null;
  }
  const match = path.match(/^\/([a-zA-Z0-9_]+)/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Check if the current page is a live stream (vs. VOD, clip, etc.).
 * Heuristic: a channel page without /videos, /clips, /schedule sub-paths.
 */
export function isLiveStreamPage(): boolean {
  const path = window.location.pathname;
  const channel = getChannelFromUrl();
  if (!channel) return false;
  // If the path is just /<channel> or /<channel>/ it's the live page
  return /^\/[a-zA-Z0-9_]+\/?$/.test(path);
}
