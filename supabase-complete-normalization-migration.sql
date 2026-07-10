-- Complete normalization phase for Droneflyver.
-- Run after supabase-gradual-normalization-migration.sql.
-- Purpose:
-- 1. Keep the old drone_app_state JSON as a backup.
-- 2. Stop writing progress/video/review data back to drone_app_state.
-- 3. Expose neutral app-state RPC names for the frontend.

create table if not exists public.drone_app_state_backups (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  data jsonb not null,
  source_updated_at timestamptz,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.drone_app_state_backups enable row level security;

drop policy if exists drone_app_state_backups_read_instructors on public.drone_app_state_backups;
create policy drone_app_state_backups_read_instructors
  on public.drone_app_state_backups for select
  to authenticated
  using ((select public.is_instructor()));

insert into public.drone_app_state_backups (source_id, data, source_updated_at, reason)
select id, data, updated_at, 'before stopping JSON writes during full normalization'
from public.drone_app_state
where id = 'rustaborgenfpv'
  and not exists (
    select 1
    from public.drone_app_state_backups
    where source_id = 'rustaborgenfpv'
      and reason = 'before stopping JSON writes during full normalization'
  );

create or replace function public.save_app_state(state_id text, new_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  caller_role text;
  caller_student jsonb;
begin
  if caller is null then
    raise exception 'Not authenticated';
  end if;

  select role into caller_role
  from public.profiles
  where id = caller;

  if caller_role in ('instructor', 'admin') then
    perform public.upsert_normalized_app_state_from_json(new_data);
    perform public.upsert_flight_logs_from_json(new_data);
    return public.get_normalized_app_state(state_id);
  end if;

  select value into caller_student
  from jsonb_array_elements(coalesce(new_data->'students', '[]'::jsonb)) as student(value)
  where value->>'id' = caller::text
  limit 1;

  if caller_student is not null then
    perform public.upsert_normalized_app_state_from_json(jsonb_build_object('students', jsonb_build_array(caller_student)));
  end if;

  perform public.upsert_flight_logs_from_json(new_data);
  return public.get_normalized_app_state(state_id);
end;
$$;

create or replace function public.get_app_state(state_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  return public.get_normalized_app_state(state_id);
end;
$$;

-- Compatibility wrappers remain for older cached clients, but they no longer
-- read or write progress/video/review data to drone_app_state.
create or replace function public.save_drone_app_state(state_id text, new_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.save_app_state(state_id, new_data);
end;
$$;

create or replace function public.get_drone_app_state(state_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.get_app_state(state_id);
end;
$$;

revoke all on function public.get_app_state(text) from public;
revoke all on function public.save_app_state(text, jsonb) from public;
revoke all on function public.get_drone_app_state(text) from public;
revoke all on function public.save_drone_app_state(text, jsonb) from public;

revoke execute on function public.get_app_state(text) from anon;
revoke execute on function public.save_app_state(text, jsonb) from anon;
revoke execute on function public.get_drone_app_state(text) from anon;
revoke execute on function public.save_drone_app_state(text, jsonb) from anon;

grant execute on function public.get_app_state(text) to authenticated;
grant execute on function public.save_app_state(text, jsonb) to authenticated;
grant execute on function public.get_drone_app_state(text) to authenticated;
grant execute on function public.save_drone_app_state(text, jsonb) to authenticated;
