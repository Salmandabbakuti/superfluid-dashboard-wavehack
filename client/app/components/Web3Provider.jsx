"use client";
import { useState, useEffect } from "react";
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  rainbowWallet,
  trustWallet
} from "@thirdweb-dev/react";
import { Sepolia } from "@thirdweb-dev/chains";

const supportedWallets = [
  metamaskWallet({ recommended: true }),
  coinbaseWallet({ recommended: true }),
  walletConnect(),
  rainbowWallet(),
  trustWallet()
];
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <ThirdwebProvider
      activeChain={11155111}
      supportedChains={[Sepolia]}
      supportedWallets={supportedWallets}
      autoConnect={true}
      clientId={clientId}
      dAppMeta={{
        name: "Superfluid Dashboard",
        description: "Superfluid Dashboard",
        logoUrl: "https://example.com/logo.png",
        url: "https://example.com",
        isDarkMode: true
      }}
    >
      {mounted && children}
    </ThirdwebProvider>
  );
}
