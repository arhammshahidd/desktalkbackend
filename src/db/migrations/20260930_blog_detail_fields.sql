-- Blog detail extras from Figma (author card + FAQ accordion)
alter table blogs add column if not exists author_role text default '';
alter table blogs add column if not exists author_photo_url text default '';
alter table blogs add column if not exists author_linkedin text default '';
alter table blogs add column if not exists faq jsonb default '[]'::jsonb;
