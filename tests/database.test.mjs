import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');`);
await db.exec(readFileSync('supabase/migrations/202609210001_about_admin.sql','utf8'));
await db.exec(`insert into public.portfolio_admins(user_id) values ('11111111-1111-4111-8111-111111111111');`);
async function role(name, user='') { await db.exec(`reset role; set role ${name}; select set_config('request.jwt.claim.sub', '${user}', false);`); }
async function read() { return (await db.query('select public.read_about() as data')).rows[0].data; }
async function denied(sql, params=[]) { await assert.rejects(db.query(sql, params)); }
await role('anon');
const seed=await read(); assert.equal(seed.profile.name,'Zhidan'); assert.equal(seed.focus.length,4);
await denied("update public.about_profile set name = 'Hacked'");
await denied("insert into public.about_tools(label,sort_order) values ('Hacked',0)");
await denied('delete from public.about_focus');
await denied('select public.save_about($1::jsonb,$2::timestamptz)',[JSON.stringify(seed),seed.revision]);
await role('authenticated','22222222-2222-4222-8222-222222222222');
assert.equal((await db.query('select * from public.portfolio_admins')).rows.length,0);
await denied("insert into public.portfolio_admins(user_id) values (auth.uid())");
await denied("insert into public.about_tools(label,sort_order) values ('Hacked',0)");
await db.exec("update public.about_profile set name='Hacked'; delete from public.about_tools;");
assert.equal((await read()).profile.name,'Zhidan'); assert.equal((await read()).tools.length,5);
await denied('select public.save_about($1::jsonb,$2::timestamptz)',[JSON.stringify(seed),seed.revision]);
await role('authenticated','11111111-1111-4111-8111-111111111111');
assert.equal((await db.query('select * from public.portfolio_admins')).rows.length,1);
const edited=structuredClone(seed); edited.profile.name='Updated'; edited.profile.bio_paragraph_1='Updated bio'; edited.profile.directive='Updated directive';
for(const key of ['interests','tools','focus']) {
 edited[key].shift(); edited[key].reverse(); edited[key][0].label='Edited '+key;
 edited[key].push({id:crypto.randomUUID(),label:'New '+key,code:'NEW',sort_order:99});
}
await db.query('select public.save_about($1::jsonb,$2::timestamptz)', [JSON.stringify(edited),seed.revision]);
const saved=await read(); assert.equal(saved.profile.name,'Updated'); assert.equal(saved.profile.directive,'Updated directive');
for(const key of ['interests','tools','focus']) { assert.deepEqual(saved[key].map(i=>i.id),edited[key].map(i=>i.id)); assert.deepEqual(saved[key].map(i=>i.sort_order),saved[key].map((_,i)=>i)); }
await denied('select public.save_about($1::jsonb,$2::timestamptz)',[JSON.stringify(seed),seed.revision]);
const invalid=structuredClone(saved); invalid.profile.name='Must roll back'; invalid.focus[0].label='';
await denied('select public.save_about($1::jsonb,$2::timestamptz)',[JSON.stringify(invalid),saved.revision]);
assert.equal((await read()).profile.name,'Updated');
await role('anon'); assert.equal((await read()).profile.name,'Updated');
await db.exec('reset role; delete from public.portfolio_admins;');
await role('authenticated','11111111-1111-4111-8111-111111111111');
await denied('select public.save_about($1::jsonb,$2::timestamptz)',[JSON.stringify(saved),saved.revision]);
console.log('PASS: migration/seed, anonymous reads, anonymous and non-admin write denial, no self-promotion, authorized CRUD/order, conflict detection, atomic rollback, public saved reads, revoked admin denial.');
await db.close();
