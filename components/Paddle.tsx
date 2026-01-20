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
  return (
    <div
      className="absolute rounded-sm transition-all duration-75"
      style={{
        left: `${paddle.x}px`,
        top: `${paddle.y}px`,
        width: `${paddle.width}px`,
        height: `${paddle.height}px`,
        backgroundColor: color,
        boxShadow: `
          0 0 10px ${glowColor},
          0 0 20px ${glowColor},
          0 0 30px ${glowColor},
          inset 0 0 10px ${glowColor}
        `,
        border: `2px solid ${color}`,
      }}
    />
  );
}