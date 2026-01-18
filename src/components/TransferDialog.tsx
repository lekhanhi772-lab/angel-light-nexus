import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, ArrowRight, Wallet, CheckCircle, XCircle, ClipboardPaste, AlertTriangle } from 'lucide-react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { parseEther, parseUnits, erc20Abi, isAddress } from 'viem';
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

// Token icons
const TOKEN_ICONS: Record<string, string> = {
  BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
  CAMLY: 'https://bscscan.com/token/images/camlycoin_32.png',
};

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferDialog({ open, onOpenChange }: TransferDialogProps) {
  const { t } = useTranslation();
  const { isConnected, address: userAddress } = useAccount();
  const { tokenBalances, isLoading: balancesLoading } = useWalletBalances();
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'success' | 'error'>('input');

  // Native token transfer
  const { sendTransaction, isPending: isNativePending, data: nativeTxHash } = useSendTransaction();
  
  // ERC20 token transfer
  const { writeContract, isPending: isErc20Pending, data: erc20TxHash } = useWriteContract();
  
  // Get the correct hash based on token type
  const txHash = selectedToken?.isNative ? nativeTxHash : erc20TxHash;
  const isPending = isNativePending || isErc20Pending;
  
  const { isLoading: isTxLoading, isSuccess: isTxSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Validate address in real-time
  useEffect(() => {
    if (!recipientAddress) {
      setAddressError(null);
      return;
    }

    if (!isAddress(recipientAddress)) {
      setAddressError(t('transfer.invalid_address'));
      return;
    }

    if (recipientAddress.toLowerCase() === userAddress?.toLowerCase()) {
      setAddressError(t('transfer.self_transfer'));
      return;
    }

    setAddressError(null);
  }, [recipientAddress, userAddress, t]);

  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipientAddress(text.trim());
    } catch (error) {
      toast.error(t('transfer.clipboard_error'));
    }
  };

  // Handle token transfer (native or ERC20)
  const handleSendTransfer = async () => {
    if (!selectedToken || !amount || !recipientAddress || addressError) return;

    try {
      if (selectedToken.isNative) {
        // Send native token (BNB/ETH)
        sendTransaction({
          to: recipientAddress as `0x${string}`,
          value: parseEther(amount),
        });
      } else {
        // Send ERC20 token (CAMLY, etc.)
        const tokenAmount = parseUnits(amount, selectedToken.decimals);
        
        writeContract({
          address: selectedToken.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [recipientAddress as `0x${string}`, tokenAmount],
        } as any);
      }
      setStep('confirm');
    } catch (error) {
      console.error('Transfer error:', error);
      setStep('error');
    }
  };

  // Watch transaction status
  useEffect(() => {
    if (isTxSuccess && step === 'confirm') {
      setStep('success');
      toast.success(t('transfer.success'));
    }
    if (isTxError && step === 'confirm') {
      setStep('error');
    }
  }, [isTxSuccess, isTxError, step, t]);

  const resetDialog = () => {
    setRecipientAddress('');
    setAddressError(null);
    setSelectedToken(null);
    setAmount('');
    setStep('input');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  // Show native tokens AND CAMLY in the transfer list
  const transferableTokens = tokenBalances.filter(t => 
    t.isNative || t.symbol === 'CAMLY'
  );

  const isValidForm = recipientAddress && 
    !addressError && 
    selectedToken && 
    amount && 
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= parseFloat(selectedToken.balanceFormatted);

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
            <Send className="w-6 h-6" style={{ color: '#DAA520' }} />
            {t('transfer.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Connect wallet prompt */}
          {!isConnected ? (
            <div className="text-center py-6">
              <Wallet className="w-12 h-12 mx-auto mb-4" style={{ color: '#DAA520', opacity: 0.5 }} />
              <p className="text-sm mb-4" style={{ color: '#8B7355' }}>
                {t('transfer.connect_wallet')}
              </p>
              <ConnectButton />
            </div>
          ) : step === 'input' ? (
            <>
              {/* Recipient address input */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: '#8B6914' }}>
                  {t('transfer.recipient_label')}
                </label>
                <div className="relative">
                  <Input
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="0x..."
                    className="pr-12 font-mono text-sm"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderColor: addressError 
                        ? '#ef4444' 
                        : recipientAddress && !addressError 
                        ? '#22c55e' 
                        : 'rgba(218, 165, 32, 0.5)',
                    }}
                  />
                  <button
                    onClick={handlePaste}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all hover:bg-[rgba(218,165,32,0.1)]"
                    title={t('transfer.paste_tooltip')}
                  >
                    <ClipboardPaste className="w-4 h-4" style={{ color: '#DAA520' }} />
                  </button>
                </div>
                {/* Address validation feedback */}
                {addressError && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#ef4444' }}>
                    <XCircle className="w-3 h-3" />
                    {addressError}
                  </p>
                )}
                {recipientAddress && !addressError && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#22c55e' }}>
                    <CheckCircle className="w-3 h-3" />
                    {t('transfer.valid_address')}
                  </p>
                )}
              </div>

              {/* Token selection */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: '#8B6914' }}>
                  {t('transfer.select_token')}
                </label>
                
                {balancesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#DAA520' }} />
                  </div>
                ) : transferableTokens.length > 0 ? (
                  <div className="grid gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {transferableTokens.map((token) => {
                      const iconUrl = TOKEN_ICONS[token.symbol];
                      return (
                        <button
                          key={`${token.symbol}-${token.address || 'native'}`}
                          onClick={() => setSelectedToken(token)}
                          className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                            selectedToken?.symbol === token.symbol 
                              ? 'ring-2 ring-[#DAA520]' 
                              : 'hover:bg-[#FFFACD]'
                          }`}
                          style={{
                            background: selectedToken?.symbol === token.symbol 
                              ? 'rgba(218, 165, 32, 0.15)' 
                              : token.symbol === 'CAMLY'
                              ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)'
                              : 'rgba(255, 255, 255, 0.6)',
                            border: token.symbol === 'CAMLY' 
                              ? '1px solid rgba(218, 165, 32, 0.5)' 
                              : '1px solid rgba(218, 165, 32, 0.3)',
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
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                style={{ background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' }}
                              >
                                {token.symbol.charAt(0)}
                              </div>
                            )}
                            <div className="text-left">
                              <p className="font-semibold text-sm" style={{ color: '#8B6914' }}>
                                {token.symbol}
                                {token.symbol === 'CAMLY' && <span className="ml-1">✨</span>}
                              </p>
                              <p className="text-xs" style={{ color: '#8B7355' }}>{token.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm" style={{ color: '#8B6914' }}>
                              {parseFloat(token.balanceFormatted).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            </p>
                            {token.usdValue !== undefined && token.usdValue > 0 && (
                              <p className="text-xs" style={{ color: '#8B7355' }}>
                                ≈ ${token.usdValue.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-center py-4" style={{ color: '#8B7355' }}>
                    {t('transfer.no_tokens')}
                  </p>
                )}
              </div>

              {/* Amount input */}
              {selectedToken && (
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#8B6914' }}>
                    {t('transfer.amount_label')} ({selectedToken.symbol})
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={selectedToken.symbol === 'CAMLY' ? '1000' : '0.01'}
                      step={selectedToken.symbol === 'CAMLY' ? '100' : '0.001'}
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
                  {/* Insufficient balance warning */}
                  {amount && parseFloat(amount) > parseFloat(selectedToken.balanceFormatted) && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#f59e0b' }}>
                      <AlertTriangle className="w-3 h-3" />
                      {t('transfer.insufficient_balance')}
                    </p>
                  )}
                </div>
              )}

              {/* Send button */}
              <Button
                onClick={handleSendTransfer}
                disabled={!isValidForm || isPending}
                className="w-full text-white py-6"
                style={{
                  background: isValidForm 
                    ? 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)'
                    : 'rgba(218, 165, 32, 0.4)',
                }}
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t('transfer.send_button')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </>
          ) : step === 'confirm' ? (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: '#DAA520' }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#8B6914' }}>
                {t('transfer.confirming')}
              </p>
              <p className="text-sm" style={{ color: '#8B7355' }}>
                {t('transfer.please_wait')}
              </p>
            </div>
          ) : step === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#22c55e' }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#22c55e' }}>
                {t('transfer.success')}
              </p>
              <p className="text-sm mb-2" style={{ color: '#8B7355' }}>
                {t('transfer.sent_to', { amount, token: selectedToken?.symbol })}
              </p>
              <p className="text-xs font-mono mb-6" style={{ color: '#8B6914' }}>
                {recipientAddress.slice(0, 10)}...{recipientAddress.slice(-8)}
              </p>
              <Button
                onClick={() => handleClose(false)}
                className="text-white"
                style={{ background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' }}
              >
                {t('transfer.close')}
              </Button>
            </div>
          ) : step === 'error' ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#ef4444' }}>
                {t('transfer.error')}
              </p>
              <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
                {t('transfer.error_message')}
              </p>
              <Button
                onClick={() => setStep('input')}
                variant="outline"
                style={{ borderColor: '#DAA520', color: '#8B6914' }}
              >
                {t('transfer.retry')}
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}