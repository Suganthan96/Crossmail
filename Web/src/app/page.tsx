'use client';

import { useState, useEffect, useRef } from 'react';
import { BridgeTest } from './components/bridge-test';
import { WalletBridge } from './components/wallet-bridge';
import Shuffle from '@/components/ui/Shuffle';
import TextType from '@/components/ui/TextType';
import { LampBackground } from '@/components/ui/lamp-background';
import { ParticlesBackground } from '@/components/ui/particles-background';
import ModernCard, { FeatureItem } from '@/components/ui/futuristic-card';
import { TransferButton, BridgeAndExecuteButton, TOKEN_METADATA, TOKEN_CONTRACT_ADDRESSES } from '@avail-project/nexus-widgets';
import { parseUnits } from 'viem';
import { ConnectKitButton } from 'connectkit';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'send' | 'bridge'>('send');
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const shuffleRef = useRef<any>(null);
  const textTypeRef = useRef<any>(null);

  // Synchronized animation controller
  useEffect(() => {
    const startSynchronizedAnimations = () => {
      setAnimationTrigger(prev => prev + 1);
    };

    // Start immediately
    const initialTimeout = setTimeout(startSynchronizedAnimations, 1000);

    // Then repeat every 7 seconds
    const interval = setInterval(startSynchronizedAnimations, 7000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Wallet Bridge - Handles Nexus SDK initialization */}
      <WalletBridge />
      
      {/* Full Screen Lamp Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <LampBackground />
      </div>

      {/* Particles Background Layer */}
      <div className="fixed inset-0 w-full h-full z-[1]">
        <ParticlesBackground />
      </div>

      <div className="relative min-h-screen w-full overflow-hidden z-10">
        {/* Header - Crossmail Logo */}
        <header className="relative z-20 p-6 flex justify-between items-start" style={{ minHeight: '120px' }}>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-wide crossmail-title" style={{ height: '1.2em', overflow: 'visible' }}>
              <div className="crossmail-container">
                <Shuffle 
                  text="MAIL"
                  tag="span"
                  className="crossmail-title crossmail-part crossmail-cross"
                  duration={0.5}
                  shuffleTimes={3}
                  scrambleCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                  triggerOnHover={false}
                  triggerOnce={false}
                  animationMode="evenodd"
                  stagger={0.05}
                  autoTrigger={false}
                  externalTrigger={animationTrigger}
                  ref={shuffleRef}
                />
                <TextType
                  text={["PAY"]}
                  as="span"
                  className="crossmail-title crossmail-part crossmail-mail"
                  typingSpeed={200}
                  deletingSpeed={50}
                  pauseDuration={1000}
                  loop={false}
                  showCursor={false}
                  startOnVisible={false}
                  externalTrigger={animationTrigger}
                  ref={textTypeRef}
                />
              </div>
            </h1>
            
            {/* Navigation Toggle Switch */}
            <div className="flex items-center gap-4 mt-6">
              <span className={`text-sm font-medium transition-colors ${activeTab === 'send' ? 'text-white' : 'text-white/60'}`}>
                Send
              </span>
              <div className="relative">
                <button
                  onClick={() => setActiveTab(activeTab === 'send' ? 'bridge' : 'send')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    activeTab === 'bridge' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      activeTab === 'bridge' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <span className={`text-sm font-medium transition-colors ${activeTab === 'bridge' ? 'text-white' : 'text-white/60'}`}>
                Bridge
              </span>
            </div>
          </div>

          {/* Wallet Connect Button */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden">
            <ConnectKitButton />
          </div>
        </header>

        {/* Content - Left Aligned Layout */}
        <div className="relative z-10 flex items-start justify-start min-h-[calc(100vh-200px)] gap-8 px-2 pt-8">
          {activeTab === 'send' ? (
            <div className="flex gap-8">
              {/* Instructions Card - How to Send USDC */}
              <div className="w-80">
                <ModernCard
                  title="SEND USDC"
                  subtitle="Cross-chain Transfer"
                >
                  <div className="space-y-4">
                    <FeatureItem 
                      title="Connect your wallet" 
                      description="Link your crypto wallet to get started" 
                    />
                    <FeatureItem 
                      title="Select destination chain" 
                      description="Choose where to send your USDC" 
                    />
                    <FeatureItem 
                      title="Enter amount & recipient" 
                      description="Specify how much and where to send" 
                    />
                    <FeatureItem 
                      title="Click Send and confirm" 
                      description="Complete the transaction securely" 
                    />
                  </div>
                </ModernCard>
              </div>
            </div>
          ) : (
            <div className="flex gap-8">
              {/* Instructions Card - How to Bridge & Supply */}
              <div className="w-80">
                <ModernCard
                  title="BRIDGE & SUPPLY"
                  subtitle="To Aave Protocol"
                >
                  <div className="space-y-4">
                    <FeatureItem 
                      title="Connect your wallet" 
                      description="Link your crypto wallet to get started" 
                    />
                    <FeatureItem 
                      title="Select source & destination" 
                      description="Choose chains for bridging" 
                    />
                    <FeatureItem 
                      title="Enter bridge amount" 
                      description="Specify how much to bridge" 
                    />
                    <FeatureItem 
                      title="Execute bridge & supply" 
                      description="Complete bridge and supply to Aave" 
                    />
                  </div>
                </ModernCard>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Under Lamp */}
        <div className="relative z-10 flex flex-col items-center justify-center -mt-90 pb-20">
          {activeTab === 'send' ? (
            <div className="text-center">
              <h2 className="text-white text-6xl font-bold mb-4" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Transfer USDC</h2>
              <p className="text-white/80 text-3xl mb-20" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                Send USDC tokens across chains instantly
              </p>
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
                    className="relative font-inherit overflow-hidden transition-all duration-300"
                    style={{ 
                      fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                      fontSize: '15px',
                      padding: '0.7em 2.7em',
                      letterSpacing: '0.06em',
                      borderRadius: '0.6em',
                      lineHeight: '1.4em',
                      border: '2px solid #06b6d4',
                      background: 'linear-gradient(to right, rgba(6, 182, 212, 0.1) 1%, transparent 40%, transparent 60%, rgba(6, 182, 212, 0.1) 100%)',
                      color: '#06b6d4',
                      boxShadow: 'inset 0 0 10px rgba(6, 182, 212, 0.4), 0 0 9px 3px rgba(6, 182, 212, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#22d3ee';
                      e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(6, 182, 212, 0.6), 0 0 9px 3px rgba(6, 182, 212, 0.2)';
                      const span = e.currentTarget.querySelector('span');
                      if (span) span.style.transform = 'translateX(15em)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#06b6d4';
                      e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(6, 182, 212, 0.4), 0 0 9px 3px rgba(6, 182, 212, 0.1)';
                      const span = e.currentTarget.querySelector('span');
                      if (span) span.style.transform = 'translateX(0)';
                    }}
                  >
                    <span 
                      className="absolute left-[-4em] w-16 h-full top-0 transition-transform duration-400 ease-in-out"
                      style={{
                        background: 'linear-gradient(to right, transparent 1%, rgba(6, 182, 212, 0.1) 40%, rgba(6, 182, 212, 0.1) 60%, transparent 100%)',
                      }}
                    />
                    {isLoading ? 'Sending…' : 'Send 1 USDC'}
                  </button>
                )}
              </TransferButton>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-white text-6xl font-bold mb-4" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Supply to Aave</h2>
              <p className="text-white/80 text-3xl mb-20" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                Bridge and supply tokens to Aave protocol
              </p>
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
                    className="relative font-inherit overflow-hidden transition-all duration-300"
                    style={{ 
                      fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                      fontSize: '15px',
                      padding: '0.7em 2.7em',
                      letterSpacing: '0.06em',
                      borderRadius: '0.6em',
                      lineHeight: '1.4em',
                      border: '2px solid #06b6d4',
                      background: 'linear-gradient(to right, rgba(6, 182, 212, 0.1) 1%, transparent 40%, transparent 60%, rgba(6, 182, 212, 0.1) 100%)',
                      color: '#06b6d4',
                      boxShadow: 'inset 0 0 10px rgba(6, 182, 212, 0.4), 0 0 9px 3px rgba(6, 182, 212, 0.1)',
                      opacity: disabled ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!disabled) {
                        e.currentTarget.style.color = '#22d3ee';
                        e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(6, 182, 212, 0.6), 0 0 9px 3px rgba(6, 182, 212, 0.2)';
                        const span = e.currentTarget.querySelector('span');
                        if (span) span.style.transform = 'translateX(15em)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!disabled) {
                        e.currentTarget.style.color = '#06b6d4';
                        e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(6, 182, 212, 0.4), 0 0 9px 3px rgba(6, 182, 212, 0.1)';
                        const span = e.currentTarget.querySelector('span');
                        if (span) span.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <span 
                      className="absolute left-[-4em] w-16 h-full top-0 transition-transform duration-400 ease-in-out"
                      style={{
                        background: 'linear-gradient(to right, transparent 1%, rgba(6, 182, 212, 0.1) 40%, rgba(6, 182, 212, 0.1) 60%, transparent 100%)',
                      }}
                    />
                    {isLoading ? 'Processing…' : 'Bridge & Supply to Aave'}
                  </button>
                )}
              </BridgeAndExecuteButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
}