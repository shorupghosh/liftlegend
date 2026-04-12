-- =================================================================================
-- PERMANENT FIX: Auto-Heal Missing Permissions & Orphaned Accounts
-- Run this script in your Supabase SQL Editor.
-- =================================================================================

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
    -- 1. Loop through all authenticated users who are MISSING from the user_roles table
    FOR u_record IN 
        SELECT id, email, raw_user_meta_data 
        FROM auth.users 
        WHERE id NOT IN (SELECT user_id FROM public.user_roles)
    LOOP
    
        -- 2. Identify if this is the admin account or a gym owner
        IF u_record.email = 'admin@gym.com' OR u_record.email LIKE 'admin@%' THEN
            v_role := 'SUPER_ADMIN';
            
            -- Insert the SUPER_ADMIN permission (does not require a gym)
            INSERT INTO public.user_roles (user_id, role, display_name)
            VALUES (u_record.id, v_role, COALESCE(u_record.raw_user_meta_data->>'full_name', 'System Admin'));
            
        ELSE
            v_role := 'OWNER';
            
            -- Insert an auto-recovered Gym Workspace for them
            INSERT INTO public.gyms (owner_id, name, status, subscription_tier)
            VALUES (
                u_record.id, 
                COALESCE(u_record.raw_user_meta_data->>'gym_name', 'My Gym Workspace'), 
                'ACTIVE', 
                'ADVANCED'
            )
            RETURNING id INTO v_gym_id;

            -- Insert the OWNER permission tied to their recovered gym
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

-- 3. Execute the healing function immediately to fix the current accounts!
SELECT public.permanent_heal_permissions();

-- 4. Enable RPC for AuthContext to use this dynamically as a frontend failsafe in the future!
GRANT EXECUTE ON FUNCTION public.permanent_heal_permissions() TO authenticated;
