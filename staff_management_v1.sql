-- ==========================================================
-- STAFF MANAGEMENT V1
-- Run this in the Supabase SQL Editor.
-- Adds invite/status fields plus secure staff management RPCs.
-- ==========================================================

alter table public.user_roles
  add column if not exists invited_email text,
  add column if not exists status text not null default 'ACTIVE',
  add column if not exists invited_at timestamptz,
  add column if not exists joined_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.user_roles
  alter column user_id drop not null;

update public.user_roles
set
  status = coalesce(status, 'ACTIVE'),
  joined_at = coalesce(joined_at, created_at, now()),
  updated_at = now()
where true;

create unique index if not exists user_roles_gym_user_unique
  on public.user_roles (gym_id, user_id)
  where user_id is not null;

create unique index if not exists user_roles_gym_invited_email_unique
  on public.user_roles (gym_id, lower(invited_email))
  where invited_email is not null;

create or replace function public.set_user_roles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_roles_updated_at on public.user_roles;
create trigger trg_user_roles_updated_at
before update on public.user_roles
for each row
execute function public.set_user_roles_updated_at();

create or replace function public.get_actor_staff_role(target_gym_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select ur.role
  from public.user_roles ur
  where ur.user_id = auth.uid()
    and ur.gym_id = target_gym_id
  order by
    case ur.role
      when 'OWNER' then 1
      when 'MANAGER' then 2
      when 'TRAINER' then 3
      else 4
    end
  limit 1
$$;

create or replace function public.can_manage_staff_role(
  actor_role text,
  target_role text
)
returns boolean
language sql
immutable
as $$
  select case
    when actor_role = 'OWNER' then target_role in ('OWNER', 'MANAGER', 'TRAINER')
    when actor_role = 'MANAGER' then target_role = 'TRAINER'
    else false
  end
$$;

create or replace function public.get_staff_management(target_gym_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
  result jsonb;
begin
  actor_role := public.get_actor_staff_role(target_gym_id);

  if actor_role not in ('OWNER', 'MANAGER') then
    raise exception 'Insufficient permissions to access staff management';
  end if;

  select jsonb_build_object(
    'staff', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', ur.id,
          'user_id', ur.user_id,
          'email', coalesce(ur.invited_email, au.email, ur.display_name),
          'display_name', coalesce(ur.display_name, au.email, ur.invited_email),
          'role', ur.role,
          'status', coalesce(ur.status, case when ur.user_id is null then 'INVITED' else 'ACTIVE' end),
          'joined_at', coalesce(ur.joined_at, ur.created_at),
          'invited_at', ur.invited_at,
          'created_at', ur.created_at
        )
        order by coalesce(ur.joined_at, ur.created_at) asc
      ) filter (where ur.id is not null),
      '[]'::jsonb
    ),
    'counts', jsonb_build_object(
      'total', count(*)::int,
      'owners', count(*) filter (where ur.role = 'OWNER')::int,
      'managers', count(*) filter (where ur.role = 'MANAGER')::int,
      'trainers', count(*) filter (where ur.role = 'TRAINER')::int
    )
  )
  into result
  from public.user_roles ur
  left join auth.users au on au.id = ur.user_id
  where ur.gym_id = target_gym_id
    and ur.role in ('OWNER', 'MANAGER', 'TRAINER');

  return coalesce(
    result,
    jsonb_build_object(
      'staff', '[]'::jsonb,
      'counts', jsonb_build_object('total', 0, 'owners', 0, 'managers', 0, 'trainers', 0)
    )
  );
end;
$$;

