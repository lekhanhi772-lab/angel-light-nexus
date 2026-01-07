import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccount, useWriteContract, useSendTransaction, usePublicClient } from 'wagmi';
import { parseEther, parseUnits, isAddress, encodeFunctionData } from 'viem';
import { useWalletBalances, TokenBalance } from '@/hooks/useWalletBalances';
import { AlertTriangle, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BatchTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Recipient {
  address: string;
  amount: string;
  isValid: boolean;
  error?: string;
}

interface TransferResult {
  address: string;
  success: boolean;
  hash?: string;
  error?: string;
}

// Multicall3 contract address (same on all EVM chains)
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;

// CAMLY token address on BSC
const CAMLY_ADDRESS = '0x0910320181889feFDE0BB1Ca63962b0A8882e413' as const;

// ERC20 transfer function signature
const ERC20_TRANSFER_ABI = [{
  name: 'transfer',
  type: 'function',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ],
  outputs: [{ name: '', type: 'bool' }]
}] as const;

// Multicall3 aggregate3 ABI
const MULTICALL3_ABI = [{
  name: 'aggregate3',
  type: 'function',
  inputs: [{
    components: [
      { name: 'target', type: 'address' },
      { name: 'allowFailure', type: 'bool' },
      { name: 'callData', type: 'bytes' }
    ],
    name: 'calls',
    type: 'tuple[]'
  }],
  outputs: [{
    components: [
      { name: 'success', type: 'bool' },
      { name: 'returnData', type: 'bytes' }
    ],
    name: 'returnData',
    type: 'tuple[]'
  }]
}] as const;

