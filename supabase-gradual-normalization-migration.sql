-- Gradual normalization migration for Droneflyver.
-- Keeps drone_app_state as JSON backup while progress, videos and reviews
-- are mirrored into normalized tables.

create extension if not exists pgcrypto;

create table if not exists public.training_steps (
  id text primary key,
  title text not null,
  description text,
  sort_order int not null unique,
  estimated_time_note text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.training_lessons (
  id text primary key,
  step_id text not null references public.training_steps(id) on delete cascade,
  lesson_order int not null,
  title text not null,
  goal text,
  video_url text,
  video_label text,
  optional boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (step_id, lesson_order)
);

create table if not exists public.student_lesson_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null references public.training_lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

create table if not exists public.exam_items (
  id text primary key,
  step_id text not null references public.training_steps(id) on delete cascade,
  item_order int not null,
  title text not null,
  requirement text,
  drone text,
  camera_angle_degrees int,
  requires_video boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (step_id, item_order)
);

create table if not exists public.student_exam_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  exam_item_id text not null references public.exam_items(id) on delete cascade,
  video_url text,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (student_id, exam_item_id)
);

create table if not exists public.student_exam_reviews (
  submission_id uuid primary key references public.student_exam_submissions(id) on delete cascade,
  result text check (result in ('passed', 'failed')),
  note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.student_access_status (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  deactivated_at timestamptz,
  deactivated_by uuid references public.profiles(id) on delete set null,
  note text,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_student_lesson_progress_updated_at on public.student_lesson_progress;
create trigger touch_student_lesson_progress_updated_at
  before update on public.student_lesson_progress
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_student_exam_submissions_updated_at on public.student_exam_submissions;
create trigger touch_student_exam_submissions_updated_at
  before update on public.student_exam_submissions
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_student_exam_reviews_updated_at on public.student_exam_reviews;
create trigger touch_student_exam_reviews_updated_at
  before update on public.student_exam_reviews
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_student_access_status_updated_at on public.student_access_status;
create trigger touch_student_access_status_updated_at
  before update on public.student_access_status
  for each row execute function public.touch_updated_at();

create index if not exists training_lessons_step_order_idx on public.training_lessons(step_id, lesson_order);
create index if not exists student_lesson_progress_student_idx on public.student_lesson_progress(student_id);
create index if not exists student_lesson_progress_lesson_idx on public.student_lesson_progress(lesson_id);
create index if not exists exam_items_step_order_idx on public.exam_items(step_id, item_order);
create index if not exists student_exam_submissions_student_idx on public.student_exam_submissions(student_id);
create index if not exists student_exam_submissions_exam_item_idx on public.student_exam_submissions(exam_item_id);
create index if not exists student_exam_reviews_reviewed_by_idx on public.student_exam_reviews(reviewed_by);
create index if not exists student_access_status_deactivated_by_idx on public.student_access_status(deactivated_by);
create index if not exists instructor_invites_used_by_idx on public.instructor_invites(used_by);

alter table public.training_steps enable row level security;
alter table public.training_lessons enable row level security;
alter table public.student_lesson_progress enable row level security;
alter table public.exam_items enable row level security;
alter table public.student_exam_submissions enable row level security;
alter table public.student_exam_reviews enable row level security;
alter table public.student_access_status enable row level security;

grant select on public.training_steps to authenticated;
grant select on public.training_lessons to authenticated;
grant select on public.exam_items to authenticated;
grant select, insert, update on public.student_lesson_progress to authenticated;
grant select, insert, update on public.student_exam_submissions to authenticated;
grant select, insert, update, delete on public.student_exam_reviews to authenticated;
grant select, insert, update, delete on public.student_access_status to authenticated;

-- Policies intentionally mirror the current app access model.
drop policy if exists "training steps read authenticated" on public.training_steps;
drop policy if exists "training lessons read authenticated" on public.training_lessons;
drop policy if exists "exam items read authenticated" on public.exam_items;
drop policy if exists "students read own lesson progress" on public.student_lesson_progress;
drop policy if exists "students upsert own lesson progress" on public.student_lesson_progress;
drop policy if exists "students update own lesson progress" on public.student_lesson_progress;
drop policy if exists "submissions read own or instructor" on public.student_exam_submissions;
drop policy if exists "students insert own submissions" on public.student_exam_submissions;
drop policy if exists "students update own submissions" on public.student_exam_submissions;
drop policy if exists "instructors update submissions" on public.student_exam_submissions;
drop policy if exists update_submissions_owner_or_instructor on public.student_exam_submissions;
drop policy if exists "reviews read own or instructor" on public.student_exam_reviews;
drop policy if exists "instructors insert reviews" on public.student_exam_reviews;
drop policy if exists "instructors update reviews" on public.student_exam_reviews;
drop policy if exists "instructors delete reviews" on public.student_exam_reviews;
drop policy if exists "student access read own or instructor" on public.student_access_status;
drop policy if exists "instructors manage student access" on public.student_access_status;
drop policy if exists instructors_insert_student_access on public.student_access_status;
drop policy if exists instructors_update_student_access on public.student_access_status;
drop policy if exists instructors_delete_student_access on public.student_access_status;

create policy "training steps read authenticated" on public.training_steps for select to authenticated using (active = true or (select public.is_instructor()));
create policy "training lessons read authenticated" on public.training_lessons for select to authenticated using (active = true or (select public.is_instructor()));
create policy "exam items read authenticated" on public.exam_items for select to authenticated using (active = true or (select public.is_instructor()));
create policy "students read own lesson progress" on public.student_lesson_progress for select to authenticated using ((select auth.uid()) = student_id or (select public.is_instructor()));
create policy "students upsert own lesson progress" on public.student_lesson_progress for insert to authenticated with check ((select auth.uid()) = student_id);
create policy "students update own lesson progress" on public.student_lesson_progress for update to authenticated using ((select auth.uid()) = student_id) with check ((select auth.uid()) = student_id);
create policy "submissions read own or instructor" on public.student_exam_submissions for select to authenticated using ((select auth.uid()) = student_id or (select public.is_instructor()));
create policy "students insert own submissions" on public.student_exam_submissions for insert to authenticated with check ((select auth.uid()) = student_id);
create policy update_submissions_owner_or_instructor on public.student_exam_submissions for update to authenticated using ((select auth.uid()) = student_id or (select public.is_instructor())) with check ((select auth.uid()) = student_id or (select public.is_instructor()));
create policy "reviews read own or instructor" on public.student_exam_reviews for select to authenticated using ((select public.is_instructor()) or exists (select 1 from public.student_exam_submissions s where s.id = submission_id and s.student_id = (select auth.uid())));
create policy "instructors insert reviews" on public.student_exam_reviews for insert to authenticated with check ((select public.is_instructor()));
create policy "instructors update reviews" on public.student_exam_reviews for update to authenticated using ((select public.is_instructor())) with check ((select public.is_instructor()));
create policy "instructors delete reviews" on public.student_exam_reviews for delete to authenticated using ((select public.is_instructor()));
create policy "student access read own or instructor" on public.student_access_status for select to authenticated using ((select auth.uid()) = student_id or (select public.is_instructor()));
create policy instructors_insert_student_access on public.student_access_status for insert to authenticated with check ((select public.is_instructor()));
create policy instructors_update_student_access on public.student_access_status for update to authenticated using ((select public.is_instructor())) with check ((select public.is_instructor()));
create policy instructors_delete_student_access on public.student_access_status for delete to authenticated using ((select public.is_instructor()));

insert into public.training_steps (id, title, description, sort_order, estimated_time_note)
values
  ('step1', 'Steg 1 - Simulator', 'Laer aa fly drone i Liftoff.', 1, 'Tidsbruk paa trinn 1-16 ca. 25 timer.'),
  ('step2', 'Steg 2 - Tinywhoop', 'Laer aa fly tinywhoop.', 2, '40 flights av 3 minutter = 2 timer effektiv flytid.'),
  ('step3', 'Steg 3 - Kurs og sertifisering', 'Kurs og sertifisering.', 3, null),
  ('step4', 'Steg 4 - Militaert typekurs', 'Militaert typekurs.', 4, null)
on conflict (id) do update set title = excluded.title, description = excluded.description, sort_order = excluded.sort_order, estimated_time_note = excluded.estimated_time_note;

insert into public.training_lessons (id, step_id, lesson_order, title, goal, video_url, video_label, optional)
values
  ('step1-lesson-1', 'step1', 1, 'Learn to fly an FPV drone TODAY (for total beginners)', 'Sett opp simulator, kontroller og forste hover i Liftoff.', 'https://www.youtube.com/watch?v=SpuXqNakP2A&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-2', 'step1', 2, 'Lesson 2 - Forward flight and altitude control', 'Fly fremover med kontrollert hoyde og sma styreutslag.', 'https://www.youtube.com/watch?v=CNJQduiIBos&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-3', 'step1', 3, 'Lesson 3 - How to slow down', 'Laer aa redusere fart uten aa miste kontroll eller hoyde.', 'https://www.youtube.com/watch?v=3S0BvdiBwCk&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-4', 'step1', 4, 'Lesson 4 - Beginning Turns', 'Start med enkle svinger og hold en rolig flylinje.', 'https://www.youtube.com/watch?v=x0eBWQqKpeg&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-5', 'step1', 5, 'Lesson 5 - Coordinated Turns', 'Koordiner roll, yaw og throttle i jevne svinger.', 'https://www.youtube.com/watch?v=E2V9aPlLSrQ&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-6', 'step1', 6, 'Lesson 6 - Un-coordinated Turns', 'Forsta forskjellen paa koordinerte og ukoordinerte svinger.', 'https://www.youtube.com/watch?v=umj9YW45sj0&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-7', 'step1', 7, 'Lesson 7 - A more complicated environment', 'Fly kontrollert i et mer krevende miljo med flere referansepunkter.', 'https://www.youtube.com/watch?v=8nuLwkJTWb4&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-8', 'step1', 8, 'Lesson 8 - Troubleshooting Your Problems', 'Identifiser vanlige feil og juster teknikken i simulatoren.', 'https://www.youtube.com/watch?v=QQDydREdDuU&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-9', 'step1', 9, 'Lesson 9 - Acrobatic Rolls and Inverted Flight', 'Ov paa rolls og kontroll naar dronen er invertert.', 'https://www.youtube.com/watch?v=l5DJh1zJ9nI&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, true),
  ('step1-lesson-10', 'step1', 10, 'Lesson 10 - Flips and Split-S', 'Gjennomfor flips og Split-S med trygg hoyde og retning.', 'https://www.youtube.com/watch?v=pL7sj1h3SRs&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, true),
  ('step1-lesson-11', 'step1', 11, 'Lesson 11 - Throttle Pumps and Low Altitude Flips and Rolls', 'Tren throttle-pumps og lave manovre med presis timing.', 'https://www.youtube.com/watch?v=DYNCfrS9mFk&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, true),
  ('step1-lesson-12', 'step1', 12, 'Lesson 12 - Extreme altitude limitation', 'Hold kontroll naar hoyden er sterkt begrenset.', 'https://www.youtube.com/watch?v=EGDxYVLIfbw&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-13', 'step1', 13, 'Lesson 13 - Landing (crashing with style)', 'Ov paa landinger og avslutninger med kontroll.', 'https://www.youtube.com/watch?v=viNSApofw58&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-14', 'step1', 14, 'Lesson 14 - Panic Stops', 'Stopp raskt og trygt naar flylinjen eller situasjonen blir feil.', 'https://www.youtube.com/watch?v=TwODqrWbpW4&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step1-lesson-15', 'step1', 15, 'Lesson 15 - Beginner Power Loops', 'Gjennomfor en enkel power loop med god inngang, throttle og utgang.', 'https://www.youtube.com/watch?v=j-fJIPVe3fs&list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, true),
  ('step1-lesson-16', 'step1', 16, 'Trinn 16 - Eksamensflyvninger', 'Bruk drone: Racewhoop 2.5", bruk kamera vinkel 10 grader, og fullfor eksamenslopene kontrollert uten uhell.', 'https://www.youtube.com/playlist?list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', null, false),
  ('step2-lesson-1', 'step2', 1, 'Tinywhoop-sjekk for flyvning', 'Kontroller propeller, batteri, failsafe, VTX-kanal og trygg flysone.', 'https://www.youtube.com/watch?v=y3MHEpfzXrM', null, false),
  ('step2-lesson-2', 'step2', 2, 'Rolig hover og landinger', 'Fly rolig hover, korte forflytninger og tre kontrollerte landinger. Bruk videoene fra Steg 1 som repetisjon.', 'https://www.youtube.com/playlist?list=PLwoDb7WF6c8lCKhQOTy-Vb9LfW0VAIrTP', 'Repetisjon fra Steg 1', false),
  ('step2-lesson-3', 'step2', 3, 'Innendors bane', 'Fly en enkel loype gjennom porter eller markorer med jevn fart.', 'https://www.youtube.com/results?search_query=tinywhoop+indoor+course+beginner', null, false),
  ('step2-lesson-4', 'step2', 4, 'Praktisk eksamensrunde', 'Gjennomfor avtalt flyvning foran instruktor uten farlige situasjoner.', 'https://www.youtube.com/results?search_query=tinywhoop+beginner+flight+practice', null, false)
on conflict (id) do update set title = excluded.title, goal = excluded.goal, video_url = excluded.video_url, video_label = excluded.video_label, optional = excluded.optional;

insert into public.exam_items (id, step_id, item_order, title, requirement, drone, camera_angle_degrees, requires_video)
values
  ('step1-exam-1', 'step1', 1, 'Ovelse 1: Straw bale - 01 Field day', 'Skal gjennomfores innen 03:15', 'Racewhoop 2.5"', 10, true),
  ('step1-exam-2', 'step1', 2, 'Ovelse 2: short circuit - 01 pole position', 'Skal gjennomfores innen 03:00', 'Racewhoop 2.5"', 10, true),
  ('step1-exam-3', 'step1', 3, 'Ovelse 3: Hangar - C03', 'Skal gjennomfores innen 02:15', 'Racewhoop 2.5"', 10, true),
  ('step2-exam-1', 'step2', 1, 'Praktisk tinywhoop-eksamen', 'Instruktor vurderer fysisk flyvning eller avtalt video.', null, null, true)
on conflict (id) do update set title = excluded.title, requirement = excluded.requirement, drone = excluded.drone, camera_angle_degrees = excluded.camera_angle_degrees, requires_video = excluded.requires_video;

-- The remaining functions keep the existing app RPC contract while reading/writing normalized tables.
-- They were applied to Supabase on 2026-07-08. Keep this file as the migration record.
