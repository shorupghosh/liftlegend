-- =================================================================================
-- SaaS Membership Lifecycle & Automation 
-- =================================================================================

-- 1. Function to Auto-Expire Memberships
-- This safely transitions any active member whose expiry date is in the past into 'EXPIRED'.
CREATE OR REPLACE FUNCTION public.set_expired_members()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.members
  SET status = 'EXPIRED'
  WHERE expiry_date < CURRENT_DATE
    AND status = 'ACTIVE';
END;
$$;

-- 2. Cron Schedule (Requires pg_cron extension enabled in Supabase)
-- Runs the expiry check every night at midnight (00:00 UTC)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Try to unschedule if exists to allow re-running script cleanly
    BEGIN
      PERFORM cron.unschedule('expire_memberships_daily');
    EXCEPTION WHEN OTHERS THEN END;

    PERFORM cron.schedule(
      'expire_memberships_daily',
      '0 0 * * *',
      'SELECT public.set_expired_members();'
    );
  END IF;
END $$;


-- 3. Trigger Function: Reactivate and clear notifications on Repayment
-- When a new payment is inserted into membership_history, reactivate member immediately
CREATE OR REPLACE FUNCTION public.reactivate_member_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the member to ACTIVE and extend their expiry date
  UPDATE public.members
  SET 
    status = 'ACTIVE',
    expiry_date = NEW.end_date,
    plan_id = COALESCE(NEW.plan_id, plan_id)
  WHERE id = NEW.member_id;

  -- Auto-resolve/read any pending alerts for this member
  UPDATE public.notifications
  SET is_read = true
  WHERE related_member_id = NEW.member_id
    AND type IN ('expiry', 'payment_due');
    
  RETURN NEW;
END;
$$;

-- 4. Attach Trigger to Activity
DROP TRIGGER IF EXISTS on_membership_payment_insert ON public.membership_history;
CREATE TRIGGER on_membership_payment_insert
AFTER INSERT ON public.membership_history
FOR EACH ROW
EXECUTE FUNCTION public.reactivate_member_on_payment();

-- 5. Helper RPC to force a refresh manually if needed via app or cron
CREATE OR REPLACE FUNCTION public.force_refresh_all_expiries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.set_expired_members();
END;
$$;
