"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { useState } from "react";
import type { State } from "wagmi";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi-config";

type Props = {
  children: ReactNode;
  initialState: State | undefined;
};

export function Providers({ children, initialState }: Props) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools buttonPosition="bottom-left" />
        ) : null}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
