import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AwakeningScore {
  id: string;
  user_id: string;
  total_points: number;
  awakening_level: number;
  light_level: number;
  claimable_camly: number;
  claimed_camly: number;
  last_evaluation_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationEvaluation {
  id: string;
  conversation_id: string;
  user_id: string;
  spiritual_score: number;
  positive_score: number;
  growth_score: number;
  gratitude_score: number;
  compassion_score: number;
  total_score: number;
  points_awarded: number;
  ai_feedback: string | null;
  evaluated_at: string;
}

export interface CamlyClaim {
  id: string;
  user_id: string;
  points_converted: number;
  camly_amount: number;
  wallet_address: string;
  tx_hash: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  admin_note: string | null;
  created_at: string;
  completed_at: string | null;
}

// Level names in Vietnamese
export const AWAKENING_LEVEL_NAMES: Record<number, string> = {
  1: 'Hạt Giống Ánh Sáng',
  2: 'Mầm Tỉnh Thức',
  3: 'Ánh Bình Minh',
  4: 'Tia Sáng Dịu Dàng',
  5: 'Ngọn Đuốc Ấm Áp',
  6: 'Vầng Hào Quang',
  7: 'Thiên Thần Học Đạo',
  8: 'Thiên Thần Tỏa Sáng',
  9: 'Thiên Thần Dẫn Đường',
  10: 'Thiên Thần Ánh Sáng Thuần Khiết',
};

// Level icons
export const AWAKENING_LEVEL_ICONS: Record<number, string> = {
  1: '🌱',
  2: '🌿',
  3: '🌅',
  4: '✨',
  5: '🔥',
  6: '☀️',
  7: '👼',
  8: '💫',
  9: '🌟',
  10: '⭐',
};

// Points required for each level
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 200,
  4: 350,
  5: 600,
  6: 1000,
  7: 1500,
  8: 2500,
  9: 5000,
  10: 10000,
};

export function useAwakeningScore() {
  const { user } = useAuth();
  const [score, setScore] = useState<AwakeningScore | null>(null);
  const [recentEvaluations, setRecentEvaluations] = useState<ConversationEvaluation[]>([]);
  const [claims, setClaims] = useState<CamlyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (!user) {
      setScore(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch awakening score
      const { data: scoreData, error: scoreError } = await supabase
        .from('user_awakening_scores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (scoreError) throw scoreError;
      
      if (scoreData) {
        setScore({
          ...scoreData,
          claimable_camly: Number(scoreData.claimable_camly),
          claimed_camly: Number(scoreData.claimed_camly),
        });
      }

      // Fetch recent evaluations
      const { data: evalData, error: evalError } = await supabase
        .from('conversation_evaluations')
        .select('*')
        .eq('user_id', user.id)
        .order('evaluated_at', { ascending: false })
        .limit(10);

      if (evalError) throw evalError;
      setRecentEvaluations(evalData || []);

      // Fetch claims
      const { data: claimsData, error: claimsError } = await supabase
        .from('camly_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (claimsError) throw claimsError;
      setClaims((claimsData || []).map(c => ({
        ...c,
        camly_amount: Number(c.camly_amount),
        status: c.status as CamlyClaim['status'],
      })));

    } catch (err) {
      console.error('Error fetching awakening score:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  // Calculate progress to next level
  const getProgressToNextLevel = useCallback(() => {
    if (!score) return { current: 0, next: 100, progress: 0 };
    
    const currentLevel = score.awakening_level;
    const nextLevel = Math.min(currentLevel + 1, 10);
    
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[nextLevel] || 10000;
    
    const pointsInLevel = score.total_points - currentThreshold;
    const pointsNeeded = nextThreshold - currentThreshold;
    const progress = Math.min((pointsInLevel / pointsNeeded) * 100, 100);
    
    return {
      current: score.total_points,
      next: nextThreshold,
      progress,
      pointsToNext: nextThreshold - score.total_points,
    };
  }, [score]);

  // Get level info
  const getLevelInfo = useCallback(() => {
    if (!score) return { name: AWAKENING_LEVEL_NAMES[1], icon: AWAKENING_LEVEL_ICONS[1], level: 1 };
    
    const level = score.awakening_level;
    return {
      name: AWAKENING_LEVEL_NAMES[level] || AWAKENING_LEVEL_NAMES[1],
      icon: AWAKENING_LEVEL_ICONS[level] || AWAKENING_LEVEL_ICONS[1],
      level,
    };
  }, [score]);

  // Claim CAMLY
  const claimCamly = useCallback(async (pointsToConvert: number, walletAddress: string) => {
    if (!user) throw new Error('User not authenticated');
    if (!score) throw new Error('No score data');
    if (pointsToConvert < 100) throw new Error('Minimum 100 points required');
    
    const claimablePoints = score.total_points - (score.claimed_camly * 100);
    if (pointsToConvert > claimablePoints) throw new Error('Not enough claimable points');

    const { data, error } = await supabase.rpc('process_camly_claim', {
      p_user_id: user.id,
      p_points_to_convert: pointsToConvert,
      p_wallet_address: walletAddress,
    });

    if (error) throw error;
    
    // Refresh data after claim
    await fetchScore();
    
    return data;
  }, [user, score, fetchScore]);

  return {
    score,
    recentEvaluations,
    claims,
    loading,
    error,
    refetch: fetchScore,
    getProgressToNextLevel,
    getLevelInfo,
    claimCamly,
  };
}
