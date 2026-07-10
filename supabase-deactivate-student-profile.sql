-- Server-controlled student deactivation for instructor/admin users.
-- Applied to Supabase project agekajyuvslxigzkvxom on 2026-07-10.

create or replace function public.deactivate_student_profile(target_student_id uuid, deactivate_note text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'Not authenticated';
  end if;

  if not (select public.is_instructor()) then
    raise exception 'Only instructors can deactivate students';
  end if;

  if not exists (select 1 from public.profiles where id = target_student_id and role = 'student') then
    return false;
  end if;

  insert into public.student_access_status (student_id, deactivated_at, deactivated_by, note, updated_at)
  values (target_student_id, now(), caller, coalesce(nullif(btrim(deactivate_note), ''), 'Deaktivert av instruktør/admin'), now())
  on conflict (student_id) do update
  set deactivated_at = now(),
      deactivated_by = caller,
      note = coalesce(nullif(btrim(deactivate_note), ''), 'Deaktivert av instruktør/admin'),
      updated_at = now();

  return true;
end;
$$;

revoke all on function public.deactivate_student_profile(uuid, text) from public;
revoke execute on function public.deactivate_student_profile(uuid, text) from anon;
grant execute on function public.deactivate_student_profile(uuid, text) to authenticated;
