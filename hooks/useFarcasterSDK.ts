import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const load = async () => {
      // Check for Farcaster SDK - it's injected by Farcaster clients
      if (typeof window !== 'undefined' && window.farcaster) {
        try {
          const ctx = await window.farcaster.context;
          setContext(ctx);
          // CRITICAL: Signal that the app is ready - this keeps it in Farcaster app
          window.farcaster.actions.ready();
          setIsSDKLoaded(true);
        } catch (error) {
          // Silently handle errors - SDK might not be available in all contexts
          console.log('Farcaster SDK not available in this context');
        }
      }
    };
    
    // Try loading immediately
    load();
    
    // Also try after a short delay in case SDK loads asynchronously
    const timer = setTimeout(load, 500);
    
    // Poll for SDK availability (Farcaster might inject it later)
    const pollInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.farcaster && !isSDKLoaded) {
        load();
      }
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(pollInterval);
    };
  }, [isSDKLoaded]);

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