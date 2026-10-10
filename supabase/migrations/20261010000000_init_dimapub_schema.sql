-- Applied to the `dimapub` Supabase project (gohailemaywvobzumoej) on 2026-10-10.

-- Contact form submissions. Written only by the `contact` edge function (service role).
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  organization text check (char_length(organization) <= 200),
  topic text not null default 'general' check (topic in ('general','adoption','instructor','bulk','authors','partnerships','press','portal','support')),
  message text not null check (char_length(message) between 1 and 5000),
  source_page text,
  ip_hash text,
  email_status text not null default 'pending',
  handled boolean not null default false
);
create index contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index contact_messages_ip_hash_idx on public.contact_messages (ip_hash, created_at desc);
alter table public.contact_messages enable row level security;

-- Newsletter / updates list. Written only by the edge function.
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique check (char_length(email) between 3 and 320),
  source_page text,
  unsubscribed boolean not null default false
);
alter table public.subscribers enable row level security;

-- Who may enter the private research portal. Managed from the Supabase dashboard.
create table public.portal_members (
  email text primary key,
  full_name text,
  role text not null default 'viewer' check (role in ('viewer','admin')),
  created_at timestamptz not null default now()
);
alter table public.portal_members enable row level security;

create or replace function public.is_portal_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.portal_members m
    where lower(m.email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  );
$$;
revoke all on function public.is_portal_member() from public, anon;
grant execute on function public.is_portal_member() to authenticated;

create policy "Members can see their own membership"
  on public.portal_members for select to authenticated
  using (lower(email) = lower((select auth.jwt() ->> 'email')));

-- Market research and differentiation reports shown in the portal.
create table public.research_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  published_on date not null default current_date,
  title text not null,
  summary text,
  category text not null default 'Market research',
  body_md text,
  file_path text,       -- object path inside the private `research` storage bucket
  external_url text,
  sort_order int not null default 100,
  is_published boolean not null default true
);
alter table public.research_reports enable row level security;

create policy "Portal members can read published reports"
  on public.research_reports for select to authenticated
  using (is_published and (select public.is_portal_member()));

-- Private bucket for report files (PDF, decks, spreadsheets).
insert into storage.buckets (id, name, public)
values ('research', 'research', false)
on conflict (id) do nothing;

create policy "Portal members can read research files"
  on storage.objects for select to authenticated
  using (bucket_id = 'research' and (select public.is_portal_member()));

insert into public.portal_members (email, full_name, role)
values ('dimapublishingllc@gmail.com', 'Dima Publishing', 'admin')
on conflict (email) do nothing;
