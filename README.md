# Cetha UI

Cetha UI is an Astro-native, SSR-safe component library for calm and precise product interfaces. Components render semantic HTML at build time or request time, and add browser JavaScript only where progressive enhancement is required.

```sh
npm install @charvesta/cetha
```

```astro
---
import { Button, Field, Input } from '@charvesta/cetha';
import '@charvesta/cetha/styles';
---

<Field id="email" label="Email">
  <Input id="email" name="email" type="email" required />
</Field>
<Button type="submit">Save</Button>
```

## Principles

- Astro components, not framework wrappers
- deterministic and SSR-safe markup
- semantic HTML before enhancement
- no runtime dependencies
- CSS custom properties for theming
- keyboard and focus behavior included for interactive components

## Components

The package includes foundations, form controls, feedback states, navigation,
overlays, and semantic data primitives. Interactive components use standard
Astro component scripts and native HTML baselines such as `<dialog>` and
`<details>`; Cetha never requires `client:*` directives.

Granular imports are available for every component:

```astro
---
import Button from '@charvesta/cetha/button';
import Dialog from '@charvesta/cetha/dialog';
---
```

Browser-only controllers are isolated under `@charvesta/cetha/client/*` and
are never imported by the server barrel.

Interactive Sidebar instances support mobile, desktop, or all-breakpoint
collapse modes, three widths, both screen edges, focus return, mobile scroll
locking, and a bubbling `cetha:change` state event.

## Styling

Cetha uses Tailwind CSS 4 as a repository build tool. The npm package ships a
compiled stylesheet, so consuming projects do not need Tailwind or a Cetha
build plugin. Theme colors and dimensions are exposed through semantic
`--cetha-*` custom properties.

Elevation is divided into `--shadow-cetha-sm`, `--shadow-cetha-md`, and
`--shadow-cetha-lg`; the original `--shadow-cetha` remains a compatible alias
for the medium level.

Use `data-cetha-mode="light|dark"` for luminosity and
`data-cetha-theme="default"` for the theme identity. Form controls and buttons
share `sm` (32px), `md` (36px, default), and `lg` (40px) density values.

## SSR contract

- no browser globals in component frontmatter or module-level package code
- no random, time-based, or global-state IDs
- caller-owned stable IDs for relational components
- deterministic initial markup in static and request-time rendering
- native usable markup before progressive enhancement

Package acceptance tests install the generated tarball into Astro 6 static and
Astro 7 Node SSR fixtures. Unit tests also render components with Astro
Container, while Playwright covers desktop and mobile keyboard/focus behavior.

See `apps/docs` for the component catalogue and API examples.

## Development

```sh
npm install
npm run check
npm run test
```

## License

MIT
