-- HELSINKI: run once via Supabase migrations or the SQL editor.
begin;

create table public.portfolio_home (
 id integer primary key default 1 check (id = 1),
 system_location_code text not null default '0x00_INIT',
 system_status_text text not null default 'BOOT_SEQ_COMPLETE',
 region_primary text not null default 'INDONESIA [ID]',
 region_secondary text not null default 'SUMATERA',
 greeting text not null default '> HELLO WORLD',
 description text not null default '',
 primary_cta_label text not null default '',
 primary_cta_url text not null default '',
 secondary_cta_label text not null default '',
 secondary_cta_url text not null default '',
 cv_cta_label text not null default '',
 cv_url text not null default '',
 cv_enabled boolean not null default false,
 workspace_terminal_user text not null default 'zhidan@battlestation',
 workspace_terminal_path text not null default '~/workspace',
 workspace_label text not null default 'WORKSPACE_INTERFACE',
 workspace_status text not null default 'READY',
 project_focus_label text not null default 'PROJECT FOCUS:',
 project_focus_value text not null default 'Computer Vision',
 workspace_motto text not null default 'BUILD. LEARN. ITERATE.',
 workspace_mode text not null default '[ DEV_MODE ]',
 updated_at timestamptz not null default clock_timestamp()
);

create table public.portfolio_home_headline_segments (
 id uuid primary key default gen_random_uuid(),
 line_number integer not null check (line_number >= 1),
 text text not null check (length(btrim(text)) > 0),
 accent text not null default 'default' check (accent in ('default', 'primary', 'secondary', 'tertiary')),
 sort_order integer not null check (sort_order >= 0),
 created_at timestamptz not null default now()
);

create table public.portfolio_home_info (
 id uuid primary key default gen_random_uuid(),
 label text not null check (length(btrim(label)) > 0),
 value text not null check (length(btrim(value)) > 0),
 accent text not null default 'default' check (accent in ('default', 'primary', 'secondary', 'tertiary')),
 sort_order integer not null check (sort_order >= 0),
 created_at timestamptz not null default now()
);

-- RLS for portfolio_home
alter table public.portfolio_home enable row level security;
revoke all on public.portfolio_home from anon, authenticated;
grant select on public.portfolio_home to anon, authenticated;
grant insert, update on public.portfolio_home to authenticated;
create policy public_read on public.portfolio_home for select to anon, authenticated using (true);
create policy admin_insert on public.portfolio_home for insert to authenticated with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_update on public.portfolio_home for update to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))) with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

-- RLS for portfolio_home_headline_segments
alter table public.portfolio_home_headline_segments enable row level security;
revoke all on public.portfolio_home_headline_segments from anon, authenticated;
grant select on public.portfolio_home_headline_segments to anon, authenticated;
grant insert, update, delete on public.portfolio_home_headline_segments to authenticated;
create policy public_read on public.portfolio_home_headline_segments for select to anon, authenticated using (true);
create policy admin_insert on public.portfolio_home_headline_segments for insert to authenticated with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_update on public.portfolio_home_headline_segments for update to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))) with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_delete on public.portfolio_home_headline_segments for delete to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

-- RLS for portfolio_home_info
alter table public.portfolio_home_info enable row level security;
revoke all on public.portfolio_home_info from anon, authenticated;
grant select on public.portfolio_home_info to anon, authenticated;
grant insert, update, delete on public.portfolio_home_info to authenticated;
create policy public_read on public.portfolio_home_info for select to anon, authenticated using (true);
create policy admin_insert on public.portfolio_home_info for insert to authenticated with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_update on public.portfolio_home_info for update to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))) with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_delete on public.portfolio_home_info for delete to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

-- Fetch RPC
create function public.read_home() returns jsonb language sql stable security invoker set search_path = '' as $$
 select jsonb_build_object(
  'profile', to_jsonb(h) - 'id' - 'updated_at',
  'revision', h.updated_at,
  'segments', coalesce((select jsonb_agg(to_jsonb(s) order by s.line_number, s.sort_order, s.id) from public.portfolio_home_headline_segments s), '[]'::jsonb),
  'info_cards', coalesce((select jsonb_agg(to_jsonb(i) order by i.sort_order, i.id) from public.portfolio_home_info i), '[]'::jsonb)
 )
 from public.portfolio_home h where h.id = 1;
