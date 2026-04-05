-- ========================================================
-- CLEANUP SQL: Remove all demo/test gyms from database
-- KEEPS: "Fit and Flex" gym and ALL its related data
-- DELETES: Every other gym and their linked records
-- ========================================================
-- ⚠️  Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ========================================================

-- Step 1: Preview what will be deleted (DRY RUN — no data changed)
SELECT id, name, status, created_at 
FROM gyms 
WHERE LOWER(name) NOT LIKE '%fit and flex%';

-- Step 2: Delete child records for non-"Fit and Flex" gyms
-- (Run these AFTER verifying Step 1 shows only demo gyms)

-- Delete attendance records
DELETE FROM attendance 
WHERE gym_id IN (
  SELECT id FROM gyms WHERE LOWER(name) NOT LIKE '%fit and flex%'
);

-- Delete payment/membership history
DELETE FROM membership_history 
WHERE gym_id IN (
  SELECT id FROM gyms WHERE LOWER(name) NOT LIKE '%fit and flex%'
);

-- Delete notifications
DELETE FROM notifications 
WHERE gym_id IN (
  SELECT id FROM gyms WHERE LOWER(name) NOT LIKE '%fit and flex%'
);

-- Delete members
DELETE FROM members 
WHERE gym_id IN (
  SELECT id FROM gyms WHERE LOWER(name) NOT LIKE '%fit and flex%'
);

-- Delete plans
DELETE FROM plans 
WHERE gym_id IN (
  SELECT id FROM gyms WHERE LOWER(name) NOT LIKE '%fit and flex%'
);

-- Delete staff/user roles
DELETE FROM user_roles 
WHERE gym_id IN (
  SELECT id FROM gyms WHERE LOWER(name) NOT LIKE '%fit and flex%'
);

-- Delete support tickets (if table exists)
DELETE FROM support_tickets 
WHERE gym_id IN (
  SELECT id FROM gyms WHERE LOWER(name) NOT LIKE '%fit and flex%'
);

-- Delete audit logs (if table exists)
DELETE FROM admin_audit_logs 
WHERE target_gym_id IN (
  SELECT id FROM gyms WHERE LOWER(name) NOT LIKE '%fit and flex%'
);

-- Step 3: Finally, delete the demo gym records themselves
DELETE FROM gyms 
WHERE LOWER(name) NOT LIKE '%fit and flex%';

-- Step 4: Verify — only "Fit and Flex" should remain
SELECT id, name, status, created_at FROM gyms;
