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
  
  const { gameState, startGame, pauseGame, resetGame, setPlayerDirection } = useGameLoop(
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
      // Handle pause/resume with SPACE
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        if (!gameState.isPlaying) {
          startGame();
        } else {
          pauseGame(); // Toggle pause state
        }
        return;
      }
      
      // Handle paddle movement
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerDirection(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerDirection(1);
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
  }, [gameState.isPlaying, setPlayerDirection, startGame, pauseGame]);

  // Touch controls with double tap for pause
  const lastTapRef = useRef<number>(0);
  const lastTapXRef = useRef<number>(0);
  const lastTapYRef = useRef<number>(0);

  const handleTouch = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Handle double tap for pause on mobile
    if (isMobile && gameState.isPlaying && !gameState.gameOver && !gameState.isPaused) {
      const now = Date.now();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      // Check for double tap (within 300ms and 50px distance)
      if (now - lastTapRef.current < 300 && 
          Math.abs(clientX - lastTapXRef.current) < 50 &&
          Math.abs(clientY - lastTapYRef.current) < 50) {
        e.preventDefault();
        e.stopPropagation();
        pauseGame();
        lastTapRef.current = 0; // Reset to prevent triple tap
        return;
      }
      
      lastTapRef.current = now;
      lastTapXRef.current = clientX;
      lastTapYRef.current = clientY;
    }
    
    // Handle resume on double tap when paused
    if (isMobile && gameState.isPaused) {
      const now = Date.now();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      if (now - lastTapRef.current < 300 && 
          Math.abs(clientX - lastTapXRef.current) < 50 &&
          Math.abs(clientY - lastTapYRef.current) < 50) {
        e.preventDefault();
        e.stopPropagation();
        pauseGame(); // Toggle pause to resume
        lastTapRef.current = 0;
        return;
      }
      
      lastTapRef.current = now;
      lastTapXRef.current = clientX;
      lastTapYRef.current = clientY;
      return; // Don't move paddle when paused
    }

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
  }, [gameState.isPlaying, gameState.gameOver, gameState.isPaused, isMobile, startGame, pauseGame, setPlayerDirection]);

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

        {/* Start/Pause Overlay */}
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

        {/* Pause Overlay */}
        {gameState.isPaused && (
          <div className="absolute inset-0 bg-cyber-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center space-y-6">
              <div className={`neon-yellow font-orbitron font-black ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                PAUSED
              </div>
              <button
                onClick={() => pauseGame()}
                className={`neon-box-yellow px-8 py-4 rounded-lg font-orbitron font-bold
                         text-cyber-yellow hover:bg-cyber-yellow/20 transition-all duration-300
                         min-h-[44px] ${isMobile ? 'text-lg' : 'text-xl'}`}
              >
                RESUME
              </button>
              <div className={`text-cyber-cyan/50 font-orbitron ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile ? 'Tap RESUME or double tap to continue' : 'Press SPACE to resume'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {gameState.isPlaying && !gameState.gameOver && (
        <div className={`absolute left-1/2 transform -translate-x-1/2 text-center ${isMobile ? 'bottom-2' : 'bottom-4'}`}>
          <div className={`text-cyber-cyan/50 font-orbitron ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {gameState.isPaused 
              ? (isMobile ? 'Double tap to resume' : 'Press SPACE to resume')
              : (isMobile ? 'Double tap to pause' : 'Press SPACE to pause')
            }
          </div>
        </div>
      )}

      {/* Pause Button for Mobile */}
      {isMobile && gameState.isPlaying && !gameState.gameOver && !gameState.isPaused && (
        <button
          onClick={() => pauseGame()}
          className="fixed bottom-20 right-4 z-50 px-4 py-3 rounded-lg
                     bg-cyber-dark/80 border-2 border-cyber-yellow text-cyber-yellow
                     font-orbitron font-bold text-sm
                     hover:bg-cyber-yellow/20 transition-all duration-300
                     min-h-[44px] min-w-[80px]
                     neon-box-yellow"
          aria-label="Pause game"
        >
          ⏸ PAUSE
        </button>
      )}
      
      {/* Sound Toggle */}
      <SoundToggle
        isEnabled={soundEffects.isEnabled}
        onToggle={() => soundEffects.setIsEnabled(!soundEffects.isEnabled)}
      />
    </div>
  );
}