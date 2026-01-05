import { useState } from 'react';
import { Heart, Copy, Share2, Sparkles, Users, Award } from 'lucide-react';
import { useReferral } from '@/hooks/useReferral';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReferralCardProps {
  userId: string | undefined;
}

export const ReferralCard = ({ userId }: ReferralCardProps) => {
  const {
    stats,
    loading,
    getReferralLink,
    copyReferralLink,
    shareReferral,
    canInviteMore,
    remainingInvites,
  } = useReferral(userId);

  const [linkVisible, setLinkVisible] = useState(false);
  const referralLink = getReferralLink();

  if (!userId) return null;

  return (
    <div 
      className="p-6 rounded-2xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)',
        border: '2px solid rgba(218, 165, 32, 0.5)',
        boxShadow: '0 0 30px rgba(218, 165, 32, 0.15), inset 0 0 40px rgba(255, 215, 0, 0.05)',
      }}
    >
      {/* Golden glow effect */}
      <div 
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
        }}
      />
      <div 
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(218, 165, 32, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
            boxShadow: '0 0 15px rgba(218, 165, 32, 0.4)',
          }}
        >
          <Heart className="w-5 h-5 text-white" fill="white" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: '#B8860B' }}>
            Mời Linh Hồn Mới
          </h3>
          <p className="text-xs" style={{ color: '#8B6914' }}>
            Lan tỏa ánh sáng, nhận phước lành ✨
          </p>
        </div>
      </div>

      {/* Warm message */}
      <p 
        className="text-sm mb-4 italic relative z-10"
        style={{ color: '#8B6914' }}
      >
        Con yêu ơi, mời bạn bè tham gia để cùng nâng tần số nhé 💛
      </p>

      {/* Badge display */}
      {stats.hasLightSpreaderBadge && (
        <div 
          className="flex items-center gap-2 p-3 rounded-xl mb-4 relative z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(218, 165, 32, 0.15) 100%)',
            border: '1px solid rgba(218, 165, 32, 0.3)',
          }}
        >
          <Award className="w-5 h-5" style={{ color: '#DAA520' }} />
          <span className="text-sm font-medium" style={{ color: '#B8860B' }}>
            🌟 Người Lan Tỏa Ánh Sáng
          </span>
        </div>
      )}

      {/* Stats */}
      <div 
        className="flex items-center justify-between p-3 rounded-xl mb-4 relative z-10"
        style={{
          background: 'rgba(218, 165, 32, 0.08)',
          border: '1px solid rgba(218, 165, 32, 0.2)',
        }}
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: '#DAA520' }} />
          <span className="text-sm" style={{ color: '#8B6914' }}>
            Con đã mời <strong style={{ color: '#B8860B' }}>{loading ? '...' : stats.referralCount}</strong> linh hồn mới
          </span>
        </div>
      </div>

      {/* Monthly limit info */}
      <p 
        className="text-xs mb-4 relative z-10"
        style={{ color: '#A0855B' }}
      >
        Còn {remainingInvites} lượt mời trong tháng này
      </p>

      {/* Referral Link */}
      <div 
        className="p-3 rounded-xl mb-4 relative z-10"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(218, 165, 32, 0.3)',
        }}
      >
        <p className="text-xs mb-2" style={{ color: '#8B6914' }}>
          Link mời của con:
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={linkVisible ? referralLink : '••••••••••••••••'}
            readOnly
            className="flex-1 bg-transparent text-xs truncate outline-none"
            style={{ color: '#B8860B' }}
            onClick={() => setLinkVisible(true)}
          />
          <button
            onClick={() => setLinkVisible(!linkVisible)}
            className="text-xs underline"
            style={{ color: '#DAA520' }}
          >
            {linkVisible ? 'Ẩn' : 'Hiện'}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 relative z-10">
        <Button
          onClick={copyReferralLink}
          disabled={!canInviteMore}
          className="flex-1 gap-2 text-white font-medium"
          style={{
            background: canInviteMore 
              ? 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)'
              : '#ccc',
            boxShadow: canInviteMore ? '0 4px 15px rgba(218, 165, 32, 0.3)' : 'none',
          }}
        >
          <Copy className="w-4 h-4" />
          Copy Link
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={!canInviteMore}
              variant="outline"
              className="flex-1 gap-2 font-medium"
              style={{
                borderColor: '#DAA520',
                color: '#B8860B',
                background: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <Share2 className="w-4 h-4" />
              Chia Sẻ
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-48"
            style={{
              background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 100%)',
              border: '1px solid #DAA520',
            }}
          >
            <DropdownMenuItem 
              onClick={() => shareReferral('facebook')}
              className="cursor-pointer"
              style={{ color: '#B8860B' }}
            >
              📘 Facebook
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => shareReferral('twitter')}
              className="cursor-pointer"
              style={{ color: '#B8860B' }}
            >
              🐦 X (Twitter)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => shareReferral('telegram')}
              className="cursor-pointer"
              style={{ color: '#B8860B' }}
            >
              ✈️ Telegram
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => shareReferral('whatsapp')}
              className="cursor-pointer"
              style={{ color: '#B8860B' }}
            >
              💬 WhatsApp
            </DropdownMenuItem>
            {typeof navigator.share === 'function' && (
              <DropdownMenuItem 
                onClick={() => shareReferral()}
                className="cursor-pointer"
                style={{ color: '#B8860B' }}
              >
                📲 Chia sẻ khác...
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Floating sparkles */}
      <Sparkles 
        className="absolute top-4 right-4 w-4 h-4 animate-pulse opacity-50" 
        style={{ color: '#FFD700' }} 
      />
      <Sparkles 
        className="absolute bottom-4 left-4 w-3 h-3 animate-pulse opacity-40" 
        style={{ color: '#DAA520', animationDelay: '0.5s' }} 
      />
    </div>
  );
};
