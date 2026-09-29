-- Desktalk schema for Supabase PostgreSQL
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null default 'Admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text not null check (type in ('podcast', 'blog')),
  created_at timestamptz not null default now()
);

create table if not exists podcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text default '',
  description text default '',
  thumbnail_url text default '',
  video_url text default '',
  rating numeric(2,1) default 0,
  host_name text default '',
  host_photo_url text default '',
  guest_name text default '',
  guest_photo_url text default '',
  sponsor_logo_url text default '',
  category_id uuid references categories(id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text default '',
  body text default '',
  cover_url text default '',
  category_id uuid references categories(id) on delete set null,
  author_name text default 'Desktalk',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text default '',
  bio text default '',
  photo_url text default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists page_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text default '',
  company text default '',
  linkedin text default '',
  enquiry text not null,
  accepted_terms boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists guest_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text default '',
  company text default '',
  linkedin text default '',
  topic text default '',
  message text default '',
  created_at timestamptz not null default now()
);

create table if not exists host_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text default '',
  company text default '',
  linkedin text default '',
  experience text default '',
  message text default '',
  created_at timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  public_url text not null,
  content_type text default '',
  folder text default 'uploads',
  created_at timestamptz not null default now()
);

create index if not exists idx_podcasts_published on podcasts (published, sort_order, published_at desc);
create index if not exists idx_blogs_published on blogs (published, published_at desc);
create index if not exists idx_categories_type on categories (type);
