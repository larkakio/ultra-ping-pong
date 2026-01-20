'use client';

import { motion } from 'framer-motion';
import ShareButton from './ShareButton';

interface GameOverProps {
  winner: 'player' | 'ai';
  playerScore: number;
  aiScore: number;
  isMobile: boolean;
  onRestart: () => void;
}

export default function GameOver({ winner, playerScore, aiScore, isMobile, onRestart }: GameOverProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-cyber-bg/95 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center space-y-8 p-8"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className={`font-orbitron font-black ${
            isMobile ? 'text-4xl' : 'text-7xl'
          } ${
            winner === 'player' ? 'neon-cyan' : 'neon-magenta'
          }`}
        >
          {winner === 'player' ? 'VICTORY!' : 'DEFEAT!'}
        </motion.div>

        <div className={`text-cyber-yellow font-orbitron ${isMobile ? 'text-lg' : 'text-2xl'}`}>
          Final Score: {playerScore} - {aiScore}
        </div>

        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={onRestart}
            className={`neon-box-cyan px-8 py-4 rounded-lg font-orbitron font-bold
                     text-cyber-cyan hover:bg-cyber-cyan/20 transition-all duration-300
                     min-h-[44px] ${isMobile ? 'text-lg' : 'text-xl'}`}
          >
            PLAY AGAIN
          </button>

          <ShareButton playerScore={playerScore} aiScore={aiScore} />
        </div>
      </motion.div>
    </motion.div>
  );
}