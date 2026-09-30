-- Wipe Desktalk tables (safe to re-run before schema.sql)
drop table if exists media_assets cascade;
drop table if exists newsletter_subscribers cascade;
drop table if exists host_applications cascade;
drop table if exists guest_applications cascade;
drop table if exists contact_submissions cascade;
drop table if exists page_settings cascade;
drop table if exists partners cascade;
drop table if exists team_members cascade;
drop table if exists blogs cascade;
drop table if exists podcasts cascade;
drop table if exists categories cascade;
drop table if exists admins cascade;
