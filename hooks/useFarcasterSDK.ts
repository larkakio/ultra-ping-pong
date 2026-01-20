import { useEffect, useState, useRef } from 'react';

// Type definitions for Farcaster SDK
declare global {
  interface Window {
    farcaster?: {
      context: Promise<any>;
      actions: {
        ready: () => void;
        openUrl: (url: string) => void;
      };
    };
  }
}

export function useFarcasterSDK() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);
  const isSDKLoadedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const load = async () => {
      // Check for Farcaster SDK - it's injected by Farcaster clients
      if (typeof window !== 'undefined' && window.farcaster && mountedRef.current && !isSDKLoadedRef.current) {
        try {
          const ctx = await window.farcaster.context;
          if (mountedRef.current && !isSDKLoadedRef.current) {
            setContext(ctx);
            // CRITICAL: Signal that the app is ready - this keeps it in Farcaster app
            window.farcaster.actions.ready();
            isSDKLoadedRef.current = true;
            setIsSDKLoaded(true);
          }
        } catch (error) {
          // Silently handle errors - SDK might not be available in all contexts
          if (mountedRef.current) {
            console.log('Farcaster SDK not available in this context');
          }
        }
      }
    };
    
    // Try loading immediately - critical for Farcaster to open in-app
    load();
    
    // Also try after short delays - SDK might load asynchronously
    const timer1 = setTimeout(load, 100);
    const timer2 = setTimeout(load, 500);
    
    // Poll for SDK availability (Farcaster might inject it later)
    let pollCount = 0;
    const maxPolls = 10; // Limit polling to prevent infinite loops
    const pollInterval = setInterval(() => {
      pollCount++;
      if (pollCount >= maxPolls || isSDKLoadedRef.current) {
        clearInterval(pollInterval);
        return;
      }
      if (typeof window !== 'undefined' && window.farcaster && mountedRef.current) {
        load();
      }
    }, 1000);
    
    return () => {
      mountedRef.current = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(pollInterval);
    };
  }, []); // Empty dependency array - only run once on mount

  const openUrl = (url: string) => {
    if (isSDKLoaded && typeof window !== 'undefined' && window.farcaster) {
      try {
        window.farcaster.actions.openUrl(url); // НЕ window.open()!
      } catch (error) {
        window.open(url, '_blank');
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const shareScore = async (score: number, opponentScore: number) => {
    const text = `I scored ${score}-${opponentScore} in Ultra Ping Pong! 🎮✨ Can you beat me?`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    
    if (isSDKLoaded && typeof window !== 'undefined' && window.farcaster) {
      try {
        window.farcaster.actions.openUrl(
          `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`
        );
      } catch (error) {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({ title: 'Ultra Ping Pong', text, url });
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(`${text} ${url}`);
          alert('Score copied to clipboard!');
        }
      }
    } else if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: 'Ultra Ping Pong', text, url });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert('Score copied to clipboard!');
    }
  };

  return { isSDKLoaded, context, openUrl, shareScore };
}