# Helsinki

Zhidan's developer portfolio, built with Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS v4. **Helsinki** is the internal project codename; the portfolio owner's public identity remains **Zhidan**.

## Development

```sh
npm install
npm run dev
npm run lint
npm run build
npm start
```

Open http://localhost:3000. The public page is prerendered with server-fetched About content and a 60-second revalidation interval. Admin routes render dynamically with cookie-based authentication.

## Structure

- `app/page.tsx`: composes the eight portfolio sections.
- `app/layout.tsx`: metadata and locally hosted fonts.
- `app/globals.css`: Tailwind v4 theme tokens, shared components, responsive layouts, focus states, and reduced-motion support.
- `components/layout/`: navigation and footer.
- `components/sections/`: Hero, About, Projects, Experience, Skills, CurrentActivity, GithubActivity, and Contact.
- `components/ui/`: reusable headers, cards, badges, buttons, and the stateful contact form.
- `data/`: projects, experience, skills, learning activities, navigation, and contact destinations.
- `lib/contact.ts`: isolated submission adapter. It deliberately reports that no message was sent until a real backend is connected.
- `public/assets/`: locally hosted Stitch workspace illustration and Zhidan monogram.
- `app/fonts/`: Latin WOFF2 versions of Inter, Space Mono, and JetBrains Mono, with their SIL Open Font Licenses. The Inter and JetBrains files contain variable weights. Builds and page loads require no font CDN.

## Reference and design

`stitch-reference/` is preserved for visual comparison only. It is not imported, served, or loaded by the application. Tailwind source scanning is explicitly limited to application/components; TypeScript, ESLint, Next.js output tracing, and Vercel upload exclusions omit the reference directory. Deploy the normal Next.js build and `public/`, not the repository as a static file server.

The migration retains the 1200px layout, slate surfaces, emerald/cyan/violet accents, dot grid, square status lights, terminal labels, monospaced heading hierarchy, bordered project cards, timeline, HUD panels, workspace SVG, and contribution-matrix silhouette. The logo SVG comes from the local export rather than its temporary Google URL.

Changes to sample content are intentional: fabricated performance counters, experience points, skill percentages, fake commits, encryption claims, generic social links, and simulated delivery success are omitted. The contribution matrix is explicitly empty until real data is provided. The original reference's lower-page fade is not reproduced: all sections remain readable without JavaScript animation.

## Content TODOs

- Add verified project repository/demo URLs to `data/projects.ts`. Keep null destinations until available. The reference contains no actual project screenshots; cards therefore remain text-based.
- Add verified email, GitHub, LinkedIn, Instagram, and CV destinations to `data/profile.ts`.
- Review employment dates, organizations, roles, skill list, and current learning topics transcribed from the generated reference before publication.
- Connect GitHub activity to verified data if desired; never substitute random heatmap values or sample commits.
- Implement a server-side contact endpoint and update `lib/contact.ts`. Only show successful delivery after backend confirmation; keep provider secrets on the server. No provider has been installed.

## PROJECT MANAGEMENT

The Projects section is powered dynamically by Supabase.

1. **Migration**: Run the `supabase/migrations/202609210002_projects.sql` migration in the Supabase SQL Editor. This sets up the `portfolio_projects` and `portfolio_project_technologies` tables, RLS policies, seeds initial data, and creates the `portfolio-projects` Storage bucket.
2. **Access**: Only users listed in the `portfolio_admins` table have CRUD permissions. They can manage projects at `/admin/projects`.
3. **Features**:
   - Create, edit, delete, and reorder projects.
   - Manage project status (`draft`, `published`, `archived`) and featured status. Only `published` and `featured` projects appear on the public homepage.
   - Attach repository and demo URLs.
   - Upload cover images (stored in the `portfolio-projects` public bucket).
4. **Caching**: Public project data is cached with the `portfolio-projects` tag. Admin actions trigger `updateTag` to instantly invalidate the cache and serve fresh data.

## Validation

See `VALIDATION.md` for the implementation audit and verified checks. Supabase Auth and PostgreSQL power the admin editor. Run `npm run test:database` for local migration, RLS, CRUD, conflict, and rollback checks (PGlite; no credentials required).


## Supabase admin setup

The installed `@supabase/supabase-js` and `@supabase/ssr` packages and existing `.env.local` are used directly. The only required variables are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `.env.local` is ignored; `.env.example` contains names only. Never put service-role or secret keys in public variables.

