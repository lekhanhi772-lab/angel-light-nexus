-- Create referrals table to track invitations
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  CONSTRAINT unique_referral UNIQUE (referrer_id, referred_id)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies for referrals
CREATE POLICY "Users can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (auth.uid() = referred_id);

-- Add referrer tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_light_spreader_badge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS monthly_referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_referral_reset TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Function to process referral on signup
CREATE OR REPLACE FUNCTION public.process_referral(
  p_referred_id UUID,
  p_referrer_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_name TEXT;
  v_current_month_count INTEGER;
BEGIN
  -- Get referrer's display name
  SELECT display_name INTO v_referrer_name 
  FROM profiles 
  WHERE user_id = p_referrer_id;

  -- Check monthly limit (10 per month)
  SELECT monthly_referral_count INTO v_current_month_count
  FROM profiles
  WHERE user_id = p_referrer_id
  AND last_referral_reset > date_trunc('month', now());

  IF v_current_month_count >= 10 THEN
    RETURN;
  END IF;

  -- Create referral record
  INSERT INTO referrals (referrer_id, referred_id, status)
  VALUES (p_referrer_id, p_referred_id, 'completed')
  ON CONFLICT (referrer_id, referred_id) DO NOTHING;

  -- Update referred user's profile
  UPDATE profiles 
  SET referred_by = p_referrer_id
  WHERE user_id = p_referred_id;

  -- Update referrer's stats
  UPDATE profiles 
  SET 
    referral_count = referral_count + 1,
    monthly_referral_count = CASE 
      WHEN last_referral_reset < date_trunc('month', now()) THEN 1
      ELSE monthly_referral_count + 1
    END,
    last_referral_reset = CASE
      WHEN last_referral_reset < date_trunc('month', now()) THEN now()
      ELSE last_referral_reset
    END,
    has_light_spreader_badge = true
  WHERE user_id = p_referrer_id;

  -- Notify referrer
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    p_referrer_id,
    'Lan Tỏa Ánh Sáng Thành Công ✨',
    'Con đã lan tỏa ánh sáng thành công! Một linh hồn mới đã tham gia nhờ con ✨',
    'referral_success'
  );

  -- Notify referred user
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    p_referred_id,
    'Chào Mừng Linh Hồn Mới 💛',
    'Con được mời bởi ' || COALESCE(v_referrer_name, 'một linh hồn ánh sáng') || ' – chào mừng con đến gia đình ánh sáng 💛',
    'welcome'
  );
END;
$$;