create or replace function public.invite_staff_member(
  target_gym_id uuid,
  invite_email text,
  invite_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
  normalized_email text;
  existing_user_id uuid;
  existing_role_id uuid;
  resulting_record public.user_roles;
begin
  actor_role := public.get_actor_staff_role(target_gym_id);
  normalized_email := lower(trim(invite_email));

  if actor_role not in ('OWNER', 'MANAGER') then
    raise exception 'Only owners or managers can invite staff';
  end if;

  if normalized_email is null or normalized_email = '' then
    raise exception 'Email is required';
  end if;

  if invite_role not in ('OWNER', 'MANAGER', 'TRAINER') then
    raise exception 'Invalid staff role';
  end if;

  if actor_role = 'MANAGER' and invite_role <> 'TRAINER' then
    raise exception 'Managers can only invite trainers';
  end if;

  select au.id
  into existing_user_id
  from auth.users au
  where lower(au.email) = normalized_email
  limit 1;

  if existing_user_id is not null then
    select ur.id
    into existing_role_id
    from public.user_roles ur
    where ur.gym_id = target_gym_id
      and ur.user_id = existing_user_id
    limit 1;
  else
    select ur.id
    into existing_role_id
    from public.user_roles ur
    where ur.gym_id = target_gym_id
      and lower(coalesce(ur.invited_email, '')) = normalized_email
    limit 1;
  end if;

  if existing_role_id is not null then
    raise exception 'A staff record already exists for this email';
  end if;

  insert into public.user_roles (
    gym_id,
    user_id,
    invited_email,
    display_name,
    role,
    status,
    invited_at,
    joined_at
  )
  values (
    target_gym_id,
    existing_user_id,
    normalized_email,
    normalized_email,
    invite_role,
    case when existing_user_id is null then 'INVITED' else 'ACTIVE' end,
    now(),
    now()
  )
  returning * into resulting_record;

  return jsonb_build_object(
    'id', resulting_record.id,
    'role', resulting_record.role,
    'status', resulting_record.status,
    'email', normalized_email
  );
end;
$$;

create or replace function public.update_staff_role(
  target_role_id uuid,
  next_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_record public.user_roles;
  actor_role text;
  owner_count integer;
begin
  if next_role not in ('OWNER', 'MANAGER', 'TRAINER') then
    raise exception 'Invalid staff role';
  end if;

  select * into target_record
  from public.user_roles
  where id = target_role_id;

  if target_record.id is null then
    raise exception 'Staff record not found';
  end if;

  actor_role := public.get_actor_staff_role(target_record.gym_id);

  if actor_role not in ('OWNER', 'MANAGER') then
    raise exception 'Insufficient permissions to update staff role';
  end if;

  if not public.can_manage_staff_role(actor_role, target_record.role) then
    raise exception 'You cannot manage this role';
  end if;

  if actor_role = 'MANAGER' and next_role <> 'TRAINER' then
    raise exception 'Managers can only assign trainer role';
  end if;

  if target_record.role = 'OWNER' and next_role <> 'OWNER' then
    select count(*)
    into owner_count
    from public.user_roles
    where gym_id = target_record.gym_id
      and role = 'OWNER';

    if owner_count <= 1 then
      raise exception 'Cannot demote the last owner';
    end if;
  end if;

  update public.user_roles
  set role = next_role,
      status = coalesce(status, 'ACTIVE')
  where id = target_role_id;

  return jsonb_build_object('success', true, 'role', next_role);
end;
$$;

create or replace function public.remove_staff_member(
  target_role_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_record public.user_roles;
  actor_role text;
  owner_count integer;
begin
  select * into target_record
  from public.user_roles
  where id = target_role_id;

  if target_record.id is null then
    raise exception 'Staff record not found';
  end if;

  actor_role := public.get_actor_staff_role(target_record.gym_id);

  if actor_role not in ('OWNER', 'MANAGER') then
    raise exception 'Insufficient permissions to remove staff';
  end if;

  if not public.can_manage_staff_role(actor_role, target_record.role) then
    raise exception 'You cannot remove this role';
  end if;

  if target_record.user_id = auth.uid() then
    raise exception 'You cannot remove your own staff access';
  end if;

  if target_record.role = 'OWNER' then
    select count(*)
    into owner_count
    from public.user_roles
    where gym_id = target_record.gym_id
      and role = 'OWNER';

    if owner_count <= 1 then
      raise exception 'Cannot remove the last owner';
    end if;
  end if;

  delete from public.user_roles
  where id = target_role_id;

  return jsonb_build_object('success', true);
end;
$$;

grant execute on function public.get_staff_management(uuid) to authenticated;
grant execute on function public.invite_staff_member(uuid, text, text) to authenticated;
grant execute on function public.update_staff_role(uuid, text) to authenticated;
grant execute on function public.remove_staff_member(uuid) to authenticated;
