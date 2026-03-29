import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'output',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    esbuild: {
      // Keep console.log for debugging
      drop: [],
    },
  }),
  manifest: {
    name: 'Timeshift',
    description: 'DVR/rewind for Twitch live streams',
    version: '0.1.0',
    permissions: ['storage'],
    host_permissions: [
      '*://*.twitch.tv/*',
      '*://*.ttvnw.net/*',
      '*://*.jtvnw.net/*',
      '*://*.cloudfront.net/*',
    ],
    icons: {
      16: 'icon-16.png',
      48: 'icon-48.png',
      128: 'icon-128.png',
    },
    action: {
      default_icon: {
        16: 'icon-16.png',
        48: 'icon-48.png',
        128: 'icon-128.png',
      },
    },
    web_accessible_resources: [
      {
        resources: ['probe.js'],
        matches: ['*://*.twitch.tv/*'],
      },
    ],
  },
});
