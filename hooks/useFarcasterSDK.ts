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
      // Farcaster SDK is loaded via script tag, available as window.farcaster
      if (typeof window !== 'undefined' && window.farcaster) {
        try {
          const ctx = await window.farcaster.context;
          setContext(ctx);
          window.farcaster.actions.ready(); // КРИТИЧНО - сигналізує готовність
          setIsSDKLoaded(true);
        } catch (error) {
          console.log('Farcaster SDK error:', error);
        }
      } else {
        // SDK not loaded, will use fallback methods
        console.log('Farcaster SDK not available, using fallback methods');
      }
    };
    
    // Wait a bit for script to load if it's being loaded
    const timer = setTimeout(load, 100);
    
    // Also check immediately in case it's already loaded
    load();
    
    return () => clearTimeout(timer);
  }, []);

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