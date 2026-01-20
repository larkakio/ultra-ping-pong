'use client';

import { createContext, useContext, ReactNode } from 'react';

interface Web3ContextType {
  // Placeholder for future Web3 integration
  isConnected: boolean;
  address: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  address: null,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  // Placeholder implementation - ready for Wagmi v2 + OnchainKit integration
  return (
    <Web3Context.Provider
      value={{
        isConnected: false,
        address: null,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}