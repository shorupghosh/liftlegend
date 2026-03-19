-- ==========================================================
-- SUPER ADMIN TABLES SETUP
-- Run this in the Supabase SQL Editor to create the tables
-- required for the newly dynamic Super Admin dashboards.
-- ==========================================================

-- 1. Create the support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'LOW',
    status TEXT NOT NULL DEFAULT 'OPEN',
    category TEXT NOT NULL DEFAULT 'Support',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: RLS (Row Level Security)
-- Allow SUPER_ADMIN to read and update all support tickets
-- Allow gym OWNERS to read their own gym's support tickets and insert new ones
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can view all support tickets"
ON support_tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "Super Admins can update all support tickets"
ON support_tickets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "Gym members can view their own gym's support tickets"
ON support_tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.gym_id = support_tickets.gym_id
  )
);

CREATE POLICY "Gym members can create support tickets for their gym"
ON support_tickets FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.gym_id = support_tickets.gym_id
  )
);

-- Insert a couple of seed tickets into an existing gym so the dashboard isn't empty (Optional)
-- INSERT INTO support_tickets (gym_id, subject, priority, status, category)
-- SELECT id, 'Help with billing setup', 'HIGH', 'OPEN', 'Billing' FROM gyms LIMIT 1;
