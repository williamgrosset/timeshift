interface TimeshiftToggleProps {
  active: boolean;
  onToggle: () => void;
}

export function TimeshiftToggle({ active, onToggle }: TimeshiftToggleProps) {
  return (
    <button
      className={`ts-toggle ${active ? 'ts-toggle--active' : ''}`}
      onClick={onToggle}
      title={active ? 'Disable Timeshift DVR' : 'Enable Timeshift DVR'}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 10l3-3v2h6V7l3 3-3 3v-2H7v2L4 10z" />
      </svg>
      <span className="ts-toggle__label">DVR</span>
    </button>
  );
}
