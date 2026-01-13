import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRewardToast } from './useRewardToast';

export function useActivityRewards() {
  const { user } = useAuth();
  const { showRewardToast } = useRewardToast();

  const awardPoints = useCallback(async (
    activityType: 'signup' | 'wallet_connect' | 'forum_post' | 'forum_comment' | 'forum_like' | 'referral',
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return { success: false, points: 0 };

    const POINTS_MAP: Record<string, number> = {
      signup: 50,
      wallet_connect: 30,
      forum_post: 10,
      forum_comment: 3,
      forum_like: 1,
      referral: 20,
    };

    const points = POINTS_MAP[activityType] || 0;

    try {
      const { data, error } = await supabase.rpc('award_activity_points', {
        p_user_id: user.id,
        p_activity_type: activityType,
        p_points: points,
        p_metadata: metadata
      });

      if (error) {
        console.error('Error awarding points:', error);
        return { success: false, points: 0 };
      }

      const result = data?.[0];
      if (result?.success && result?.points_awarded > 0) {
        showRewardToast({
          points: result.points_awarded,
          type: activityType
        });
        return { success: true, points: result.points_awarded };
      }

      return { success: false, points: 0 };
    } catch (err) {
      console.error('Award points error:', err);
      return { success: false, points: 0 };
    }
  }, [user, showRewardToast]);

  const checkAndAwardSignupBonus = useCallback(async () => {
    return awardPoints('signup');
  }, [awardPoints]);

  const checkAndAwardWalletBonus = useCallback(async () => {
    return awardPoints('wallet_connect');
  }, [awardPoints]);

  const awardForumPostPoints = useCallback(async (postId: string) => {
    return awardPoints('forum_post', { post_id: postId });
  }, [awardPoints]);

  const awardForumCommentPoints = useCallback(async (commentId: string) => {
    return awardPoints('forum_comment', { comment_id: commentId });
  }, [awardPoints]);

  const awardForumLikePoints = useCallback(async (postId: string) => {
    return awardPoints('forum_like', { post_id: postId });
  }, [awardPoints]);

  const awardReferralPoints = useCallback(async (referredUserId: string) => {
    return awardPoints('referral', { referred_user_id: referredUserId });
  }, [awardPoints]);

  return {
    awardPoints,
    checkAndAwardSignupBonus,
    checkAndAwardWalletBonus,
    awardForumPostPoints,
    awardForumCommentPoints,
    awardForumLikePoints,
    awardReferralPoints
  };
}
