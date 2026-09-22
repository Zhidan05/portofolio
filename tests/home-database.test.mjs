import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();

await db.exec(`create role anon; create role authenticated; create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');`);

// We need the admins table from the about migration, then the home migration
await db.exec(readFileSync('supabase/migrations/202609210001_about_admin.sql','utf8'));
await db.exec(readFileSync('supabase/migrations/202609220001_home_admin.sql','utf8'));
await db.exec(readFileSync('supabase/migrations/202609220002_home_custom_color.sql','utf8'));

await db.exec(`insert into public.portfolio_admins(user_id) values ('11111111-1111-4111-8111-111111111111');`);

async function role(name, user='') { await db.exec(`reset role; set role ${name}; select set_config('request.jwt.claim.sub', '${user}', false);`); }
async function read() { return (await db.query('select public.read_home() as data')).rows[0].data; }
async function denied(sql, params=[]) { await assert.rejects(db.query(sql, params)); }

// PUBLIC (anon)
await role('anon');
const seed = await read();
assert.equal(seed.profile.greeting, '> HELLO WORLD');
assert.equal(seed.segments.length, 7);
assert.equal(seed.info_cards.length, 3);

// Write denial
await denied("update public.portfolio_home set greeting = 'Hacked'");
await denied("insert into public.portfolio_home_info(label,value,sort_order) values ('Hacked','Hacked',0)");
await denied('delete from public.portfolio_home_headline_segments');
await denied('select public.save_home($1::jsonb,$2::timestamptz)',[JSON.stringify(seed), seed.revision]);

// NON-ADMIN (authenticated but not in portfolio_admins)
await role('authenticated','22222222-2222-4222-8222-222222222222');
await denied("insert into public.portfolio_home_info(label,value,sort_order) values ('Hacked','Hacked',0)");
await db.exec("update public.portfolio_home set greeting='Hacked'; delete from public.portfolio_home_info;");
assert.equal((await read()).profile.greeting, '> HELLO WORLD'); // RLS silently ignored update
assert.equal((await read()).info_cards.length, 3); // RLS silently ignored delete
await denied('select public.save_home($1::jsonb,$2::timestamptz)',[JSON.stringify(seed), seed.revision]);

// ADMIN
await role('authenticated','11111111-1111-4111-8111-111111111111');
const edited = structuredClone(seed);
edited.profile.greeting = 'Updated Greeting';
edited.profile.cv_enabled = true;
edited.segments.shift(); // remove first
edited.segments.reverse(); // reorder
edited.segments.push({id:crypto.randomUUID(), line_number: 2, text: 'New segment', accent: 'secondary', sort_order: 99});
edited.segments.push({id:crypto.randomUUID(), line_number: 3, text: 'Custom Color', accent: 'custom', custom_color: '#F00', sort_order: 100});
edited.info_cards.shift();
edited.info_cards.push({id:crypto.randomUUID(), label: 'New Card', value: 'New Value', accent: 'primary', sort_order: 99});

// ATOMICITY / CONCURRENCY (simulate success)
await db.query('select public.save_home($1::jsonb,$2::timestamptz)', [JSON.stringify(edited), seed.revision]);
const saved = await read();
assert.equal(saved.profile.greeting, 'Updated Greeting');
assert.equal(saved.profile.cv_enabled, true);
assert.equal(saved.segments.length, edited.segments.length);
assert.equal(saved.info_cards.length, edited.info_cards.length);

// CONCURRENCY (stale revision denial)
await denied('select public.save_home($1::jsonb,$2::timestamptz)',[JSON.stringify(seed), seed.revision]);

// ATOMICITY (rollback on invalid child)
const invalid = structuredClone(saved);
invalid.profile.greeting = 'Must roll back';
invalid.info_cards[0].label = ''; // violates check constraint
await denied('select public.save_home($1::jsonb,$2::timestamptz)',[JSON.stringify(invalid), saved.revision]);
assert.equal((await read()).profile.greeting, 'Updated Greeting'); // Still old value

const invalidColor = structuredClone(saved);
invalidColor.segments.push({id:crypto.randomUUID(), line_number: 3, text: 'Invalid Color', accent: 'custom', custom_color: 'red', sort_order: 101});
await denied('select public.save_home($1::jsonb,$2::timestamptz)',[JSON.stringify(invalidColor), saved.revision]);

// ADMIN revoked
await db.exec('reset role; delete from public.portfolio_admins;');
await role('authenticated','11111111-1111-4111-8111-111111111111');
await denied('select public.save_home($1::jsonb,$2::timestamptz)',[JSON.stringify(saved), saved.revision]);

console.log('PASS: Home migration/seed, anonymous reads, non-admin write denial, admin CRUD, conflict detection, rollback.');
await db.close();
