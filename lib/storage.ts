import { DEFAULTS } from './constants';
import type { TimeshiftSettings } from './types';

const STORAGE_KEY = 'timeshift_settings';

/** Load settings from chrome.storage.local, falling back to defaults. */
export async function loadSettings(): Promise<TimeshiftSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY] as Partial<TimeshiftSettings> | undefined;
  return {
    enabled: stored?.enabled ?? DEFAULTS.enabled,
    autoActivate: stored?.autoActivate ?? DEFAULTS.autoActivate,
    backBufferSeconds: stored?.backBufferSeconds ?? DEFAULTS.backBufferSeconds,
    preferredQuality: stored?.preferredQuality ?? DEFAULTS.preferredQuality,
  };
}

/** Save settings to chrome.storage.local. */
export async function saveSettings(settings: TimeshiftSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}

/** Update a subset of settings. */
export async function updateSettings(
  partial: Partial<TimeshiftSettings>,
): Promise<TimeshiftSettings> {
  const current = await loadSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
  return updated;
}

/** Listen for settings changes. Returns an unsubscribe function. */
export function onSettingsChange(
  callback: (settings: TimeshiftSettings) => void,
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string,
  ) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
      const newVal = changes[STORAGE_KEY].newValue as TimeshiftSettings;
      callback(newVal);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
