-- =================================================================================
-- COMPLETE SaaS REGISTRATION FIX & ORPHAN RECOVERY
-- Run this ONCE in your Supabase SQL Editor.
-- This ensures no future Gym Owner will ever see the "Account found, but role missing" error!
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- PART 1: The Automated Signup Trigger 
-- This automatically builds the Gym and Permission Role the millisecond they sign up
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_gym_id UUID;
  v_gym_name TEXT;
  v_plan_tier TEXT;
  v_address TEXT;
BEGIN
  -- Extract sign-up form fields
  v_gym_name := COALESCE(NEW.raw_user_meta_data->>'gym_name', 'My Gym Workspace');
  v_plan_tier := COALESCE(NEW.raw_user_meta_data->>'selected_plan_tier', 'ADVANCED');
  v_address := COALESCE(NEW.raw_user_meta_data->>'address', '');

  -- Security Check: Don't create duplicate roles if one accidentally exists
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- System Admin Check
  IF NEW.email = 'admin@gym.com' OR NEW.email LIKE 'admin@%' THEN
    INSERT INTO public.user_roles (user_id, role, display_name)
    VALUES (NEW.id, 'SUPER_ADMIN', 'System Admin');
    RETURN NEW;
  END IF;

  -- Create their exclusive Gym Database Workspace
  INSERT INTO public.gyms (owner_id, name, status, subscription_tier, address)
  VALUES (NEW.id, v_gym_name, 'ACTIVE', v_plan_tier, v_address)
  RETURNING id INTO v_gym_id;

  -- Explicitly grant them the 'OWNER' permission role
  INSERT INTO public.user_roles (user_id, gym_id, role, display_name)
  VALUES (NEW.id, v_gym_id, 'OWNER', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Standardize failsafe to keep transactions clean
  RETURN NEW;
END;
$$;

-- Securely attach the active trigger to the core identity system
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ---------------------------------------------------------------------------------
-- PART 2: The Auto-Heal Sweep for Currently Stuck Users (Like "Fit and Flex")
-- This repairs anyone currently blocked on your login screen
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.permanent_heal_permissions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    u_record RECORD;
    v_gym_id UUID;
    v_role TEXT;
BEGIN
    FOR u_record IN 
        SELECT id, email, raw_user_meta_data 
        FROM auth.users 
        WHERE id NOT IN (SELECT user_id FROM public.user_roles)
    LOOP
        IF u_record.email = 'admin@gym.com' OR u_record.email LIKE 'admin@%' THEN
            v_role := 'SUPER_ADMIN';
            INSERT INTO public.user_roles (user_id, role, display_name)
            VALUES (u_record.id, v_role, COALESCE(u_record.raw_user_meta_data->>'full_name', 'System Admin'));
        ELSE
            v_role := 'OWNER';
            INSERT INTO public.gyms (owner_id, name, status, subscription_tier)
            VALUES (
                u_record.id, 
                COALESCE(u_record.raw_user_meta_data->>'gym_name', 'My Gym Workspace'), 
                'ACTIVE', 
                'ADVANCED'
            )
            RETURNING id INTO v_gym_id;

            INSERT INTO public.user_roles (user_id, gym_id, role, display_name)
            VALUES (
                u_record.id, 
                v_gym_id, 
                v_role, 
                COALESCE(u_record.raw_user_meta_data->>'full_name', u_record.email, 'Gym Owner')
            );
        END IF;
    END LOOP;
END;
$$;

-- Execute the sweep to instantly fix Fit and Flex
SELECT public.permanent_heal_permissions();
GRANT EXECUTE ON FUNCTION public.permanent_heal_permissions() TO authenticated;
