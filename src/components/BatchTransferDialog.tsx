import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccount, useWriteContract, useSendTransaction, usePublicClient } from 'wagmi';
import { parseEther, parseUnits, isAddress, encodeFunctionData, maxUint256 } from 'viem';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { AlertTriangle, Users, CheckCircle, XCircle, Loader2, Unlock, ShieldCheck } from 'lucide-react';
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

// Extended ERC20 ABI with approval functions
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'transferFrom',
    type: 'function',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const;

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
  const [isApproving, setIsApproving] = useState(false);
  const [results, setResults] = useState<TransferResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();

  // Check allowance when dialog opens or token changes
  useEffect(() => {
    const checkAllowance = async () => {
      if (!open || !address || !publicClient || selectedToken !== 'CAMLY') {
        setAllowance(BigInt(0));
        return;
      }

      setIsCheckingAllowance(true);
      try {
        const currentAllowance = await publicClient.readContract({
          address: CAMLY_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, MULTICALL3_ADDRESS]
        } as any);
        setAllowance(currentAllowance as bigint);
      } catch (err) {
        console.error('Error checking allowance:', err);
        setAllowance(BigInt(0));
      } finally {
        setIsCheckingAllowance(false);
      }
    };

    checkAllowance();
  }, [open, address, publicClient, selectedToken]);

  // Parse and validate recipients
  // Supports: comma-separated, tab-separated (Excel/Google Sheets), space-separated
  const recipients = useMemo<Recipient[]>(() => {
    if (!inputText.trim()) return [];
    
    const lines = inputText.trim().split('\n');
    const parsed: Recipient[] = [];
    const seenAddresses = new Set<string>();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Support tab (Excel/Google Sheets), comma, or multiple spaces as separators
      // Priority: tab > comma > spaces
      let parts: string[];
      if (trimmed.includes('\t')) {
        // Tab-separated (from Excel/Google Sheets copy-paste)
        parts = trimmed.split('\t').map(p => p.trim()).filter(Boolean);
      } else if (trimmed.includes(',')) {
        // Comma-separated
        parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
      } else {
        // Space-separated (fallback)
        parts = trimmed.split(/\s+/).filter(Boolean);
      }

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
  const totalAmountWei = parseUnits(totalAmount.toString(), 8); // CAMLY has 8 decimals

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
  const hasEnoughAllowance = allowance >= totalAmountWei;
  const needsApproval = isErc20 && !hasEnoughAllowance && validRecipients.length > 0;

  const handleApprove = async () => {
    if (!address || !chain) return;

    setIsApproving(true);
    try {
      toast.info('Đang yêu cầu cấp quyền cho Multicall3...');
      
      const hash = await writeContractAsync({
        address: CAMLY_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [MULTICALL3_ADDRESS, maxUint256],
        account: address,
        chain: chain,
      });

      toast.info('Đang chờ xác nhận...');
      
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Update allowance
      setAllowance(maxUint256);
      toast.success('✅ Đã cấp quyền thành công! Bây giờ bạn có thể chuyển hàng loạt.');
    } catch (err: any) {
      console.error('Approve error:', err);
      toast.error('Cấp quyền thất bại: ' + (err.shortMessage || err.message));
    } finally {
      setIsApproving(false);
    }
  };

  const handleBatchTransfer = async () => {
    if (validRecipients.length === 0 || !hasEnoughBalance || !address) return;

    setIsProcessing(true);
    setResults([]);
    setCurrentIndex(0);

    try {
      if (isErc20) {
        // Use Multicall3 for ERC20 with transferFrom
        toast.info(`Đang chuẩn bị ${validRecipients.length} giao dịch CAMLY...`);

        // Encode all transferFrom calls
        const calls = validRecipients.map(r => ({
          target: CAMLY_ADDRESS,
          allowFailure: false,
          callData: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'transferFrom',
            args: [
              address, // from: user's wallet
              r.address as `0x${string}`, // to: recipient
              parseUnits(r.amount, 8) // amount: CAMLY has 8 decimals
            ]
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

          {/* Approval Status for CAMLY */}
          {isErc20 && validRecipients.length > 0 && (
            <div 
              className={`p-3 rounded-xl ${needsApproval ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}
              style={{ border: '1px solid' }}
            >
              {isCheckingAllowance ? (
                <p className="text-sm flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang kiểm tra quyền...
                </p>
              ) : needsApproval ? (
                <div className="space-y-2">
                  <p className="text-sm flex items-center gap-2 text-amber-700">
                    <Unlock className="w-4 h-4" />
                    Cần cấp quyền cho Multicall3 (chỉ 1 lần)
                  </p>
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving}
                    size="sm"
                    className="w-full text-white"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    }}
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang cấp quyền...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        🔓 Cấp Quyền Một Lần
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm flex items-center gap-2 text-green-700">
                  <ShieldCheck className="w-4 h-4" />
                  ✅ Đã cấp quyền - Sẵn sàng batch transfer
                </p>
              )}
            </div>
          )}

          {/* Recipients Input */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>
              Danh sách người nhận
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Mỗi dòng 1 cặp: địa chỉ, số lượng\n\nVí dụ:\n0x1234...5678, 100\n0xabcd...efgh, 200\n\n💡 Hỗ trợ paste từ Excel/Google Sheets`}
              className="min-h-[120px] border-[#DAA520]/40 bg-white/80 text-sm font-mono"
              disabled={isProcessing}
            />
            <p className="text-xs mt-1" style={{ color: '#8B6914' }}>
              📋 Hỗ trợ paste từ Excel/Google Sheets (2 cột: địa chỉ, số lượng)
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
            disabled={validRecipients.length === 0 || !hasEnoughBalance || isProcessing || (isErc20 && needsApproval)}
            className="w-full text-white"
            style={{
              background: validRecipients.length > 0 && hasEnoughBalance && (!isErc20 || !needsApproval)
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
