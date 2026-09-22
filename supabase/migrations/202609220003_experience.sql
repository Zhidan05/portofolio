-- HELSINKI: run once via Supabase migrations or the SQL editor.
begin;

-- =====================================================================================
-- EXPERIENCE TABLE
-- =====================================================================================
create table public.portfolio_experiences (
    id uuid primary key default gen_random_uuid(),
    organization text not null check (char_length(organization) <= 150),
    role text not null check (char_length(role) <= 150),
    description text not null check (char_length(description) <= 1000),
    start_label text not null check (char_length(start_label) <= 30),
    end_label text check (end_label is null or char_length(end_label) <= 30),
    status text not null check (status in ('active', 'inactive', 'completed')),
    status_label text not null check (char_length(status_label) <= 50),
    accent text not null default 'primary' check (accent in ('primary', 'secondary', 'tertiary', 'custom')),
    custom_accent_color text null check (
        custom_accent_color is null or (
            custom_accent_color ~* '^#[0-9a-f]{3}$' or 
            custom_accent_color ~* '^#[0-9a-f]{6}$'
        )
    ),
    is_current boolean not null default false,
    sort_order integer not null default 0,
    published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.portfolio_experiences enable row level security;

-- =====================================================================================
-- EXPERIENCE TAGS TABLE
-- =====================================================================================
create table public.portfolio_experience_tags (
    id uuid primary key default gen_random_uuid(),
    experience_id uuid not null references public.portfolio_experiences(id) on delete cascade,
    label text not null check (char_length(label) <= 80 and char_length(label) > 0),
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

alter table public.portfolio_experience_tags enable row level security;
create index portfolio_experience_tags_exp_id_idx on public.portfolio_experience_tags(experience_id);

-- =====================================================================================
-- ROW LEVEL SECURITY
-- =====================================================================================

-- Anonymous & Authenticated (non-admin): can only read published experiences
create policy "Allow public read of published experiences" on public.portfolio_experiences
  for select to anon, authenticated
  using (published = true);

-- Tags visibility follows their parent experience visibility
create policy "Allow public read of tags for published experiences" on public.portfolio_experience_tags
  for select to anon, authenticated
  using (exists (
    select 1 from public.portfolio_experiences
    where portfolio_experiences.id = portfolio_experience_tags.experience_id
    and portfolio_experiences.published = true
  ));

-- Admins: full access
create policy "Allow admins full access to experiences" on public.portfolio_experiences
  for all to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = auth.uid()));

create policy "Allow admins full access to experience tags" on public.portfolio_experience_tags
  for all to authenticated
  using (exists (select 1 from public.portfolio_admins where user_id = auth.uid()));

-- =====================================================================================
-- SAVE FUNCTION (Atomic Insert/Update)
-- =====================================================================================
create or replace function public.save_experience(exp_json jsonb, tags_json jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  is_admin boolean;
  exp_id uuid;
  tag_record jsonb;
begin
  select exists (select 1 from public.portfolio_admins where user_id = auth.uid()) into is_admin;
  if not is_admin then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  exp_id := (exp_json->>'id')::uuid;

  if exp_id is null then
    exp_id := gen_random_uuid();
  end if;

  insert into public.portfolio_experiences (
    id, organization, role, description, start_label, end_label, status, status_label,
    accent, custom_accent_color, is_current, sort_order, published
  ) values (
    exp_id,
    exp_json->>'organization',
    exp_json->>'role',
    exp_json->>'description',
    exp_json->>'start_label',
    nullif(exp_json->>'end_label', ''),
    exp_json->>'status',
    exp_json->>'status_label',
    exp_json->>'accent',
    nullif(exp_json->>'custom_accent_color', ''),
    (exp_json->>'is_current')::boolean,
    coalesce((exp_json->>'sort_order')::integer, 0),
    coalesce((exp_json->>'published')::boolean, true)
  )
  on conflict (id) do update set
    organization = excluded.organization,
    role = excluded.role,
    description = excluded.description,
    start_label = excluded.start_label,
    end_label = excluded.end_label,
    status = excluded.status,
    status_label = excluded.status_label,
    accent = excluded.accent,
    custom_accent_color = excluded.custom_accent_color,
    is_current = excluded.is_current,
    sort_order = excluded.sort_order,
    published = excluded.published,
    updated_at = now();

  -- Replace tags atomically
  delete from public.portfolio_experience_tags where experience_id = exp_id;

  if tags_json is not null and jsonb_typeof(tags_json) = 'array' then
    for tag_record in select * from jsonb_array_elements(tags_json) loop
      insert into public.portfolio_experience_tags (
        id, experience_id, label, sort_order
      ) values (
        coalesce((tag_record->>'id')::uuid, gen_random_uuid()),
        exp_id,
        tag_record->>'label',
        (tag_record->>'sort_order')::integer
      );
    end loop;
  end if;

  return exp_id;
end;
$$;

-- =====================================================================================
-- REORDER FUNCTION
-- =====================================================================================
create or replace function public.reorder_experiences(exp_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  is_admin boolean;
  i integer;
begin
  select exists (select 1 from public.portfolio_admins where user_id = auth.uid()) into is_admin;
  if not is_admin then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  for i in 1 .. array_length(exp_ids, 1) loop
    update public.portfolio_experiences
    set sort_order = i, updated_at = now()
    where id = exp_ids[i];
  end loop;
end;
$$;

-- =====================================================================================
-- SEED DATA
-- =====================================================================================
do $$
declare
  exp1_id uuid := '11111111-1111-4111-8111-111111111111';
  exp2_id uuid := '22222222-2222-4222-8222-222222222222';
  exp3_id uuid := '33333333-3333-4333-8333-333333333333';
begin
  insert into public.portfolio_experiences (id, organization, role, description, start_label, end_label, status, status_label, accent, is_current, sort_order, published)
  values
    (exp1_id, 'PT Semen Padang', 'IT Site Support / MBKM Internship', 'Industrial site IT support, infrastructure troubleshooting, computer vision prototyping, and internal administrative tools.', '2026', 'PRESENT', 'active', 'ACTIVE MISSION', 'primary', true, 0, true),
    (exp2_id, 'IEEE Student Branch Universitas Riau', 'Information & Creative Media Division', 'Digital systems, developer workshops, and visual communications for academic and research events.', '2026', 'PRESENT', 'inactive', 'DORMANT', 'secondary', true, 1, true),
    (exp3_id, 'Universitas Riau // UPA TIK', 'IT & Web Designer', 'System maintenance and web design for the university''s information technology department.', '2025', null, 'completed', 'COMPLETED', 'tertiary', false, 2, true);

  insert into public.portfolio_experience_tags (experience_id, label, sort_order)
  values
    (exp1_id, 'Infrastructure Support', 0),
    (exp1_id, 'IT Troubleshooting', 1),
    (exp1_id, 'Computer Vision', 2),
    (exp1_id, 'Internal Web Tools', 3),
    
    (exp2_id, 'Technical Workshops', 0),
    (exp2_id, 'Information Systems', 1),
    (exp2_id, 'Digital Media', 2),
    
    (exp3_id, 'Web Portal Operations', 0),
    (exp3_id, 'Information Logistics', 1),
    (exp3_id, 'Digital Resources', 2);
end;
$$;

commit;
