'use client';

import { motion } from 'framer-motion';

interface ScoreBoardProps {
  playerScore: number;
  aiScore: number;
  scale: number;
  isMobile: boolean;
}

export default function ScoreBoard({ playerScore, aiScore, scale, isMobile }: ScoreBoardProps) {
  return (
    <div className={`absolute left-1/2 transform -translate-x-1/2 flex z-10 pointer-events-none ${isMobile ? 'top-2 gap-6' : 'top-3 gap-12'}`}>
      {/* Player Score */}
      <motion.div
        key={`player-${playerScore}`}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className={`font-orbitron text-cyber-cyan opacity-50 mb-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
          PLAYER
        </div>
        <div className={`neon-cyan font-orbitron font-black ${isMobile ? 'text-2xl' : 'text-4xl'}`} style={{ textShadow: '0 0 20px #00F0FF' }}>
          {playerScore}
        </div>
      </motion.div>

      {/* VS Divider */}
      <div className={`text-cyber-yellow font-orbitron self-center opacity-40 ${isMobile ? 'text-xs' : 'text-sm'}`}>
        VS
      </div>

      {/* AI Score */}
      <motion.div
        key={`ai-${aiScore}`}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className={`font-orbitron text-cyber-magenta opacity-50 mb-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
          AI
        </div>
        <div className={`neon-magenta font-orbitron font-black ${isMobile ? 'text-2xl' : 'text-4xl'}`} style={{ textShadow: '0 0 20px #FF00E5' }}>
          {aiScore}
        </div>
      </motion.div>
    </div>
  );
}