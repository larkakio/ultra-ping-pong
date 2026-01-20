import { useState, useEffect, useRef } from 'react';
import { GAME_CONFIG } from '@/lib/constants';
import { Ball, Paddle } from '@/lib/physics';

export function useAI(ballRef: React.MutableRefObject<Ball | null> | Ball, aiPaddle: Paddle, initialIsPlaying: boolean) {
  const getInitialTarget = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth / 2;
    }
    return 300; // Default center
  };
  const [targetX, setTargetX] = useState(getInitialTarget());
  const [isPlaying, setIsPlaying] = useState(initialIsPlaying);
  const lastUpdateRef = useRef(0);
  const ballRefObj = useRef<Ball | null>(null);

  // Handle both ref and direct ball prop - update on every render
  if ('current' in ballRef && ballRef.current) {
    ballRefObj.current = ballRef.current;
  } else if (!('current' in ballRef)) {
    ballRefObj.current = ballRef as Ball;
  }

  // Update isPlaying state when prop changes
  useEffect(() => {
    setIsPlaying(initialIsPlaying);
  }, [initialIsPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const updateAI = () => {
      const ball = ('current' in ballRef) ? ballRef.current : (ballRef as Ball);
      if (!ball) return;
      
      const now = Date.now();
      
      // Only update target with reaction delay
      if (now - lastUpdateRef.current > GAME_CONFIG.AI_REACTION_DELAY) {
        // Only track ball if it's moving towards AI (upward in vertical orientation)
        if (ball.vy < 0) {
          // Add random error for imperfection
          const error = (Math.random() - 0.5) * GAME_CONFIG.AI_ERROR_MARGIN;
          setTargetX(ball.x + error);
        }
        lastUpdateRef.current = now;
      }
    };

    const interval = setInterval(updateAI, 16); // ~60fps
    return () => clearInterval(interval);
  }, [isPlaying, ballRef]);

  // Calculate AI paddle movement (horizontal movement in vertical orientation)
  const getAIPaddleX = (currentX: number): number => {
    const paddleCenter = currentX + aiPaddle.width / 2;
    const diff = targetX - paddleCenter;
    
    if (Math.abs(diff) < 2) return currentX;
    
    const speed = GAME_CONFIG.PADDLE_SPEED * GAME_CONFIG.AI_SPEED_MULTIPLIER;
    const movement = diff > 0 ? speed : -speed;
    
    const newX = currentX + movement;
    
    // Keep within bounds
    const canvasWidth = typeof window !== 'undefined' ? window.innerWidth : 600;
    return Math.max(
      0,
      Math.min(newX, canvasWidth - aiPaddle.width)
    );
  };

  return { getAIPaddleX, setIsPlaying };
}