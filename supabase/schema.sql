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

-- Only this verified Google email receives administrator privileges.
-- Keep this authorization rule in Postgres; the frontend must never decide roles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (
    new.id,
    case when lower(new.email) = 'nguyenhoang280004@gmail.com' then 'admin' else 'customer' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Creates a profile for accounts that existed before the trigger was installed,
-- and upgrades the configured administrator if that account already exists.
create or replace function public.ensure_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (
    auth.uid(),
    case when lower(coalesce(auth.jwt() ->> 'email', '')) = 'nguyenhoang280004@gmail.com' then 'admin' else 'customer' end
  )
  on conflict (id) do nothing;

  update public.profiles
  set role = 'admin'
  where id = auth.uid()
    and lower(coalesce(auth.jwt() ->> 'email', '')) = 'nguyenhoang280004@gmail.com';
end;
$$;

create or replace function public.mark_profile_seeded()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set seeded_at = now()
  where id = auth.uid();
$$;

revoke all on function public.ensure_profile() from public;
grant execute on function public.ensure_profile() to authenticated;
revoke all on function public.mark_profile_seeded() from public;
grant execute on function public.mark_profile_seeded() to authenticated;

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

-- The printer catalog is shared, so a default printer must refer to an existing catalog row.
alter table public.calculator_settings drop constraint if exists calculator_settings_default_printer_id_fkey;
alter table public.calculator_settings add constraint calculator_settings_default_printer_id_fkey
  foreign key (default_printer_id) references public.printers(id) on delete set null;

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

-- The administrator can supervise all customer-owned data; customers remain isolated.
drop policy if exists "Admins manage all plastics" on public.plastics;
create policy "Admins manage all plastics" on public.plastics for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage all calculator settings" on public.calculator_settings;
create policy "Admins manage all calculator settings" on public.calculator_settings for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage all products" on public.products;
create policy "Admins manage all products" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users manage their printers" on public.printers;
drop policy if exists "Authenticated users view printers" on public.printers;
drop policy if exists "Anyone can view printers" on public.printers;
create policy "Anyone can view printers" on public.printers for select using (true);
create policy "Admins add printers" on public.printers for insert to authenticated with check (public.is_admin());
create policy "Admins update printers" on public.printers for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete printers" on public.printers for delete to authenticated using (public.is_admin());

-- Create the administrator through Authentication first, then assign the role below.
-- Replace the email address with the account that should administer the printer library.
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'admin@example.com');
