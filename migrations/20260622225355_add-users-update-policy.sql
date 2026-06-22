-- Add UPDATE policy for users table to allow bot/system updates
CREATE POLICY "System can update users" ON public.users
    FOR UPDATE USING (true) WITH CHECK (true);
