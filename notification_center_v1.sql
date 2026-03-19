-- ==========================================================
-- NOTIFICATION CENTER V1
-- Run this in the Supabase SQL Editor.
-- ==========================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  type text not null default 'general',
  title text not null,
  message text not null,
  related_member_id uuid null references public.members(id) on delete set null,
  is_read boolean not null default false,
  dedupe_key text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications
  add column if not exists type text not null default 'general';

alter table public.notifications
  add column if not exists related_member_id uuid null references public.members(id) on delete set null;

alter table public.notifications
  add column if not exists dedupe_key text null;

alter table public.notifications
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists notifications_gym_created_at_idx
  on public.notifications (gym_id, created_at desc);

create index if not exists notifications_gym_unread_idx
  on public.notifications (gym_id, is_read, created_at desc);

create unique index if not exists notifications_gym_dedupe_idx
  on public.notifications (gym_id, dedupe_key)
  where dedupe_key is not null;

alter table public.notifications enable row level security;

drop policy if exists "Gym staff can view notifications" on public.notifications;
create policy "Gym staff can view notifications"
on public.notifications
for select
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.gym_id = notifications.gym_id
  )
);

drop policy if exists "Owners can insert notifications" on public.notifications;
create policy "Owners can insert notifications"
on public.notifications
for insert
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.gym_id = notifications.gym_id
      and ur.role in ('OWNER', 'MANAGER')
  )
);

drop policy if exists "Owners can update notifications" on public.notifications;
create policy "Owners can update notifications"
on public.notifications
for update
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.gym_id = notifications.gym_id
      and ur.role in ('OWNER', 'MANAGER')
  )
);

create or replace function public.get_notifications(target_gym_id uuid, result_limit integer default 10)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
begin
  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.gym_id = target_gym_id
  ) then
    raise exception 'Insufficient permissions to access notifications';
  end if;

  select jsonb_build_object(
    'items', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', n.id,
            'gym_id', n.gym_id,
            'type', n.type,
            'title', n.title,
            'message', n.message,
            'related_member_id', n.related_member_id,
            'is_read', n.is_read,
            'created_at', n.created_at
          )
          order by n.created_at desc
        )
        from (
          select *
          from public.notifications
          where gym_id = target_gym_id
          order by created_at desc
          limit greatest(result_limit, 1)
        ) n
      ),
      '[]'::jsonb
    ),
    'unread_count',
    coalesce(
      (
        select count(*)::int
        from public.notifications
        where gym_id = target_gym_id
          and is_read = false
      ),
      0
    )
  )
  into payload;

  return payload;
end;
$$;

create or replace function public.mark_notification_read(target_notification_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_gym_id uuid;
begin
  select gym_id
  into target_gym_id
  from public.notifications
  where id = target_notification_id;

  if target_gym_id is null then
    raise exception 'Notification not found';
  end if;

  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.gym_id = target_gym_id
  ) then
    raise exception 'Insufficient permissions to update notification';
  end if;

  update public.notifications
  set is_read = true
  where id = target_notification_id;

  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.mark_all_notifications_read(target_gym_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.gym_id = target_gym_id
  ) then
    raise exception 'Insufficient permissions to update notifications';
  end if;

  update public.notifications
  set is_read = true
  where gym_id = target_gym_id
    and is_read = false;

  return jsonb_build_object('success', true);
end;
$$;

grant execute on function public.get_notifications(uuid, integer) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read(uuid) to authenticated;
