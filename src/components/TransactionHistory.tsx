import { useState } from 'react';
import { useTransactionHistory, Transaction } from '@/hooks/useTransactionHistory';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, ExternalLink, History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s trước`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(timestamp).toLocaleDateString('vi-VN');
};

const truncateAddress = (addr: string): string => 
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const TransactionRow = ({ tx }: { tx: Transaction }) => {
  const isSend = tx.type === 'send';
  const Icon = isSend ? ArrowUpRight : ArrowDownLeft;
  const iconBg = isSend ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
  const iconColor = isSend ? '#ef4444' : '#22c55e';
  const amountPrefix = isSend ? '-' : '+';
  const amountColor = isSend ? '#ef4444' : '#22c55e';
  const partnerAddress = isSend ? tx.to : tx.from;

  return (
    <a
      href={`https://bscscan.com/tx/${tx.hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/80 group"
      style={{ background: 'rgba(255, 255, 255, 0.5)' }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm" style={{ color: '#5a5a5a' }}>
              {isSend ? 'Gửi' : 'Nhận'} {tx.symbol}
            </p>
            {tx.symbol === 'CAMLY' && <span className="text-xs">✨</span>}
          </div>
          <p className="text-xs flex items-center gap-1" style={{ color: '#8B6914' }}>
            {isSend ? 'Đến' : 'Từ'}: {truncateAddress(partnerAddress)}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-sm" style={{ color: amountColor }}>
          {amountPrefix}{parseFloat(tx.amount).toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </p>
        <p className="text-xs" style={{ color: '#8B6914' }}>
          {formatTimeAgo(tx.timestamp)}
        </p>
      </div>
    </a>
  );
};

type FilterType = 'all' | 'receive' | 'send';

export const TransactionHistory = () => {
  const { transactions, isLoading, error, refetch, isOnBnbChain } = useTransactionHistory();
  const [filter, setFilter] = useState<FilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredTxs = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  if (!isOnBnbChain) {
    return null;
  }

  return (
    <div 
      className="p-4 rounded-2xl mt-4"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.95) 100%)',
        border: '1px solid rgba(218, 165, 32, 0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" style={{ color: '#DAA520' }} />
          <h4 className="text-sm font-bold" style={{ color: '#B8860B' }}>
            Lịch Sử Giao Dịch
          </h4>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="p-1.5 rounded-full transition-all hover:bg-[rgba(218,165,32,0.1)]"
        >
          <RefreshCw 
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} 
            style={{ color: '#DAA520' }} 
          />
        </button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="mb-3">
        <TabsList className="w-full bg-white/60 h-8">
          <TabsTrigger 
            value="all" 
            className="flex-1 text-xs data-[state=active]:bg-[#DAA520] data-[state=active]:text-white"
          >
            Tất cả
          </TabsTrigger>
          <TabsTrigger 
            value="receive" 
            className="flex-1 text-xs data-[state=active]:bg-[#22c55e] data-[state=active]:text-white"
          >
            Nhận
          </TabsTrigger>
          <TabsTrigger 
            value="send" 
            className="flex-1 text-xs data-[state=active]:bg-[#ef4444] data-[state=active]:text-white"
          >
            Gửi
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Transaction List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6 gap-2">
          <div className="w-4 h-4 border-2 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs" style={{ color: '#8B6914' }}>Đang tải...</span>
        </div>
      ) : error ? (
        <p className="text-xs text-center py-4" style={{ color: '#8B6914' }}>{error}</p>
      ) : filteredTxs.length > 0 ? (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 pr-2">
            {filteredTxs.map((tx, i) => (
              <TransactionRow key={`${tx.hash}-${i}`} tx={tx} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-xs text-center py-6" style={{ color: '#8B6914' }}>
          {filter === 'all' 
            ? 'Chưa có giao dịch nào trên BNB Chain' 
            : filter === 'receive' 
              ? 'Chưa nhận giao dịch nào'
              : 'Chưa gửi giao dịch nào'}
        </p>
      )}
    </div>
  );
};
