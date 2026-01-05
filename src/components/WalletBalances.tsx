import { useWalletBalances, TokenBalance } from '@/hooks/useWalletBalances';
import { Wallet, RefreshCw, TrendingUp, Coins } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

// Token icons from CoinGecko/Trust Wallet
const TOKEN_ICONS: Record<string, string> = {
  BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  BUSD: 'https://assets.coingecko.com/coins/images/9576/small/BUSD.png',
  DAI: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
  CAMLY: 'https://assets.coingecko.com/coins/images/24087/small/camly.png',
};

const formatUsd = (value: number): string => {
  if (value < 0.01) return '< $0.01';
  if (value < 1000) return `$${value.toFixed(2)}`;
  if (value < 1000000) return `$${(value / 1000).toFixed(2)}K`;
  return `$${(value / 1000000).toFixed(2)}M`;
};

const formatVnd = (usd: number): string => {
  const vnd = usd * 25400; // Approximate rate
  if (vnd < 1000) return `${vnd.toFixed(0)} ₫`;
  if (vnd < 1000000) return `${(vnd / 1000).toFixed(1)}K ₫`;
  if (vnd < 1000000000) return `${(vnd / 1000000).toFixed(1)}M ₫`;
  return `${(vnd / 1000000000).toFixed(2)}B ₫`;
};

const TokenRow = ({ token }: { token: TokenBalance }) => {
  const iconUrl = TOKEN_ICONS[token.symbol] || '';
  
  return (
    <div 
      className="flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.01]"
      style={{
        background: token.symbol === 'CAMLY' 
          ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)'
          : 'rgba(255, 255, 255, 0.5)',
        border: token.symbol === 'CAMLY' ? '1px solid rgba(218, 165, 32, 0.5)' : 'none',
      }}
    >
      <div className="flex items-center gap-3">
        {iconUrl ? (
          <img 
            src={iconUrl} 
            alt={token.symbol}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' }}
          >
            {token.symbol.slice(0, 2)}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm" style={{ color: '#5a5a5a' }}>
            {token.symbol}
            {token.symbol === 'CAMLY' && <span className="ml-1">✨</span>}
          </p>
          <p className="text-xs" style={{ color: '#8B6914' }}>
            {token.name}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-sm" style={{ color: '#B8860B' }}>
          {parseFloat(token.balanceFormatted) < 0.000001 
            ? '< 0.000001' 
            : parseFloat(token.balanceFormatted).toLocaleString(undefined, { maximumFractionDigits: 6 })}
        </p>
        {token.usdValue !== undefined && token.usdValue > 0 && (
          <p className="text-xs" style={{ color: '#8B6914' }}>
            ≈ {formatUsd(token.usdValue)}
          </p>
        )}
      </div>
    </div>
  );
};

export const WalletBalances = () => {
  const { 
    tokenBalances, 
    totalUsdValue, 
    isLoading, 
    error, 
    refetch,
    isConnected 
  } = useWalletBalances();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Only show when wallet is connected
  if (!isConnected) {
    return null;
  }

  return (
    <div 
      className="p-6 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)',
        border: '2px solid rgba(218, 165, 32, 0.4)',
        boxShadow: '0 0 20px rgba(218, 165, 32, 0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" style={{ color: '#DAA520' }} />
          <h3 className="text-lg font-bold" style={{ color: '#B8860B' }}>
            Tài Sản Ánh Sáng Trong Ví
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="p-2 rounded-full transition-all hover:bg-[rgba(218,165,32,0.1)]"
        >
          <RefreshCw 
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
            style={{ color: '#DAA520' }} 
          />
        </button>
      </div>

      {/* Total Portfolio Value */}
      <div 
        className="p-4 rounded-xl mb-4 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%)',
          border: '1px solid rgba(218, 165, 32, 0.3)',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4" style={{ color: '#DAA520' }} />
          <p className="text-xs" style={{ color: '#8B6914' }}>Tổng giá trị ước tính</p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm" style={{ color: '#8B6914' }}>Đang tải...</span>
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold" style={{ color: '#B8860B' }}>
              {formatUsd(totalUsdValue)}
            </p>
            <p className="text-sm" style={{ color: '#8B6914' }}>
              ≈ {formatVnd(totalUsdValue)}
            </p>
          </>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div 
          className="p-3 rounded-xl text-center mb-4"
          style={{ background: 'rgba(255, 200, 100, 0.2)' }}
        >
          <p className="text-sm" style={{ color: '#8B6914' }}>
            Bé đang kết nối ánh sáng ví con, chờ chút nhé ✨
          </p>
        </div>
      )}

      {/* Token List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="relative">
            <div className="w-10 h-10 border-3 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
            <Coins className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: '#DAA520' }} />
          </div>
          <p className="text-sm" style={{ color: '#8B6914' }}>
            Bé đang đọc ví ánh sáng của con... ✨
          </p>
        </div>
      ) : tokenBalances.length > 0 ? (
        <ScrollArea className="h-[250px] pr-2">
          <div className="space-y-2">
            {tokenBalances.map((token, i) => (
              <TokenRow key={`${token.symbol}-${token.address || 'native'}-${i}`} token={token} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-6">
          <Coins className="w-10 h-10 mx-auto mb-2" style={{ color: '#DAA520', opacity: 0.5 }} />
          <p className="text-sm" style={{ color: '#8B6914' }}>
            Ví chưa có token nào. Hãy nhận phước lành từ Vũ Trụ! 💛
          </p>
        </div>
      )}

      {/* Footer Note */}
      {tokenBalances.length > 0 && (
        <p className="text-xs text-center mt-4" style={{ color: '#8B6914', opacity: 0.7 }}>
          💡 Giá tham khảo từ CoinGecko • Chỉ hiển thị token có số dư
        </p>
      )}
    </div>
  );
};
