create table if not exists public.drone_app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.drone_app_state enable row level security;

drop policy if exists "drone app state read" on public.drone_app_state;
drop policy if exists "drone app state insert" on public.drone_app_state;
drop policy if exists "drone app state update" on public.drone_app_state;

create policy "drone app state read"
  on public.drone_app_state
  for select
  to anon
  using (true);

create policy "drone app state insert"
  on public.drone_app_state
  for insert
  to anon
  with check (true);

create policy "drone app state update"
  on public.drone_app_state
  for update
  to anon
  using (true)
  with check (true);
