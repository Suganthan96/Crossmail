import { BridgeTest } from './components/bridge-test';
import { WalletBridge } from './components/wallet-bridge';
import { CacheClearer } from './components/cache-clearer';
import Silk from '@/components/Silk';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Silk Background - Fixed position, full screen */}
      <div className="fixed inset-0 -z-10">
        <Silk
          speed={5}
          scale={1}
          color="#5B47DB"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {/* Header - Crossmail Logo */}
      <header className="relative z-20 p-6">
        <h1 className="text-3xl font-bold text-white tracking-wide">
          Crossmail
        </h1>
      </header>

      {/* Content - Centered Buttons */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] gap-6">
        <CacheClearer />
        <WalletBridge />
        <BridgeTest />
      </div>
    </div>
  );
}