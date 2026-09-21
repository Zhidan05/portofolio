-- HELSINKI: run once via Supabase migrations or the SQL editor.
begin;
create table public.portfolio_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;
grant select on public.portfolio_admins to authenticated;
create policy admins_read_own on public.portfolio_admins for select to authenticated using (user_id = (select auth.uid()));
create table public.about_profile (
 id integer primary key default 1 check (id = 1),
 "name" text not null check (length("name") <= 160 and length(btrim("name")) > 0),
 "class" text not null check (length("class") <= 160 and length(btrim("class")) > 0),
 "specialization" text not null check (length("specialization") <= 160 and length(btrim("specialization")) > 0),
 "affiliation" text not null check (length("affiliation") <= 160 and length(btrim("affiliation")) > 0),
 "location" text not null check (length("location") <= 160 and length(btrim("location")) > 0),
 "record_id" text not null check (length("record_id") <= 160 and length(btrim("record_id")) > 0),
 "class_meta" text not null check (length("class_meta") <= 160 and length(btrim("class_meta")) > 0),
 "bio_paragraph_1" text not null check (length("bio_paragraph_1") <= 4000 and length(btrim("bio_paragraph_1")) > 0),
 "bio_paragraph_2" text not null check (length("bio_paragraph_2") <= 4000),
 "bio_paragraph_3" text not null check (length("bio_paragraph_3") <= 4000),
 "bio_highlight" text not null check (length("bio_highlight") <= 160),
 "directive" text not null check (length("directive") <= 2000 and length(btrim("directive")) > 0),
 updated_at timestamptz not null default clock_timestamp()
);

create table public.about_interests (
 id uuid primary key default gen_random_uuid(),
 label text not null check (length(btrim(label)) between 1 and 160),
 
 sort_order integer not null check (sort_order >= 0),
 created_at timestamptz not null default now()
);

create table public.about_tools (
 id uuid primary key default gen_random_uuid(),
 label text not null check (length(btrim(label)) between 1 and 160),
 
 sort_order integer not null check (sort_order >= 0),
 created_at timestamptz not null default now()
);

create table public.about_focus (
 id uuid primary key default gen_random_uuid(),
 label text not null check (length(btrim(label)) between 1 and 160),
 code text not null check (length(btrim(code)) between 1 and 40),
 sort_order integer not null check (sort_order >= 0),
 created_at timestamptz not null default now()
);

alter table public.about_profile enable row level security;
revoke all on public.about_profile from anon, authenticated;
grant select on public.about_profile to anon, authenticated;
grant insert, update on public.about_profile to authenticated;
create policy public_read on public.about_profile for select to anon, authenticated using (true);
create policy admin_insert on public.about_profile for insert to authenticated with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_update on public.about_profile for update to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))) with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));


alter table public.about_interests enable row level security;
revoke all on public.about_interests from anon, authenticated;
grant select on public.about_interests to anon, authenticated;
grant insert, update, delete on public.about_interests to authenticated;
create policy public_read on public.about_interests for select to anon, authenticated using (true);
create policy admin_insert on public.about_interests for insert to authenticated with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_update on public.about_interests for update to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))) with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_delete on public.about_interests for delete to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

alter table public.about_tools enable row level security;
revoke all on public.about_tools from anon, authenticated;
grant select on public.about_tools to anon, authenticated;
grant insert, update, delete on public.about_tools to authenticated;
create policy public_read on public.about_tools for select to anon, authenticated using (true);
create policy admin_insert on public.about_tools for insert to authenticated with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_update on public.about_tools for update to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))) with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_delete on public.about_tools for delete to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

alter table public.about_focus enable row level security;
revoke all on public.about_focus from anon, authenticated;
grant select on public.about_focus to anon, authenticated;
grant insert, update, delete on public.about_focus to authenticated;
create policy public_read on public.about_focus for select to anon, authenticated using (true);
create policy admin_insert on public.about_focus for insert to authenticated with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_update on public.about_focus for update to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))) with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy admin_delete on public.about_focus for delete to authenticated using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

