'use client';

interface SoundToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export default function SoundToggle({ isEnabled, onToggle }: SoundToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-2 right-2 z-20 p-2 rounded-lg
                 border-2 border-cyber-yellow text-cyber-yellow
                 hover:bg-cyber-yellow/20 transition-all duration-300
                 min-w-[40px] min-h-[40px] flex items-center justify-center
                 neon-box-yellow bg-cyber-dark/80"
      aria-label={isEnabled ? 'Mute sound' : 'Unmute sound'}
    >
      {isEnabled ? '🔊' : '🔇'}
    </button>
  );
}