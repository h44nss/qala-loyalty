-- Phase 1: Database Schema & Backend Foundation
-- Run this script in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role text DEFAULT 'customer'::text CHECK (role IN ('admin', 'customer')),
  full_name text NOT NULL,
  phone_number text UNIQUE NOT NULL,
  instagram_username text,
  current_stamp integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Stamp Tokens Table
CREATE TABLE public.stamp_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token_code text UNIQUE NOT NULL,
  stamp_amount integer NOT NULL CHECK (stamp_amount > 0),
  status text DEFAULT 'unused'::text CHECK (status IN ('unused', 'used', 'expired')),
  generated_by uuid REFERENCES public.profiles(id),
  used_by uuid REFERENCES public.profiles(id),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 3. Reward Redemptions Table
CREATE TABLE public.reward_redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) NOT NULL,
  stamps_used integer DEFAULT 10,
  verified_by uuid REFERENCES public.profiles(id) NOT NULL,
  redeemed_at timestamptz DEFAULT now()
);

-- 4. Stamp History Table
CREATE TABLE public.stamp_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES public.profiles(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('earn', 'redeem')),
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  related_token_id uuid REFERENCES public.stamp_tokens(id),
  related_redemption_id uuid REFERENCES public.reward_redemptions(id),
  created_at timestamptz DEFAULT now()
);

-- 5. Settings Table
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

INSERT INTO public.settings (key, value) VALUES
  ('stamp_target', '10'),
  ('qr_expiration_seconds', '180');


-- 6. Trigger for New User Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(new.phone, 'Unknown'),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 7. RPC Functions
-- A. generate_stamp_token
CREATE OR REPLACE FUNCTION public.generate_stamp_token(p_admin_id uuid, p_stamp_amount int)
RETURNS SETOF public.stamp_tokens AS $$
DECLARE
  v_expiration_seconds int;
  v_token_code text;
BEGIN
  -- random 8 char token code
  v_token_code := substr(md5(random()::text), 1, 8);
  SELECT value::int INTO v_expiration_seconds FROM public.settings WHERE key = 'qr_expiration_seconds';
  
  RETURN QUERY
  INSERT INTO public.stamp_tokens (token_code, stamp_amount, generated_by, expires_at)
  VALUES (
    v_token_code, 
    p_stamp_amount, 
    p_admin_id, 
    now() + (v_expiration_seconds || ' seconds')::interval
  ) RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. claim_stamp_token
CREATE OR REPLACE FUNCTION public.claim_stamp_token(p_token_code text, p_customer_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_token record;
  v_new_balance int;
BEGIN
  SELECT * INTO v_token FROM public.stamp_tokens WHERE token_code = p_token_code FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'QR tidak valid');
  END IF;
  
  IF v_token.status = 'used' THEN
    RETURN jsonb_build_object('success', false, 'message', 'QR sudah pernah digunakan');
  END IF;

  IF v_token.status = 'expired' OR v_token.expires_at < now() THEN
    UPDATE public.stamp_tokens SET status = 'expired' WHERE id = v_token.id;
    RETURN jsonb_build_object('success', false, 'message', 'QR sudah kedaluwarsa');
  END IF;
  
  UPDATE public.profiles 
  SET current_stamp = current_stamp + v_token.stamp_amount 
  WHERE id = p_customer_id 
  RETURNING current_stamp INTO v_new_balance;
  
  UPDATE public.stamp_tokens 
  SET status = 'used', used_by = p_customer_id, used_at = now() 
  WHERE id = v_token.id;
  
  INSERT INTO public.stamp_history (customer_id, type, amount, balance_after, related_token_id)
  VALUES (p_customer_id, 'earn', v_token.stamp_amount, v_new_balance, v_token.id);
  
  RETURN jsonb_build_object('success', true, 'message', 'Stempel berhasil diklaim', 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. redeem_reward
CREATE OR REPLACE FUNCTION public.redeem_reward(p_customer_id uuid, p_admin_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_current_stamp int;
  v_stamp_target int;
  v_redemption_id uuid;
BEGIN
  SELECT value::int INTO v_stamp_target FROM public.settings WHERE key = 'stamp_target';
  
  SELECT current_stamp INTO v_current_stamp FROM public.profiles WHERE id = p_customer_id FOR UPDATE;
  
  IF v_current_stamp < v_stamp_target THEN
    RETURN jsonb_build_object('success', false, 'message', 'Stempel belum cukup');
  END IF;
  
  UPDATE public.profiles SET current_stamp = current_stamp - v_stamp_target WHERE id = p_customer_id;
  
  INSERT INTO public.reward_redemptions (customer_id, stamps_used, verified_by)
  VALUES (p_customer_id, v_stamp_target, p_admin_id) RETURNING id INTO v_redemption_id;
  
  INSERT INTO public.stamp_history (customer_id, type, amount, balance_after, related_redemption_id)
  VALUES (p_customer_id, 'redeem', -v_stamp_target, v_current_stamp - v_stamp_target, v_redemption_id);
  
  RETURN jsonb_build_object('success', true, 'message', 'Reward berhasil ditukar', 'new_balance', v_current_stamp - v_stamp_target);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Profiles: 
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update all profiles" ON public.profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Stamp Tokens:
CREATE POLICY "Admin can view all stamp tokens" ON public.stamp_tokens FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can insert stamp tokens" ON public.stamp_tokens FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Stamp History:
CREATE POLICY "Users can view own history" ON public.stamp_history FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admin can view all history" ON public.stamp_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Reward Redemptions:
CREATE POLICY "Users can view own redemptions" ON public.reward_redemptions FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admin can view all redemptions" ON public.reward_redemptions FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can insert redemptions" ON public.reward_redemptions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Settings:
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin can update settings" ON public.settings FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