-- One SQL statement gives readers a consistent snapshot of all four tables.
create function public.read_about() returns jsonb language sql stable security invoker set search_path = '' as $$
 select jsonb_build_object('profile', to_jsonb(p) - 'id' - 'updated_at', 'revision', p.updated_at,
 'interests', coalesce((select jsonb_agg(to_jsonb(i) order by i.sort_order, i.id) from public.about_interests i), '[]'::jsonb),
 'tools', coalesce((select jsonb_agg(to_jsonb(t) order by t.sort_order, t.id) from public.about_tools t), '[]'::jsonb),
 'focus', coalesce((select jsonb_agg(to_jsonb(f) order by f.sort_order, f.id) from public.about_focus f), '[]'::jsonb))
 from public.about_profile p where p.id = 1;
$$;
revoke all on function public.read_about() from public;
grant execute on function public.read_about() to anon, authenticated;

-- Invoker rights preserve RLS; every save is one transaction, including removals.
create function public.save_about(content jsonb, expected_revision timestamptz) returns timestamptz
language plpgsql security invoker set search_path = '' as $$
declare current_revision timestamptz; next_revision timestamptz; list_name text;
begin
 if not exists (select 1 from public.portfolio_admins where user_id = auth.uid()) then
   raise exception 'Admin access required' using errcode = '42501';
 end if;
 -- Also serialize initial creation when the singleton row does not exist yet.
 perform pg_catalog.pg_advisory_xact_lock(728194201);
 select updated_at into current_revision from public.about_profile where id = 1 for update;
 if current_revision is distinct from expected_revision then
   raise exception 'Record changed' using errcode = '40001';
 end if;
 if jsonb_typeof(content->'profile') is distinct from 'object' then raise exception 'Invalid profile'; end if;
 foreach list_name in array array['interests','tools','focus'] loop
   if jsonb_typeof(content->list_name) is distinct from 'array' then raise exception 'Invalid list'; end if;
   if jsonb_array_length(content->list_name) > 30 then raise exception 'Too many items'; end if;
 end loop;
 next_revision := clock_timestamp();
 insert into public.about_profile (id, "name", "class", "specialization", "affiliation", "location", "record_id", "class_meta", "bio_paragraph_1", "bio_paragraph_2", "bio_paragraph_3", "bio_highlight", "directive", updated_at)
 values (1, content->'profile'->>'name', content->'profile'->>'class', content->'profile'->>'specialization', content->'profile'->>'affiliation', content->'profile'->>'location', content->'profile'->>'record_id', content->'profile'->>'class_meta', content->'profile'->>'bio_paragraph_1', content->'profile'->>'bio_paragraph_2', content->'profile'->>'bio_paragraph_3', content->'profile'->>'bio_highlight', content->'profile'->>'directive', next_revision)
 on conflict (id) do update set "name" = excluded."name", "class" = excluded."class", "specialization" = excluded."specialization", "affiliation" = excluded."affiliation", "location" = excluded."location", "record_id" = excluded."record_id", "class_meta" = excluded."class_meta", "bio_paragraph_1" = excluded."bio_paragraph_1", "bio_paragraph_2" = excluded."bio_paragraph_2", "bio_paragraph_3" = excluded."bio_paragraph_3", "bio_highlight" = excluded."bio_highlight", "directive" = excluded."directive", updated_at = next_revision;

 delete from public.about_interests where not exists (select 1 from jsonb_array_elements(content->'interests') item where (item->>'id')::uuid = about_interests.id);
 insert into public.about_interests (id, label, sort_order)
 select (item->>'id')::uuid, item->>'label', (ordinality - 1)::integer
 from jsonb_array_elements(content->'interests') with ordinality as items(item, ordinality)
 on conflict (id) do update set label = excluded.label, sort_order = excluded.sort_order;

 delete from public.about_tools where not exists (select 1 from jsonb_array_elements(content->'tools') item where (item->>'id')::uuid = about_tools.id);
 insert into public.about_tools (id, label, sort_order)
 select (item->>'id')::uuid, item->>'label', (ordinality - 1)::integer
 from jsonb_array_elements(content->'tools') with ordinality as items(item, ordinality)
 on conflict (id) do update set label = excluded.label, sort_order = excluded.sort_order;

 delete from public.about_focus where not exists (select 1 from jsonb_array_elements(content->'focus') item where (item->>'id')::uuid = about_focus.id);
 insert into public.about_focus (id, label, code, sort_order)
 select (item->>'id')::uuid, item->>'label', item->>'code', (ordinality - 1)::integer
 from jsonb_array_elements(content->'focus') with ordinality as items(item, ordinality)
 on conflict (id) do update set label = excluded.label, code = excluded.code, sort_order = excluded.sort_order;

 return next_revision;
