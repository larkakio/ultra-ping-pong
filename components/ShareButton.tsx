'use client';

import { useFarcasterSDK } from '@/hooks/useFarcasterSDK';

interface ShareButtonProps {
  playerScore: number;
  aiScore: number;
}

export default function ShareButton({ playerScore, aiScore }: ShareButtonProps) {
  const { shareScore } = useFarcasterSDK();

  return (
    <button
      onClick={() => shareScore(playerScore, aiScore)}
      className="neon-button px-6 py-3 rounded-lg font-orbitron font-bold
                 border-2 border-cyber-cyan text-cyber-cyan
                 hover:bg-cyber-cyan/20 transition-all duration-300
                 min-h-[44px]"
    >
      Share Score 🚀
    </button>
  );
}