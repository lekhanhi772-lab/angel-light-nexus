import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, Loader2, ArrowRight, Wallet, CheckCircle, XCircle } from 'lucide-react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { useWalletBalances, TokenBalance } from '@/hooks/useWalletBalances';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface GiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientAddress: string;
  recipientName: string;
  postId?: string; // Optional - for tipping on posts
}

export function GiftDialog({
  open,
  onOpenChange,
  recipientAddress,
  recipientName,
  postId
}: GiftDialogProps) {
  const { t } = useTranslation();
  const { isConnected, address } = useAccount();
  const { tokenBalances, isLoading: balancesLoading } = useWalletBalances();
  
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'success' | 'error'>('select');

  const { sendTransaction, isPending, data: txHash } = useSendTransaction();
  
  const { isLoading: isTxLoading, isSuccess: isTxSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle native token transfer
  const handleSendGift = async () => {
    if (!selectedToken || !amount || !recipientAddress) return;

    try {
      if (selectedToken.isNative) {
        // Send native token (BNB/ETH)
        sendTransaction({
          to: recipientAddress as `0x${string}`,
          value: parseEther(amount),
        });
      } else {
        // For ERC20 tokens - we need to use contract write
        // This is a simplified version - in production you'd use writeContract
        toast.error(t('gift.erc20_not_supported', 'Hiện tại chỉ hỗ trợ gửi BNB/ETH. Token ERC20 sẽ sớm được hỗ trợ!'));
        return;
      }
      setStep('confirm');
    } catch (error) {
      console.error('Gift error:', error);
      setStep('error');
    }
  };

  // Watch transaction status
  if (isTxSuccess && step === 'confirm') {
    setStep('success');
    toast.success(t('gift.success', 'Đã gửi quà thành công! ✨'));
  }

  if (isTxError && step === 'confirm') {
    setStep('error');
  }

  const resetDialog = () => {
    setSelectedToken(null);
    setAmount('');
    setStep('select');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  const nativeTokens = tokenBalances.filter(t => t.isNative);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[450px] p-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
          border: '2px solid #DAA520',
        }}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ color: '#8B6914' }}>
            <Gift className="w-6 h-6" style={{ color: '#DAA520' }} />
            {t('gift.title', 'Tặng Quà Ánh Sáng')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Recipient info */}
          <div 
            className="p-3 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(218, 165, 32, 0.1)' }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' }}
            >
              {recipientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#8B6914' }}>{recipientName}</p>
              <p className="text-xs font-mono" style={{ color: '#8B7355' }}>
                {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
              </p>
            </div>
          </div>

          {/* Connect wallet prompt */}
          {!isConnected ? (
            <div className="text-center py-6">
              <Wallet className="w-12 h-12 mx-auto mb-4" style={{ color: '#DAA520', opacity: 0.5 }} />
              <p className="text-sm mb-4" style={{ color: '#8B7355' }}>
                {t('gift.connect_wallet', 'Kết nối ví để gửi quà')}
              </p>
              <ConnectButton />
            </div>
          ) : step === 'select' ? (
            <>
              {/* Token selection */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: '#8B6914' }}>
                  {t('gift.select_token', 'Chọn token để tặng')}
                </label>
                
                {balancesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#DAA520' }} />
                  </div>
                ) : nativeTokens.length > 0 ? (
                  <div className="grid gap-2">
                    {nativeTokens.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => setSelectedToken(token)}
                        className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                          selectedToken?.symbol === token.symbol 
                            ? 'ring-2 ring-[#DAA520]' 
                            : 'hover:bg-[#FFFACD]'
                        }`}
                        style={{
                          background: selectedToken?.symbol === token.symbol 
                            ? 'rgba(218, 165, 32, 0.15)' 
                            : 'rgba(255, 255, 255, 0.6)',
                          border: '1px solid rgba(218, 165, 32, 0.3)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' }}
                          >
                            {token.symbol.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-sm" style={{ color: '#8B6914' }}>{token.symbol}</p>
                            <p className="text-xs" style={{ color: '#8B7355' }}>{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm" style={{ color: '#8B6914' }}>{token.balanceFormatted}</p>
                          {token.usdValue && (
                            <p className="text-xs" style={{ color: '#8B7355' }}>
                              ≈ ${token.usdValue.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: '#8B7355' }}>
                    {t('gift.no_balance', 'Ví của bạn chưa có token nào')}
                  </p>
                )}
              </div>

              {/* Amount input */}
              {selectedToken && (
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#8B6914' }}>
                    {t('gift.amount', 'Số lượng')} ({selectedToken.symbol})
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.01"
                      step="0.001"
                      min="0"
                      max={selectedToken.balanceFormatted}
                      className="pr-20"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(218, 165, 32, 0.5)',
                      }}
                    />
                    <button
                      onClick={() => setAmount(selectedToken.balanceFormatted)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-full"
                      style={{ background: 'rgba(218, 165, 32, 0.2)', color: '#B8860B' }}
                    >
                      MAX
                    </button>
                  </div>
                </div>
              )}

              {/* Send button */}
              <Button
                onClick={handleSendGift}
                disabled={!selectedToken || !amount || parseFloat(amount) <= 0 || isPending}
                className="w-full text-white py-6"
                style={{
                  background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                }}
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t('gift.send', 'Gửi Quà')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </>
          ) : step === 'confirm' ? (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: '#DAA520' }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#8B6914' }}>
                {t('gift.confirming', 'Đang xác nhận giao dịch...')}
              </p>
              <p className="text-sm" style={{ color: '#8B7355' }}>
                {t('gift.please_wait', 'Vui lòng đợi trong giây lát')}
              </p>
            </div>
          ) : step === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#22c55e' }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#22c55e' }}>
                {t('gift.success_title', 'Tặng quà thành công!')} ✨
              </p>
              <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
                {t('gift.success_message', 'Quà ánh sáng đã được gửi đến')} {recipientName}
              </p>
              <Button
                onClick={() => handleClose(false)}
                className="text-white"
                style={{ background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' }}
              >
                {t('gift.close', 'Đóng')}
              </Button>
            </div>
          ) : step === 'error' ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#ef4444' }}>
                {t('gift.error_title', 'Có lỗi xảy ra')}
              </p>
              <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
                {t('gift.error_message', 'Giao dịch không thành công. Vui lòng thử lại.')}
              </p>
              <Button
                onClick={() => setStep('select')}
                variant="outline"
                style={{ borderColor: '#DAA520', color: '#8B6914' }}
              >
                {t('gift.try_again', 'Thử lại')}
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
