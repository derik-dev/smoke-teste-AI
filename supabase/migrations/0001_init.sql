create table public.tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  status text not null default 'queued' check (status in ('queued','running','done','failed')),
  phase text,
  report jsonb,
  error text,
  share_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index tests_user_created on public.tests (user_id, created_at desc);

create table public.test_steps (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  idx int not null,
  device text not null check (device in ('desktop','mobile')),
  title text not null,
  description text,
  status text not null check (status in ('ok','warn','fail')),
  screenshot_path text,
  created_at timestamptz not null default now()
);
create index test_steps_test on public.test_steps (test_id, idx);

alter table public.tests enable row level security;
alter table public.test_steps enable row level security;

-- usuário só lê os próprios testes; escrita é feita pelo servidor (service role)
create policy "own tests" on public.tests for select using (auth.uid() = user_id);
create policy "own steps" on public.test_steps for select
  using (exists (select 1 from public.tests t where t.id = test_id and t.user_id = auth.uid()));

insert into storage.buckets (id, name, public) values ('screenshots', 'screenshots', true)
  on conflict do nothing;
