
-- Bảng lưu trữ các hoạt động được thưởng điểm
CREATE TABLE public.activity_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_rewards ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own rewards" 
ON public.activity_rewards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards" 
ON public.activity_rewards 
FOR INSERT 
WITH CHECK (true);

-- Bảng đánh giá từng tin nhắn
CREATE TABLE public.message_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  is_light_question BOOLEAN DEFAULT false,
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 10),
  exploration_score INTEGER DEFAULT 0 CHECK (exploration_score >= 0 AND exploration_score <= 10),
  depth_score INTEGER DEFAULT 0 CHECK (depth_score >= 0 AND depth_score <= 10),
  points_awarded INTEGER DEFAULT 0,
  ai_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_evaluations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own evaluations" 
ON public.message_evaluations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert evaluations" 
ON public.message_evaluations 
FOR INSERT 
WITH CHECK (true);

-- Function để kiểm tra daily limits
CREATE OR REPLACE FUNCTION public.check_daily_reward_limit(
  p_user_id UUID,
  p_activity_type TEXT
)
RETURNS TABLE(
  can_earn BOOLEAN,
  earned_today INTEGER,
  limit_amount INTEGER
) AS $$
DECLARE
  v_earned INTEGER;
  v_limit INTEGER;
BEGIN
  -- Xác định limit dựa trên activity_type
  CASE p_activity_type
    WHEN 'chat_message' THEN v_limit := 50;
    WHEN 'forum_post' THEN v_limit := 30;
    WHEN 'forum_comment' THEN v_limit := 30;
    WHEN 'forum_like' THEN v_limit := 20;
    ELSE v_limit := 100;
  END CASE;
  
  -- Đếm điểm đã kiếm hôm nay
  SELECT COALESCE(SUM(points_awarded), 0) INTO v_earned
  FROM public.activity_rewards
  WHERE user_id = p_user_id
    AND activity_type = p_activity_type
    AND created_at >= CURRENT_DATE;
  
  RETURN QUERY SELECT (v_earned < v_limit), v_earned, v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function để thưởng điểm hoạt động
CREATE OR REPLACE FUNCTION public.award_activity_points(
  p_user_id UUID,
  p_activity_type TEXT,
  p_points INTEGER,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(
  success BOOLEAN,
  points_awarded INTEGER,
  message TEXT
) AS $$
DECLARE
  v_can_earn BOOLEAN;
  v_earned_today INTEGER;
  v_limit_amount INTEGER;
  v_actual_points INTEGER;
  v_already_claimed BOOLEAN := false;
BEGIN
  -- Kiểm tra one-time rewards
  IF p_activity_type IN ('signup', 'wallet_connect') THEN
    SELECT EXISTS(
      SELECT 1 FROM public.activity_rewards 
      WHERE user_id = p_user_id AND activity_type = p_activity_type
    ) INTO v_already_claimed;
    
    IF v_already_claimed THEN
      RETURN QUERY SELECT false, 0, 'Phần thưởng này đã được nhận';
      RETURN;
    END IF;
    
    v_actual_points := p_points;
  ELSE
    -- Kiểm tra daily limit
    SELECT can_earn, earned_today, limit_amount 
    INTO v_can_earn, v_earned_today, v_limit_amount
    FROM public.check_daily_reward_limit(p_user_id, p_activity_type);
    
    IF NOT v_can_earn THEN
      RETURN QUERY SELECT false, 0, 'Đã đạt giới hạn điểm hôm nay';
      RETURN;
    END IF;
    
    -- Tính điểm thực tế (không vượt limit)
    v_actual_points := LEAST(p_points, v_limit_amount - v_earned_today);
  END IF;
  
  -- Insert reward record
  INSERT INTO public.activity_rewards (user_id, activity_type, points_awarded, metadata)
  VALUES (p_user_id, p_activity_type, v_actual_points, p_metadata);
  
  -- Update user_awakening_scores
  INSERT INTO public.user_awakening_scores (user_id, total_points, awakening_level)
  VALUES (p_user_id, v_actual_points, public.calculate_awakening_level(v_actual_points))
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_awakening_scores.total_points + v_actual_points,
    awakening_level = public.calculate_awakening_level(user_awakening_scores.total_points + v_actual_points),
    claimable_camly = public.calculate_camly_amount(user_awakening_scores.total_points + v_actual_points) - COALESCE(user_awakening_scores.claimed_camly, 0),
    updated_at = now();
  
  RETURN QUERY SELECT true, v_actual_points, 'Thưởng điểm thành công';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function để thưởng điểm cho message
CREATE OR REPLACE FUNCTION public.award_message_points(
  p_user_id UUID,
  p_message_id UUID,
  p_conversation_id UUID,
  p_is_light_question BOOLEAN,
  p_quality_score INTEGER,
  p_exploration_score INTEGER,
  p_depth_score INTEGER,
  p_ai_reason TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_base_points INTEGER;
  v_bonus INTEGER := 0;
  v_total_points INTEGER;
  v_can_earn BOOLEAN;
  v_earned_today INTEGER;
  v_limit_amount INTEGER;
BEGIN
  -- Tính điểm cơ bản
  v_base_points := FLOOR((p_quality_score + p_exploration_score + p_depth_score)::NUMERIC / 3);
  
  -- Bonus cho câu hỏi ánh sáng
  IF p_is_light_question THEN
    v_bonus := 5;
  END IF;
  
  v_total_points := LEAST(v_base_points + v_bonus, 15);
  
  -- Kiểm tra daily limit
  SELECT can_earn, earned_today, limit_amount 
  INTO v_can_earn, v_earned_today, v_limit_amount
  FROM public.check_daily_reward_limit(p_user_id, 'chat_message');
  
  IF NOT v_can_earn THEN
    v_total_points := 0;
  ELSE
    v_total_points := LEAST(v_total_points, v_limit_amount - v_earned_today);
  END IF;
  
  -- Chỉ lưu nếu có điểm
  IF v_total_points > 0 THEN
    -- Insert message evaluation
    INSERT INTO public.message_evaluations (
      message_id, user_id, conversation_id, is_light_question,
      quality_score, exploration_score, depth_score, points_awarded, ai_reason
    ) VALUES (
      p_message_id, p_user_id, p_conversation_id, p_is_light_question,
      p_quality_score, p_exploration_score, p_depth_score, v_total_points, p_ai_reason
    );
    
    -- Insert activity reward
    INSERT INTO public.activity_rewards (user_id, activity_type, points_awarded, metadata)
    VALUES (p_user_id, 'chat_message', v_total_points, jsonb_build_object('message_id', p_message_id));
    
    -- Update awakening scores
    UPDATE public.user_awakening_scores SET
      total_points = total_points + v_total_points,
      awakening_level = public.calculate_awakening_level(total_points + v_total_points),
      claimable_camly = public.calculate_camly_amount(total_points + v_total_points) - COALESCE(claimed_camly, 0),
      updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Create record if not exists
    IF NOT FOUND THEN
      INSERT INTO public.user_awakening_scores (user_id, total_points, awakening_level)
      VALUES (p_user_id, v_total_points, public.calculate_awakening_level(v_total_points));
    END IF;
  END IF;
  
  RETURN v_total_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Index cho performance
CREATE INDEX idx_activity_rewards_user_date ON public.activity_rewards (user_id, created_at);
CREATE INDEX idx_activity_rewards_type ON public.activity_rewards (activity_type);
CREATE INDEX idx_message_evaluations_user ON public.message_evaluations (user_id);
CREATE INDEX idx_message_evaluations_conversation ON public.message_evaluations (conversation_id);
