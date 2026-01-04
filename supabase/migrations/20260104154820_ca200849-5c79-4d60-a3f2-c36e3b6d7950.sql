-- Add wallet_address column to profiles table for Web3 integration
ALTER TABLE public.profiles 
ADD COLUMN wallet_address TEXT DEFAULT NULL;

-- Add created_at index for performance when counting "days with Angel"
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Add index for wallet_address lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);

-- Add RLS policy for updating wallet_address (users can update their own)
CREATE POLICY "Users can update their own wallet address"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);