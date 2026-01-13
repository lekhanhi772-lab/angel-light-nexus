-- Create table for user awakening scores
CREATE TABLE public.user_awakening_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_points INTEGER DEFAULT 0,
  awakening_level INTEGER DEFAULT 1,
  light_level INTEGER DEFAULT 1,
  claimable_camly DECIMAL(18,8) DEFAULT 0,
  claimed_camly DECIMAL(18,8) DEFAULT 0,
  last_evaluation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for conversation evaluations
CREATE TABLE public.conversation_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  spiritual_score INTEGER DEFAULT 0 CHECK (spiritual_score >= 0 AND spiritual_score <= 10),
  positive_score INTEGER DEFAULT 0 CHECK (positive_score >= 0 AND positive_score <= 10),
  growth_score INTEGER DEFAULT 0 CHECK (growth_score >= 0 AND growth_score <= 10),
  gratitude_score INTEGER DEFAULT 0 CHECK (gratitude_score >= 0 AND gratitude_score <= 10),
  compassion_score INTEGER DEFAULT 0 CHECK (compassion_score >= 0 AND compassion_score <= 10),
  total_score INTEGER GENERATED ALWAYS AS (
    spiritual_score + positive_score + growth_score + gratitude_score + compassion_score
  ) STORED,
  points_awarded INTEGER DEFAULT 0,
  ai_feedback TEXT,
  evaluated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id)
);

-- Create table for CAMLY claims
CREATE TABLE public.camly_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  points_converted INTEGER NOT NULL,
  camly_amount DECIMAL(18,8) NOT NULL,
  wallet_address TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.user_awakening_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camly_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_awakening_scores
CREATE POLICY "Users can view their own awakening scores"
  ON public.user_awakening_scores
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert awakening scores"
  ON public.user_awakening_scores
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update awakening scores"
  ON public.user_awakening_scores
  FOR UPDATE
  USING (true);

-- RLS Policies for conversation_evaluations
CREATE POLICY "Users can view their own evaluations"
  ON public.conversation_evaluations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert evaluations"
  ON public.conversation_evaluations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all evaluations"
  ON public.conversation_evaluations
  FOR SELECT
  USING (is_admin());

-- RLS Policies for camly_claims
CREATE POLICY "Users can view their own claims"
  ON public.camly_claims
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims"
  ON public.camly_claims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims"
  ON public.camly_claims
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update claims"
  ON public.camly_claims
  FOR UPDATE
  USING (is_admin());

-- Create function to calculate awakening level based on total points
CREATE OR REPLACE FUNCTION public.calculate_awakening_level(points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE
    WHEN points >= 10000 THEN 10
    WHEN points >= 5000 THEN 9
    WHEN points >= 2500 THEN 8
    WHEN points >= 1500 THEN 7
    WHEN points >= 1000 THEN 6
    WHEN points >= 600 THEN 5
    WHEN points >= 350 THEN 4
    WHEN points >= 200 THEN 3
    WHEN points >= 100 THEN 2
    ELSE 1
  END;
END;
$$;

-- Create function to calculate claimable CAMLY with bonus
CREATE OR REPLACE FUNCTION public.calculate_camly_amount(points INTEGER)
RETURNS DECIMAL(18,8)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  base_camly DECIMAL(18,8);
  bonus_rate DECIMAL(5,4);
BEGIN
  -- Base rate: 100 points = 1 CAMLY
  base_camly := points / 100.0;
  
  -- Calculate bonus based on points amount
  bonus_rate := CASE
    WHEN points >= 5000 THEN 0.10  -- 10% bonus
    WHEN points >= 1000 THEN 0.05  -- 5% bonus
    WHEN points >= 500 THEN 0.02   -- 2% bonus
    ELSE 0
  END;
  
  RETURN base_camly * (1 + bonus_rate);
END;
$$;

-- Create function to update user points after evaluation
CREATE OR REPLACE FUNCTION public.update_user_awakening_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
  daily_points INTEGER;
  max_daily_points INTEGER := 50;
BEGIN
  -- Check daily points limit
  SELECT COALESCE(SUM(points_awarded), 0) INTO daily_points
  FROM conversation_evaluations
  WHERE user_id = NEW.user_id
    AND evaluated_at::date = CURRENT_DATE
    AND id != NEW.id;
  
  -- Apply daily limit
  IF daily_points >= max_daily_points THEN
    NEW.points_awarded := 0;
  ELSIF daily_points + NEW.points_awarded > max_daily_points THEN
    NEW.points_awarded := max_daily_points - daily_points;
  END IF;
  
  -- Insert or update user awakening scores
  INSERT INTO user_awakening_scores (user_id, total_points, awakening_level, last_evaluation_at)
  VALUES (
    NEW.user_id,
    NEW.points_awarded,
    calculate_awakening_level(NEW.points_awarded),
    NEW.evaluated_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_awakening_scores.total_points + NEW.points_awarded,
    awakening_level = calculate_awakening_level(user_awakening_scores.total_points + NEW.points_awarded),
    claimable_camly = calculate_camly_amount(user_awakening_scores.total_points + NEW.points_awarded - (user_awakening_scores.claimed_camly * 100)::INTEGER),
    last_evaluation_at = NEW.evaluated_at,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic points update
CREATE TRIGGER on_evaluation_insert
  BEFORE INSERT ON public.conversation_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_awakening_points();

-- Create function to process CAMLY claim
CREATE OR REPLACE FUNCTION public.process_camly_claim(
  p_user_id UUID,
  p_points_to_convert INTEGER,
  p_wallet_address TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_score RECORD;
  v_camly_amount DECIMAL(18,8);
  v_claim_id UUID;
BEGIN
  -- Get user's current score
  SELECT * INTO v_user_score
  FROM user_awakening_scores
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User has no awakening score';
  END IF;
  
  -- Check if user has enough points (minimum 100 points = 1 CAMLY)
  IF p_points_to_convert < 100 THEN
    RAISE EXCEPTION 'Minimum 100 points required to claim';
  END IF;
  
  -- Check if user has enough claimable points
  IF v_user_score.total_points - (v_user_score.claimed_camly * 100)::INTEGER < p_points_to_convert THEN
    RAISE EXCEPTION 'Not enough claimable points';
  END IF;
  
  -- Calculate CAMLY amount
  v_camly_amount := calculate_camly_amount(p_points_to_convert);
  
  -- Create claim record
  INSERT INTO camly_claims (user_id, points_converted, camly_amount, wallet_address)
  VALUES (p_user_id, p_points_to_convert, v_camly_amount, p_wallet_address)
  RETURNING id INTO v_claim_id;
  
  -- Update user's claimed amount
  UPDATE user_awakening_scores
  SET 
    claimed_camly = claimed_camly + v_camly_amount,
    claimable_camly = calculate_camly_amount(total_points - ((claimed_camly + v_camly_amount) * 100)::INTEGER),
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN v_claim_id;
END;
$$;