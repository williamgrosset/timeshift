import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { SELECTORS } from '@/lib/constants';
import { waitForElement, getChannelFromUrl, isLiveStreamPage } from '@/lib/twitch-dom';
import { getLatestVod, type TwitchVod } from '@/lib/twitch-gql';
import styles from './player.content/style.css?inline';

export default defineContentScript({
  matches: ['*://*.twitch.tv/*'],
  runAt: 'document_idle',
  cssInjectionMode: 'manual',

  async main(ctx) {
    console.log('[Timeshift] Content script loaded');

    let rewindBtnContainer: HTMLDivElement | null = null;
    let rewindBtnRoot: Root | null = null;
    let goLiveBtnContainer: HTMLDivElement | null = null;
    let goLiveBtnRoot: Root | null = null;
    let currentChannel: string | null = null;
    let currentVod: TwitchVod | null = null;

    // ------------------------------------------------------------------
    // Determine page type and inject appropriate button
    // ------------------------------------------------------------------
    async function init(): Promise<void> {
      cleanup();
      const channel = getChannelFromUrl();

      if (isLiveStreamPage() && channel) {
        currentChannel = channel;
        console.log(`[Timeshift] Live stream detected: ${channel}`);

        // Fetch latest VOD for this channel
        currentVod = await getLatestVod(channel);
        if (currentVod) {
          console.log(`[Timeshift] Found VOD: ${currentVod.id} (${currentVod.title})`);
          await injectRewindButton();
        } else {
          console.log('[Timeshift] No VOD available for this channel');
        }
      } else if (isVodPage()) {
        // We're on a VOD page — check if we came from a live channel
        const referrerChannel = getReferrerChannel();
        if (referrerChannel) {
          currentChannel = referrerChannel;
          console.log(`[Timeshift] VOD page with live channel context: ${referrerChannel}`);
          await injectGoLiveButton(referrerChannel);
        }
      }
    }

    // ------------------------------------------------------------------
    // Check if current page is a VOD page
    // ------------------------------------------------------------------
    function isVodPage(): boolean {
      return /^\/videos\/\d+/.test(window.location.pathname);
    }

    // ------------------------------------------------------------------
    // Store/retrieve the channel we came from
    // ------------------------------------------------------------------
    function storeReferrerChannel(channel: string): void {
      sessionStorage.setItem('timeshift_referrer_channel', channel);
    }

    function getReferrerChannel(): string | null {
      return sessionStorage.getItem('timeshift_referrer_channel');
    }

    function clearReferrerChannel(): void {
      sessionStorage.removeItem('timeshift_referrer_channel');
    }

    // ------------------------------------------------------------------
    // Navigate using Twitch SPA (click a link so React Router handles it)
    // ------------------------------------------------------------------
    function navigateTo(url: string): void {
      const link = document.createElement('a');
      link.href = url;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    // ------------------------------------------------------------------
    // Inject "Rewind" button into live player controls
    // ------------------------------------------------------------------
    async function injectRewindButton(): Promise<void> {
      if (rewindBtnContainer) return;

      try {
        const controlsRight = await waitForElement(
          SELECTORS.CONTROLS_RIGHT,
          ctx.signal,
        );

        rewindBtnContainer = document.createElement('div');
        rewindBtnContainer.id = 'timeshift-rewind-root';
        controlsRight.prepend(rewindBtnContainer);

        const shadow = rewindBtnContainer.attachShadow({ mode: 'open' });
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        shadow.appendChild(styleEl);

        const mountPoint = document.createElement('div');
        shadow.appendChild(mountPoint);
        rewindBtnRoot = createRoot(mountPoint);

        rewindBtnRoot.render(
          createElement('button', {
            className: 'ts-rewind-btn',
            title: 'Rewind stream (watch VOD)',
            onClick: () => {
              if (!currentVod || !currentChannel) return;
              storeReferrerChannel(currentChannel);
              // Navigate to VOD, seeking near the end (latest content)
              const timeParam = formatVodTime(currentVod.lengthSeconds - 30);
              navigateTo(`/videos/${currentVod.id}?t=${timeParam}`);
            },
          },
            createElement('svg', {
              width: 20, height: 20, viewBox: '0 0 20 20', fill: 'currentColor',
            },
              createElement('path', {
                d: 'M10 3a7 7 0 1 0 7 7h-2a5 5 0 1 1-1.46-3.54L11 9h6V3l-2.34 2.34A6.97 6.97 0 0 0 10 3z',
              }),
            ),
            createElement('span', { className: 'ts-rewind-btn__label' }, 'Rewind'),
          ),
        );

        console.log('[Timeshift] Rewind button injected');
      } catch {
        // Aborted or element not found
      }
    }

    // ------------------------------------------------------------------
    // Inject "Go Live" button on VOD page
    // ------------------------------------------------------------------
    async function injectGoLiveButton(channel: string): Promise<void> {
      if (goLiveBtnContainer) return;

      try {
        const controlsRight = await waitForElement(
          SELECTORS.CONTROLS_RIGHT,
          ctx.signal,
        );

        goLiveBtnContainer = document.createElement('div');
        goLiveBtnContainer.id = 'timeshift-golive-root';
        controlsRight.prepend(goLiveBtnContainer);

        const shadow = goLiveBtnContainer.attachShadow({ mode: 'open' });
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        shadow.appendChild(styleEl);

        const mountPoint = document.createElement('div');
        shadow.appendChild(mountPoint);
        goLiveBtnRoot = createRoot(mountPoint);

        goLiveBtnRoot.render(
          createElement('button', {
            className: 'ts-golive-btn',
            title: 'Return to live stream',
            onClick: () => {
              clearReferrerChannel();
              navigateTo(`/${channel}`);
            },
          },
            createElement('span', { className: 'ts-golive-btn__dot' }),
            createElement('span', null, 'Go Live'),
          ),
        );

        console.log('[Timeshift] Go Live button injected');
      } catch {
        // Aborted or element not found
      }
    }

    // ------------------------------------------------------------------
    // Format seconds to VOD time param (e.g. "1h30m15s")
    // ------------------------------------------------------------------
    function formatVodTime(seconds: number): string {
      const s = Math.max(0, Math.floor(seconds));
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      let result = '';
      if (h > 0) result += `${h}h`;
      if (m > 0) result += `${m}m`;
      result += `${sec}s`;
      return result;
    }

    // ------------------------------------------------------------------
    // Clean up UI elements
    // ------------------------------------------------------------------
    function cleanup(): void {
      if (rewindBtnRoot) {
        rewindBtnRoot.unmount();
        rewindBtnRoot = null;
      }
      if (rewindBtnContainer) {
        rewindBtnContainer.remove();
        rewindBtnContainer = null;
      }
      if (goLiveBtnRoot) {
        goLiveBtnRoot.unmount();
        goLiveBtnRoot = null;
      }
      if (goLiveBtnContainer) {
        goLiveBtnContainer.remove();
        goLiveBtnContainer = null;
      }
      currentChannel = null;
      currentVod = null;
    }

    // ------------------------------------------------------------------
    // Watch for SPA navigation (Twitch uses React Router)
    // ------------------------------------------------------------------
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        console.log('[Timeshift] URL changed, re-initializing');
        // Small delay to let Twitch's React render the new page
        setTimeout(init, 500);
      }
    });
    urlObserver.observe(document.documentElement, { childList: true, subtree: true });

    // Initial setup
    await init();

    // Clean up on context invalidation
    ctx.onInvalidated(() => {
      cleanup();
      urlObserver.disconnect();
    });
  },
});
