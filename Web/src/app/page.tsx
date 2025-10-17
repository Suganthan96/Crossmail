import { BridgeTest } from './components/bridge-test';
import { WalletBridge } from './components/wallet-bridge';

export default function Home() {
  return (
    <>
      <WalletBridge />
      <BridgeTest />
    </>
  );
}