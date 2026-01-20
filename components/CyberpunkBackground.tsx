'use client';

import { motion } from 'framer-motion';

export default function CyberpunkBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      {/* Center Line - Horizontal for vertical orientation */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-cyber-cyan opacity-20">
        <motion.div
          className="h-full w-20 bg-cyber-cyan"
          animate={{
            x: [0, 600, 1200, 1800],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            boxShadow: '0 0 20px #00F0FF, 0 0 40px #00F0FF',
          }}
        />
      </div>

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyber-cyan rounded-full"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5,
          }}
          animate={{
            y: [null, Math.random() * 100 + '%'],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
          style={{
            boxShadow: '0 0 10px #00F0FF',
          }}
        />
      ))}

      {/* Scanlines Overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />
    </div>
  );
}