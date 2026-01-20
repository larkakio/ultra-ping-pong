'use client';

import { useState, useEffect } from 'react';
import { Ball as BallType } from '@/lib/physics';

interface BallProps {
  ball: BallType;
  scale: number;
}

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

export default function Ball({ ball, scale }: BallProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  useEffect(() => {
    // Add current position to trail
    setTrail((prev) => {
      const newTrail = [
        { x: ball.x, y: ball.y, opacity: 1 },
        ...prev.map((p) => ({ ...p, opacity: p.opacity * 0.6 })),
      ].slice(0, 5); // Keep max 5 trail points
      return newTrail;
    });
  }, [ball.x, ball.y]);

  // Use absolute pixel positions (ball positions are already in viewport coordinates)
  return (
    <>
      {/* Trail */}
      {trail.slice(1).map((point, i) => (
        <div
          key={`trail-${i}-${Math.round(point.x)}-${Math.round(point.y)}`}
          className="absolute rounded-full"
          style={{
            left: `${point.x - ball.size / 2}px`,
            top: `${point.y - ball.size / 2}px`,
            width: `${ball.size}px`,
            height: `${ball.size}px`,
            backgroundColor: '#FFFC00',
            opacity: point.opacity * 0.3,
            boxShadow: `0 0 ${point.opacity * 20}px #FFFC00`,
          }}
        />
      ))}
      
      {/* Ball */}
      <div
        className="absolute rounded-full ball"
        style={{
          left: `${ball.x - ball.size / 2}px`,
          top: `${ball.y - ball.size / 2}px`,
          width: `${ball.size}px`,
          height: `${ball.size}px`,
          backgroundColor: '#FFFC00',
          boxShadow: `
            0 0 10px #FFFC00,
            0 0 20px #FFFC00,
            0 0 30px #FFFC00,
            0 0 40px #FFFC00
          `,
          zIndex: 15, // Ensure ball is above background but below paddles
          willChange: 'left, top', // Optimize for animation
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      />
    </>
  );
}