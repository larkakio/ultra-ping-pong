'use client';

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { GAME_CONFIG } from '@/lib/constants';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useAI } from '@/hooks/useAI';
import { useSound } from '@/hooks/useSound';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { useFarcasterSDK } from '@/hooks/useFarcasterSDK';
import { resetBall, type Ball } from '@/lib/physics';
import Paddle from './Paddle';
import BallComponent from './Ball';
import ScoreBoard from './ScoreBoard';
import GameOver from './GameOver';
import CyberpunkBackground from './CyberpunkBackground';
import SoundToggle from './SoundToggle';

export default function Game() {
  const soundEffects = useSound(true);
  const { canvasWidth, canvasHeight, scale, isMobile } = useResponsiveSize();
  const { isSDKLoaded } = useFarcasterSDK(); // Initialize Farcaster SDK - this calls ready() automatically
  
  // Ensure Farcaster SDK ready() is called early to prevent external browser opening
  useEffect(() => {
    // Call ready() immediately if SDK is available
    if (typeof window !== 'undefined' && window.farcaster?.actions) {
      try {
        window.farcaster.actions.ready();
      } catch (e) {
        // SDK might not be ready yet
      }
    }
  }, [isSDKLoaded]);
  
  // Use refs to track current game state for AI
  const gameStateRef = useRef<any>(null);
  const ballRef = useRef<Ball | null>(null);
  
  // Use actual viewport dimensions for physics
  const physicsWidth = typeof window !== 'undefined' ? window.innerWidth : 600;
  const physicsHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
  
  const initialAiPaddle = useMemo(() => ({
    x: physicsWidth / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
    y: 0, // At the very top
    width: GAME_CONFIG.PADDLE_WIDTH,
    height: GAME_CONFIG.PADDLE_HEIGHT,
  }), [physicsWidth]);
  
  const aiHook = useAI(ballRef, initialAiPaddle, false);
  
  // Create AI function that uses current game state
  const getAIPaddleX = useCallback((currentX: number) => {
    if (!gameStateRef.current?.isPlaying) return currentX;
    return aiHook.getAIPaddleX(currentX);
  }, [aiHook]);
  
  const { gameState, startGame, resetGame, setPlayerDirection } = useGameLoop(
    getAIPaddleX,
    soundEffects
  );
  
  // Update refs when game state changes
  useEffect(() => {
    gameStateRef.current = gameState;
    ballRef.current = gameState.ball;
    // Update AI hook playing state
    aiHook.setIsPlaying(gameState.isPlaying);
  }, [gameState, aiHook]);

  // Keyboard controls - Left/Right for vertical orientation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle paddle movement
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerDirection(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerDirection(1);
      } else if (e.key === ' ' || e.key === 'Space') {
        // Space to start game if not playing
        if (!gameState.isPlaying) {
          e.preventDefault();
          startGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' ||
          e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerDirection(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying, setPlayerDirection, startGame]);

  // Touch controls - simplified without pause
  const handleTouch = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!gameState.isPlaying) {
      startGame();
      return;
    }

    // Normal paddle movement
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const canvasRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const canvasCenterX = canvasRect.left + canvasRect.width / 2;
    const direction = clientX < canvasCenterX ? -1 : 1;
    setPlayerDirection(direction);
  }, [gameState.isPlaying, startGame, setPlayerDirection]);

  const handleTouchEnd = useCallback(() => {
    setPlayerDirection(0);
  }, [setPlayerDirection]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-cyber-bg">
      <CyberpunkBackground />
      
      {/* Game Canvas - Full Screen */}
      <div
        className="relative border-0
                   neon-box-cyan bg-cyber-dark/50"
        style={{
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
        }}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouch}
        onMouseUp={handleTouchEnd}
      >
        {/* Score Board */}
        <ScoreBoard
          playerScore={gameState.playerScore}
          aiScore={gameState.aiScore}
          scale={scale}
          isMobile={isMobile}
        />

        {/* Player Paddle - At bottom */}
        <Paddle
          paddle={gameState.playerPaddle}
          color={GAME_CONFIG.COLORS.PLAYER_PADDLE}
          glowColor={GAME_CONFIG.COLORS.PLAYER_PADDLE}
          scale={scale}
        />
        {/* AI Paddle - At top */}
        <Paddle
          paddle={gameState.aiPaddle}
          color={GAME_CONFIG.COLORS.AI_PADDLE}
          glowColor={GAME_CONFIG.COLORS.AI_PADDLE}
          scale={scale}
        />

        {/* Ball */}
        <BallComponent ball={gameState.ball} scale={scale} />

        {/* Game Over Overlay */}
        {gameState.gameOver && (
          <GameOver
            winner={gameState.winner!}
            playerScore={gameState.playerScore}
            aiScore={gameState.aiScore}
            isMobile={isMobile}
            onRestart={() => {
              resetGame();
              setTimeout(() => startGame(), 100);
            }}
          />
        )}

        {/* Start Overlay */}
        {!gameState.isPlaying && !gameState.gameOver && (
          <div className="absolute inset-0 bg-cyber-bg/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className={`neon-cyan font-orbitron font-black mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                ULTRA PING PONG
              </div>
              <button
                onClick={startGame}
                className={`neon-box-cyan px-8 py-4 rounded-lg font-orbitron font-bold
                         text-cyber-cyan hover:bg-cyber-cyan/20 transition-all duration-300
                         min-h-[44px] ${isMobile ? 'text-lg' : 'text-xl'}`}
              >
                START GAME
              </button>
              <div className={`text-cyber-yellow font-orbitron opacity-70 mt-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Use Left/Right Arrow Keys or Touch to play
              </div>
            </div>
          </div>
        )}
      </div>

      
      {/* Sound Toggle */}
      <SoundToggle
        isEnabled={soundEffects.isEnabled}
        onToggle={() => soundEffects.setIsEnabled(!soundEffects.isEnabled)}
      />
    </div>
  );
}