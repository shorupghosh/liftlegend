alter table public.gyms
  add column if not exists owner_user_id uuid null,
  add column if not exists owner_email text null,
  add column if not exists suspended_at timestamptz null,
  add column if not exists deleted_at timestamptz null,
  add column if not exists last_activity_at timestamptz null,
  add column if not exists member_limit integer null,
  add column if not exists staff_limit integer null;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid null,
  actor_email text null,
  action text not null,
  target_gym_id uuid null references public.gyms(id) on delete set null,
  target_gym_name text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

create policy if not exists "super admins can read admin audit logs"
on public.admin_audit_logs
for select
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'SUPER_ADMIN'
  )
);

create policy if not exists "super admins can insert admin audit logs"
on public.admin_audit_logs
for insert
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'SUPER_ADMIN'
  )
);

create or replace function public.admin_is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'SUPER_ADMIN'
  );
$$;

create or replace function public.admin_log_action(
  action_name text,
  gym_id uuid,
  gym_name text,
  details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_email_value text;
begin
  if not public.admin_is_super_admin() then
    raise exception 'Only super admins can perform this action';
  end if;

  select email into actor_email_value from auth.users where id = auth.uid();

  insert into public.admin_audit_logs (
    actor_user_id,
    actor_email,
    action,
    target_gym_id,
    target_gym_name,
    metadata
  )
  values (
    auth.uid(),
    actor_email_value,
    action_name,
    gym_id,
    gym_name,
    coalesce(details, '{}'::jsonb)
  );
end;
$$;

create or replace function public.admin_update_gym_status(target_gym_id uuid, next_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  gym_name_value text;
  audit_action text;
begin
  if not public.admin_is_super_admin() then
    raise exception 'Only super admins can update gym status';
  end if;

  update public.gyms
  set status = next_status,
      suspended_at = case when next_status in ('LOCKED', 'SUSPENDED') then now() else null end,
      deleted_at = case when next_status = 'DELETED' then now() else deleted_at end
  where id = target_gym_id
  returning name into gym_name_value;

  audit_action := case
    when next_status in ('LOCKED', 'SUSPENDED') then 'GYM_SUSPENDED'
    when next_status = 'DELETED' then 'GYM_DELETED'
    else 'GYM_ACTIVATED'
  end;

  perform public.admin_log_action(audit_action, target_gym_id, gym_name_value, jsonb_build_object('status', next_status));
end;
$$;

create or replace function public.admin_delete_gym(target_gym_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.admin_update_gym_status(target_gym_id, 'DELETED');
end;
$$;

create or replace function public.admin_update_subscription(
  target_gym_id uuid,
  next_tier text default null,
  next_status text default null,
  next_trial_ends_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  gym_name_value text;
begin
  if not public.admin_is_super_admin() then
    raise exception 'Only super admins can update subscriptions';
  end if;

  update public.gyms
  set subscription_tier = coalesce(next_tier, subscription_tier),
      status = coalesce(next_status, status),
      trial_ends_at = coalesce(next_trial_ends_at, trial_ends_at)
  where id = target_gym_id
  returning name into gym_name_value;

  perform public.admin_log_action(
    'SUBSCRIPTION_CHANGED',
    target_gym_id,
    gym_name_value,
    jsonb_build_object(
      'next_tier', next_tier,
      'next_status', next_status,
      'next_trial_ends_at', next_trial_ends_at
    )
  );
end;
$$;

create or replace function public.admin_start_impersonation(target_gym_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  gym_name_value text;
begin
  if not public.admin_is_super_admin() then
    raise exception 'Only super admins can impersonate a gym';
  end if;

  select name into gym_name_value from public.gyms where id = target_gym_id;

  perform public.admin_log_action(
    'IMPERSONATION_STARTED',
    target_gym_id,
    gym_name_value,
    jsonb_build_object('started_at', now())
  );
end;
$$;

create or replace function public.admin_end_impersonation(target_gym_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  gym_name_value text;
begin
  if not public.admin_is_super_admin() then
    raise exception 'Only super admins can end impersonation';
  end if;

  select name into gym_name_value from public.gyms where id = target_gym_id;

  perform public.admin_log_action(
    'IMPERSONATION_ENDED',
    target_gym_id,
    gym_name_value,
    jsonb_build_object('ended_at', now())
  );
end;
$$;
