-- 1. Create helper function to sync a user's Stripe status from payments.stripe_subscriptions and payments.customer_mappings views
CREATE OR REPLACE FUNCTION public.sync_user_stripe_status(user_id_text text)
RETURNS void AS $$
DECLARE
    user_id_uuid uuid;
    is_premium_val boolean;
    stripe_customer_id_val text;
BEGIN
    BEGIN
        user_id_uuid := user_id_text::uuid;
    EXCEPTION WHEN others THEN
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id_uuid) THEN
        RETURN;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM payments.stripe_subscriptions
        WHERE subject_type = 'users'
          AND subject_id = user_id_text
          AND status IN ('active', 'trialing')
    ) INTO is_premium_val;

    SELECT provider_customer_id
    INTO stripe_customer_id_val
    FROM payments.customer_mappings
    WHERE subject_type = 'users'
      AND subject_id = user_id_text
    LIMIT 1;

    UPDATE public.users
    SET is_premium = is_premium_val,
        stripe_customer_id = stripe_customer_id_val
    WHERE id = user_id_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger function for payments.stripe_subscriptions changes
CREATE OR REPLACE FUNCTION public.on_stripe_subscription_change()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.subject_type = 'users' THEN
            PERFORM public.sync_user_stripe_status(OLD.subject_id);
        END IF;
        RETURN OLD;
    ELSE
        IF NEW.subject_type = 'users' THEN
            PERFORM public.sync_user_stripe_status(NEW.subject_id);
        END IF;
        IF TG_OP = 'UPDATE' AND OLD.subject_id <> NEW.subject_id AND OLD.subject_type = 'users' THEN
            PERFORM public.sync_user_stripe_status(OLD.subject_id);
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger function for payments.customer_mappings changes
CREATE OR REPLACE FUNCTION public.on_customer_mapping_change()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.subject_type = 'users' THEN
            PERFORM public.sync_user_stripe_status(OLD.subject_id);
        END IF;
        RETURN OLD;
    ELSE
        IF NEW.subject_type = 'users' THEN
            PERFORM public.sync_user_stripe_status(NEW.subject_id);
        END IF;
        IF TG_OP = 'UPDATE' AND OLD.subject_id <> NEW.subject_id AND OLD.subject_type = 'users' THEN
            PERFORM public.sync_user_stripe_status(OLD.subject_id);
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Triggers on payments schema tables
DROP TRIGGER IF EXISTS trg_stripe_subscription_sync ON payments.stripe_subscriptions;
CREATE TRIGGER trg_stripe_subscription_sync
AFTER INSERT OR UPDATE OR DELETE ON payments.stripe_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.on_stripe_subscription_change();

DROP TRIGGER IF EXISTS trg_customer_mapping_sync ON payments.customer_mappings;
CREATE TRIGGER trg_customer_mapping_sync
AFTER INSERT OR UPDATE OR DELETE ON payments.customer_mappings
FOR EACH ROW EXECUTE FUNCTION public.on_customer_mapping_change();
