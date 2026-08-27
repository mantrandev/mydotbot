# Course Sidebar

Read this reference for every course and every page with primary navigation. Static reports without navigation may remove the sidebar block.

## Layout

- Use `.app-shell` with a `320px` `.sidebar` and a fluid `.app-main`.
- Keep the sidebar width fixed. Desktop collapse moves the sidebar out and reduces its layout slot so the main content regains the full width without reflowing menu rows.
- Keep the sidebar sticky and independently scrollable on desktop.
- At `900px` and below, render the same sidebar as a fixed drawer no wider than the viewport minus `40px`.
- Mobile starts closed. Opening it shows `.nav-scrim` and locks body scrolling.
- Close the mobile drawer after selecting an item, pressing Escape or activating the scrim.

## Hierarchy

- Put overall progress near the top as `completed/total` plus a horizontal progress bar.
- Put direct destinations above the grouped curriculum.
- Each `.nav-group-toggle` uses three areas: disclosure arrow, module name with range or phase metadata, and `completed/total` count.
- Each `.nav-child` uses three columns: completion mark, short lesson or day identifier, and a single-line title.
- The current item uses `var(--rust-soft)` and `var(--rust)`. Completed items use `var(--good)`.
- Open the group containing the current lesson by default. Other groups stay collapsible.
- Keep `.tabs` only for secondary views inside the selected page.

## Behavior

- Use one toggle button with `aria-controls` and synchronized `aria-expanded`.
- Set `aria-hidden` and `inert` while the sidebar is closed so hidden controls cannot receive focus.
- Keep submenu buttons synchronized with `aria-expanded`.
- Preserve the sidebar hierarchy, progress and selected item across desktop and mobile layouts.
- Respect `prefers-reduced-motion` for the sidebar, its layout slot and submenu transitions.
