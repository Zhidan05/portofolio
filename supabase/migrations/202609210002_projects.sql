-- HELSINKI: Projects Migration
begin;

-- Create portfolio_projects table
create table public.portfolio_projects (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null check (length(btrim(slug)) > 0),
    title text not null check (length(btrim(title)) > 0),
    category text not null check (length(btrim(category)) > 0),
    short_description text not null check (length(btrim(short_description)) > 0),
    descriptor text,
    cover_image_url text,
    repository_url text,
    demo_url text,
    status text not null default 'published' check (status in ('draft', 'published', 'archived')),
    featured boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Trigger to update updated_at on portfolio_projects
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_portfolio_projects_updated_at
  before update on public.portfolio_projects
  for each row
  execute function public.set_current_timestamp_updated_at();

-- Create portfolio_project_technologies table
create table public.portfolio_project_technologies (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.portfolio_projects(id) on delete cascade,
    label text not null check (length(btrim(label)) > 0),
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

-- RLS for portfolio_projects
alter table public.portfolio_projects enable row level security;
revoke all on public.portfolio_projects from anon, authenticated;
grant select on public.portfolio_projects to anon, authenticated;
grant insert, update, delete on public.portfolio_projects to authenticated;

-- Read policy: Anyone can read published projects. Admins can read all.
create policy projects_read_anon on public.portfolio_projects for select to anon
using (status = 'published');

create policy projects_read_auth on public.portfolio_projects for select to authenticated
using (
    status = 'published'
    or exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
);

create policy admin_insert_project on public.portfolio_projects for insert to authenticated
with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

create policy admin_update_project on public.portfolio_projects for update to authenticated
using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())))
with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

create policy admin_delete_project on public.portfolio_projects for delete to authenticated
using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));


-- RLS for portfolio_project_technologies
alter table public.portfolio_project_technologies enable row level security;
revoke all on public.portfolio_project_technologies from anon, authenticated;
grant select on public.portfolio_project_technologies to anon, authenticated;
grant insert, update, delete on public.portfolio_project_technologies to authenticated;

-- Read policy: Anyone can read if the parent project is readable (which means it's published or user is admin).
create policy technologies_read_anon on public.portfolio_project_technologies for select to anon
using (
    exists (
        select 1 from public.portfolio_projects pp
        where pp.id = portfolio_project_technologies.project_id
        and pp.status = 'published'
    )
);

create policy technologies_read_auth on public.portfolio_project_technologies for select to authenticated
using (
    exists (
        select 1 from public.portfolio_projects pp
        where pp.id = portfolio_project_technologies.project_id
        and (
            pp.status = 'published'
            or exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
        )
    )
);

create policy admin_insert_technology on public.portfolio_project_technologies for insert to authenticated
with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

create policy admin_update_technology on public.portfolio_project_technologies for update to authenticated
using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())))
with check (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));

create policy admin_delete_technology on public.portfolio_project_technologies for delete to authenticated
using (exists (select 1 from public.portfolio_admins where user_id = (select auth.uid())));


-- Set up Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-projects', 
  'portfolio-projects', 
  true, 
  5242880, -- 5MB
  '{image/jpeg,image/png,image/webp,image/avif}'
) on conflict (id) do update set 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = '{image/jpeg,image/png,image/webp,image/avif}';

-- Storage RLS policies
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'portfolio-projects' );

create policy "Admin Insert"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'portfolio-projects'
    and exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
);

create policy "Admin Update"
on storage.objects for update
to authenticated
using (
    bucket_id = 'portfolio-projects'
    and exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
);

create policy "Admin Delete"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'portfolio-projects'
    and exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
);


-- Seed data for projects
do $$
declare
  pid1 uuid := 'e8c1f9c0-6b6a-4f4c-9f8a-1a2b3c4d5e60';
  pid2 uuid := 'c7b2e8d1-5a59-3e3b-8e79-0a1b2c3d4e5f';
  pid3 uuid := 'd6a1f7c2-4948-2d2a-7d68-9f0a1b2c3d4e';
  pid4 uuid := 'f9d2e8b3-3837-1c19-6c57-8e9f0a1b2c3d';
begin
  -- Only insert if empty to prevent re-seeding if re-run
  if not exists (select 1 from public.portfolio_projects) then
      insert into public.portfolio_projects (id, slug, title, category, short_description, descriptor, status, featured, sort_order) values
      (pid1, 'ppe-compliance-detection', 'PPE Compliance Detection', 'Computer Vision / AI', 'Real-time computer vision for detecting incomplete personal protective equipment. A practical safety-monitoring pipeline with Telegram integration.', 'DETECTION_PIPELINE // PERSONAL PROTECTIVE EQUIPMENT', 'published', true, 0),
      (pid2, 'employee-attendance-face-recognition', 'Employee Attendance — Face Recognition', 'Computer Vision / Web', 'An employee attendance system using face identification and recognition, connecting computer vision with a web-based attendance workflow.', 'FACE_IDENTIFICATION // ATTENDANCE WORKFLOW', 'published', true, 1),
      (pid3, 'simba-sistem-informasi-magang-berbasis-aplikasi', 'SIMBA — Sistem Informasi Magang Berbasis Aplikasi', 'Full Stack Web', 'A full-stack internship management system that brings internship administration and its supporting workflows into one web application.', 'INTERNSHIP_MANAGEMENT // FULL-STACK APPLICATION', 'published', true, 2),
      (pid4, 'innoelectrica-expo-2026', 'InnoElectrica Expo 2026', 'Modern Event Platform', 'An interactive event website and platform, bringing event information to life through a modern interface and considered motion.', 'EVENT_PLATFORM // INTERACTIVE EXPERIENCES', 'published', true, 3);

      -- Project 1 tech
      insert into public.portfolio_project_technologies (project_id, label, sort_order) values
      (pid1, 'Python', 0), (pid1, 'Ultralytics YOLO', 1), (pid1, 'OpenCV', 2), (pid1, 'Telegram', 3);

      -- Project 2 tech
      insert into public.portfolio_project_technologies (project_id, label, sort_order) values
      (pid2, 'InsightFace', 0), (pid2, 'ArcFace', 1), (pid2, 'Python', 2), (pid2, 'Web technologies', 3);

      -- Project 3 tech
      insert into public.portfolio_project_technologies (project_id, label, sort_order) values
      (pid3, 'Laravel', 0), (pid3, 'MySQL', 1), (pid3, 'Bootstrap', 2), (pid3, 'JavaScript', 3);

      -- Project 4 tech
      insert into public.portfolio_project_technologies (project_id, label, sort_order) values
      (pid4, 'Next.js', 0), (pid4, 'Tailwind CSS', 1), (pid4, 'Framer Motion', 2);
  end if;
end $$;

commit;
