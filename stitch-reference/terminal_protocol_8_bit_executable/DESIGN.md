---
name: Terminal Protocol / 8-Bit Executable
colors:
  surface: '#0d141d'
  surface-dim: '#0d141d'
  surface-bright: '#333a44'
  surface-container-lowest: '#080f17'
  surface-container-low: '#151c25'
  surface-container: '#192029'
  surface-container-high: '#232a34'
  surface-container-highest: '#2e353f'
  on-surface: '#dce3f0'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dce3f0'
  inverse-on-surface: '#2a313b'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#b090ff'
  on-tertiary-container: '#4600a7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0d141d'
  on-background: '#dce3f0'
  surface-variant: '#2e353f'
typography:
  display-hero:
    fontFamily: Space Mono
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Space Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Mono
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Space Mono
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Mono
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-micro:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

## Brand & Style

This design system establishes a high-performance engineering aesthetic at the intersection of enterprise-grade software architecture, vintage arcade precision, and Unix command-line mastery. Designed explicitly for seasoned engineers presenting complex work to recruiters and technical directors, the UI avoids kitsch nostalgia in favor of surgical calibration.

The emotional signature is **competent, sharp, tactile, and mathematically disciplined**. It leverages:
- **Structural Brutalism & Terminal Micro-interactions:** Monospaced data displays, bracketed index signatures, crisp terminal-style status pulses, and precise key-value telemetry.
- **Glassmorphism with Hard Geometries:** High-density semi-translucent dark slate surfaces contained within 1px razor-sharp borders and stepped corner notches.
- **Matrix Micro-Grid Textures:** Understated dot and crosshair grids anchored at 24px intervals to ground interface elements without adding visual noise.

## Colors

The palette operates in strict dark mode, constructing depth through finely graduated charcoal and slate steps:

- **Background / Canvas (`#0c0e14`):** Deep void-slate providing infinite black depth with reduced optical fatigue.
- **Surfaces (`#121620` base, `#181d2a` elevated):** Dark industrial layers with subtle blue-steel undertones.
- **Primary Accent (`#10b981` / Emerald Neon):** Signifies execution, online states, active tabs, and primary CTA triggers. Accompanied by `#05d554` for terminal scanline accents.
- **Secondary Accent (`#06b6d4` / Cyber Cyan):** Utilized for system telemetry, code links, and structural metadata.
- **Tertiary Accent (`#8b5cf6` / Neon Violet):** Reserved for specialized tags, stack taxonomy, and experimental flags.
- **Warning Accent (`#f59e0b` / Cyber Amber):** Used for build statuses, warnings, and pending task indicators.
- **Typography Neutrals:** Primary text is cast in `#f3f4f6` (off-white 95% opacity), secondary metadata in `#9ca3af`, and muted structural lines/scaffolding in `#334155` and `#1e293b`.

## Typography

Typography establishes a duality: **Space Mono** commands structural headers with algorithmic rigor, while **Inter** delivers friction-free readability across descriptions, case study narratives, and technical specifications. **JetBrains Mono** handles all micro-labels, terminal telemetry, code snippets, and UI tags.

- Headlines must strictly use monospaced letter forms. To avoid excessive vertical height, line-heights are clamped tight.
- Major titles can be prefixed with terminal notation (e.g., `~/projects`, `01_experience`, `sys.status()`).
- All body text utilizes relaxed tracking and proportional numbers for optimal legibility at long formats.
- Labels, chip badges, and timestamps are typeset in uppercase or bracketed format (e.g., `[SYS_OK]`, `// STACK`).

## Layout & Spacing

The layout is built upon an uncompromising **8px spatial grid** combined with an adaptive 12-column system.

- **Desktop (1200px+):** 12 columns, fixed 1200px or fluid max-width container, 24px (`1.5rem`) gutters, 40px (`2.5rem`) canvas margins.
- **Tablet (768px – 1199px):** 8 columns, 20px gutters, 24px margins. Layout stacks secondary sidebar panels below the hero/project matrix.
- **Mobile (< 768px):** 4 columns, 16px (`1rem`) gutters, 20px (`1.25rem`) margins. Multi-column metric panels collapse to alternating 2x2 or 1-column stacks.

