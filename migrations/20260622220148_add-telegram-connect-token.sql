-- Add telegram_connect_token column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telegram_connect_token TEXT;

-- Create unique index to allow fast lookup of active tokens
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_telegram_connect_token 
ON public.users (telegram_connect_token) 
WHERE telegram_connect_token IS NOT NULL;
