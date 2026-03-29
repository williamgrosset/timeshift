# Timeshift

A Chrome extension that adds rewind functionality to Twitch live streams. Jump to the current broadcast's VOD to scrub backward, then return to live with a single click.

## How it works

When you're watching a live Twitch stream, Timeshift queries the Twitch GraphQL API for the channel's latest VOD (the current broadcast archive). A **Rewind** button appears in the player controls. Clicking it navigates to the VOD near the end so you can seek through the broadcast using Twitch's native VOD player. A **Go Live** button lets you jump back to the live stream instantly.

## Installation

### From source

```sh
git clone https://github.com/williamgrosset/timeshift.git
cd timeshift
npm install
npm run build
```

Then load the extension in Chrome:

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `output/chrome-mv3/` folder

### Development

```sh
npm run dev    # Watch mode with HMR
npm run build  # Production build
npm run zip    # Package for distribution
```

## Usage

1. Navigate to any live Twitch stream
2. Click the **Rewind** button in the player controls to jump to the current broadcast's VOD
3. Use Twitch's native VOD controls to seek/scrub through the broadcast
4. Click **Go Live** to return to the live stream

## Project structure

```
entrypoints/
  interceptor.content.ts    MAIN world script (reserved for future hooks)
  player.content.ts          ISOLATED world — detects live/VOD pages, injects buttons
  background.ts              Service worker — badge updates
  popup/                     Extension popup (settings UI)
lib/
  twitch-gql.ts              Twitch GraphQL API — fetches latest VOD for a channel
  twitch-dom.ts              Twitch DOM selectors and MutationObserver utilities
  storage.ts                 chrome.storage.local wrapper with typed settings
  constants.ts               URL patterns, selectors, defaults
  types.ts                   Shared TypeScript types
  messages.ts                Message protocol helpers
```

## Tech stack

- **[WXT](https://wxt.dev/)** — Chrome extension framework (Manifest V3)
- **React** — UI components (rendered in Shadow DOM)
- **TypeScript** — strict mode

## Known limitations

- The channel must have VODs enabled. If the streamer has disabled past broadcasts, Timeshift can't offer rewind.
- Twitch DOM selectors may break if Twitch updates their frontend. These are centralized in `lib/constants.ts` for easy maintenance.
- The VOD may lag a few minutes behind the live stream depending on Twitch's processing speed.

## License

[MIT](LICENSE)
