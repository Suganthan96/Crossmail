'use client';

import React from 'react';
import { BridgeButton,BridgeAndExecuteButton, TransferButton, TOKEN_METADATA,TOKEN_CONTRACT_ADDRESSES  } from '@avail-project/nexus-widgets';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useNexus } from '@avail-project/nexus-widgets';
import { CardSpotlight } from '@/components/ui/card-spotlight';


export function BridgeTest() {
  const { isConnected } = useAccount();
  const { isSdkInitialized, sdk } = useNexus();


  React.useEffect(() => {
    if (sdk && isSdkInitialized) {
      console.log('Available TOKEN_METADATA:', TOKEN_METADATA);
      console.log('Available TOKEN_CONTRACT_ADDRESSES:', TOKEN_CONTRACT_ADDRESSES);
      console.log('USDC on Arbitrum (42161):', TOKEN_CONTRACT_ADDRESSES['USDC']?.[42161]);
      console.log('ETH on Arbitrum (42161):', TOKEN_CONTRACT_ADDRESSES['ETH']?.[42161]);
      console.log('Available tokens:', Object.keys(TOKEN_METADATA));
    }
  }, [sdk, isSdkInitialized]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ConnectKitButton />
      </div>
    );
  }

  if (!isSdkInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Nexus SDK...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we set up the cross-chain bridge</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen gap-8 p-8">
      {/* Left Container - Send 1 USDC Card */}
      <div className="flex-1 flex items-center justify-center">
        <CardSpotlight className="w-full max-w-md" radius={400} color="#5B47DB">
          <div className="w-full">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Transfer USDC</h3>
            <p className="text-white/70 text-sm mb-6 text-center">Send USDC tokens across chains instantly</p>
            <TransferButton
              prefill={{
                chainId: 11155420, 
                token: 'USDC',
                amount: '1',
                recipient: '0x0754241982730db1ecf4a2c5e7839c1467f13c5e', 
              }}
            >
              {({ onClick, isLoading }) => (
                <button onClick={onClick} disabled={isLoading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  {isLoading ? 'Sending…' : 'Send 1 USDC'}
                </button>
              )}
            </TransferButton>
          </div>
        </CardSpotlight>
      </div>

      {/* Right Container - Bridge & Supply to Aave Card */}
      <div className="flex-1 flex items-center justify-center">
        <CardSpotlight className="w-full max-w-md" radius={400} color="#5B47DB">
          <div className="w-full">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Supply to Aave</h3>
            <p className="text-white/70 text-sm mb-6 text-center">Bridge and supply tokens to Aave protocol</p>
            <BridgeAndExecuteButton
              contractAddress="0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff" 
              contractAbi={
                [
                  {
                    name: 'supply',
                    type: 'function',
                    stateMutability: 'nonpayable',
                    inputs: [
                      { name: 'asset', type: 'address' },
                      { name: 'amount', type: 'uint256' },
                      { name: 'onBehalfOf', type: 'address' },
                      { name: 'referralCode', type: 'uint16' },
                    ],
                    outputs: [],
                  },
                ] as const
              }
              functionName="supply"
              buildFunctionParams={(token, amount, chainId, userAddress) => {
                const decimals = TOKEN_METADATA[token].decimals;
                const amountWei = parseUnits(amount, decimals);
                const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
                return {
                  functionParams: [tokenAddress, amountWei, userAddress, 0],
                };
              }}
              prefill={{ toChainId: 421614, token: 'USDC' }}
            >
              {({ onClick, isLoading, disabled }) => (
                <button onClick={onClick} disabled={isLoading || disabled}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  {isLoading ? 'Processing…' : 'Bridge & Supply to Aave'}
                </button>
              )}
            </BridgeAndExecuteButton>
          </div>
        </CardSpotlight>
      </div>
    </div>
  );
}	