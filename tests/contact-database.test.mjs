import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');`);
await db.exec(readFileSync("supabase/migrations/202609210001_about_admin.sql", "utf8"));
await db.exec(readFileSync("supabase/migrations/202609240001_contact.sql", "utf8"));
await db.exec("insert into public.portfolio_admins(user_id) values ('11111111-1111-4111-8111-111111111111')");

async function role(name, user = "") { await db.exec(`reset role; set role ${name}; select set_config('request.jwt.claim.sub', '${user}', false);`); }
async function denied(sql, params = []) { await assert.rejects(db.query(sql, params)); }

await role("anon");
assert.equal((await db.query("select count(*)::int as count from public.portfolio_contact")).rows[0].count, 1);
assert.equal((await db.query("select count(*)::int as count from public.portfolio_contact_channels")).rows[0].count, 4);
assert.equal((await db.query("select count(*)::int as count from public.portfolio_contact_subjects")).rows[0].count, 4);
await denied("select * from public.portfolio_contact_messages");
await denied("insert into public.portfolio_contact_messages(sender_name,sender_email,subject_value,message) values ('Mallory','mallory@example.com','project','This direct insert must fail')");
assert.equal((await db.query("select public.submit_contact_message($1,$2,$3,$4) as submitted", ["Ada Lovelace", "ada@example.com", "project", "This controlled submission should succeed."])).rows[0].submitted, true);
await denied("select public.submit_contact_message($1,$2,$3,$4)", ["A", "invalid", "project", "short"]);

await db.exec("reset role; update public.portfolio_contact_channels set status = 'hidden' where type = 'instagram'; update public.portfolio_contact_subjects set enabled = false where value = 'research';");
await role("anon");
assert.equal((await db.query("select count(*)::int as count from public.portfolio_contact_channels")).rows[0].count, 3);
assert.equal((await db.query("select count(*)::int as count from public.portfolio_contact_subjects")).rows[0].count, 3);
await denied("select public.submit_contact_message($1,$2,$3,$4)", ["Grace Hopper", "grace@example.com", "research", "This subject has been disabled."]);

await role("authenticated", "22222222-2222-4222-8222-222222222222");
assert.equal((await db.query("select * from public.portfolio_contact_messages")).rows.length, 0);
await db.exec("update public.portfolio_contact set heading = 'HACKED'");
assert.equal((await db.query("select heading from public.portfolio_contact")).rows[0].heading, "LET'S BUILD SOMETHING USEFUL");

await role("authenticated", "11111111-1111-4111-8111-111111111111");
const messages = await db.query("select * from public.portfolio_contact_messages");
assert.equal(messages.rows.length, 1);
const messageId = messages.rows[0].id;
await db.query("update public.portfolio_contact_messages set status = 'read', read_at = now() where id = $1", [messageId]);
assert.equal((await db.query("select status from public.portfolio_contact_messages where id = $1", [messageId])).rows[0].status, "read");
await denied("update public.portfolio_contact_messages set message = 'rewritten' where id = $1", [messageId]);
await denied("delete from public.portfolio_contact_messages where id = $1", [messageId]);
await db.query("update public.portfolio_contact_messages set status = 'archived', archived_at = now() where id = $1", [messageId]);
await db.exec("update public.portfolio_contact set heading = 'Updated Contact';");
assert.equal((await db.query("select heading from public.portfolio_contact")).rows[0].heading, "Updated Contact");
await db.exec("insert into public.portfolio_contact_channels(id,contact_id,type,label,value,url,status,sort_order) values ('30000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000007','website','TEMP CHANNEL','Example','https://example.com','active',9)");
await db.query("select public.reorder_contact_channels($1::uuid[])", [["30000000-0000-4000-8000-000000000001", "10000000-0000-4000-8000-000000000001"]]);
await db.exec("delete from public.portfolio_contact_channels where id = '30000000-0000-4000-8000-000000000001'");
await db.exec("insert into public.portfolio_contact_subjects(contact_id,value,label,enabled,sort_order) values ('00000000-0000-4000-8000-000000000007','collaboration','Collaboration',true,9)");
await db.query("select public.reorder_contact_subjects($1::uuid[])", [["20000000-0000-4000-8000-000000000004", "20000000-0000-4000-8000-000000000001"]]);

await role("anon");
const xssMessage = '<script>alert("x")</script> remains plain text';
assert.equal((await db.query("select public.submit_contact_message($1,$2,$3,$4) as submitted", ["Plain Text", "plain@example.com", "project", xssMessage])).rows[0].submitted, true);
for (let index = 0; index < 3; index += 1) {
  await db.query("select public.submit_contact_message($1,$2,$3,$4)", ["Rate Test", "limit@example.com", "project", `Legitimate message number ${index + 1}.`]);
}
await denied("select public.submit_contact_message($1,$2,$3,$4)", ["Rate Test", "limit@example.com", "project", "The fourth message must be throttled."]);
await db.exec("reset role");
const stored = (await db.query("select message from public.portfolio_contact_messages where id = $1", [messageId])).rows[0].message;
assert.equal(stored, "This controlled submission should succeed.");
assert.equal((await db.query("select message from public.portfolio_contact_messages where sender_email = 'plain@example.com'")).rows[0].message, xssMessage);
console.log("PASS: Contact migration, public filtering, controlled submission, inbox privacy, admin content/status management.");
await db.close();
