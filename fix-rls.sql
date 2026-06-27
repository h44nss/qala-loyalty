-- Drop old recursive policies
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all stamp tokens" ON public.stamp_tokens;
DROP POLICY IF EXISTS "Admin can insert stamp tokens" ON public.stamp_tokens;
DROP POLICY IF EXISTS "Admin can view all history" ON public.stamp_history;
DROP POLICY IF EXISTS "Admin can view all redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Admin can insert redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Admin can update settings" ON public.settings;

-- Create security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate admin policies
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin can view all stamp tokens" ON public.stamp_tokens FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can insert stamp tokens" ON public.stamp_tokens FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin can view all history" ON public.stamp_history FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin can view all redemptions" ON public.reward_redemptions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can insert redemptions" ON public.reward_redemptions FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update settings" ON public.settings FOR UPDATE USING (public.is_admin());
