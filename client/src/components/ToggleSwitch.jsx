export function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-block w-9 h-5 rounded-full relative transition-colors ${
        checked ? 'bg-accent' : 'bg-border'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
          checked ? 'right-0.5' : 'left-0.5'
        }`}
      />
    </button>
  );
}
