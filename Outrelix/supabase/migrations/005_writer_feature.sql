-- 005_writer_feature.sql
create table if not exists writer_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  mode text check (mode in ('write','rewrite')),
  content_type text,
  input_text text,
  output_text text,
  word_count int,
  created_at timestamptz default now()
);

create table if not exists writer_settings (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  daily_limit int default 15,
  created_at timestamptz default now()
);

create or replace function count_user_writes(uid uuid)
returns int language sql as $$
  select count(*) from writer_sessions
  where user_id = uid and created_at::date = now()::date;
$$;

-- RLS
alter table writer_sessions enable row level security;
create policy "users can see their own writer_sessions"
  on writer_sessions for select using (auth.uid() = user_id);
create policy "users can insert their own writer_sessions"
  on writer_sessions for insert with check (auth.uid() = user_id);

alter table writer_settings enable row level security;
create policy "users can see their own writer_settings"
  on writer_settings for select using (auth.uid() = user_id);
create policy "users can insert their own writer_settings"
  on writer_settings for insert with check (auth.uid() = user_id);
create policy "users can update their own writer_settings"
  on writer_settings for update using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_writer_sessions_user_id on writer_sessions(user_id);
create index if not exists idx_writer_sessions_created_at on writer_sessions(created_at);
create index if not exists idx_writer_settings_user_id on writer_settings(user_id);
