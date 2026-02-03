-- Brand Generator Feature Migration

-- Table: brand_generations
create table if not exists brand_generations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  brand_name text,
  business_type text,
  tagline text,
  color_palette text[],
  tone text,
  hero_html text,
  features text[],
  created_at timestamptz default now()
);

-- RLS
alter table brand_generations enable row level security;

drop policy if exists "Users select their own brands" on brand_generations;
create policy "Users select their own brands"
  on brand_generations for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert their own brands" on brand_generations;
create policy "Users insert their own brands"
  on brand_generations for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete their own brands" on brand_generations;
create policy "Users delete their own brands"
  on brand_generations for delete
  using (auth.uid() = user_id);

-- Daily limit tracking
create table if not exists brand_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  daily_limit int default 10,
  created_at timestamptz default now()
);

alter table brand_settings enable row level security;

drop policy if exists "Users select their own brand settings" on brand_settings;
create policy "Users select their own brand settings"
  on brand_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert their own brand settings" on brand_settings;
create policy "Users insert their own brand settings"
  on brand_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update their own brand settings" on brand_settings;
create policy "Users update their own brand settings"
  on brand_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Functions for daily limit enforcement
create or replace function count_user_brand_generations(uid uuid)
returns int
language sql
as $$
  select count(*) from brand_generations
  where user_id = uid and created_at::date = now()::date;
$$;

grant execute on function count_user_brand_generations(uuid) to authenticated;

-- Indexes
create index if not exists idx_brand_generations_user_id on brand_generations(user_id);
create index if not exists idx_brand_generations_created_at on brand_generations(created_at desc);

