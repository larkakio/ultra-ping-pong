"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { WrongNetworkBanner } from "@/components/WrongNetworkBanner";
import { wagmiConfig } from "./wagmi.config";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WrongNetworkBanner />
        {children}
        <DailyCheckIn />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
