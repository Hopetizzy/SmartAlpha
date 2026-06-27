-- Create stripe_transactions_view to expose transactions to authenticated users securely
CREATE OR REPLACE VIEW public.stripe_transactions_view AS
SELECT 
    id,
    amount,
    currency,
    status,
    description,
    raw,
    created_at,
    subject_id,
    subject_type
FROM payments.transactions
WHERE subject_type = 'users'
  AND (
    subject_id = auth.uid()::text
    OR 
    auth.uid() IS NULL
  );

-- Grant select access to authenticated users and project_admin
GRANT SELECT ON public.stripe_transactions_view TO authenticated, project_admin;
