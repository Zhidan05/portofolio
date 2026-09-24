-- HELSINKI Contact module. Apply after 202609220003_experience.sql.
begin;

create table public.portfolio_contact (
  id uuid primary key default gen_random_uuid(),
  section_label text not null check (length(btrim(section_label)) between 1 and 100),
  heading text not null check (length(btrim(heading)) between 1 and 200),
  description text not null check (length(btrim(description)) between 1 and 1000),
  channels_heading text not null check (length(btrim(channels_heading)) between 1 and 100),
  channels_status_label text check (channels_status_label is null or length(channels_status_label) <= 100),
  channels_footer_title text check (channels_footer_title is null or length(channels_footer_title) <= 100),
  channels_footer_text text check (channels_footer_text is null or length(channels_footer_text) <= 500),
  form_heading text not null check (length(btrim(form_heading)) between 1 and 100),
  form_intro text check (form_intro is null or length(form_intro) <= 500),
  submit_label text not null check (length(btrim(submit_label)) between 1 and 100),
  max_message_length integer not null default 1024 check (max_message_length between 100 and 5000),
  updated_at timestamptz not null default now()
);

create table public.portfolio_contact_channels (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.portfolio_contact(id) on delete cascade,
  type text not null check (length(btrim(type)) between 1 and 40 and type ~ '^[A-Za-z0-9_-]+$'),
  label text not null check (length(btrim(label)) between 1 and 100),
  value text check (value is null or length(value) <= 320),
  url text check (url is null or url ~* '^https?://' or (type = 'email' and value ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and url = ('mailto:' || value))),
  status text not null default 'active' check (status in ('active', 'pending', 'hidden')),
  status_label text check (status_label is null or length(status_label) <= 80),
  accent text not null default 'primary' check (accent in ('primary', 'secondary', 'tertiary') or accent ~* '^#[0-9a-f]{6}$'),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_contact_subjects (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.portfolio_contact(id) on delete cascade,
  value text not null unique check (value ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$'),
  label text not null check (length(btrim(label)) between 1 and 120),
  enabled boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_contact_messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null check (length(btrim(sender_name)) between 2 and 100),
  sender_email text not null check (length(sender_email) <= 254 and sender_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  subject_value text not null check (length(subject_value) between 1 and 80),
  message text not null check (length(btrim(message)) >= 10 and length(message) <= 5000),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  source text not null default 'portfolio' check (source = 'portfolio'),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  archived_at timestamptz
);

create index portfolio_contact_channels_contact_order_idx on public.portfolio_contact_channels(contact_id, sort_order);
create index portfolio_contact_subjects_contact_order_idx on public.portfolio_contact_subjects(contact_id, sort_order);
create index portfolio_contact_messages_status_created_idx on public.portfolio_contact_messages(status, created_at desc);
create index portfolio_contact_messages_sender_throttle_idx on public.portfolio_contact_messages(lower(sender_email), created_at desc);
create index portfolio_contact_messages_new_idx on public.portfolio_contact_messages(created_at desc) where status = 'new';

alter table public.portfolio_contact enable row level security;
alter table public.portfolio_contact_channels enable row level security;
alter table public.portfolio_contact_subjects enable row level security;
alter table public.portfolio_contact_messages enable row level security;

revoke all on public.portfolio_contact, public.portfolio_contact_channels, public.portfolio_contact_subjects, public.portfolio_contact_messages from anon, authenticated;
grant select on public.portfolio_contact to anon, authenticated;
grant select on public.portfolio_contact_channels to anon, authenticated;
grant select on public.portfolio_contact_subjects to anon, authenticated;
grant update on public.portfolio_contact to authenticated;
grant insert, update, delete on public.portfolio_contact_channels to authenticated;
grant insert, update, delete on public.portfolio_contact_subjects to authenticated;
grant select on public.portfolio_contact_messages to authenticated;
grant update(status, read_at, archived_at) on public.portfolio_contact_messages to authenticated;

create policy contact_public_read on public.portfolio_contact for select to anon, authenticated using (true);
create policy contact_admin_update on public.portfolio_contact for update to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

create policy channels_public_read on public.portfolio_contact_channels for select to anon, authenticated using (status <> 'hidden');
create policy channels_admin_read_hidden on public.portfolio_contact_channels for select to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy channels_admin_insert on public.portfolio_contact_channels for insert to authenticated
  with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy channels_admin_update on public.portfolio_contact_channels for update to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy channels_admin_delete on public.portfolio_contact_channels for delete to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

create policy subjects_public_read on public.portfolio_contact_subjects for select to anon, authenticated using (enabled);
create policy subjects_admin_read_disabled on public.portfolio_contact_subjects for select to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy subjects_admin_insert on public.portfolio_contact_subjects for insert to authenticated
  with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy subjects_admin_update on public.portfolio_contact_subjects for update to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy subjects_admin_delete on public.portfolio_contact_subjects for delete to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

create policy messages_admin_read on public.portfolio_contact_messages for select to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));
create policy messages_admin_update on public.portfolio_contact_messages for update to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

create function public.read_public_contact() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'settings', to_jsonb(c),
    'channels', coalesce((select jsonb_agg(to_jsonb(ch) order by ch.sort_order, ch.id) from public.portfolio_contact_channels ch where ch.contact_id = c.id and ch.status <> 'hidden'), '[]'::jsonb),
    'subjects', coalesce((select jsonb_agg(to_jsonb(s) order by s.sort_order, s.id) from public.portfolio_contact_subjects s where s.contact_id = c.id and s.enabled), '[]'::jsonb)
  ) from public.portfolio_contact c order by c.updated_at desc limit 1;
