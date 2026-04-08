-- Remove overly permissive policies from orders table
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Add deny-all policies for otps table (accessed only via service role in edge functions)
CREATE POLICY "Deny all select on otps" ON public.otps FOR SELECT USING (false);
CREATE POLICY "Deny all insert on otps" ON public.otps FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny all update on otps" ON public.otps FOR UPDATE USING (false);
CREATE POLICY "Deny all delete on otps" ON public.otps FOR DELETE USING (false);