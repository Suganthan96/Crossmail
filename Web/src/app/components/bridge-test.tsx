'use client';

import { BridgeButton } from '@avail-project/nexus-widgets';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';

export function BridgeTest() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ConnectKitButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h1 className="text-2xl font-bold">Test Cross-Chain Bridge</h1>
      
      
      <BridgeButton
        prefill={{
          chainId: 421614, // Arbitrum Sepolia (testnet)
          token: 'USDC',
          amount: '1', // 1 USDC
        }}
      >
        {({ onClick, isLoading }) => (
          <button
            onClick={onClick}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Bridging...' : 'Bridge 1 USDC to Arbitrum Sepolia'}
          </button>
        )}
      </BridgeButton>

      <p className="text-sm text-gray-600">
        This will bridge USDC from your current chain to Arbitrum Sepolia testnet
      </p>
    </div>
  );
}