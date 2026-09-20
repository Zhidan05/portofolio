# Helsinki migration validation

## Initial audit

- Existing application: unmodified Next.js 16.3.5 App Router starter, React 19.2.8, TypeScript, Tailwind v4 through `@tailwindcss/postcss`. No Vite, `src/`, nested routes, existing feature components, contact backend, or animation library.
- Existing public assets: Next.js starter SVGs and favicon. Existing styling: starter light/dark global theme and responsive starter page.
- Reference: portfolio `code.html` and `screen.png`, monogram SVG inside `code.html`, monogram screenshot, and Terminal Protocol `DESIGN.md`.
- Design: 1200px max-width, desktop 7/5 and 5/7 column layouts, 24px gutters, 64px section spacing; Space Mono headings, Inter prose, JetBrains Mono labels; slate #0d141d / #080f17 / #151c25; green #4edea3, cyan #4cd7f6, violet #d0bcff.
- Assets: workspace illustration migrated to a standalone local SVG; local monogram used in place of the temporary Google image. No project photography was supplied.

## Checks performed

- `npm run lint`: PASS, no warnings or errors.
- `npm run build`: PASS, production route `/` statically prerendered; TypeScript passes.
- Production server tested with headless Chrome and Playwright at 375, 430, 768, 1024, and 1440px.
- All five widths: document scroll width equals viewport width; no elements extending beyond the right viewport edge; eight sections present; all images loaded.
- No browser page errors.
- Mobile navigation: opens, closes with Escape, follows the Projects anchor, and closes after selection.
- Contact: valid draft produces an explicit “Message not sent” status and preserves input values. No external service or network submission.
- Reduced motion: smooth scrolling becomes `auto`; status animation becomes `none`.
- Requesting `/stitch-reference/zhidan.dev_developer_portfolio/code.html` returns 404.
- Full-page desktop and mobile screenshots inspected against the Stitch screenshot. Layout, typography, palette, cards, timeline, and workspace art retained; lower sections remain visible.

## Deliberate differences and remaining content

The generated reference's placeholder statistics, fake commits, skill rankings, and encryption claims are replaced with non-numeric focus labels or clearly empty states. Placeholder contact destinations and project links are not clickable. The UI is complete, but delivery, verified destinations, CV, and live GitHub data still require owner-provided configuration. Reference-sourced experience and learning content need owner review.

Local verification screenshots and the Playwright output are stored in the ignored `.helsinki-checks/` directory. They are development evidence, not application assets.