Components align directly to modular rhythm lines: card paddings utilize `space-md` or `space-lg`, and section gaps mandate `space-2xl` to establish high-impact breathing room amid dense data displays.

## Elevation & Depth

Visual depth is produced using **tonal layered glass surfaces** bound by crisp 1px borders, discarding blurry organic drop shadows in favor of laser-sharp luminescence.

1. **Level 0 (Base Canvas):** Solid `#0c0e14` with a pseudo-element background grid of subtle intersecting lines (`rgba(255, 255, 255, 0.03)` at 24px squares).
2. **Level 1 (Panels & Cards):** Background `rgba(18, 22, 32, 0.75)` with a 12px backdrop-filter blur, enclosed by a 1px solid border of `rgba(255, 255, 255, 0.08)`.
3. **Level 2 (Hover & Active States):** Background `rgba(24, 29, 42, 0.90)`. The border shifts to `rgba(16, 185, 129, 0.40)` or `rgba(6, 182, 212, 0.40)`. Drop shadow is replaced by an ambient outer glow: `0 0 12px -2px rgba(16, 185, 129, 0.25)`.
4. **Level 3 (Modals & Command Palettes):** Background `#121620`, bordered with `#334155`, casting a sharp non-diffuse stepped offset shadow: `4px 4px 0px 0px rgba(0, 0, 0, 0.8)`.

## Shapes

The design system employs **sharp, unrounded silhouettes (`roundedness: 0`)** or controlled micro-notches to emphasize industrial hardware aesthetics and micro-pixel architecture:

- All standard buttons, input fields, cards, and modal containers use crisp `0px` border-radii.
- **Notched Pixel Accent Option:** Feature cards and active system badges may utilize an angled cut or a stepped 2-pixel inverted corner notch (`clip-path: polygon(...)`) to produce a tactical, RPG HUD terminal silhouette.
- Divider rules utilize dashed or dotted line styles (`1px dashed rgba(255, 255, 255, 0.12)`).

## Components

### Buttons
- **Primary:** Neon emerald background (`#10b981`), pitch-black bold text (`#0c0e14`), 0px border-radius, `font-family: JetBrains Mono`. Hover state transitions to pure white text with a box glow of `0 0 16px rgba(16, 185, 129, 0.5)`. Text is prefixed with an executable bracket `> RUN_`.
- **Secondary / Ghost:** Transparent background, 1px border (`#334155`), text `#f3f4f6`. On hover: border turns `#06b6d4`, text shifts to `#06b6d4`, subtle matrix scan-line background pattern activates.

### Chips & Terminal Badges
- Displayed in `JetBrains Mono` at `11px` uppercase.
- Padded with `4px 8px`, 1px border matching the accent color at 30% opacity, surface background at 10% opacity (e.g., Violet `#8b5cf6` badge has background `rgba(139, 92, 246, 0.1)` and border `rgba(139, 92, 246, 0.3)`).
- Prefix tag options: `[v1.0.4]`, `[SYS_OK]`, `[ENV:PROD]`.

### Cards & Project Showcases
- Dark glass panel surface (`rgba(18, 22, 32, 0.85)`), 1px razor perimeter in `#1e293b`.
- Top-right corner features custom pixel HUD coordinates (e.g., `LOC: 0x4F`, `STATUS: 200`).
- Card header separated from the body by a fine `1px` horizontal border.
- Hover action triggers corner notch accent highlights in `#10b981`.

### Status Indicators
- 6px square indicator (not circular).
- Pulsing animation via CSS opacity keyframes (`rgba(16, 185, 129, 1)` to `rgba(16, 185, 129, 0.2)`).
- Accompanied by inline terminal text: `ONLINE // ACCEPTING_PROJECTS`.

### Form Inputs & Terminal Command Line
- Inset box background (`#0c0e14`), framed with 1px `#1e293b`.
- Monospaced typography with an emerald blinking cursor block (`█`).
- Placeholder text stylized as bash prompts: `$ type your message...`.
- Focus state instantly snaps border to `#10b981` without transitional lag.

### Checkboxes & Selectors
- Rigid square boxes with a solid 1px border.
- Checked state fills with an emerald square center (`8px x 8px` pixel-inset marker) instead of a round checkmark.