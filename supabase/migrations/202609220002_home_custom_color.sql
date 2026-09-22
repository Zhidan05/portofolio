-- HELSINKI: run once via Supabase migrations or the SQL editor.
begin;

-- Add custom_color column
alter table public.portfolio_home_headline_segments add column custom_color text null;

-- Update the check constraint to allow 'custom'
alter table public.portfolio_home_headline_segments drop constraint portfolio_home_headline_segments_accent_check;
alter table public.portfolio_home_headline_segments add constraint portfolio_home_headline_segments_accent_check check (accent in ('default', 'primary', 'secondary', 'tertiary', 'custom'));

-- Add validation for the custom color hex code
alter table public.portfolio_home_headline_segments add constraint portfolio_home_headline_segments_custom_color_check check (
    custom_color is null or (
        custom_color ~* '^#[0-9a-f]{3}$' or 
        custom_color ~* '^#[0-9a-f]{6}$'
    )
);

-- Recreate save_home to support custom_color
create or replace function public.save_home(content jsonb, expected_revision timestamptz) returns timestamptz
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
 insert into public.portfolio_home_headline_segments (id, line_number, text, accent, custom_color, sort_order)
 select (item->>'id')::uuid, (item->>'line_number')::integer, item->>'text', item->>'accent', item->>'custom_color', (ordinality - 1)::integer
 from jsonb_array_elements(content->'segments') with ordinality as items(item, ordinality)
 on conflict (id) do update set line_number = excluded.line_number, text = excluded.text, accent = excluded.accent, custom_color = excluded.custom_color, sort_order = excluded.sort_order;

 delete from public.portfolio_home_info where not exists (select 1 from jsonb_array_elements(content->'info_cards') item where (item->>'id')::uuid = portfolio_home_info.id);
 insert into public.portfolio_home_info (id, label, value, accent, sort_order)
 select (item->>'id')::uuid, item->>'label', item->>'value', item->>'accent', (ordinality - 1)::integer
 from jsonb_array_elements(content->'info_cards') with ordinality as items(item, ordinality)
 on conflict (id) do update set label = excluded.label, value = excluded.value, accent = excluded.accent, sort_order = excluded.sort_order;

 return next_revision;
end;
$$;

commit;
