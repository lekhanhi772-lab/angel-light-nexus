import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAccount, useWriteContract, useSendTransaction, usePublicClient, useSwitchChain } from 'wagmi';
import { parseEther, parseUnits, isAddress, encodeFunctionData, maxUint256 } from 'viem';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { AlertTriangle, Users, CheckCircle, XCircle, Loader2, Unlock, ShieldCheck, AlertCircle } from 'lucide-react';
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

const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;
const CAMLY_ADDRESS = '0x0910320181889feFDE0BB1Ca63962b0A8882e413' as const;
const BNB_CHAIN_ID = 56;
const CAMLY_DECIMALS = 8;

const ERC20_ABI = [
  { name: 'transfer', type: 'function', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'transferFrom', type: 'function', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'approve', type: 'function', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'allowance', type: 'function', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' }
] as const;

const MULTICALL3_ABI = [{
  name: 'aggregate3', type: 'function',
  inputs: [{ components: [{ name: 'target', type: 'address' }, { name: 'allowFailure', type: 'bool' }, { name: 'callData', type: 'bytes' }], name: 'calls', type: 'tuple[]' }],
  outputs: [{ components: [{ name: 'success', type: 'bool' }, { name: 'returnData', type: 'bytes' }], name: 'returnData', type: 'tuple[]' }]
}] as const;

export const BatchTransferDialog = ({ open, onOpenChange }: BatchTransferDialogProps) => {
  const { t } = useTranslation();
  const { address, chain } = useAccount();
  const { tokenBalances } = useWalletBalances();
  const { switchChain } = useSwitchChain();
  const [selectedToken, setSelectedToken] = useState<'BNB' | 'CAMLY'>('CAMLY');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [results, setResults] = useState<TransferResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  const [useSequentialMode, setUseSequentialMode] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();

  const isOnBnbChain = chain?.id === BNB_CHAIN_ID;

  useEffect(() => {
    const checkAllowance = async () => {
      if (!open || !address || !publicClient || selectedToken !== 'CAMLY' || !isOnBnbChain) {
        setAllowance(BigInt(0));
        return;
      }
      setIsCheckingAllowance(true);
      try {
        const currentAllowance = await publicClient.readContract({
          address: CAMLY_ADDRESS, abi: ERC20_ABI, functionName: 'allowance', args: [address, MULTICALL3_ADDRESS]
        } as any);
        setAllowance(currentAllowance as bigint);
      } catch (err) {
        setAllowance(BigInt(0));
      } finally {
        setIsCheckingAllowance(false);
      }
    };
    checkAllowance();
  }, [open, address, publicClient, selectedToken, isOnBnbChain]);

  useEffect(() => { setSimulationError(null); }, [inputText, selectedToken, useSequentialMode]);

  const recipients = useMemo<Recipient[]>(() => {
    if (!inputText.trim()) return [];
    const lines = inputText.trim().split('\n');
    const parsed: Recipient[] = [];
    const seenAddresses = new Set<string>();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let parts: string[];
      if (trimmed.includes('\t')) parts = trimmed.split('\t').map(p => p.trim()).filter(Boolean);
      else if (trimmed.includes(',')) parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
      else parts = trimmed.split(/\s+/).filter(Boolean);

      if (parts.length < 2) { parsed.push({ address: trimmed, amount: '0', isValid: false, error: t('batchTransfer.invalid_format') }); continue; }
      const addr = parts[0].trim();
      const amountStr = parts[1].trim().replace(',', '.');
      const amount = parseFloat(amountStr);

      if (!isAddress(addr)) parsed.push({ address: addr, amount: amountStr, isValid: false, error: t('batchTransfer.invalid_address') });
      else if (addr.toLowerCase() === address?.toLowerCase()) parsed.push({ address: addr, amount: amountStr, isValid: false, error: t('batchTransfer.self_send') });
      else if (seenAddresses.has(addr.toLowerCase())) parsed.push({ address: addr, amount: amountStr, isValid: false, error: t('batchTransfer.duplicate_address') });
      else if (isNaN(amount) || amount <= 0) parsed.push({ address: addr, amount: amountStr, isValid: false, error: t('batchTransfer.invalid_amount') });
      else { parsed.push({ address: addr, amount: amountStr, isValid: true }); seenAddresses.add(addr.toLowerCase()); }
    }
    return parsed;
  }, [inputText, address, t]);

  const validRecipients = recipients.filter(r => r.isValid);
  const invalidRecipients = recipients.filter(r => !r.isValid);

  const totalAmountWei = useMemo(() => {
    if (validRecipients.length === 0) return BigInt(0);
    try { return validRecipients.reduce((sum, r) => sum + parseUnits(r.amount, selectedToken === 'CAMLY' ? CAMLY_DECIMALS : 18), BigInt(0)); }
    catch { return BigInt(0); }
  }, [validRecipients, selectedToken]);

  const totalAmount = useMemo(() => validRecipients.reduce((sum, r) => sum + parseFloat(r.amount), 0), [validRecipients]);

  const currentBalance = useMemo(() => {
    const token = tokenBalances.find(t => t.symbol === selectedToken);
    return parseFloat(token?.balanceFormatted || '0');
  }, [selectedToken, tokenBalances]);

  const hasEnoughBalance = currentBalance >= totalAmount;
  const isErc20 = selectedToken === 'CAMLY';
  const hasEnoughAllowance = allowance >= totalAmountWei;
  const needsApproval = isErc20 && !hasEnoughAllowance && validRecipients.length > 0 && !useSequentialMode;

  const handleSwitchNetwork = async () => {
    try { await switchChain({ chainId: BNB_CHAIN_ID }); }
    catch { toast.error(t('batchTransfer.switch_error')); }
  };

  const handleApprove = async () => {
    if (!address || !chain || !isOnBnbChain) return;
    setIsApproving(true);
    try {
      toast.info(t('batchTransfer.approve_requesting'));
      const hash = await writeContractAsync({ address: CAMLY_ADDRESS, abi: ERC20_ABI, functionName: 'approve', args: [MULTICALL3_ADDRESS, maxUint256], account: address, chain });
      toast.info(t('batchTransfer.approve_waiting'));
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
        const newAllowance = await publicClient.readContract({ address: CAMLY_ADDRESS, abi: ERC20_ABI, functionName: 'allowance', args: [address, MULTICALL3_ADDRESS] } as any);
        setAllowance(newAllowance as bigint);
      }
      toast.success(t('batchTransfer.approve_success'));
    } catch (err: any) {
      toast.error(t('batchTransfer.approve_failed') + ': ' + (err.shortMessage || err.message));
    } finally { setIsApproving(false); }
  };

  const handleBatchTransfer = async () => {
    if (validRecipients.length === 0 || !hasEnoughBalance || !address || !isOnBnbChain) return;
    setIsProcessing(true); setResults([]); setCurrentIndex(0); setSimulationError(null);

    try {
      if (isErc20 && !useSequentialMode) {
        toast.info(t('batchTransfer.preparing', { count: validRecipients.length, token: 'CAMLY' }));
        const calls = validRecipients.map(r => ({
          target: CAMLY_ADDRESS, allowFailure: false,
          callData: encodeFunctionData({ abi: ERC20_ABI, functionName: 'transferFrom', args: [address, r.address as `0x${string}`, parseUnits(r.amount, CAMLY_DECIMALS)] })
        }));

        try {
          if (publicClient) await publicClient.simulateContract({ address: MULTICALL3_ADDRESS, abi: MULTICALL3_ABI, functionName: 'aggregate3', args: [calls], account: address });
        } catch (simError: any) {
          setSimulationError(t('batchTransfer.simulation_failed') + ': ' + (simError?.shortMessage || simError?.message));
          setIsProcessing(false); return;
        }

        const hash = await writeContractAsync({ address: MULTICALL3_ADDRESS, abi: MULTICALL3_ABI, functionName: 'aggregate3', args: [calls], account: address, chain });
        if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
        setResults(validRecipients.map(r => ({ address: r.address, success: true, hash })));
        toast.success(t('batchTransfer.batch_success', { count: validRecipients.length }));
      } else {
        toast.info(t('batchTransfer.sequential_processing', { count: validRecipients.length, token: selectedToken }));
        const newResults: TransferResult[] = [];

        for (let i = 0; i < validRecipients.length; i++) {
          const recipient = validRecipients[i];
          setCurrentIndex(i + 1);
          try {
            const hash = isErc20
              ? await writeContractAsync({ address: CAMLY_ADDRESS, abi: ERC20_ABI, functionName: 'transfer', args: [recipient.address as `0x${string}`, parseUnits(recipient.amount, CAMLY_DECIMALS)], account: address, chain })
              : await sendTransactionAsync({ to: recipient.address as `0x${string}`, value: parseEther(recipient.amount) });
            if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
            newResults.push({ address: recipient.address, success: true, hash });
            setResults([...newResults]);
            toast.success(t('batchTransfer.item_success', { current: i + 1, total: validRecipients.length, amount: recipient.amount, token: selectedToken }));
          } catch {
            newResults.push({ address: recipient.address, success: false });
            setResults([...newResults]);
            toast.error(t('batchTransfer.item_failed', { current: i + 1, total: validRecipients.length }));
          }
        }
        const successCount = newResults.filter(r => r.success).length;
        toast[successCount === validRecipients.length ? 'success' : 'warning'](
          successCount === validRecipients.length 
            ? t('batchTransfer.all_complete', { count: successCount })
            : t('batchTransfer.partial_complete', { success: successCount, total: validRecipients.length })
        );
      }
    } catch (err: any) {
      toast.error(t('batchTransfer.transaction_failed') + ': ' + (err.shortMessage || err.message));
    } finally { setIsProcessing(false); }
  };

  const resetDialog = () => { setInputText(''); setResults([]); setCurrentIndex(0); setSimulationError(null); setUseSequentialMode(false); };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetDialog(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFBF0 0%, #FFF8E7 100%)', border: '2px solid rgba(218, 165, 32, 0.4)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#B8860B' }}>
            <Users className="w-5 h-5" style={{ color: '#DAA520' }} />
            {t('batchTransfer.title')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="space-y-4">
            {!isOnBnbChain && (
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-300">
                <p className="text-sm flex items-center gap-2 text-orange-700 mb-2"><AlertCircle className="w-4 h-4" />{t('batchTransfer.switch_network')}</p>
                <Button onClick={handleSwitchNetwork} size="sm" className="w-full text-white" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>{t('batchTransfer.switch_button')}</Button>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>{t('batchTransfer.select_token')}</label>
              <Select value={selectedToken} onValueChange={(v) => setSelectedToken(v as 'BNB' | 'CAMLY')}>
                <SelectTrigger className="border-[#DAA520]/40 bg-white/80"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-[#DAA520]/40">
                  <SelectItem value="CAMLY"><div className="flex items-center gap-2"><img src="https://bscscan.com/token/images/camlycoin_32.png" alt="CAMLY" className="w-5 h-5" /><span>CAMLY ✨</span></div></SelectItem>
                  <SelectItem value="BNB"><div className="flex items-center gap-2"><span>🔶</span><span>BNB</span></div></SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isErc20 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-[#DAA520]/20">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#8B6914' }}>{t('batchTransfer.sequential_mode')}</p>
                  <p className="text-xs" style={{ color: '#B8860B' }}>{useSequentialMode ? t('batchTransfer.sequential_hint', { count: validRecipients.length }) : t('batchTransfer.multicall_hint')}</p>
                </div>
                <Switch checked={useSequentialMode} onCheckedChange={setUseSequentialMode} disabled={isProcessing} />
              </div>
            )}

            {isErc20 && validRecipients.length > 0 && !useSequentialMode && isOnBnbChain && (
              <div className={`p-3 rounded-xl ${needsApproval ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`} style={{ border: '1px solid' }}>
                {isCheckingAllowance ? (
                  <p className="text-sm flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" />{t('batchTransfer.checking_allowance')}</p>
                ) : needsApproval ? (
                  <div className="space-y-2">
                    <p className="text-sm flex items-center gap-2 text-amber-700"><Unlock className="w-4 h-4" />{t('batchTransfer.needs_approval')}</p>
                    <Button onClick={handleApprove} disabled={isApproving} size="sm" className="w-full text-white" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                      {isApproving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('batchTransfer.approving')}</> : <><Unlock className="w-4 h-4 mr-2" />{t('batchTransfer.approve_button')}</>}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm flex items-center gap-2 text-green-700"><ShieldCheck className="w-4 h-4" />{t('batchTransfer.approved')}</p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>{t('batchTransfer.recipients_label')}</label>
              <Textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={t('batchTransfer.recipients_placeholder')} className="min-h-[120px] border-[#DAA520]/40 bg-white/80 text-sm font-mono" disabled={isProcessing} />
              <p className="text-xs mt-1" style={{ color: '#8B6914' }}>{t('batchTransfer.excel_hint')}</p>
            </div>

            {simulationError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-300">
                <p className="text-sm flex items-center gap-2 text-red-700"><AlertTriangle className="w-4 h-4" />{simulationError}</p>
                <p className="text-xs text-red-600 mt-1">{t('batchTransfer.try_sequential')}</p>
              </div>
            )}

            {invalidRecipients.length > 0 && (
              <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {t('batchTransfer.errors_count', { count: invalidRecipients.length })}</p>
                <ScrollArea className="max-h-[60px]">
                  {invalidRecipients.slice(0, 3).map((r, i) => <p key={i} className="text-xs text-red-500 truncate">{r.address.slice(0, 10)}... - {r.error}</p>)}
                  {invalidRecipients.length > 3 && <p className="text-xs text-red-400">{t('batchTransfer.and_more', { count: invalidRecipients.length - 3 })}</p>}
                </ScrollArea>
              </div>
            )}

            {validRecipients.length > 0 && (
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)', border: '1px solid rgba(218, 165, 32, 0.3)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: '#B8860B' }}>{t('batchTransfer.summary')}</p>
                <div className="space-y-1 text-xs" style={{ color: '#8B6914' }}>
                  <p>• {t('batchTransfer.valid_recipients', { count: validRecipients.length })}</p>
                  <p>• {t('batchTransfer.total')}: <span className="font-bold">{totalAmount.toLocaleString()} {selectedToken}</span></p>
                  <p className={hasEnoughBalance ? '' : 'text-red-500'}>• {t('batchTransfer.balance')}: {currentBalance.toLocaleString()} {selectedToken} {hasEnoughBalance ? t('batchTransfer.enough') : t('batchTransfer.not_enough')}</p>
                  <p>• {t('batchTransfer.method')}: <span className="font-medium">{isErc20 && !useSequentialMode ? t('batchTransfer.multicall_method') : t('batchTransfer.sequential_method', { count: validRecipients.length })}</span></p>
                </div>
              </div>
            )}

            {isProcessing && (isErc20 && useSequentialMode || !isErc20) && (
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-600 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t('batchTransfer.processing', { current: currentIndex, total: validRecipients.length })}</p>
              </div>
            )}

            {results.length > 0 && (
              <ScrollArea className="max-h-[100px]">
                <div className="space-y-1">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {r.success ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                      <span className="truncate" style={{ color: r.success ? '#22c55e' : '#ef4444' }}>{r.address.slice(0, 10)}...{r.address.slice(-4)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <Button onClick={handleBatchTransfer} disabled={validRecipients.length === 0 || !hasEnoughBalance || isProcessing || (isErc20 && needsApproval && !useSequentialMode) || !isOnBnbChain} className="w-full text-white"
              style={{ background: validRecipients.length > 0 && hasEnoughBalance && isOnBnbChain && (!isErc20 || !needsApproval || useSequentialMode) ? 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' : undefined }}>
              {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('batchTransfer.processing_button')}</> : <><Users className="w-4 h-4 mr-2" />{t('batchTransfer.send_button')}</>}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};