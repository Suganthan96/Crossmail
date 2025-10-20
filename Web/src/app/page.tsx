import { BridgeTest } from './components/bridge-test';
import { WalletBridge } from './components/wallet-bridge';
import { CacheClearer } from './components/cache-clearer';

export default function Home() {
  return (
    <>
      <CacheClearer />
      <WalletBridge />
      <BridgeTest />
    </>
  );
}