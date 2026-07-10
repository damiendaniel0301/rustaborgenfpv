-- Allow admins to use the same normalized app-state access as instructors.
-- Applied to Supabase project agekajyuvslxigzkvxom on 2026-07-10.

create or replace function public.get_normalized_app_state(state_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  caller_role text;
  students_json jsonb;
  instructors_json jsonb;
  deleted_ids jsonb;
  flight_logs_json jsonb;
begin
  if caller is null then
    raise exception 'Not authenticated';
  end if;

  select role into caller_role
  from public.profiles
  where id = caller;

  if caller_role in ('instructor', 'admin') then
    select coalesce(jsonb_agg(public.build_student_progress_json(p.id, coalesce(p.display_name, p.email, 'Elev')) order by p.created_at), '[]'::jsonb)
    into students_json
    from public.profiles p
    left join public.student_access_status access on access.student_id = p.id
    where p.role = 'student'
      and access.deactivated_at is null;

    select coalesce(jsonb_agg(jsonb_build_object('id', p.id::text, 'name', coalesce(p.display_name, p.email, 'Instruktor'), 'role', p.role) order by p.created_at), '[]'::jsonb)
    into instructors_json
    from public.profiles p
    where p.role in ('instructor', 'admin');

    select coalesce(jsonb_agg(student_id::text), '[]'::jsonb)
    into deleted_ids
    from public.student_access_status
    where deactivated_at is not null;

    flight_logs_json := public.flight_logs_json_for_user(caller, true);

    return jsonb_build_object('students', students_json, 'instructors', instructors_json, 'deletedStudentIds', deleted_ids, 'flightLogs', flight_logs_json);
  end if;

  select jsonb_build_array(public.build_student_progress_json(p.id, coalesce(p.display_name, p.email, 'Elev')))
  into students_json
  from public.profiles p
  left join public.student_access_status access on access.student_id = p.id
  where p.id = caller
    and p.role = 'student'
    and access.deactivated_at is null;

  flight_logs_json := public.flight_logs_json_for_user(caller, false);

  return jsonb_build_object(
    'students', coalesce(students_json, '[]'::jsonb),
    'instructors', '[]'::jsonb,
    'deletedStudentIds', '[]'::jsonb,
    'flightLogs', flight_logs_json
  );
end;
$$;

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