$$;
revoke all on function public.read_home() from public;
grant execute on function public.read_home() to anon, authenticated;

-- Save RPC
create function public.save_home(content jsonb, expected_revision timestamptz) returns timestamptz
language plpgsql security invoker set search_path = '' as $$
declare current_revision timestamptz; next_revision timestamptz; list_name text;
begin
 if not exists (select 1 from public.portfolio_admins where user_id = auth.uid()) then
   raise exception 'Admin access required' using errcode = '42501';
 end if;
 
 perform pg_catalog.pg_advisory_xact_lock(728194202);
 select updated_at into current_revision from public.portfolio_home where id = 1 for update;
 if current_revision is distinct from expected_revision then
   raise exception 'Record changed' using errcode = '40001';
 end if;
 
 if jsonb_typeof(content->'profile') is distinct from 'object' then raise exception 'Invalid profile'; end if;
 foreach list_name in array array['segments','info_cards'] loop
   if jsonb_typeof(content->list_name) is distinct from 'array' then raise exception 'Invalid list'; end if;
   if jsonb_array_length(content->list_name) > 30 then raise exception 'Too many items'; end if;
 end loop;
 
 next_revision := clock_timestamp();
 insert into public.portfolio_home (
  id, system_location_code, system_status_text, region_primary, region_secondary,
  greeting, description, primary_cta_label, primary_cta_url, secondary_cta_label,
  secondary_cta_url, cv_cta_label, cv_url, cv_enabled,
  workspace_terminal_user, workspace_terminal_path, workspace_label, workspace_status,
  project_focus_label, project_focus_value, workspace_motto, workspace_mode, updated_at
 )
 values (
  1,
  content->'profile'->>'system_location_code',
  content->'profile'->>'system_status_text',
  content->'profile'->>'region_primary',
  content->'profile'->>'region_secondary',
  content->'profile'->>'greeting',
  content->'profile'->>'description',
  content->'profile'->>'primary_cta_label',
  content->'profile'->>'primary_cta_url',
  content->'profile'->>'secondary_cta_label',
  content->'profile'->>'secondary_cta_url',
  content->'profile'->>'cv_cta_label',
  content->'profile'->>'cv_url',
  (content->'profile'->>'cv_enabled')::boolean,
  content->'profile'->>'workspace_terminal_user',
  content->'profile'->>'workspace_terminal_path',
  content->'profile'->>'workspace_label',
  content->'profile'->>'workspace_status',
  content->'profile'->>'project_focus_label',
  content->'profile'->>'project_focus_value',
  content->'profile'->>'workspace_motto',
  content->'profile'->>'workspace_mode',
  next_revision
 )
 on conflict (id) do update set
  system_location_code = excluded.system_location_code,
  system_status_text = excluded.system_status_text,
  region_primary = excluded.region_primary,
  region_secondary = excluded.region_secondary,
  greeting = excluded.greeting,
  description = excluded.description,
  primary_cta_label = excluded.primary_cta_label,
  primary_cta_url = excluded.primary_cta_url,
  secondary_cta_label = excluded.secondary_cta_label,
  secondary_cta_url = excluded.secondary_cta_url,
  cv_cta_label = excluded.cv_cta_label,
  cv_url = excluded.cv_url,
  cv_enabled = excluded.cv_enabled,
  workspace_terminal_user = excluded.workspace_terminal_user,
  workspace_terminal_path = excluded.workspace_terminal_path,
  workspace_label = excluded.workspace_label,
  workspace_status = excluded.workspace_status,
  project_focus_label = excluded.project_focus_label,
  project_focus_value = excluded.project_focus_value,
  workspace_motto = excluded.workspace_motto,
  workspace_mode = excluded.workspace_mode,
  updated_at = next_revision;

 delete from public.portfolio_home_headline_segments where not exists (select 1 from jsonb_array_elements(content->'segments') item where (item->>'id')::uuid = portfolio_home_headline_segments.id);
 insert into public.portfolio_home_headline_segments (id, line_number, text, accent, sort_order)
 select (item->>'id')::uuid, (item->>'line_number')::integer, item->>'text', item->>'accent', (ordinality - 1)::integer
 from jsonb_array_elements(content->'segments') with ordinality as items(item, ordinality)
 on conflict (id) do update set line_number = excluded.line_number, text = excluded.text, accent = excluded.accent, sort_order = excluded.sort_order;

 delete from public.portfolio_home_info where not exists (select 1 from jsonb_array_elements(content->'info_cards') item where (item->>'id')::uuid = portfolio_home_info.id);
 insert into public.portfolio_home_info (id, label, value, accent, sort_order)
 select (item->>'id')::uuid, item->>'label', item->>'value', item->>'accent', (ordinality - 1)::integer
 from jsonb_array_elements(content->'info_cards') with ordinality as items(item, ordinality)
 on conflict (id) do update set label = excluded.label, value = excluded.value, accent = excluded.accent, sort_order = excluded.sort_order;

 return next_revision;
