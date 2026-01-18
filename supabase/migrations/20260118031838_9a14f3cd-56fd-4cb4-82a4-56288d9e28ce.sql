-- Update calculate_camly_amount function: 1 point = 1,000 CAMLY
CREATE OR REPLACE FUNCTION public.calculate_camly_amount(points integer)
RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
  -- New ratio: 1 point = 1,000 CAMLY
  RETURN points * 1000.0;
END;
$$;

-- Update process_camly_claim function with new ratio
CREATE OR REPLACE FUNCTION public.process_camly_claim(
  p_user_id uuid,
  p_wallet_address text,
  p_points_to_convert integer
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_claimable numeric;
  v_camly_amount numeric;
  v_claim_id uuid;
BEGIN
  -- Check if user has enough claimable points
  SELECT claimable_camly INTO v_current_claimable
  FROM user_awakening_scores
  WHERE user_id = p_user_id;
  
  IF v_current_claimable IS NULL THEN
    RAISE EXCEPTION 'User awakening score not found';
  END IF;
  
  -- Minimum 1 point to claim (gives 1,000 CAMLY)
  IF p_points_to_convert < 1 THEN
    RAISE EXCEPTION 'Minimum 1 point required to claim';
  END IF;
  
  IF v_current_claimable < p_points_to_convert THEN
    RAISE EXCEPTION 'Insufficient claimable points. Available: %, Requested: %', v_current_claimable, p_points_to_convert;
  END IF;
  
  -- Calculate CAMLY amount: 1 point = 1,000 CAMLY
  v_camly_amount := p_points_to_convert * 1000.0;
  
  -- Create claim record
  INSERT INTO camly_claims (
    user_id,
    wallet_address,
    points_converted,
    camly_amount,
    status
  ) VALUES (
    p_user_id,
    p_wallet_address,
    p_points_to_convert,
    v_camly_amount,
    'pending'
  ) RETURNING id INTO v_claim_id;
  
  -- Update user's claimable and claimed amounts
  UPDATE user_awakening_scores
  SET 
    claimable_camly = claimable_camly - p_points_to_convert,
    claimed_camly = COALESCE(claimed_camly, 0) + v_camly_amount,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN v_claim_id::text;
END;
$$;