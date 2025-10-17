'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, base, arbitrum, optimism } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { NexusProvider } from '@avail-project/nexus-widgets';

const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, base, arbitrum, optimism],
    transports: {
      [mainnet.id]: http(),
      [base.id]: http(),
      [arbitrum.id]: http(),
      [optimism.id]: http(),
    },
    walletConnectProjectId: '7a6e6a1f7934519391a590f1b17504df', // Get from https://cloud.walletconnect.com
    appName: 'Nexus Test',
  })
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <NexusProvider
            config={{
              network: 'testnet', // Start with testnet!
              debug: true, // See what's happening
            }}
          >
            {children}
          </NexusProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}