export const BatchTransferDialog = ({ open, onOpenChange }: BatchTransferDialogProps) => {
  const { address, chain } = useAccount();
  const { tokenBalances } = useWalletBalances();
  const [selectedToken, setSelectedToken] = useState<'BNB' | 'CAMLY'>('CAMLY');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<TransferResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();

  // Parse and validate recipients
  const recipients = useMemo<Recipient[]>(() => {
    if (!inputText.trim()) return [];
    
    const lines = inputText.trim().split('\n');
    const parsed: Recipient[] = [];
    const seenAddresses = new Set<string>();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Support both comma and space separators
      const parts = trimmed.split(/[,\s]+/).filter(Boolean);
      if (parts.length < 2) {
        parsed.push({ address: trimmed, amount: '0', isValid: false, error: 'Định dạng không hợp lệ' });
        continue;
      }

      const addr = parts[0].trim();
      const amountStr = parts[1].trim();
      const amount = parseFloat(amountStr);

      if (!isAddress(addr)) {
        parsed.push({ address: addr, amount: amountStr, isValid: false, error: 'Địa chỉ không hợp lệ' });
      } else if (addr.toLowerCase() === address?.toLowerCase()) {
        parsed.push({ address: addr, amount: amountStr, isValid: false, error: 'Không thể gửi cho chính mình' });
      } else if (seenAddresses.has(addr.toLowerCase())) {
        parsed.push({ address: addr, amount: amountStr, isValid: false, error: 'Địa chỉ trùng lặp' });
      } else if (isNaN(amount) || amount <= 0) {
        parsed.push({ address: addr, amount: amountStr, isValid: false, error: 'Số lượng không hợp lệ' });
      } else {
        parsed.push({ address: addr, amount: amountStr, isValid: true });
        seenAddresses.add(addr.toLowerCase());
      }
    }

    return parsed;
  }, [inputText, address]);

  const validRecipients = recipients.filter(r => r.isValid);
  const invalidRecipients = recipients.filter(r => !r.isValid);
  const totalAmount = validRecipients.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  // Get current balance
  const currentBalance = useMemo(() => {
    if (selectedToken === 'BNB') {
      const bnb = tokenBalances.find(t => t.symbol === 'BNB');
      return parseFloat(bnb?.balanceFormatted || '0');
    } else {
      const camly = tokenBalances.find(t => t.symbol === 'CAMLY');
      return parseFloat(camly?.balanceFormatted || '0');
    }
  }, [selectedToken, tokenBalances]);

  const hasEnoughBalance = currentBalance >= totalAmount;
  const isErc20 = selectedToken === 'CAMLY';

  const handleBatchTransfer = async () => {
    if (validRecipients.length === 0 || !hasEnoughBalance) return;

    setIsProcessing(true);
    setResults([]);
    setCurrentIndex(0);

    try {
      if (isErc20) {
        // Use Multicall3 for ERC20 (single confirmation)
        toast.info(`Đang chuẩn bị ${validRecipients.length} giao dịch CAMLY...`);

        // Encode all transfer calls
        const calls = validRecipients.map(r => ({
          target: CAMLY_ADDRESS,
          allowFailure: false,
          callData: encodeFunctionData({
            abi: ERC20_TRANSFER_ABI,
            functionName: 'transfer',
            args: [r.address as `0x${string}`, parseUnits(r.amount, 8)] // CAMLY has 8 decimals
          })
        }));

        // Execute via Multicall3
        const hash = await writeContractAsync({
          address: MULTICALL3_ADDRESS,
          abi: MULTICALL3_ABI,
          functionName: 'aggregate3',
          args: [calls],
          account: address,
          chain: chain,
        });

        // Wait for confirmation
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }

        // All successful
        setResults(validRecipients.map(r => ({
          address: r.address,
          success: true,
          hash
        })));

        toast.success(`✨ Đã gửi thành công đến ${validRecipients.length} địa chỉ!`);
      } else {
        // Sequential for native BNB
        toast.info(`Đang xử lý ${validRecipients.length} giao dịch BNB (cần ${validRecipients.length} xác nhận)...`);
        
        const newResults: TransferResult[] = [];

        for (let i = 0; i < validRecipients.length; i++) {
          const recipient = validRecipients[i];
          setCurrentIndex(i + 1);

          try {
            const hash = await sendTransactionAsync({
              to: recipient.address as `0x${string}`,
              value: parseEther(recipient.amount)
            });

            if (publicClient) {
              await publicClient.waitForTransactionReceipt({ hash });
            }

            newResults.push({ address: recipient.address, success: true, hash });
            setResults([...newResults]);
            toast.success(`✅ ${i + 1}/${validRecipients.length}: Đã gửi ${recipient.amount} BNB`);
          } catch (err: any) {
            newResults.push({ address: recipient.address, success: false, error: err.message });
            setResults([...newResults]);
            toast.error(`❌ ${i + 1}/${validRecipients.length}: Thất bại`);
          }
        }

        const successCount = newResults.filter(r => r.success).length;
        if (successCount === validRecipients.length) {
          toast.success(`✨ Hoàn thành tất cả ${successCount} giao dịch!`);
        } else {
          toast.warning(`Hoàn thành ${successCount}/${validRecipients.length} giao dịch`);
        }
      }
    } catch (err: any) {
      console.error('Batch transfer error:', err);
      toast.error('Giao dịch thất bại: ' + (err.shortMessage || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDialog = () => {
    setInputText('');
    setResults([]);
    setCurrentIndex(0);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetDialog(); }}>
      <DialogContent 
        className="max-w-md max-h-[90vh] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFFBF0 0%, #FFF8E7 100%)',
          border: '2px solid rgba(218, 165, 32, 0.4)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#B8860B' }}>
            <Users className="w-5 h-5" style={{ color: '#DAA520' }} />
            Chuyển Tiền Hàng Loạt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Token Selector */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>
              Chọn token
            </label>
            <Select value={selectedToken} onValueChange={(v) => setSelectedToken(v as 'BNB' | 'CAMLY')}>
              <SelectTrigger className="border-[#DAA520]/40 bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DAA520]/40">
                <SelectItem value="CAMLY">
                  <div className="flex items-center gap-2">
                    <img src="https://bscscan.com/token/images/camlycoin_32.png" alt="CAMLY" className="w-5 h-5" />
                    <span>CAMLY ✨ (Multicall3 - 1 xác nhận)</span>
                  </div>
                </SelectItem>
                <SelectItem value="BNB">
                  <div className="flex items-center gap-2">
                    <span>🔶</span>
                    <span>BNB (Tuần tự - N xác nhận)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipients Input */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>
              Danh sách người nhận
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Mỗi dòng 1 cặp: địa chỉ, số lượng\n\nVí dụ:\n0x1234...5678, 100\n0xabcd...efgh, 200`}
              className="min-h-[120px] border-[#DAA520]/40 bg-white/80 text-sm font-mono"
              disabled={isProcessing}
            />
            <p className="text-xs mt-1" style={{ color: '#8B6914' }}>
              Format: địa chỉ, số lượng (mỗi dòng 1 cặp)
            </p>
          </div>

          {/* Validation Errors */}
          {invalidRecipients.length > 0 && (
            <div className="p-2 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Có {invalidRecipients.length} dòng lỗi:
              </p>
              <ScrollArea className="max-h-[60px]">
                {invalidRecipients.slice(0, 3).map((r, i) => (
                  <p key={i} className="text-xs text-red-500 truncate">
                    {r.address.slice(0, 10)}... - {r.error}
                  </p>
                ))}
                {invalidRecipients.length > 3 && (
                  <p className="text-xs text-red-400">...và {invalidRecipients.length - 3} lỗi khác</p>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Summary */}
          {validRecipients.length > 0 && (
            <div 
              className="p-3 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                border: '1px solid rgba(218, 165, 32, 0.3)',
              }}
            >
              <p className="text-sm font-medium mb-2" style={{ color: '#B8860B' }}>📊 Tóm tắt:</p>
              <div className="space-y-1 text-xs" style={{ color: '#8B6914' }}>
                <p>• {validRecipients.length} người nhận hợp lệ</p>
                <p>• Tổng: <span className="font-bold">{totalAmount.toLocaleString()} {selectedToken}</span></p>
                <p className={hasEnoughBalance ? '' : 'text-red-500'}>
                  • Số dư: {currentBalance.toLocaleString()} {selectedToken} {hasEnoughBalance ? '✅' : '❌ Không đủ'}
                </p>
                <p>• Phương thức: <span className="font-medium">
                  {isErc20 ? 'Multicall3 (1 xác nhận)' : `Tuần tự (${validRecipients.length} xác nhận)`}
                </span></p>
              </div>
            </div>
          )}

          {/* Progress */}
          {isProcessing && !isErc20 && (
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý {currentIndex}/{validRecipients.length}...
              </p>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <ScrollArea className="max-h-[100px]">
              <div className="space-y-1">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {r.success ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span className="truncate" style={{ color: r.success ? '#22c55e' : '#ef4444' }}>
                      {r.address.slice(0, 10)}...{r.address.slice(-4)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Action Button */}
          <Button
            onClick={handleBatchTransfer}
            disabled={validRecipients.length === 0 || !hasEnoughBalance || isProcessing}
            className="w-full text-white"
            style={{
              background: validRecipients.length > 0 && hasEnoughBalance
                ? 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)'
                : undefined,
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Chuyển Hàng Loạt ✨
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
