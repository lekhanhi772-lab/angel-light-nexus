import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { useState, useEffect, useCallback } from 'react';

// Popular tokens on different chains (BNB Chain, Ethereum, etc.)
const CHAIN_TOKENS: Record<number, { address: `0x${string}`; symbol: string; name: string; decimals: number; icon?: string }[]> = {
  // BNB Chain (56)
  56: [
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether USD', decimals: 18 },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin', decimals: 18 },
    { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', symbol: 'BUSD', name: 'Binance USD', decimals: 18 },
    { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { address: '0xba2ae424d960c26247dd6c32edc70b295c744c43', symbol: 'DOGE', name: 'Dogecoin', decimals: 8 },
    // Camly Coin - BEP20 (địa chỉ chính xác)
    { address: '0x0910320181889feFDE0BB1Ca63962b0A8882e413', symbol: 'CAMLY', name: 'Camly Coin', decimals: 18 },
  ],
  // Ethereum (1)
  1: [
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0x6B175474E89094C44Da98b954EesdfFD691dEB623Fd', symbol: 'DAI', name: 'Dai', decimals: 18 },
  ],
  // Polygon (137)
  137: [
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
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
      
      // Fetch ERC20 balances using eth_call
      for (const token of tokens) {
        try {
          // ERC20 balanceOf ABI encoded call
          const data = `0x70a08231000000000000000000000000${address.slice(2)}`;
          
          const response = await fetch(`https://rpc.ankr.com/${chainId === 56 ? 'bsc' : chainId === 137 ? 'polygon' : 'eth'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{ to: token.address, data }, 'latest'],
              id: 1,
            }),
          });
          
          const result = await response.json();
          
          if (result.result && result.result !== '0x' && result.result !== '0x0') {
            const balance = BigInt(result.result);
            if (balance > 0n) {
              const formatted = formatUnits(balance, token.decimals);
              balances.push({
                symbol: token.symbol,
                name: token.name,
                balance: balance.toString(),
                balanceFormatted: parseFloat(formatted).toFixed(6),
                decimals: token.decimals,
                isNative: false,
                address: token.address,
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching ${token.symbol}:`, err);
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
