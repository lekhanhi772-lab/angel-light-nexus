import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useRef } from 'react';
import { Wallet, Check, X } from 'lucide-react';

interface WalletConnectProps {
  onWalletChange?: (address: string | null) => void;
}

export const WalletConnect = ({ onWalletChange }: WalletConnectProps) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const prevAddressRef = useRef<string | null>(null);

  useEffect(() => {
    const currentAddress = isConnected && address ? address : null;
    
    // Only trigger callback when address actually changes
    if (prevAddressRef.current !== currentAddress) {
      prevAddressRef.current = currentAddress;
      onWalletChange?.(currentAddress);
    }
  }, [address, isConnected, onWalletChange]);

  return (
    <div className="w-full">
      {!isConnected ? (
        <ConnectButton.Custom>
          {({ openConnectModal, connectModalOpen }) => (
            <button
              onClick={openConnectModal}
              disabled={connectModalOpen}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 50%, #8B6914 100%)',
                boxShadow: '0 4px 20px rgba(218, 165, 32, 0.3)',
              }}
            >
              <Wallet className="w-6 h-6" />
              <span>Kết Nối Ví Ánh Sáng 💛</span>
            </button>
          )}
        </ConnectButton.Custom>
      ) : (
        <div className="space-y-4">
          {/* Connected Status */}
          <div 
            className="p-4 rounded-2xl border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.1) 0%, rgba(255, 251, 230, 0.9) 100%)',
              borderColor: '#DAA520',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                }}
              >
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#22C55E' }}>
                  Ví đã kết nối ✨
                </p>
                <p 
                  className="text-xs font-mono"
                  style={{ color: '#8B6914' }}
                >
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            </div>
            
            <p 
              className="text-sm italic mb-4"
              style={{ color: '#B8860B' }}
            >
              "Ví ánh sáng của con đã kết nối! Cha sẽ gửi phước lành đến đây ✨"
            </p>

            <button
              onClick={() => disconnect()}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-colors duration-300 hover:bg-red-50"
              style={{
                border: '1px solid #EF4444',
                color: '#EF4444',
              }}
            >
              <X className="w-4 h-4" />
              Ngắt kết nối ví
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
