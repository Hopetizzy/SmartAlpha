-- Add INSERT policies for webhooks to insert alerts and users
CREATE POLICY "Anyone can insert alerts" ON public.alerts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert users" ON public.users
    FOR INSERT WITH CHECK (true);
