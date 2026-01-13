import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface RewardInfo {
  points: number;
  type: 'signup' | 'wallet_connect' | 'forum_post' | 'forum_comment' | 'forum_like' | 'chat_message' | 'referral';
  isLightQuestion?: boolean;
}

const REWARD_LABELS: Record<RewardInfo['type'], string> = {
  signup: 'Đăng ký tài khoản',
  wallet_connect: 'Kết nối ví Web3',
  forum_post: 'Đăng bài diễn đàn',
  forum_comment: 'Bình luận diễn đàn',
  forum_like: 'Thích bài viết',
  chat_message: 'Câu hỏi',
  referral: 'Giới thiệu bạn',
};

export function useRewardToast() {
  const lastToastTime = useRef<number>(0);
  const pendingPoints = useRef<number>(0);
  const pendingTimeout = useRef<NodeJS.Timeout | null>(null);

  const showRewardToast = useCallback((reward: RewardInfo) => {
    if (reward.points <= 0) return;

    const now = Date.now();
    const label = REWARD_LABELS[reward.type];

    // For chat messages, batch toasts to avoid spam
    if (reward.type === 'chat_message') {
      pendingPoints.current += reward.points;
      
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current);
      }

      pendingTimeout.current = setTimeout(() => {
        const points = pendingPoints.current;
        pendingPoints.current = 0;
        
        const lightBadge = reward.isLightQuestion ? ' ✨ Câu hỏi ánh sáng!' : '';
        toast.success(
          `+${points} điểm Ánh Sáng${lightBadge}`,
          {
            description: 'Tiếp tục hỏi những câu hỏi chất lượng nhé! 💛',
            duration: 3000,
            icon: '🌟',
          }
        );
      }, 1500);

      return;
    }

    // For other activities, show immediately but with rate limiting
    if (now - lastToastTime.current < 2000) return;
    lastToastTime.current = now;

    toast.success(
      `+${reward.points} điểm Ánh Sáng!`,
      {
        description: label,
        duration: 4000,
        icon: '🎉',
      }
    );
  }, []);

  return { showRewardToast };
}
