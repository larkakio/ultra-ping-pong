'use client';

import { Paddle as PaddleType } from '@/lib/physics';

interface PaddleProps {
  paddle: PaddleType;
  color: string;
  glowColor: string;
  scale: number;
}

export default function Paddle({ paddle, color, glowColor, scale }: PaddleProps) {
  // Use absolute pixel positions (paddle positions are already in viewport coordinates)
  // Remove transition for smoother, more responsive movement
  return (
    <div
      className="absolute rounded-sm paddle"
      style={{
        left: `${paddle.x}px`,
        top: `${paddle.y}px`,
        width: `${paddle.width}px`,
        height: `${paddle.height}px`,
        backgroundColor: color,
        boxShadow: `
          0 0 20px ${glowColor},
          0 0 40px ${glowColor},
          0 0 60px ${glowColor},
          0 0 80px ${glowColor},
          inset 0 0 20px ${glowColor}
        `,
        border: `4px solid ${color}`,
        zIndex: 30, // Higher z-index to ensure paddles are always visible above everything
        willChange: 'left, top', // Optimize for animation
        transform: 'translateZ(0)', // Force GPU acceleration
        pointerEvents: 'none', // Allow clicks to pass through to game canvas
        // Ensure paddle is always visible with strong glow
        opacity: 1,
        // Ensure paddle stays within viewport
        position: 'absolute',
      }}
    />
  );
}