import { useState, useEffect, useRef } from 'react';

export function useSound(enabled: boolean) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.log('Web Audio API not supported');
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playBeep = (frequency: number, duration: number, type: 'sine' | 'square' = 'sine') => {
    if (!isEnabled || !audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const playPaddleHit = () => {
    playBeep(440, 0.05, 'square');
  };

  const playWallBounce = () => {
    playBeep(880, 0.03, 'square');
  };

  const playScore = () => {
    // Arpeggiated chord C-E-G
    playBeep(523.25, 0.1, 'sine'); // C
    setTimeout(() => playBeep(659.25, 0.1, 'sine'), 50); // E
    setTimeout(() => playBeep(783.99, 0.1, 'sine'), 100); // G
  };

  const playGameOver = () => {
    // Dramatic descent
    let freq = 880;
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        playBeep(freq, 0.05, 'sine');
      }, i * 50);
      freq *= 0.9;
    }
  };

  return {
    isEnabled,
    setIsEnabled,
    playPaddleHit,
    playWallBounce,
    playScore,
    playGameOver,
  };
}