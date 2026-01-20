import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '@/lib/constants';
import { Ball, Paddle, checkPaddleCollision, calculateBounceAngle, checkWallCollision, checkGoal, resetBall } from '@/lib/physics';

interface GameState {
  ball: Ball;
  playerPaddle: Paddle;
  aiPaddle: Paddle;
  playerScore: number;
  aiScore: number;
  isPlaying: boolean;
  gameOver: boolean;
  winner: 'player' | 'ai' | null;
}

export function useGameLoop(
  getAIPaddleX: (currentX: number) => number,
  soundEffects: {
    playPaddleHit: () => void;
    playWallBounce: () => void;
    playScore: () => void;
    playGameOver: () => void;
  }
) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const canvasWidth = typeof window !== 'undefined' ? window.innerWidth : 600;
    const canvasHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
    
    return {
      ball: resetBall(),
      playerPaddle: {
        // Player at bottom edge, horizontal paddle - larger offset from bottom to ensure visibility
        // Account for safe area on mobile devices (home indicator, notch, etc.)
        x: canvasWidth / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
        y: Math.max(0, canvasHeight - GAME_CONFIG.PADDLE_HEIGHT - 30), // Offset 30px from bottom for better visibility
        width: GAME_CONFIG.PADDLE_WIDTH,
        height: GAME_CONFIG.PADDLE_HEIGHT,
      },
      aiPaddle: {
        // AI at top edge, horizontal paddle
        x: canvasWidth / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
        y: 0, // At the very top
        width: GAME_CONFIG.PADDLE_WIDTH,
        height: GAME_CONFIG.PADDLE_HEIGHT,
      },
      playerScore: 0,
      aiScore: 0,
      isPlaying: false,
      gameOver: false,
      winner: null,
    };
  });

  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const playerDirectionRef = useRef<number>(0);

  const startGame = useCallback(() => {
    // Randomly choose which paddle serves
    const servingPaddle = Math.random() < 0.5 ? 'player' : 'ai';
    
    setGameState((prev) => {
      const canvasWidth = typeof window !== 'undefined' ? window.innerWidth : 600;
      const canvasHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
      
      return {
        ...prev,
        isPlaying: true,
        gameOver: false,
        winner: null,
        playerScore: 0,
        aiScore: 0,
        ball: resetBall(servingPaddle),
        playerPaddle: {
          ...prev.playerPaddle,
          x: canvasWidth / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
          y: Math.max(0, canvasHeight - GAME_CONFIG.PADDLE_HEIGHT - 30), // Offset 30px from bottom
        },
        aiPaddle: {
          ...prev.aiPaddle,
          x: canvasWidth / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
          y: 0,
        },
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    const canvasWidth = typeof window !== 'undefined' ? window.innerWidth : 600;
    const canvasHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
    
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      gameOver: false,
      winner: null,
      playerScore: 0,
      aiScore: 0,
      ball: resetBall(),
      playerPaddle: {
        ...prev.playerPaddle,
        x: canvasWidth / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
        y: Math.max(0, canvasHeight - GAME_CONFIG.PADDLE_HEIGHT - 30), // Offset 30px from bottom
      },
      aiPaddle: {
        ...prev.aiPaddle,
        x: canvasWidth / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
        y: 0,
      },
    }));
  }, []);

  const setPlayerDirection = useCallback((direction: number) => {
    playerDirectionRef.current = direction;
  }, []);

  const gameLoop = useCallback(
    (currentTime: number) => {
      // Always request next frame for smooth loop
      animationFrameRef.current = requestAnimationFrame((t) => gameLoop(t));
      
      // Get current state from ref to avoid stale closures
      setGameState((prevState) => {
        // Check if game should be stopped
        if (!prevState.isPlaying || prevState.gameOver) {
          return prevState; // Return unchanged state
        }

        // Use fixed timestep for consistent physics
        const deltaTime = currentTime - lastTimeRef.current;
        if (deltaTime < 1000 / GAME_CONFIG.TARGET_FPS) {
          return prevState; // Return unchanged state
        }

        lastTimeRef.current = currentTime;

        let newBall = { ...prevState.ball };
        let newPlayerPaddle = { ...prevState.playerPaddle };
        let newAiPaddle = { ...prevState.aiPaddle };
        let newPlayerScore = prevState.playerScore;
        let newAiScore = prevState.aiScore;
        let newGameOver: boolean = prevState.gameOver;
        let newWinner: 'player' | 'ai' | null = prevState.winner;

        // Get canvas dimensions once
        const canvasWidth = typeof window !== 'undefined' ? window.innerWidth : 600;
        const canvasHeight = typeof window !== 'undefined' ? window.innerHeight : 900;

        // Update player paddle (horizontal movement in vertical orientation)
        const playerMovement = playerDirectionRef.current * GAME_CONFIG.PADDLE_SPEED;
        newPlayerPaddle.x = Math.max(
          0,
          Math.min(
            newPlayerPaddle.x + playerMovement,
            canvasWidth - newPlayerPaddle.width
          )
        );
        // Ensure player paddle stays at bottom with proper offset (30px from bottom)
        newPlayerPaddle.y = Math.max(0, canvasHeight - GAME_CONFIG.PADDLE_HEIGHT - 30);

        // Update AI paddle (horizontal movement)
        newAiPaddle.x = getAIPaddleX(newAiPaddle.x);
        
        // Move ball
        newBall.x += newBall.vx;
        newBall.y += newBall.vy;
        
        // Track if we've handled a collision to prevent multiple bounces
        let collisionHandled = false;
        
        // Check paddle collisions FIRST (most important)
        if (checkPaddleCollision(newBall, newPlayerPaddle)) {
          const bounce = calculateBounceAngle(newBall, newPlayerPaddle);
          newBall.vx = bounce.vx;
          newBall.vy = -Math.abs(bounce.vy); // Always bounce up from player paddle (at bottom)
          newBall.speed = Math.sqrt(newBall.vx ** 2 + newBall.vy ** 2);
          // Position ball above paddle to prevent sticking
          newBall.y = newPlayerPaddle.y - newBall.size / 2 - 1;
          soundEffects.playPaddleHit();
          collisionHandled = true;
        } else if (checkPaddleCollision(newBall, newAiPaddle)) {
          const bounce = calculateBounceAngle(newBall, newAiPaddle);
          newBall.vx = bounce.vx;
          newBall.vy = Math.abs(bounce.vy); // Always bounce down from AI paddle (at top)
          newBall.speed = Math.sqrt(newBall.vx ** 2 + newBall.vy ** 2);
          // Position ball below paddle to prevent sticking
          newBall.y = newAiPaddle.y + newAiPaddle.height + newBall.size / 2 + 1;
          soundEffects.playPaddleHit();
          collisionHandled = true;
        }
        
        // Check left/right wall collisions (only if no paddle collision)
        if (!collisionHandled) {
          if (newBall.x - newBall.size / 2 <= 0) {
            newBall.vx = Math.abs(newBall.vx); // Bounce right
            newBall.x = newBall.size / 2; // Position at left edge
            soundEffects.playWallBounce();
          } else if (newBall.x + newBall.size / 2 >= canvasWidth) {
            newBall.vx = -Math.abs(newBall.vx); // Bounce left
            newBall.x = canvasWidth - newBall.size / 2; // Position at right edge
            soundEffects.playWallBounce();
          }
        }

        // Check for goals (after all collisions)
        const goal = checkGoal(newBall);
        if (goal === 'player') {
          // Player scored (ball passed top edge)
          newPlayerScore++;
          soundEffects.playScore();
          // Reset ball served by AI (opponent of scorer)
          newBall = resetBall('ai');
          
          if (newPlayerScore >= GAME_CONFIG.WINNING_SCORE) {
            newGameOver = true;
            newWinner = 'player';
            soundEffects.playGameOver();
          }
        } else if (goal === 'ai') {
          // AI scored (ball passed bottom edge)
          newAiScore++;
          soundEffects.playScore();
          // Reset ball served by player (opponent of scorer)
          newBall = resetBall('player');
          
          if (newAiScore >= GAME_CONFIG.WINNING_SCORE) {
            newGameOver = true;
            newWinner = 'ai';
            soundEffects.playGameOver();
          }
        }

        return {
          ...prevState,
          ball: newBall,
          playerPaddle: newPlayerPaddle,
          aiPaddle: newAiPaddle,
          playerScore: newPlayerScore,
          aiScore: newAiScore,
          gameOver: newGameOver,
          winner: newWinner,
          isPlaying: !newGameOver,
        };
      });
    },
    [getAIPaddleX, soundEffects]
  );

  useEffect(() => {
    // Always start the game loop for smooth animation
    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame((t) => gameLoop(t));

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  return {
    gameState,
    startGame,
    resetGame,
    setPlayerDirection,
  };
}