'use client';

import React from 'react';
import { TransferButton, BridgeAndExecuteButton, TOKEN_METADATA, TOKEN_CONTRACT_ADDRESSES } from '@avail-project/nexus-widgets';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useNexus } from '@avail-project/nexus-widgets';
import { useSearchParams } from 'next/navigation';
import { WalletBridge } from '../components/wallet-bridge';

export default function WidgetPage() {
  const { isConnected } = useAccount();
  const { isSdkInitialized, sdk } = useNexus();
  const searchParams = useSearchParams();
  const [recipientAddress, setRecipientAddress] = React.useState('');
  const [isValidAddress, setIsValidAddress] = React.useState(false);
  
  // Get parameters from URL
  const type = searchParams.get('type') || 'transfer';
  const amount = searchParams.get('amount') || '1';
  const token = searchParams.get('token') || 'USDC';
  const chainId = parseInt(searchParams.get('chainId') || '11155420');
  const urlRecipient = searchParams.get('recipient');
  const isPopup = searchParams.get('popup') === 'true';

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

  // Initialize recipient from URL or allow user input
  React.useEffect(() => {
    if (urlRecipient && validateAddress(urlRecipient)) {
      setRecipientAddress(urlRecipient);
      setIsValidAddress(true);
    }
  }, [urlRecipient]);

  if (!isConnected) {
    return (
      <>
        <WalletBridge />
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Nexus Widget</h1>
            <p className="text-white/70 mb-6">Connect your wallet to get started</p>
            <ConnectKitButton />
          </div>
        </div>
      </>
    );
  }

  if (!isSdkInitialized) {
    return (
      <>
        <WalletBridge />
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white">Initializing Nexus SDK...</p>
            <p className="text-sm text-white/70 mt-2">Please wait while we set up the cross-chain bridge</p>
          </div>
        </div>
      </>
    );
  }

  const finalRecipient = recipientAddress || urlRecipient;

  return (
    <>
      <WalletBridge />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Nexus Widget</h1>
            <p className="text-white/70">
              {type === 'transfer' ? 'Sending' : 'Bridging'} {amount} {token}
            </p>
            {chainId && (
              <p className="text-sm text-white/50 mt-1">
                To {chainId === 11155420 ? 'Optimism Sepolia' : `Chain ${chainId}`}
              </p>
            )}
          </div>

          {/* Fee Display */}
          <div className="mb-4">
            <p className="text-green-400 text-center font-medium">≈ $0.00</p>
          </div>

          {/* Recipient Input (if not provided via URL) */}
          {!urlRecipient && (
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                To
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={handleAddressChange}
                placeholder="0x... (Enter recipient's address)"
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
                  recipientAddress === '' 
                    ? 'border-white/20 focus:ring-blue-500' 
                    : isValidAddress 
                      ? 'border-green-500 focus:ring-green-500' 
                      : 'border-red-500 focus:ring-red-500'
                }`}
              />
              {recipientAddress !== '' && (
                <p className={`text-xs mt-1 ${isValidAddress ? 'text-green-400' : 'text-red-400'}`}>
                  {isValidAddress ? '✓ Valid Ethereum address' : '✗ Invalid address format'}
                </p>
              )}
            </div>
          )}

          {/* Display recipient if provided via URL */}
          {urlRecipient && (
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">To</label>
              <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white/80">
                {urlRecipient.length > 20 ? 
                  `${urlRecipient.substring(0, 6)}...${urlRecipient.substring(urlRecipient.length - 4)}` : 
                  urlRecipient
                }
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 text-sm">
              💡 <strong>Sign a quick message to turn on cross-chain transfers. Don't worry it's gasless & no funds will move yet.</strong>
            </p>
          </div>

          {/* Action Buttons */}
          {finalRecipient && validateAddress(finalRecipient) ? (
            <div className="space-y-3">
              {type === 'transfer' ? (
                <TransferButton
                  prefill={{
                    chainId: chainId,
                    token: token as any,
                    amount: amount,
                    recipient: finalRecipient as `0x${string}`,
                  }}
                >
                  {({ onClick, isLoading }) => (
                    <button
                      onClick={onClick}
                      disabled={isLoading}
                      className="w-full px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isLoading ? 'Signing...' : 'Sign'}
                    </button>
                  )}
                </TransferButton>
              ) : (
                <BridgeAndExecuteButton
                  contractAddress="0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff"
                  contractAbi={[
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
                  ] as const}
                  functionName="supply"
                  buildFunctionParams={(token, amount, chainId, userAddress) => {
                    const decimals = TOKEN_METADATA[token].decimals;
                    const amountWei = parseUnits(amount, decimals);
                    const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
                    return {
                      functionParams: [tokenAddress, amountWei, userAddress, 0],
                    };
                  }}
                  prefill={{ toChainId: chainId, token: token as any }}
                >
                  {({ onClick, isLoading, disabled }) => (
                    <button
                      onClick={onClick}
                      disabled={isLoading || disabled}
                      className="w-full px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isLoading ? 'Processing...' : 'Bridge & Supply'}
                    </button>
                  )}
                </BridgeAndExecuteButton>
              )}

              <button
                onClick={() => isPopup ? window.close() : window.history.back()}
                className="w-full px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full px-6 py-3 bg-gray-600 text-white/50 font-medium rounded-lg cursor-not-allowed"
            >
              {!finalRecipient ? 'Enter Recipient Address' : 'Invalid Address Format'}
            </button>
          )}

          {/* Powered By */}
          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Powered By <span className="text-blue-400 font-medium">🔗 avail</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}