1. In the existing Supabase project's **SQL Editor**, paste and run the entire `supabase/migrations/202609210001_about_admin.sql` file once. It creates the five tables, RLS policies, atomic read/save functions, and the original About seed. Do not rerun the initial migration against an already-created schema; use subsequent migrations for future changes.
2. In **Authentication → Sign In / Providers**, disable **Allow new users to sign up** and anonymous sign-ins. There is no signup UI in HELSINKI; disable the Auth signup API too.
3. Open **Authentication → Users → Add user → Create new user**. Manually create and confirm your admin account. Copy its UUID.
4. In SQL Editor, authorize that UUID:

   ```sql
   insert into public.portfolio_admins (user_id)
   values ('SUPABASE_AUTH_USER_UUID');
   ```

5. Run `npm run dev`, open `/login`, and sign in. `/admin` reports actual database connectivity; `/admin/about` edits all profile fields and ordered lists. **SAVE & PUBLISH** commits the entire record atomically.

The current workspace has no linked Supabase CLI project or privileged database connection. The migration has **not** been applied remotely by this implementation. A read-only check on September 21, 2026 found the five tables and `read_about` absent from the exposed API, and public sign-up enabled. Apply the migration and disable sign-up before testing a live admin account. The public site retains the original About copy during setup or database outages.

To revoke write access, delete the user's row from `portfolio_admins` in SQL Editor. Account/password management remains in the Supabase dashboard.

### SSR, security, and caching

- Next.js **16.3.5 App Router** uses `proxy.ts`, not the deprecated middleware file convention. `lib/supabase/client.ts` uses `createBrowserClient`; `server.ts` creates a new `createServerClient` per server request using asynchronous `cookies()` with `getAll`/`setAll`.
- Proxy matches `/login` and `/admin/*`, verifies claims, refreshes tokens, and copies cookie changes to both the incoming request and outgoing response. Cookie-writing/authenticated responses are private and uncached. Public portfolio responses never receive auth cookies.
- Admin layouts/pages and every editor server action independently validate the user with `getUser()` and check `portfolio_admins`. Client guards provide responsive feedback; they are not the security boundary. RLS independently enforces membership for writes. There is no email allowlist, user-metadata authorization, embedded password, or privileged API key.
- The allowlist permits users to select only their own row and grants no membership mutation privileges. All four content tables allow public SELECT; only allowlisted users may INSERT/UPDATE, and only lists allow DELETE. `save_about` runs with invoker rights and checks a revision to prevent lost concurrent edits.
- About is a Server Component. Its server-only public data client is always anonymous, never reads cookies, and caches only the content read with the `portfolio-about` tag and a 60-second revalidation interval. No Supabase client or polling hook is shipped for public About.
- The save server action calls `updateTag` and `revalidatePath('/')`. The next homepage request gets saved content without deployment; already-open pages show it on refresh/navigation. There is no background polling. Direct database edits are picked up through the 60-second revalidation cycle.
- Public fetch failures, empty records, or missing configuration display the original published content without exposing database errors. Admin fetch failures block the editor and allow retry. Text remains escaped; field/list validation runs both in the server action and database.
- Logout uses Supabase `signOut({ scope: 'local' })`, clears the current session cookies, and returns to `/login`. Other devices are unaffected. Existing issued access tokens can survive until expiry; remove allowlist membership to revoke database write access.

This follows the [Supabase Next.js SSR guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs).

### Vercel

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the appropriate **Preview** and **Production** environments. Keep using the Next.js framework preset and a supported Node.js version (22 or newer; local checks used Node 24). Redeploy after changing public variables, which are embedded during the build. Set the deployed site's URL in Supabase Auth settings. No localhost origin is hardcoded into application code.

### Validation

Run `npm run lint`, `npm run build`, `npm run test:database`, and `npm run test:validation`. The database test runs the real migration in PGlite with a minimal Auth schema fixture, exercising RLS, admin CRUD/order, revision conflicts, and rollback without remote credentials.

See `ADMIN_IMPLEMENTATION.md` for the file inventory, verified results, and the distinction between local SSR fixture tests and live Supabase checks. After migration/bootstrap, verify login, browser refresh, logout, expired sessions, non-admin denial, list CRUD/order, and public updates against the hosted project.
