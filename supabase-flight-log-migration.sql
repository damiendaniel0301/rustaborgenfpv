-- Flight log migration for Veien til FPV.
-- Run after supabase-complete-normalization-migration.sql.

create table if not exists public.flight_logs (
  id text primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  log_date date,
  sortie_no text,
  operator_pilot text,
  drone_airframe text,
  location text,
  mission_type text,
  takeoff_time text,
  landing_time text,
  flight_time_minutes numeric(8,2),
  cumulative_flight_hours numeric(10,2),
  battery_pack_no text,
  weather text,
  flight_mode text,
  core_events text[] not null default '{}',
  issues_incidents text,
  maintenance_required boolean not null default false,
  maintenance_notes text,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.flight_logs enable row level security;

create index if not exists flight_logs_owner_date_idx on public.flight_logs(owner_id, log_date desc);
create index if not exists flight_logs_sortie_idx on public.flight_logs(sortie_no);

drop trigger if exists touch_flight_logs_updated_at on public.flight_logs;
create trigger touch_flight_logs_updated_at
before update on public.flight_logs
for each row execute function public.touch_updated_at();

grant select, insert, update, delete on public.flight_logs to authenticated;

drop policy if exists flight_logs_read_own_or_instructor on public.flight_logs;
create policy flight_logs_read_own_or_instructor on public.flight_logs
for select to authenticated
using (
  owner_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'instructor')
);

drop policy if exists flight_logs_insert_own_or_instructor on public.flight_logs;
create policy flight_logs_insert_own_or_instructor on public.flight_logs
for insert to authenticated
with check (
  owner_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'instructor')
);

drop policy if exists flight_logs_update_own_or_instructor on public.flight_logs;
create policy flight_logs_update_own_or_instructor on public.flight_logs
for update to authenticated
using (
  owner_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'instructor')
)
with check (
  owner_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'instructor')
);

drop policy if exists flight_logs_delete_own_or_instructor on public.flight_logs;
create policy flight_logs_delete_own_or_instructor on public.flight_logs
for delete to authenticated
using (
  owner_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'instructor')
);

create or replace function public.flight_logs_json_for_user(target_user uuid, include_all boolean default false)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'ownerId', owner_id,
    'date', coalesce(log_date::text, ''),
    'sortieNo', coalesce(sortie_no, ''),
    'operatorPilot', coalesce(operator_pilot, ''),
    'droneAirframe', coalesce(drone_airframe, ''),
    'location', coalesce(location, ''),
    'missionType', coalesce(mission_type, ''),
    'takeoffTime', coalesce(takeoff_time, ''),
    'landingTime', coalesce(landing_time, ''),
    'flightTimeMinutes', coalesce(flight_time_minutes, 0),
    'cumulativeFlightHours', coalesce(cumulative_flight_hours, 0),
    'batteryPackNo', coalesce(battery_pack_no, ''),
    'weather', coalesce(weather, ''),
    'flightMode', coalesce(flight_mode, ''),
    'coreEvents', to_jsonb(core_events),
    'issuesIncidents', coalesce(issues_incidents, ''),
    'maintenanceRequired', maintenance_required,
    'maintenanceNotes', coalesce(maintenance_notes, ''),
    'remarks', coalesce(remarks, ''),
    'createdAt', created_at,
    'updatedAt', updated_at
  ) order by log_date desc nulls last, takeoff_time desc nulls last), '[]'::jsonb)
  from public.flight_logs
  where include_all or owner_id = target_user;
$$;

create or replace function public.upsert_flight_logs_from_json(new_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  is_instructor boolean;
begin
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'instructor')
    into is_instructor;

  insert into public.flight_logs (
    id, owner_id, log_date, sortie_no, operator_pilot, drone_airframe, location,
    mission_type, takeoff_time, landing_time, flight_time_minutes,
    cumulative_flight_hours, battery_pack_no, weather, flight_mode, core_events,
    issues_incidents, maintenance_required, maintenance_notes, remarks, created_at, updated_at
  )
  select
    log_item->>'id',
    (log_item->>'ownerId')::uuid,
    nullif(log_item->>'date', '')::date,
    log_item->>'sortieNo',
    log_item->>'operatorPilot',
    log_item->>'droneAirframe',
    log_item->>'location',
    log_item->>'missionType',
    log_item->>'takeoffTime',
    log_item->>'landingTime',
    coalesce(nullif(log_item->>'flightTimeMinutes', '')::numeric, 0),
    coalesce(nullif(log_item->>'cumulativeFlightHours', '')::numeric, 0),
    log_item->>'batteryPackNo',
    log_item->>'weather',
    log_item->>'flightMode',
    coalesce(array(select jsonb_array_elements_text(coalesce(log_item->'coreEvents', '[]'::jsonb))), array[]::text[]),
    log_item->>'issuesIncidents',
    coalesce((log_item->>'maintenanceRequired')::boolean, false),
    log_item->>'maintenanceNotes',
    log_item->>'remarks',
    coalesce(nullif(log_item->>'createdAt', '')::timestamptz, now()),
    now()
  from jsonb_array_elements(coalesce(new_data->'flightLogs', '[]'::jsonb)) as log_item
  where log_item ? 'id'
    and log_item ? 'ownerId'
    and (is_instructor or (log_item->>'ownerId')::uuid = auth.uid())
  on conflict (id) do update set
    owner_id = excluded.owner_id,
    log_date = excluded.log_date,
    sortie_no = excluded.sortie_no,
    operator_pilot = excluded.operator_pilot,
    drone_airframe = excluded.drone_airframe,
    location = excluded.location,
    mission_type = excluded.mission_type,
    takeoff_time = excluded.takeoff_time,
    landing_time = excluded.landing_time,
    flight_time_minutes = excluded.flight_time_minutes,
    cumulative_flight_hours = excluded.cumulative_flight_hours,
    battery_pack_no = excluded.battery_pack_no,
    weather = excluded.weather,
    flight_mode = excluded.flight_mode,
    core_events = excluded.core_events,
    issues_incidents = excluded.issues_incidents,
    maintenance_required = excluded.maintenance_required,
    maintenance_notes = excluded.maintenance_notes,
    remarks = excluded.remarks,
    updated_at = now()
  where is_instructor or public.flight_logs.owner_id = auth.uid();
end;
$$;

create or replace function public.get_normalized_app_state(state_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  is_instructor boolean;
  result jsonb;
begin
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'instructor')
    into is_instructor;

  result := jsonb_build_object(
    'students', public.students_json_for_user(auth.uid(), is_instructor),
    'instructors', public.instructors_json(),
    'flightLogs', public.flight_logs_json_for_user(auth.uid(), is_instructor),
    'deletedStudentIds', public.deleted_student_ids_json()
  );

  return result;
end;
$$;

create or replace function public.save_app_state(state_id text, new_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.upsert_normalized_app_state_from_json(state_id, new_data);
  perform public.upsert_flight_logs_from_json(new_data);
  return public.get_normalized_app_state(state_id);
end;
$$;

revoke execute on function public.flight_logs_json_for_user(uuid, boolean) from anon, authenticated;
revoke execute on function public.upsert_flight_logs_from_json(jsonb) from anon, authenticated;
revoke execute on function public.get_normalized_app_state(text) from anon, authenticated;
grant execute on function public.save_app_state(text, jsonb) to authenticated;
grant execute on function public.get_app_state(text) to authenticated;
