create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  seeded_at timestamptz
);

alter table public.profiles add column if not exists role text not null default 'customer'
  check (role in ('admin', 'customer'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists public.plastics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  price_per_kg numeric not null check (price_per_kg >= 0),
  color text not null default '',
  manufacturer text not null default '',
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at date not null default current_date
);

create table if not exists public.printers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  power_kw numeric not null check (power_kw >= 0),
  purchase_price numeric not null check (purchase_price >= 0),
  lifetime_hours numeric not null check (lifetime_hours >= 0),
  created_at date not null default current_date
);

create table if not exists public.calculator_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_printer_id uuid,
  electricity_price_per_kwh numeric not null default 4000 check (electricity_price_per_kwh >= 0),
  technical_rate_per_hour numeric not null default 10000 check (technical_rate_per_hour >= 0),
  risk_percent numeric not null default 15 check (risk_percent between 0 and 100),
  profit_method text not null default 'markup' check (profit_method in ('markup', 'margin')),
  profit_percent numeric not null default 50 check (profit_percent >= 0),
  advanced_costs_enabled boolean not null default false
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  total_weight numeric not null check (total_weight >= 0),
  print_hours numeric not null check (print_hours >= 0),
  quantity integer not null check (quantity > 0),
  cost_per_unit numeric not null check (cost_per_unit >= 0),
  suggested_price numeric check (suggested_price >= 0),
  created_at date not null default current_date
);

create index if not exists products_user_created_at_idx on public.products (user_id, created_at desc);

alter table public.plastics enable row level security;
alter table public.printers enable row level security;
alter table public.calculator_settings enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Users manage their profile" on public.profiles;
create policy "Users view their profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users create customer profile" on public.profiles for insert to authenticated
  with check (auth.uid() = id and role = 'customer');
create policy "Customers update their profile" on public.profiles for update to authenticated
  using (auth.uid() = id and role = 'customer')
  with check (auth.uid() = id and role = 'customer');
create policy "Users manage their plastics" on public.plastics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their calculator settings" on public.calculator_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their products" on public.products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their printers" on public.printers;
create policy "Authenticated users view printers" on public.printers for select to authenticated using (true);
create policy "Admins add printers" on public.printers for insert to authenticated with check (public.is_admin());
create policy "Admins update printers" on public.printers for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete printers" on public.printers for delete to authenticated using (public.is_admin());

-- Create the administrator through Authentication first, then assign the role below.
-- Replace the email address with the account that should administer the printer library.
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'admin@example.com');
