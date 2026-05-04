-- ============================================================
-- PiezaLink - Esquema inicial
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ============================================================
-- VENDORS (perfiles de vendedores)
-- ============================================================
create table if not exists public.vendors (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  company_name  text not null,
  logo_url      text,
  description   text,
  phone         text,
  whatsapp      text not null,
  email         text not null,
  city          text,
  state         text,
  country       text default 'Argentina',
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- SUBSCRIPTIONS (planes de suscripción)
-- ============================================================
create type subscription_plan as enum ('trial', 'basic', 'pro');
create type subscription_status as enum ('active', 'inactive', 'expired');

create table if not exists public.subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  vendor_id   uuid references public.vendors(id) on delete cascade not null,
  plan        subscription_plan not null default 'trial',
  status      subscription_status not null default 'active',
  started_at  timestamptz default now(),
  expires_at  timestamptz default (now() + interval '30 days'),
  created_at  timestamptz default now()
);

-- ============================================================
-- PARTS (catálogo de piezas)
-- ============================================================
create table if not exists public.parts (
  id              uuid primary key default uuid_generate_v4(),
  vendor_id       uuid references public.vendors(id) on delete cascade not null,
  part_number     text not null,
  description     text not null,
  compatibility   text not null,
  stock_quantity  integer not null default 0,
  brand           text,
  category        text,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_parts_vendor_id on public.parts(vendor_id);
create index if not exists idx_parts_part_number on public.parts(part_number);
create index if not exists idx_parts_search on public.parts using gin(
  to_tsvector('spanish', coalesce(part_number,'') || ' ' || coalesce(description,'') || ' ' || coalesce(compatibility,'') || ' ' || coalesce(brand,''))
);

-- ============================================================
-- CONTACT_REQUESTS (consultas de compradores)
-- ============================================================
create table if not exists public.contact_requests (
  id            uuid primary key default uuid_generate_v4(),
  part_id       uuid references public.parts(id) on delete set null,
  vendor_id     uuid references public.vendors(id) on delete cascade not null,
  buyer_name    text not null,
  buyer_email   text not null,
  buyer_phone   text not null,
  message       text,
  created_at    timestamptz default now()
);

create index if not exists idx_contacts_vendor_id on public.contact_requests(vendor_id);

-- ============================================================
-- PART_EVENTS (métricas: vistas y clicks de whatsapp)
-- ============================================================
create type event_type as enum ('view', 'whatsapp_click');

create table if not exists public.part_events (
  id          uuid primary key default uuid_generate_v4(),
  part_id     uuid references public.parts(id) on delete cascade not null,
  vendor_id   uuid references public.vendors(id) on delete cascade not null,
  event_type  event_type not null,
  created_at  timestamptz default now()
);

create index if not exists idx_events_vendor_id on public.part_events(vendor_id);
create index if not exists idx_events_part_id on public.part_events(part_id);
create index if not exists idx_events_created_at on public.part_events(created_at);

-- ============================================================
-- AD_SPACES (espacios publicitarios)
-- ============================================================
create type ad_position as enum ('home_top', 'search_top', 'search_sidebar');

create table if not exists public.ad_spaces (
  id          uuid primary key default uuid_generate_v4(),
  vendor_id   uuid references public.vendors(id) on delete set null,
  title       text not null,
  position    ad_position not null,
  image_url   text not null,
  link_url    text not null,
  starts_at   timestamptz not null default now(),
  expires_at  timestamptz not null,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Vendors: públicos para leer, solo el dueño puede editar
alter table public.vendors enable row level security;

create policy "vendors_public_read" on public.vendors
  for select using (is_active = true);

create policy "vendors_owner_all" on public.vendors
  for all using (auth.uid() = user_id);

-- Parts: públicas para leer, solo el vendedor dueño puede editar
alter table public.parts enable row level security;

create policy "parts_public_read" on public.parts
  for select using (is_active = true);

create policy "parts_owner_all" on public.parts
  for all using (
    vendor_id in (
      select id from public.vendors where user_id = auth.uid()
    )
  );

-- Contact requests: solo el vendedor puede ver las suyas
alter table public.contact_requests enable row level security;

create policy "contacts_insert_public" on public.contact_requests
  for insert with check (true);

create policy "contacts_vendor_read" on public.contact_requests
  for select using (
    vendor_id in (
      select id from public.vendors where user_id = auth.uid()
    )
  );

-- Part events: insert público, solo el vendedor puede leer los suyos
alter table public.part_events enable row level security;

create policy "events_insert_public" on public.part_events
  for insert with check (true);

create policy "events_vendor_read" on public.part_events
  for select using (
    vendor_id in (
      select id from public.vendors where user_id = auth.uid()
    )
  );

-- Subscriptions: solo el vendedor dueño puede ver la suya
alter table public.subscriptions enable row level security;

create policy "subscriptions_vendor_read" on public.subscriptions
  for select using (
    vendor_id in (
      select id from public.vendors where user_id = auth.uid()
    )
  );

-- Ad spaces: públicas para leer activas
alter table public.ad_spaces enable row level security;

create policy "ads_public_read" on public.ad_spaces
  for select using (is_active = true and expires_at > now());

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger vendors_updated_at before update on public.vendors
  for each row execute function public.handle_updated_at();

create trigger parts_updated_at before update on public.parts
  for each row execute function public.handle_updated_at();

-- ============================================================
-- FUNCIÓN: crear suscripción trial al registrar vendedor
-- ============================================================
create or replace function public.handle_new_vendor()
returns trigger as $$
begin
  insert into public.subscriptions (vendor_id, plan, status, expires_at)
  values (new.id, 'trial', 'active', now() + interval '30 days');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_vendor_created after insert on public.vendors
  for each row execute function public.handle_new_vendor();
