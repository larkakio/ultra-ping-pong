'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

export function useFarcasterSDK() {
  const { address } = useAccount();
  const [isSDKLoaded, setIsSDKLoaded] = useState(true);

  useEffect(() => {
    setIsSDKLoaded(true);
  }, []);

  const shareScore = (playerScore: number, aiScore: number) => {
    const text = encodeURIComponent(
      `Ultra Ping Pong — Player ${playerScore} : AI ${aiScore}\n${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    window.open(`https://warpcast.com/~/compose?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return {
    isSDKLoaded,
    context: address
      ? { user: { displayName: `${address.slice(0, 6)}…${address.slice(-4)}` } }
      : null,
    openUrl: (url: string) => window.open(url, '_blank', 'noopener,noreferrer'),
    shareToFarcaster: (url: string) => window.open(url, '_blank', 'noopener,noreferrer'),
    shareScore,
  };
}
