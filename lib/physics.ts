import { GAME_CONFIG } from './constants';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  speed: number;
}

// Get viewport dimensions for physics
export function getCanvasDimensions() {
  if (typeof window === 'undefined') {
    return { width: 600, height: 900 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function checkPaddleCollision(ball: Ball, paddle: Paddle): boolean {
  return (
    ball.x - ball.size / 2 < paddle.x + paddle.width &&
    ball.x + ball.size / 2 > paddle.x &&
    ball.y - ball.size / 2 < paddle.y + paddle.height &&
    ball.y + ball.size / 2 > paddle.y
  );
}

export function calculateBounceAngle(
  ball: Ball,
  paddle: Paddle
): { vx: number; vy: number } {
  // Calculate relative intersection (-1 to 1)
  // For vertical orientation: paddles are horizontal, so use x coordinate
  // Clamp to avoid extreme angles
  const relativeIntersect = Math.max(-1, Math.min(1, 
    (paddle.x + paddle.width / 2 - ball.x) / (paddle.width / 2)
  ));
  
  // Maximum bounce angle (60 degrees)
  const maxAngle = Math.PI / 3;
  const bounceAngle = relativeIntersect * maxAngle;
  
  // Determine direction based on which paddle (top or bottom)
  const { height } = getCanvasDimensions();
  const direction = ball.y < height / 2 ? 1 : -1;
  
  // Increase speed slightly
  const newSpeed = Math.min(
    ball.speed + GAME_CONFIG.BALL_SPEED_INCREMENT,
    GAME_CONFIG.BALL_MAX_SPEED
  );
  
  // Calculate new velocity components
  const newVx = newSpeed * Math.sin(bounceAngle);
  const newVy = direction * newSpeed * Math.cos(bounceAngle);
  
  // Ensure minimum velocity to prevent getting stuck
  const minVel = 0.5;
  return {
    vx: Math.abs(newVx) < minVel ? (newVx > 0 ? minVel : -minVel) : newVx,
    vy: Math.abs(newVy) < minVel ? (newVy > 0 ? minVel : -minVel) : newVy,
  };
}

export function checkWallCollision(ball: Ball): boolean {
  // For vertical orientation: walls are left and right
  const { width } = getCanvasDimensions();
  return ball.x - ball.size / 2 <= 0 || ball.x + ball.size / 2 >= width;
}

export function checkGoal(ball: Ball): 'player' | 'ai' | null {
  // For vertical orientation: goals are top and bottom
  // Player defends bottom, AI defends top
  // If ball passes top edge → player scored (AI missed) → player gets point
  // If ball passes bottom edge → AI scored (player missed) → AI gets point
  const { height } = getCanvasDimensions();
  if (ball.y - ball.size / 2 <= 0) return 'player'; // Ball passed top → player scored
  if (ball.y + ball.size / 2 >= height) return 'ai'; // Ball passed bottom → AI scored
  return null;
}

export function resetBall(fromPaddle?: 'player' | 'ai'): Ball {
  const { width, height } = getCanvasDimensions();
  
  // If no paddle specified, randomly choose
  const servingPaddle = fromPaddle || (Math.random() < 0.5 ? 'player' : 'ai');
  
  // Start from center horizontally, at the edge of the serving paddle
  const startX = width / 2;
  const startY = servingPaddle === 'player' 
    ? height - GAME_CONFIG.PADDLE_HEIGHT - GAME_CONFIG.BALL_SIZE / 2 - 1 // Just above player paddle (at bottom)
    : GAME_CONFIG.PADDLE_HEIGHT + GAME_CONFIG.BALL_SIZE / 2 + 1; // Just below AI paddle (at top)
  
  // Angle towards center (slightly random, but more controlled)
  const angle = (Math.random() - 0.5) * Math.PI / 4; // -45 to 45 degrees
  
  // Direction based on serving paddle
  const vyDirection = servingPaddle === 'player' ? -1 : 1; // Up from player, down from AI
  const vxDirection = (Math.random() - 0.5) > 0 ? 1 : -1; // Random horizontal direction
  
  // Ensure minimum velocity components
  const vx = vxDirection * GAME_CONFIG.BALL_INITIAL_SPEED * Math.cos(angle);
  const vy = vyDirection * GAME_CONFIG.BALL_INITIAL_SPEED * Math.sin(angle);
  
  return {
    x: startX,
    y: startY,
    vx: Math.abs(vx) < 1 ? (vxDirection * 1.5) : vx, // Ensure minimum horizontal speed
    vy: Math.abs(vy) < 1 ? (vyDirection * 1.5) : vy, // Ensure minimum vertical speed
    size: GAME_CONFIG.BALL_SIZE,
    speed: GAME_CONFIG.BALL_INITIAL_SPEED,
  };
}