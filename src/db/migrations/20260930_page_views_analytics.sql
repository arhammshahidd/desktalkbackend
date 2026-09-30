-- Site traffic / content view analytics
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  path text not null default '/',
  page_type text not null default 'page'
    check (page_type in ('page', 'podcast', 'blog')),
  content_id uuid,
  content_slug text not null default '',
  content_title text not null default '',
  referrer text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on page_views (created_at desc);
create index if not exists page_views_visitor_day_idx on page_views (visitor_id, created_at desc);
create index if not exists page_views_content_idx on page_views (page_type, content_slug, created_at desc);
