import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

export interface Transaction {
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  symbol: string;
  from: string;
  to: string;
  timestamp: number;
  status: 'success' | 'failed';
  isNative: boolean;
  tokenAddress?: string;
}

interface BscScanTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
  contractAddress?: string;
}

const BSCSCAN_API = 'https://api.bscscan.com/api';

export const useTransactionHistory = () => {
  const { address, isConnected, chainId } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!address || !isConnected || chainId !== 56) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const addressLower = address.toLowerCase();

      // Fetch native BNB transactions and ERC20 transfers in parallel
      const [nativeRes, tokenRes] = await Promise.all([
        fetch(`${BSCSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`),
        fetch(`${BSCSCAN_API}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`)
      ]);

      const [nativeData, tokenData] = await Promise.all([
        nativeRes.json(),
        tokenRes.json()
      ]);

      const allTxs: Transaction[] = [];

      // Process native BNB transactions
      if (nativeData.status === '1' && Array.isArray(nativeData.result)) {
        for (const tx of nativeData.result as BscScanTx[]) {
          const value = parseFloat(tx.value) / 1e18;
          if (value === 0) continue; // Skip zero value transactions
          
          allTxs.push({
            hash: tx.hash,
            type: tx.from.toLowerCase() === addressLower ? 'send' : 'receive',
            amount: value.toFixed(6),
            symbol: 'BNB',
            from: tx.from,
            to: tx.to,
            timestamp: parseInt(tx.timeStamp) * 1000,
            status: tx.isError === '0' ? 'success' : 'failed',
            isNative: true,
          });
        }
      }

      // Process ERC20 token transactions
      if (tokenData.status === '1' && Array.isArray(tokenData.result)) {
        for (const tx of tokenData.result as BscScanTx[]) {
          const decimals = parseInt(tx.tokenDecimal || '18');
          const value = parseFloat(tx.value) / Math.pow(10, decimals);
          if (value === 0) continue;
          
          allTxs.push({
            hash: tx.hash,
            type: tx.from.toLowerCase() === addressLower ? 'send' : 'receive',
            amount: value.toFixed(6),
            symbol: tx.tokenSymbol || 'TOKEN',
            from: tx.from,
            to: tx.to,
            timestamp: parseInt(tx.timeStamp) * 1000,
            status: 'success',
            isNative: false,
            tokenAddress: tx.contractAddress,
          });
        }
      }

      // Sort by timestamp descending and limit to 30
      allTxs.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(allTxs.slice(0, 30));
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Không thể tải lịch sử giao dịch');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, chainId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
    isOnBnbChain: chainId === 56,
  };
};