$$;
revoke all on function public.read_public_contact() from public;
grant execute on function public.read_public_contact() to anon, authenticated;

create function public.submit_contact_message(p_sender_name text, p_sender_email text, p_subject_value text, p_message text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_name text := btrim(p_sender_name);
  v_email text := lower(btrim(p_sender_email));
  v_subject text := btrim(p_subject_value);
  v_message text := btrim(p_message);
  v_max_length integer;
begin
  select max_message_length into v_max_length from public.portfolio_contact order by updated_at desc limit 1;
  if v_max_length is null then raise exception 'Contact service unavailable' using errcode = '55000'; end if;
  if length(v_name) not between 2 and 100 then raise exception 'Invalid sender name' using errcode = '22023'; end if;
  if length(v_email) > 254 or v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Invalid sender email' using errcode = '22023'; end if;
  if not exists (select 1 from public.portfolio_contact_subjects where value = v_subject and enabled) then raise exception 'Invalid subject' using errcode = '22023'; end if;
  if length(v_message) < 10 or length(v_message) > v_max_length then raise exception 'Invalid message length' using errcode = '22023'; end if;
  -- Serialize throttling per normalized email so concurrent requests cannot race the count.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_email));
  if (select count(*) from public.portfolio_contact_messages where lower(sender_email) = v_email and created_at > now() - interval '15 minutes') >= 3 then
    raise exception 'Submission limit reached' using errcode = 'P0001';
  end if;
  insert into public.portfolio_contact_messages(sender_name, sender_email, subject_value, message)
  values (v_name, v_email, v_subject, v_message);
  return true;
end;
$$;
revoke all on function public.submit_contact_message(text, text, text, text) from public;
grant execute on function public.submit_contact_message(text, text, text, text) to anon, authenticated;

create function public.reorder_contact_channels(p_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())) then raise exception 'Admin access required' using errcode = '42501'; end if;
  update public.portfolio_contact_channels ch set sort_order = ordered.position - 1, updated_at = clock_timestamp()
  from unnest(p_ids) with ordinality as ordered(id, position) where ch.id = ordered.id;
end;
$$;
revoke all on function public.reorder_contact_channels(uuid[]) from public, anon;
grant execute on function public.reorder_contact_channels(uuid[]) to authenticated;

create function public.reorder_contact_subjects(p_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())) then raise exception 'Admin access required' using errcode = '42501'; end if;
  update public.portfolio_contact_subjects s set sort_order = ordered.position - 1, updated_at = clock_timestamp()
  from unnest(p_ids) with ordinality as ordered(id, position) where s.id = ordered.id;
end;
$$;
revoke all on function public.reorder_contact_subjects(uuid[]) from public, anon;
grant execute on function public.reorder_contact_subjects(uuid[]) to authenticated;

insert into public.portfolio_contact(id, section_label, heading, description, channels_heading, channels_status_label, channels_footer_title, channels_footer_text, form_heading, form_intro, submit_label, max_message_length)
values ('00000000-0000-4000-8000-000000000007', '07 // DISPATCH_CONSOLE', 'LET''S BUILD SOMETHING USEFUL', 'Interested in software engineering collaboration, computer vision research, or full-stack applications? Let''s turn a useful idea into something real.', 'DIRECT_CHANNELS', 'CHANNELS PENDING', 'CHANNELS PENDING', 'Verified contact details will be published here.', 'TRANSMIT_MESSAGE.SH', 'Contact form preview — delivery is not connected yet.', 'DISPATCH MESSAGE →', 1024);

insert into public.portfolio_contact_channels(id, contact_id, type, label, status, status_label, accent, sort_order) values
('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000007', 'email', 'PRIMARY EMAIL', 'pending', 'PENDING', 'primary', 0),
('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000007', 'github', 'CODE REPOSITORY', 'pending', 'PENDING', 'secondary', 1),
('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000007', 'linkedin', 'PROFESSIONAL NETWORK', 'pending', 'PENDING', 'tertiary', 2),
('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000007', 'instagram', 'DEVELOPER DISPATCH', 'pending', 'PENDING', 'primary', 3);

insert into public.portfolio_contact_subjects(id, contact_id, value, label, enabled, sort_order) values
('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000007', 'project', 'Project Inquiry / Contract', true, 0),
('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000007', 'opportunity', 'Internship / Job Opportunity', true, 1),
('20000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000007', 'research', 'Computer Vision / AI Research', true, 2),
('20000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000007', 'other', 'General Dev Discussion', true, 3);

commit;
