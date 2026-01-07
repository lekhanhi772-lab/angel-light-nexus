import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { useState, useEffect, useCallback } from 'react';

// Popular tokens on different chains (BNB Chain, Ethereum, etc.)
const CHAIN_TOKENS: Record<number, { address: `0x${string}`; symbol: string; name: string }[]> = {
  // BNB Chain (56)
  56: [
    // Camly Coin - BEP20 (ưu tiên fetch đầu tiên)
    { address: '0x0910320181889feFDE0BB1Ca63962b0A8882e413', symbol: 'CAMLY', name: 'Camly Coin' },
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether USD' },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin' },
    { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', symbol: 'BUSD', name: 'Binance USD' },
    { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', symbol: 'ETH', name: 'Ethereum' },
    { address: '0xba2ae424d960c26247dd6c32edc70b295c744c43', symbol: 'DOGE', name: 'Dogecoin' },
  ],
  // Ethereum (1)
  1: [
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD' },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin' },
  ],
  // Polygon (137)
  137: [
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD' },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin' },
  ],
};

// CoinGecko IDs for price lookup
const SYMBOL_TO_COINGECKO: Record<string, string> = {
  'BNB': 'binancecoin',
  'ETH': 'ethereum',
  'MATIC': 'matic-network',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'BUSD': 'binance-usd',
  'DAI': 'dai',
  'DOGE': 'dogecoin',
  'CAMLY': 'camly-coin',
};

// Native token symbols per chain
const CHAIN_NATIVE: Record<number, { symbol: string; name: string }> = {
  1: { symbol: 'ETH', name: 'Ethereum' },
  56: { symbol: 'BNB', name: 'BNB' },
  137: { symbol: 'MATIC', name: 'Polygon' },
  42161: { symbol: 'ETH', name: 'Ethereum' },
  10: { symbol: 'ETH', name: 'Ethereum' },
  8453: { symbol: 'ETH', name: 'Ethereum' },
};

// Multiple RPC URLs for fallback
const RPC_URLS: Record<number, string[]> = {
  56: [
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.binance.org',
    'https://bsc-dataseed2.binance.org',
    'https://bsc.publicnode.com',
  ],
  1: ['https://eth.llamarpc.com', 'https://ethereum.publicnode.com'],
  137: ['https://polygon-rpc.com', 'https://polygon.llamarpc.com'],
};

// ERC20 balanceOf selector: 0x70a08231
// ERC20 decimals selector: 0x313ce567
const BALANCE_OF_SELECTOR = '0x70a08231';
const DECIMALS_SELECTOR = '0x313ce567';

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  balanceFormatted: string;
  decimals: number;
  usdValue?: number;
  isNative: boolean;
  address?: string;
  icon?: string;
}

// Helper to call RPC with fallback
async function callRpcWithFallback(
  chainId: number,
  method: string,
  params: unknown[]
): Promise<unknown> {
  const rpcUrls = RPC_URLS[chainId] || [];
  
  for (const rpcUrl of rpcUrls) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
          id: Date.now(),
        }),
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      if (data.error) continue;
      
      return data.result;
    } catch {
      continue;
    }
  }
  
  throw new Error(`All RPCs failed for chain ${chainId}`);
}

