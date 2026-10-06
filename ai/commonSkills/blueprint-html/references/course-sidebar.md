# Course Sidebar

Read this reference for every course and every page with primary navigation. Static reports without navigation may remove the sidebar block.

## Layout

- Use `.app-shell` with a `320px` `.sidebar` and a fluid `.app-main`.
- Keep the sidebar width fixed. Desktop collapse moves the sidebar out and reduces its layout slot so the main content regains the full width without reflowing menu rows.
- Keep the sidebar sticky and independently scrollable on desktop.
- At `900px` and below, render the same sidebar as a fixed drawer no wider than the viewport minus `40px`.
- Mobile starts closed. Opening it shows `.nav-scrim` and locks body scrolling.
- Close the mobile drawer after selecting an item, pressing Escape or activating the scrim.

## Selection, not scrolling

The sidebar switches views. It never scroll-spies a single long document.

- Wrap each destination in its own `<section class="view" data-view="<id>" hidden>`, where `<id>` matches the `data-go` of the sidebar item that opens it.
- Showing a view hides every other one. Toggle `el.hidden`, not `style.display` — the platform honours `[hidden]`.
- Expand the group containing the selected view and mark the item `.active`, so the sidebar always answers "where am I".
- Mirror the selection in `location.hash` with `history.replaceState`, and read the hash on load. A reader who bookmarks one lesson should land on it, and you can link someone straight to a topic.
- Give each view a `.controls` stepper that names its neighbours — `◀ Lesson 06 · Title` / `Lesson 08 · Title ▶` — not bare arrows. Naming the destination is what makes sequential study work without the sidebar.
- Scroll the main surface to its top on each switch. Keeping the old scroll offset drops the reader into the middle of the new view.
- The masthead, `.foot` and the sidebar stay put across switches; only the view area changes.

Why this matters: the page is a reference people return to under time pressure. Everything that is not the thing they came for is noise, and on a phone a twenty-topic scroll is unusable.

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
