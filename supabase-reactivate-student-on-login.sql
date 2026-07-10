-- Reactivate a previously deactivated student when the same Auth user logs in again.
-- Applied to Supabase project agekajyuvslxigzkvxom on 2026-07-10.

create or replace function public.reactivate_own_student_profile()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  caller_role text;
begin
  if caller is null then
    raise exception 'Not authenticated';
  end if;

  select role into caller_role
  from public.profiles
  where id = caller;

  if caller_role <> 'student' then
    return false;
  end if;

  update public.student_access_status
  set deactivated_at = null,
      deactivated_by = null,
      note = 'Reaktivert ved ny innlogging med samme e-post',
      updated_at = now()
  where student_id = caller
    and deactivated_at is not null;

  return true;
end;
$$;

revoke all on function public.reactivate_own_student_profile() from public;
revoke execute on function public.reactivate_own_student_profile() from anon;
grant execute on function public.reactivate_own_student_profile() to authenticated;

create or replace function public.get_profiles_for_roster()
returns table (
  id uuid,
  email text,
  display_name text,
  role text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.email, p.display_name, p.role, p.created_at
  from public.profiles p
  left join public.student_access_status access on access.student_id = p.id
  where public.is_instructor()
    and (p.role <> 'student' or access.deactivated_at is null)
  order by p.created_at;
$$;

revoke all on function public.get_profiles_for_roster() from public;
revoke execute on function public.get_profiles_for_roster() from anon;
grant execute on function public.get_profiles_for_roster() to authenticated;
