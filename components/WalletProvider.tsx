"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

const config = createConfig({
  chains: [avalanche, avalancheFuji],
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
  ssr: false,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