end;
$$;
revoke all on function public.save_home(jsonb, timestamptz) from public, anon;
grant execute on function public.save_home(jsonb, timestamptz) to authenticated;


-- Seed
insert into public.portfolio_home (
 id, system_location_code, system_status_text, region_primary, region_secondary,
 greeting, description, primary_cta_label, primary_cta_url, secondary_cta_label,
 secondary_cta_url, cv_cta_label, cv_url, cv_enabled,
 workspace_terminal_user, workspace_terminal_path, workspace_label, workspace_status,
 project_focus_label, project_focus_value, workspace_motto, workspace_mode
) values (
 1,
 '0x00_INIT', 'BOOT_SEQ_COMPLETE', 'INDONESIA [ID]', 'SUMATERA',
 '> HELLO WORLD',
 'Informatics Engineering student focused on software development, computer vision, web applications, and practical technology solutions calibrated for real-world reliability.',
 '> RUN_PROJECTS ↓', '#projects',
 '[ GET IN TOUCH ↗ ]', '#contact',
 '[ DOWNLOAD CV ↓ ]', '', false,
 'zhidan@battlestation', '~/workspace',
 'WORKSPACE_INTERFACE', 'READY',
 'PROJECT FOCUS:', 'Computer Vision',
 'BUILD. LEARN. ITERATE.', '[ DEV_MODE ]'
);

insert into public.portfolio_home_headline_segments (id, line_number, text, accent, sort_order) values
('f2d1e05a-a4d3-4859-96ec-2178385d3cb1', 1, 'Hi, I''m ', 'default', 0),
('b3a4a90b-8d2b-4573-9a74-d4cfd9e87900', 1, 'Zhidan', 'primary', 1),
('2c8c49e7-49f3-4df4-ae53-294b4ea01389', 1, '. I build software, ', 'default', 2),
('6de3ab39-509b-43e4-8a47-a87fdbd5f49b', 1, 'AI systems', 'secondary', 3),
('98be0804-d4db-4b48-84dc-6d80d2919d67', 1, ', and ', 'default', 4),
('88a4db95-aeb1-4cf4-921c-d78edffb14e9', 1, 'digital experiences', 'tertiary', 5),
('6f937e19-0940-410f-8700-1c390234cfeb', 1, '.', 'default', 6);

insert into public.portfolio_home_info (id, label, value, accent, sort_order) values
('1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', 'ROLE', 'Software Dev', 'default', 0),
('a9b8c7d6-e5f4-3a2b-1c0d-0e9f8a7b6c5d', 'FOCUS', 'Web / CV / Edge AI', 'secondary', 1),
('4f3e2d1c-0b9a-8f7e-6d5c-4b3a2910fedc', 'LOCATION', 'Indonesia [ID]', 'primary', 2);

commit;
