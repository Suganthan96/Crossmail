'use client';

import { useState } from 'react';
import { BridgeTest } from './components/bridge-test';
import { WalletBridge } from './components/wallet-bridge';
import { Boxes } from '@/components/ui/background-boxes';
import { EvervaultCard, Icon } from '@/components/ui/evervault-card';
import { TransferButton, BridgeAndExecuteButton, TOKEN_METADATA, TOKEN_CONTRACT_ADDRESSES } from '@avail-project/nexus-widgets';
import { parseUnits } from 'viem';
import { ConnectKitButton } from 'connectkit';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'send' | 'bridge'>('send');

  return (
    <>
      {/* Wallet Bridge - Handles Nexus SDK initialization */}
      <WalletBridge />
      
      <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
        {/* Background Boxes - Fixed position, full screen */}
        <div className="absolute inset-0 w-full h-full bg-slate-900 z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
        <Boxes />

      {/* Header - Crossmail Logo */}
      <header className="relative z-20 p-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Crossmail
          </h1>
          
          {/* Navigation Tabs */}
          <div className="flex gap-4 mt-6">
          <button
            onClick={() => setActiveTab('send')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'send'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Send
          </button>
          <button
            onClick={() => setActiveTab('bridge')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'bridge'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Bridge
          </button>
          </div>
        </div>

        {/* Wallet Connect Button */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden">
          <ConnectKitButton />
        </div>
      </header>

      {/* Content - Two Column Layout */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)] gap-8 px-8">
        {activeTab === 'send' ? (
          <>
            {/* Left Card - Evervault Animation Behind Button */}
            <div className="flex-1 max-w-md">
              <div className="border border-white/20 dark:border-white/[0.2] flex flex-col items-start mx-auto p-8 relative h-[30rem] rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md overflow-hidden">
                <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white z-30" />
                <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white z-30" />
                <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white z-30" />
                <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white z-30" />

                {/* Evervault Card as Background */}
                <div className="absolute inset-0 z-0">
                  <EvervaultCard text="Send" />
                </div>

                {/* Content on top of animation */}
                <div className="relative z-20 flex flex-col h-full justify-center items-center gap-4">
                  <div className="text-center">
                    <h2 className="text-white text-2xl font-bold mb-2">Transfer USDC</h2>
                    <p className="text-white/70 text-sm">
                      Send USDC tokens across chains instantly
                    </p>
                  </div>

                  <TransferButton
                    prefill={{
                      chainId: 11155420,
                      token: 'USDC',
                      amount: '1',
                      recipient: '0x0754241982730db1ecf4a2c5e7839c1467f13c5e',
                    }}
                  >
                    {({ onClick, isLoading }) => (
                      <button
                        onClick={onClick}
                        disabled={isLoading}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative z-10"
                      >
                        {isLoading ? 'Sending…' : 'Send 1 USDC'}
                      </button>
                    )}
                  </TransferButton>
                </div>
              </div>
            </div>

            {/* Right Card - Steps */}
            <div className="flex-1 max-w-md">
              <div className="border border-white/20 dark:border-white/[0.2] flex flex-col items-start mx-auto p-8 relative h-[30rem] rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md">
                <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white" />
                <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white" />
                <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white" />
                <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white" />

                <h2 className="text-white text-xl font-bold mb-3">
                  How to Send USDC
                </h2>
                <h2 className="text-white text-xl font-bold mb-3">
                  How to Send USDC
                </h2>
                <div className="space-y-3 text-white/80 text-sm">
                  <p>1. Connect your wallet</p>
                  <p>2. Select the destination chain</p>
                  <p>3. Enter amount and recipient</p>
                  <p>4. Click Send and confirm</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Left Card - Evervault Animation Behind Button */}
            <div className="flex-1 max-w-md">
              <div className="border border-white/20 dark:border-white/[0.2] flex flex-col items-start mx-auto p-8 relative h-[30rem] rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md overflow-hidden">
                <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white z-30" />
                <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white z-30" />
                <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white z-30" />
                <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white z-30" />

                {/* Evervault Card as Background */}
                <div className="absolute inset-0 z-0">
                  <EvervaultCard text="Bridge" />
                </div>

                {/* Content on top of animation */}
                <div className="relative z-20 flex flex-col h-full justify-center items-center gap-4">
                  <div className="text-center">
                    <h2 className="text-white text-2xl font-bold mb-2">Supply to Aave</h2>
                    <p className="text-white/70 text-sm">
                      Bridge and supply tokens to Aave protocol
                    </p>
                  </div>

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
                      <button
                        onClick={onClick}
                        disabled={isLoading || disabled}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {isLoading ? 'Processing…' : 'Bridge & Supply to Aave'}
                      </button>
                    )}
                  </BridgeAndExecuteButton>
                </div>
              </div>
            </div>

            {/* Right Card - Steps */}
            <div className="flex-1 max-w-md">
              <div className="border border-white/20 dark:border-white/[0.2] flex flex-col items-start mx-auto p-8 relative h-[30rem] rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md">
                <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white" />
                <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white" />
                <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white" />
                <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white" />

                <h2 className="text-white text-xl font-bold mb-3">
                  How to Bridge & Supply
                </h2>
                <div className="space-y-3 text-white/80 text-sm">
                  <p>1. Connect your wallet</p>
                  <p>2. Select source and destination chains</p>
                  <p>3. Enter amount to bridge</p>
                  <p>4. Execute bridge and supply to Aave</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      </div>
    </>
  );
}