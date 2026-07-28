# Changelog

## 0.1.3

- Consolidated Dropdown outside-click handling into one delegated listener per
  document, including repeated initialization and secondary documents.
- Added shared owner-aware scroll locking for Dialog and Sidebar overlays,
  native Dialog focus-containment coverage, and Dropdown entrance motion.
- Added role-based elevation tokens, size-aware control radii, and loading
  Button feedback that remains disabled while preserving the wait cursor.

## 0.1.2

- Fixed Alert title alignment, Breadcrumb list markers, clickable Tabs active
  state, Table cell padding, and Toast entrance-state cascade behavior.
- Expanded Sidebar with focus return, inert closed panels, hidden backdrops,
  mobile scroll locking, a built-in close action, collapse modes, state events,
  three widths, and left or right positioning.

## 0.1.1

- Aligned component density around 32, 36, and 40 pixel controls with tighter
  4, 6, and 8 pixel radii.
- Added scoped `data-cetha-mode` color modes, WCAG AA contrast assertions, and
  a vendored MIT-licensed Phosphor icon subset without a runtime dependency.

## 0.1.0

- Added 29 Astro-native UI components and local SVG icons.
- Added SSR-safe progressive enhancers for password input, dialog, dropdown,
  tabs, sidebar, toast, and data-table behavior.
- Added compiled semantic styles, Astro 6 static and Astro 7 Node SSR package
  fixtures, component render tests, and desktop/mobile Playwright coverage.
