'use client';

import { useState, useEffect, useRef } from 'react';
import { WalletBridge } from './components/wallet-bridge';
import Shuffle from '@/components/ui/Shuffle';
import TextType from '@/components/ui/TextType';
import ModernCard, { FeatureItem } from '@/components/ui/futuristic-card';
import DottedGlowBackground from '@/components/ui/dotted-glow-background';
import { TransferButton, BridgeAndExecuteButton, TOKEN_METADATA, TOKEN_CONTRACT_ADDRESSES } from '@avail-project/nexus-widgets';
import { parseUnits } from 'viem';
import { ConnectKitButton } from 'connectkit';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'send' | 'bridge'>('send');
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedChain, setSelectedChain] = useState<number>(11155420);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const shuffleRef = useRef<any>(null);
  const textTypeRef = useRef<any>(null);

  // Chain options mapping
  const chainOptions = [
    { id: 11155420, name: 'Optimism Sepolia' },
    { id: 80002, name: 'Polygon Amoy' },
    { id: 421614, name: 'Arbitrum Sepolia' },
    { id: 84532, name: 'Base Sepolia' },
    { id: 11155111, name: 'Sepolia' },
    { id: 10143, name: 'Monad Testnet' },
  ];

  // Validate Ethereum address
  const validateAddress = (address: string) => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  // Handle recipient address change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setRecipientAddress(address);
    setIsValidAddress(validateAddress(address));
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTransferAmount(value);
    }
  };

  // Handle chain selection change
  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChain(Number(e.target.value));
  };

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

      <div className="relative min-h-screen w-full overflow-hidden bg-gray-200/60 backdrop-blur-sm">
        {/* Header - Centered MailPay Logo */}
        <header className="relative z-20 p-6 flex flex-col items-center bg-gray-200/60 backdrop-blur-sm" style={{ minHeight: '160px' }}>
          {/* Navigation Toggle Switch - Top Left */}
          <div className="absolute top-6 left-6 flex items-center gap-4">
            <span className={`text-sm font-medium transition-colors ${activeTab === 'send' ? 'text-black' : 'text-black/60'}`}>
              Send
            </span>
            <div className="relative">
              <button
                onClick={() => setActiveTab(activeTab === 'send' ? 'bridge' : 'send')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                  activeTab === 'bridge' ? 'bg-black' : 'bg-black/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    activeTab === 'bridge' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <span className={`text-sm font-medium transition-colors ${activeTab === 'bridge' ? 'text-black' : 'text-black/60'}`}>
              Bridge
            </span>
          </div>

          {/* Wallet Connect Button - Top Right */}
          <div className="absolute top-6 right-6 backdrop-blur-md bg-white/10 border border-black/20 rounded-xl overflow-hidden">
            <ConnectKitButton />
          </div>

          {/* Centered Logo */}
          <div className="flex flex-col items-center mt-8">
            <h1 className="text-4xl font-bold text-black tracking-wide crossmail-title" style={{ height: '1.2em', overflow: 'visible', color: '#000' }}>
              <div className="crossmail-container">
                <Shuffle 
                  text="MAIL"
                  tag="span"
                  className="crossmail-title crossmail-part crossmail-cross text-black"
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
                  className="crossmail-title crossmail-part crossmail-mail text-black"
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
          </div>
        </header>

        {/* Two Partition Layout */}
        <div className="relative z-10 flex min-h-[calc(100vh-200px)] gap-4 p-4">
          {/* Left Partition - Steps */}
          <div className="w-1/2 bg-gray-200/60 backdrop-blur-sm border-4 border-black rounded-3xl p-6 overflow-y-auto">
            <div className="w-full">
              {activeTab === 'send' ? (
                <div className="space-y-2">
                  <div className="text-center mb-3">
                    <h3 className="text-2xl font-bold text-black mb-1" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                      REBALANCE FUNDS
                    </h3>
                    <p className="text-black/70 text-sm" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                      Nexus-Powered Distribution
                    </p>
                    <div className="border-t-2 border-black my-2"></div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-lg font-bold text-black mb-1" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                        STEP 1: Connect Hot Wallet
                      </h4>
                      <div className="border-t border-black mb-1"></div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-600 font-bold">✓</span>
                        <span className="text-sm font-semibold text-black">Link your spending wallet</span>
                      </div>
                      <p className="text-sm text-black/80" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                        Connect hot wallet to view prefered token balance across all chains using nexus unified balance (Ethereum, Base, Arbitrum, Optimism).
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-black mb-1" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                        STEP 2: Load Employee Data
                      </h4>
                      <div className="border-t border-black mb-1"></div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-600 font-bold">→</span>
                        <span className="text-sm font-semibold text-black">Upload payroll preferences</span>
                      </div>
                      <p className="text-sm text-black/80" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                        Import CSV: email, address, amount, chain. Csv has the total per chain.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-black mb-1" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                        STEP 3: Review Distribution
                      </h4>
                      <div className="border-t border-black mb-1"></div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-600 font-bold">→</span>
                        <span className="text-sm font-semibold text-black">Check allocation plan</span>
                      </div>
                      <p className="text-sm text-black/80 mb-1" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                        View current vs required balances.
                      </p>
                      <p className="text-sm text-black/60 italic">Example: 5000 → Base, 3000 → Arbitrum</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-black mb-1" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                        STEP 4: Get Nexus Quotes
                      </h4>
                      <div className="border-t border-black mb-1"></div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-600 font-bold">→</span>
                        <span className="text-sm font-semibold text-black">Fetch bridge routes</span>
                      </div>
                      <p className="text-sm text-black/80" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                        Review fees, times, and routes. Approve spending and confirm.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-black mb-1" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                        STEP 5: Execute & Verify
                      </h4>
                      <div className="border-t border-black mb-1"></div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-600 font-bold">→</span>
                        <span className="text-sm font-semibold text-black">Bridge and confirm</span>
                      </div>
                      <p className="text-sm text-black/80" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                        Bridge via Nexus (1-2 min per chain). Verify balances match targets.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-bold text-black mb-2" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                    BRIDGE & SUPPLY
                  </h3>
                  <p className="text-black/70 mb-6" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                    To Aave Protocol
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                        <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-cyan-600">
                          <path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-black" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Connect your wallet</p>
                        <p className="text-black/70" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Link your crypto wallet to get started</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                        <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-cyan-600">
                          <path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-black" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Select source & destination</p>
                        <p className="text-black/70" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Choose chains for bridging</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                        <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-cyan-600">
                          <path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-black" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Enter bridge amount</p>
                        <p className="text-black/70" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Specify how much to bridge</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                        <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-cyan-600">
                          <path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-black" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Execute bridge & supply</p>
                        <p className="text-black/70" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Complete bridge and supply to Aave</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Partition - Transfer Form */}
          <div className="w-1/2 bg-gray-200/60 backdrop-blur-sm border-4 border-black rounded-3xl p-8 flex flex-col items-center justify-center">
            {activeTab === 'send' ? (
              <div className="text-center max-w-lg">
                <h2 className="text-black text-5xl font-bold mb-4" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Rebalance Interface</h2>
                <p className="text-black/80 text-2xl mb-8" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                  Rebalance any tokens across any chains instantly
                </p>
                
                {/* Recipient Address Input */}
                <div className="mb-6">
                  <label className="block text-black text-lg font-medium mb-3" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={handleAddressChange}
                    placeholder="0x... (Enter recipient's Ethereum address)"
                    className={`w-full px-6 py-4 rounded-xl bg-white/30 backdrop-blur-md border text-black placeholder-black/50 focus:outline-none focus:ring-2 transition-all duration-300 text-center ${
                      recipientAddress === '' 
                        ? 'border-white/30 focus:ring-cyan-500' 
                        : isValidAddress 
                          ? 'border-green-500 focus:ring-green-500' 
                          : 'border-red-500 focus:ring-red-500'
                    }`}
                    style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}
                  />
                  {recipientAddress !== '' && (
                    <p className={`text-sm mt-2 ${isValidAddress ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                      {isValidAddress ? '✓ Valid Ethereum address' : '✗ Invalid address format'}
                    </p>
                  )}
                </div>

                {/* Amount Input */}
                <div className="mb-12">
                  <label className="block text-black text-lg font-medium mb-3" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                    Amount (USDC)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={transferAmount}
                      onChange={handleAmountChange}
                      placeholder="Enter amount"
                      className="flex-1 px-6 py-4 rounded-xl bg-white/30 backdrop-blur-md border border-white/30 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 text-center"
                      style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}
                    />
                    
                    {/* Chain Selector */}
                    <select
                      value={selectedChain}
                      onChange={handleChainChange}
                      className="px-6 py-4 rounded-xl bg-white/30 backdrop-blur-md border border-white/30 text-black focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 cursor-pointer"
                      style={{ 
                        fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                        minWidth: '200px'
                      }}
                    >
                      {chainOptions.map((chain) => (
                        <option key={chain.id} value={chain.id} className="bg-slate-800 text-white">
                          {chain.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {recipientAddress && isValidAddress && transferAmount && parseFloat(transferAmount) > 0 ? (
                  <TransferButton
                    prefill={{
                      chainId: selectedChain,
                      token: 'USDC',
                      amount: transferAmount,
                      recipient: recipientAddress as `0x${string}`,
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
                        {isLoading ? 'Sending…' : `Send ${transferAmount} USDC`}
                      </button>
                    )}
                  </TransferButton>
                ) : (
                  <button 
                    disabled 
                    className="relative font-inherit overflow-hidden opacity-50 cursor-not-allowed"
                    style={{ 
                      fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                      fontSize: '15px',
                      padding: '0.7em 2.7em',
                      letterSpacing: '0.06em',
                      borderRadius: '0.6em',
                      lineHeight: '1.4em',
                      border: '2px solid #374151',
                      background: 'linear-gradient(to right, rgba(55, 65, 81, 0.1) 1%, transparent 40%, transparent 60%, rgba(55, 65, 81, 0.1) 100%)',
                      color: '#111827',
                      boxShadow: 'inset 0 0 10px rgba(55, 65, 81, 0.4), 0 0 9px 3px rgba(55, 65, 81, 0.1)',
                    }}
                  >
                    {recipientAddress === '' 
                      ? 'Enter Recipient Address' 
                      : !isValidAddress 
                        ? 'Invalid Address Format'
                        : transferAmount === '' || parseFloat(transferAmount) <= 0
                          ? 'Enter Amount'
                          : 'Ready to Send'
                    }
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center max-w-lg">
                <h2 className="text-black text-5xl font-bold mb-4" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>Supply to Aave</h2>
                <p className="text-black/80 text-2xl mb-12" style={{ fontFamily: 'Nasalization, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
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
      </div>
    </>
  );
}