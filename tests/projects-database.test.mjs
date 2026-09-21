import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');
create schema storage;
create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id));
`);

await db.exec(readFileSync('supabase/migrations/202609210001_about_admin.sql','utf8'));
await db.exec(readFileSync('supabase/migrations/202609210002_projects.sql','utf8'));

await db.exec(`insert into public.portfolio_admins(user_id) values ('11111111-1111-4111-8111-111111111111');`);

async function role(name, user='') { await db.exec(`reset role; set role ${name}; select set_config('request.jwt.claim.sub', '${user}', false);`); }
async function denied(sql, params=[]) { await assert.rejects(db.query(sql, params)); }

// Test anon
await role('anon');
const publicProjects = (await db.query(`select * from public.portfolio_projects`)).rows;
assert.equal(publicProjects.length, 4); // Seeds are published
assert.ok(publicProjects.every(p => p.status === 'published'));

await denied("insert into public.portfolio_projects (slug, title, category, short_description, status) values ('test', 'Test', 'Cat', 'Desc', 'published')");

// Test authenticated non-admin
await role('authenticated', '22222222-2222-4222-8222-222222222222');
await denied("insert into public.portfolio_projects (slug, title, category, short_description, status) values ('test', 'Test', 'Cat', 'Desc', 'published')");
await db.exec("update public.portfolio_projects set title='Hacked'");
// Because RLS silently ignores updates if not authorized, we check that it didn't change:
const nonAdminProjects = (await db.query(`select * from public.portfolio_projects`)).rows;
assert.notEqual(nonAdminProjects[0].title, 'Hacked');

// Test admin
await role('authenticated', '11111111-1111-4111-8111-111111111111');
await db.query("insert into public.portfolio_projects (slug, title, category, short_description, status) values ('test-draft', 'Draft', 'Cat', 'Desc', 'draft')");
const allProjects = (await db.query(`select * from public.portfolio_projects`)).rows;
assert.equal(allProjects.length, 5);

await role('anon');
const publicProjectsAfter = (await db.query(`select * from public.portfolio_projects`)).rows;
assert.equal(publicProjectsAfter.length, 4); // Draft is not visible

console.log('PASS: Projects RLS - anonymous read published, anonymous/non-admin write denial, admin write/read draft.');
await db.close();
