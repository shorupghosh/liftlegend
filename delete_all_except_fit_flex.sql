-- Delete all child data related to other gyms explicitly to prevent any cascading failures
DELETE FROM public.attendance WHERE gym_id != 'caaba35b-5eff-4fbe-9f33-cce92c844cf6';
DELETE FROM public.membership_history WHERE gym_id != 'caaba35b-5eff-4fbe-9f33-cce92c844cf6';
DELETE FROM public.members WHERE gym_id != 'caaba35b-5eff-4fbe-9f33-cce92c844cf6';
DELETE FROM public.plans WHERE gym_id != 'caaba35b-5eff-4fbe-9f33-cce92c844cf6';
DELETE FROM public.notifications WHERE gym_id != 'caaba35b-5eff-4fbe-9f33-cce92c844cf6';
DELETE FROM public.notifications WHERE gym_id != 'caaba35b-5eff-4fbe-9f33-cce92c844cf6';

-- Remove the roles associated with the other gyms (preserve Super Admins)
DELETE FROM public.user_roles 
WHERE gym_id != 'caaba35b-5eff-4fbe-9f33-cce92c844cf6' 
AND role != 'SUPER_ADMIN';

-- Delete the other gyms completely
DELETE FROM public.gyms WHERE id != 'caaba35b-5eff-4fbe-9f33-cce92c844cf6';

-- Delete all users from the authentication table EXCEPT the Super Admin and Fit & Flex owners
DELETE FROM auth.users 
WHERE id NOT IN (
    SELECT user_id FROM public.user_roles 
    WHERE gym_id = 'caaba35b-5eff-4fbe-9f33-cce92c844cf6' OR role = 'SUPER_ADMIN'
);
