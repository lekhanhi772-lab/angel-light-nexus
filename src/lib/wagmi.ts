import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

// RainbowKit config cho ANGEL AI
export const wagmiConfig = getDefaultConfig({
  appName: 'Angel AI - Ngôi Nhà Ánh Sáng',
  projectId: 'angel-ai-web3', // WalletConnect Cloud project ID (fallback)
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false,
});
