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

Open http://localhost:3000. The page is statically rendered; only navigation and the contact form need client-side React.

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

## Validation

See `VALIDATION.md` for the implementation audit and verified checks. No runtime or development dependencies were added or removed.
