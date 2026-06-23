-- Add INSERT policy for target_wallets to allow seeding and webhook/bot inserts
CREATE POLICY "Anyone can insert target wallets" ON public.target_wallets
    FOR INSERT WITH CHECK (true);
