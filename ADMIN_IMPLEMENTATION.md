# HELSINKI admin / Supabase SSR implementation

## Framework and architecture

Detected **Next.js 16.3.5**, React 19, TypeScript, and the root `app/` App Router. Existing styles, public sections, database migration, seeds, and ordered-list editor are retained. Installed Supabase packages are used without reinstalling; their installed versions are pinned in the package/lock files.

- Browser: `createBrowserClient` from `@supabase/ssr`, cookie-based session persistence.
- Server: request-local `createServerClient` with async Next.js `cookies()` and `getAll`/`setAll`.
- Request refresh: Next.js 16 `proxy.ts`, matching `/login` and `/admin/*`. Uses verified claims and copies refreshed cookies into the request and response; private cache headers follow refresh/redirect responses.
- Server authorization: `getUser()` plus an RLS-protected `portfolio_admins` lookup, deduplicated only within a server render. Admin layouts, pages, and server actions check access. The client guard additionally handles live session changes.
- Public About: Server Component with a separate, server-only anonymous client. Tagged data caching uses a 60-second revalidation interval. Saving invokes `updateTag` and `revalidatePath('/')`; the next homepage request receives new content. Already-open pages update on navigation/refresh. No public auth session or personalized response is cached.
- Errors: generic public fallback to original content; explicit admin retry/access-denied states; server action result objects avoid exposing database diagnostics. Invalid input is checked on the server and constrained by PostgreSQL.

## Files created during the SSR continuation

- `proxy.ts`
- `lib/supabase/client.ts`, `server.ts`, `config.ts`, `proxy.ts`, `database.types.ts`
- `lib/admin.ts`, `lib/about-cache.ts`, `lib/aboutValidation.ts`
- `services/publicAboutService.ts`
- `components/admin/AboutEditor.tsx`, `LoginForm.tsx`, `AccessDenied.tsx`
- `app/(control)/admin/about/actions.ts`
- `app/(control)/admin/loading.tsx`, `error.tsx`
- `tests/about-validation.test.mjs`

## Files modified during the SSR continuation

- `components/sections/About.tsx`: server fetching; same public markup/design.
- `components/admin/AuthProvider.tsx`, `AdminShell.tsx`: SSR browser client and cookie-aware navigation/logout.
- `services/authService.ts`, `aboutService.ts`: explicit browser auth and protected server action adapters.
- `app/(control)/login/page.tsx`, `admin/layout.tsx`, `admin/page.tsx`, `admin/about/page.tsx`: server entry points/authorization and actual connectivity status.
- `app/(control)/control.css`: dashboard status styling.
- `.env.example`: requested publishable-key variable name.
- `package.json`, `package-lock.json`: pin installed Supabase versions; add validation test command.
- `README.md`, `ADMIN_IMPLEMENTATION.md`: current setup, SSR, caching, and verification documentation.

Removed obsolete `lib/supabase.ts` and `hooks/useAbout.ts`; the new explicit clients and server-rendered About replace them. `.env.local`, installed skills, Hero, Projects, Experience, Skills, Current Activity, Contact, Navbar, Footer, and global public styles were not edited in this continuation.

The earlier implementation's `data/about.ts`, `lib/about.ts`, control layout/CSS, auth provider/shell, initial migration, `.env.example`, and database test remain part of the complete feature.

## Migration, tables, and policies

The existing `supabase/migrations/202609210001_about_admin.sql` is retained unchanged; no duplicate migration or new seed biography was created. It defines:

- `portfolio_admins`: Auth user UUID foreign key and creation timestamp.
- `about_profile`: singleton profile, biography, highlight, record/header labels, directive, revision timestamp.
- `about_interests`, `about_tools`, `about_focus`: stable UUIDs, labels, explicit order, timestamps; focus also has a code.

All five tables enable RLS and explicitly grant only intended access. `portfolio_admins.admins_read_own` allows users to read their own membership, with no client INSERT/UPDATE/DELETE privileges. Content `public_read` policies allow public SELECT. `admin_insert` and `admin_update` require an allowlisted `auth.uid()`; list `admin_delete` policies use the same membership check. Singleton profile deletion is not granted.