export const useWalletBalances = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [totalUsdValue, setTotalUsdValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});

  // Get native balance
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address,
  });

  // Fetch prices from CoinGecko
  const fetchPrices = useCallback(async (symbols: string[]) => {
    try {
      const geckoIds = symbols
        .map(s => SYMBOL_TO_COINGECKO[s.toUpperCase()])
        .filter(Boolean)
        .join(',');
      
      if (!geckoIds) return {};

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds}&vs_currencies=usd`
      );
      const data = await response.json();
      
      const priceMap: Record<string, number> = {};
      for (const [symbol, geckoId] of Object.entries(SYMBOL_TO_COINGECKO)) {
        if (data[geckoId]?.usd) {
          priceMap[symbol] = data[geckoId].usd;
        }
      }
      return priceMap;
    } catch (err) {
      console.error('Error fetching prices:', err);
      return {};
    }
  }, []);

  // Fetch ERC20 token balances
  const fetchTokenBalances = useCallback(async () => {
    if (!address || !isConnected) {
      setTokenBalances([]);
      setTotalUsdValue(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balances: TokenBalance[] = [];
      
      // Add native token
      const nativeInfo = CHAIN_NATIVE[chainId] || { symbol: 'ETH', name: 'Native Token' };
      if (nativeBalance) {
        balances.push({
          symbol: nativeInfo.symbol,
          name: nativeInfo.name,
          balance: nativeBalance.value.toString(),
          balanceFormatted: parseFloat(nativeBalance.formatted).toFixed(6),
          decimals: nativeBalance.decimals,
          isNative: true,
        });
      }

      // Get token list for current chain
      const tokens = CHAIN_TOKENS[chainId] || [];
      
      console.log('[WalletBalances] Fetching tokens for chain:', chainId, 'Address:', address);
      
      // Fetch each token balance
      for (const token of tokens) {
        try {
          // Encode balanceOf call data
          const balanceOfData = `${BALANCE_OF_SELECTOR}000000000000000000000000${address.slice(2).toLowerCase()}`;
          
          console.log(`[WalletBalances] Reading ${token.symbol} at ${token.address}`);
          
          // Read balance and decimals in parallel
          const [balanceResult, decimalsResult] = await Promise.all([
            callRpcWithFallback(chainId, 'eth_call', [{ to: token.address, data: balanceOfData }, 'latest']),
            callRpcWithFallback(chainId, 'eth_call', [{ to: token.address, data: DECIMALS_SELECTOR }, 'latest']),
          ]);
          
          if (!balanceResult || balanceResult === '0x' || balanceResult === '0x0') {
            console.log(`[WalletBalances] ${token.symbol}: no balance or invalid response`);
            continue;
          }
          
          const balance = BigInt(balanceResult as string);
          const decimals = decimalsResult ? parseInt(decimalsResult as string, 16) : 18;
          
          console.log(`[WalletBalances] ${token.symbol}: balance=${balance}, decimals=${decimals}`);
          
          if (balance > 0n) {
            const formatted = formatUnits(balance, decimals);
            console.log(`[WalletBalances] ${token.symbol} formatted:`, formatted);
            
            balances.push({
              symbol: token.symbol,
              name: token.name,
              balance: balance.toString(),
              balanceFormatted: parseFloat(formatted).toFixed(6),
              decimals,
              isNative: false,
              address: token.address,
            });
          }
        } catch (err) {
          console.error(`[WalletBalances] Error reading ${token.symbol}:`, err);
        }
      }

      // Fetch prices
      const symbols = balances.map(b => b.symbol);
      const fetchedPrices = await fetchPrices(symbols);
      setPrices(fetchedPrices);

      // Calculate USD values
      let total = 0;
      const balancesWithUsd = balances.map(b => {
        const price = fetchedPrices[b.symbol] || 0;
        const usdValue = parseFloat(b.balanceFormatted) * price;
        total += usdValue;
        return { ...b, usdValue };
      });

      // Sort by USD value descending
      balancesWithUsd.sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));

      setTokenBalances(balancesWithUsd);
      setTotalUsdValue(total);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Không thể tải số dư ví. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, chainId, nativeBalance, fetchPrices]);

  // Fetch balances when address or chain changes
  useEffect(() => {
    if (isConnected && address && !nativeLoading) {
      fetchTokenBalances();
    }
  }, [isConnected, address, chainId, nativeLoading, fetchTokenBalances]);

  return {
    tokenBalances,
    totalUsdValue,
    isLoading: isLoading || nativeLoading,
    error,
    refetch: fetchTokenBalances,
    isConnected,
    chainId,
  };
};