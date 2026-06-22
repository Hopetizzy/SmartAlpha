-- Add SELECT policies to allow system/bot to query necessary details anonymously
CREATE POLICY "System can read users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "System can read alert settings" ON public.alert_settings
    FOR SELECT USING (true);

CREATE POLICY "System can read target wallets" ON public.target_wallets
    FOR SELECT USING (true);