`read_about` returns one consistent snapshot. `save_about` uses **security invoker**, preserves RLS, serializes concurrent saves, rejects stale revisions, validates list/field constraints, and atomically commits profile/list CRUD or rolls back. Seed content reproduces the original public About component.

## Routes and auth flow

`/login`, `/admin`, and `/admin/about` are retained and upgraded. Sign-in uses `auth.signInWithPassword`; cookies carry the session across browser/server requests. Proxy refreshes tokens, server guards validate user and admin membership, and RLS independently enforces writes. Logout calls `auth.signOut({ scope: 'local' })`, clears current-session cookies, and navigates to `/login`. No registration page, default password, email-based admin rule, service-role key, or auth-helper dependency is present.

## First admin / manual Supabase steps

The existing `.env.local` is used as-is. Run the full migration file once in the existing project's SQL Editor. Disable public sign-up and anonymous sign-ins in Auth settings. Then manually create/confirm a user under **Authentication → Users**, copy its UUID, and run:

```sql
insert into public.portfolio_admins (user_id)
values ('SUPABASE_AUTH_USER_UUID');
```

Open `/login` with that account. No credentials or actual admin UUID are committed.

**Verified live, read-only:** the configured project is reachable; its Auth settings endpoint reports public sign-up enabled. The exposed Data API returns `PGRST205` for each expected table and `PGRST202` for `read_about`. This indicates that the required schema/functions are not available through the API. A privileged inspection was not available, so no claim is made about hidden database objects.

**Not performed:** remote migration application, remote admin bootstrap, Auth settings changes, live admin CRUD, remote advisor checks, or Vercel deployment. There is no linked CLI project, callable Supabase MCP, or privileged database connection in this workspace. Public keys cannot apply SQL migrations. See README for the exact SQL Editor procedure.

## Vercel

Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Preview/Production as needed, use the Next.js preset with Node.js 22 or newer, and redeploy after variable changes. Configure the deployed site URL in Supabase Auth settings. Application code does not hardcode localhost URLs. The SSR proxy's private response headers prevent authenticated responses/cookies from being shared through a CDN.

## Verification

- `npm run lint`: passed without warnings.
- `npm run build`: passed. Homepage is prerendered with 1-minute revalidation; `/login`, `/admin`, `/admin/about` render dynamically; Proxy is included.
- `npm run test:database`: passed against PGlite PostgreSQL, covering migration/seed, public SELECT, anonymous/non-admin write denial, self-promotion denial, admin CRUD/order, revision conflict, rollback, and revoked admin denial.
- `npm run test:validation`: passed: malformed input, required/optional fields, lengths, UUIDs, duplicate IDs, focus codes, list limits, and revisions. Node emits only its informational module-type detection warning for the direct TypeScript test imports.
- Headless Chromium against a **production Next.js build with a local Supabase fixture**: passed public About HTML with JavaScript disabled, server redirects while logged out, cookie persistence across refresh, server token refresh and response Set-Cookie, private/no-store headers, expired-token rejection, non-admin denial, blocked direct non-admin server-action replay, dashboard connectivity, editor profile/bio/directive edits, all list CRUD/reorder controls, failed-save retry, logout/cookie removal, and immediate fresh anonymous HTML after save/cache invalidation.
- Editor and login widths: 375, 430, 768, 1024, and 1440 px; no horizontal overflow. Mobile editor screenshot visually inspected. Public markup and theme are preserved.
- `.env.local` is Git-ignored. No environment values were printed or changed. Runtime code uses only the requested public variables.

Local browser fixtures/screenshots reside under ignored `.helsinki-checks/`; database and validation tests are checked in. Fixture tests exercise the actual SSR SDK, Next.js proxy/guards/actions, and production caching, but do not substitute for hosted Supabase Auth tests after the manual setup steps.

## Remaining TODOs

Apply/expose the migration, disable hosted sign-up, bootstrap your admin, verify hosted login/session/CRUD/RLS behavior, and configure/redeploy Vercel. Other content modules remain intentionally unimplemented. No additional local Supabase installation or environment-file recreation is needed.