end;
$$;
revoke all on function public.save_about(jsonb, timestamptz) from public, anon;
grant execute on function public.save_about(jsonb, timestamptz) to authenticated;

-- Seed copied from the original published About component.
insert into public.about_profile ("name", "class", "specialization", "affiliation", "location", "record_id", "class_meta", "bio_paragraph_1", "bio_paragraph_2", "bio_paragraph_3", "bio_highlight", "directive") values ('Zhidan', 'Informatics Engineering', 'Full-Stack & Vision Systems', 'Universitas Riau', 'Indonesia', 'ZHIDAN', 'INFORMATICS_ENGINEER', 'I am an Informatics Engineering student interested in the mechanics of resilient computing. My engineering path connects structured software design, full-stack applications, and computer vision.', 'I like bringing machine learning and web systems together: from face recognition and attendance workflows to safety monitoring and useful digital experiences.', 'Every project is an opportunity to make technology more practical, with thoughtful requirements, readable code, and clear interfaces.', 'Informatics Engineering student', 'Simplicity in interface, rigor in architecture, practical utility over decorative hype.');
insert into public.about_interests (id, label, sort_order) values ('4ed1c491-69e6-4436-9987-8a4a7bedded6', 'Web Architecture', 0);
insert into public.about_interests (id, label, sort_order) values ('fa2f7ec1-f3f7-4ecd-ad34-67e4b3541b79', 'Computer Vision & YOLO', 1);
insert into public.about_interests (id, label, sort_order) values ('5c82767c-4f4a-4229-911c-2009a1d94a27', 'Edge AI & Recognition', 2);
insert into public.about_interests (id, label, sort_order) values ('92af1fab-9618-4f8a-9c4a-88cb68df3f26', 'Network Protocols & Sockets', 3);
insert into public.about_tools (id, label, sort_order) values ('7f86226a-ac61-4f2a-9c83-903073eb1439', 'VS Code', 0);
insert into public.about_tools (id, label, sort_order) values ('82f165e5-a289-4371-a3a4-be6b62b93784', 'Linux / WSL', 1);
insert into public.about_tools (id, label, sort_order) values ('6e067dca-6444-4af5-8121-83285260698f', 'Docker', 2);
insert into public.about_tools (id, label, sort_order) values ('7fd52a2b-90e5-4a18-8ad2-1ea3fb9274be', 'Git', 3);
insert into public.about_tools (id, label, sort_order) values ('77057fd2-547b-4212-8f50-ae9ad614405d', 'Postman', 4);
insert into public.about_focus (id, label, code, sort_order) values ('209a2cf3-f45b-4d75-b819-b3941a11ddea', 'SOFTWARE DEVELOPMENT', 'FOCUS_01', 0);
insert into public.about_focus (id, label, code, sort_order) values ('b1364000-472a-4fcb-8b88-4304c94de84b', 'COMPUTER VISION', 'FOCUS_02', 1);
insert into public.about_focus (id, label, code, sort_order) values ('c82fe744-d6f6-42c3-85f7-15edef67a417', 'WEB APPLICATIONS', 'FOCUS_03', 2);
insert into public.about_focus (id, label, code, sort_order) values ('f1dd0266-5689-4d7c-9955-1184222c97a4', 'CONTINUOUS LEARNING', 'FOCUS_04', 3);
commit;
