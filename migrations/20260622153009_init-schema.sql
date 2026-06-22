-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    telegram_chat_id TEXT,
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Create alert_settings table
CREATE TABLE IF NOT EXISTS public.alert_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    min_liquidity NUMERIC DEFAULT 0 NOT NULL,
    min_volume NUMERIC DEFAULT 0 NOT NULL,
    max_risk_score INTEGER DEFAULT 100 NOT NULL
);

-- 3. Create target_wallets table
CREATE TABLE IF NOT EXISTS public.target_wallets (
    address TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    win_rate NUMERIC DEFAULT 0 NOT NULL,
    profit_loss_7d NUMERIC DEFAULT 0 NOT NULL
);

-- 4. Create watchlists table
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    wallet_address TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_wallet UNIQUE (user_id, wallet_address)
);

-- 5. Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    token_mint TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    type TEXT NOT NULL, -- "BUY" or "SELL"
    amount_usd NUMERIC NOT NULL,
    risk_score INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS (Row Level Security) on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Users: Users can read their own user record.
CREATE POLICY "Users can read own record" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Alert settings: Users can read/write their own settings.
CREATE POLICY "Users can read own settings" ON public.alert_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.alert_settings
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.alert_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Target wallets: All authenticated users can read.
CREATE POLICY "Anyone can read target wallets" ON public.target_wallets
    FOR SELECT TO authenticated USING (true);

-- Watchlists: Users can read/write their own watchlists.
CREATE POLICY "Users can read own watchlists" ON public.watchlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlists" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists" ON public.watchlists
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists" ON public.watchlists
    FOR DELETE USING (auth.uid() = user_id);

-- Alerts: All authenticated users can read alerts.
CREATE POLICY "Authenticated users can read alerts" ON public.alerts
    FOR SELECT TO authenticated USING (true);
