"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";
import { WagmiProvider, createConfig, http, createStorage } from "wagmi";
import { base, mainnet, localhost } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Create a no-op storage for SSR
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const config = createConfig({
  chains: [localhost, mainnet, base],
  connectors: [injected()],
  transports: {
    [localhost.id]: http(),
    [mainnet.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : noopStorage,
  }),
});

export function QueryProvider(props: PropsWithChildren) {
  const [client] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>{props.children}</QueryClientProvider>
    </WagmiProvider>
  );
}
