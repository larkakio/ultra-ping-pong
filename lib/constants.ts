export const GAME_CONFIG = {
  // Canvas Dimensions - Base dimensions for scaling (actual size uses viewport)
  CANVAS_WIDTH: 600, // Base width for scaling calculations
  CANVAS_HEIGHT: 900, // Base height for scaling calculations
  
  // Paddle - Horizontal for vertical orientation
  PADDLE_WIDTH: 100, // Horizontal width
  PADDLE_HEIGHT: 12, // Horizontal height (thickness)
  PADDLE_SPEED: 8,
  PADDLE_OFFSET: 0, // At the very edge of screen (top/bottom)
  
  // Ball
  BALL_SIZE: 12,
  BALL_INITIAL_SPEED: 9, // Significantly increased for faster gameplay
  BALL_MAX_SPEED: 18, // Maximum speed increased
  BALL_SPEED_INCREMENT: 0.5, // Speed increment per hit
  
  // AI
  AI_REACTION_DELAY: 80, // ms
  AI_ERROR_MARGIN: 25, // px random offset
  AI_SPEED_MULTIPLIER: 0.85, // Slightly slower than ball
  
  // Scoring
  WINNING_SCORE: 11,
  
  // Colors
  COLORS: {
    PLAYER_PADDLE: '#00F0FF', // cyan
    AI_PADDLE: '#FF00E5', // magenta
    BALL: '#FFFC00', // yellow
    BACKGROUND: '#0A0E27',
    GRID: '#1A1F3A',
    CENTER_LINE: '#00F0FF',
  },
  
  // FPS
  TARGET_FPS: 60,
};