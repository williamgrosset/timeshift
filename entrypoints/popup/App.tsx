import { useEffect, useState } from 'react';
import { loadSettings, updateSettings } from '@/lib/storage';
import type { TimeshiftSettings } from '@/lib/types';

const BUFFER_OPTIONS = [
  { label: '5 min', value: 300 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
  { label: '1 hour', value: 3600 },
];

export function App() {
  const [settings, setSettings] = useState<TimeshiftSettings | null>(null);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const update = async (partial: Partial<TimeshiftSettings>) => {
    const updated = await updateSettings(partial);
    setSettings(updated);
  };

  return (
    <div className="popup">
      <div className="popup__header">
        <h1 className="popup__title">Timeshift</h1>
        <span className="popup__subtitle">DVR for Twitch</span>
      </div>

      <div className="popup__section">
        <label className="popup__toggle">
          <span>Enabled</span>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          <span className="popup__slider" />
        </label>
      </div>

      <div className="popup__section">
        <label className="popup__toggle">
          <span>Auto-activate on streams</span>
          <input
            type="checkbox"
            checked={settings.autoActivate}
            onChange={(e) => update({ autoActivate: e.target.checked })}
          />
          <span className="popup__slider" />
        </label>
      </div>

      <div className="popup__section">
        <label className="popup__label">Buffer size</label>
        <div className="popup__chips">
          {BUFFER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`popup__chip ${settings.backBufferSeconds === opt.value ? 'popup__chip--active' : ''}`}
              onClick={() => update({ backBufferSeconds: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="popup__footer">
        Click the <strong>DVR</strong> button on the Twitch player to activate.
      </div>
    </div>
  );
}
