# Layout and Navigation

Read this for every page with more than one section. Each section becomes one sidebar item and one view.

## Mapping a document onto the shell

- Put the summary (answer first, key numbers) in the first view.
- Group views into `.mod` modules. Give each module a different `.folder--<tone>`: `sand`, `violet`, `green`, `orange`, `blue`, `teal`, `rose`, `slate`, `olive`.
- Number modules `01.`, `02.` in `.mod__title`.
- `.mod__count[data-count]` lists the tracked view ids in that module, comma-separated. Tracked = every lesson view with `data-scene` plus every `.done-btn[data-done]`.
- A planned but missing page is `li.lesson.is-soon` with a `.soon` badge, not a dead link.
- Top `.nav__item`s jump to the first view of an area (`data-area` on both the button and its views). An area that does not exist yet uses `data-soon="…"` and shows a toast.
- `.tree-root__meta` states the page count.

## Layout modes

```
≥1200 × ≥640   topbar / sidebar 296 | sheet | rail 376   each column scrolls on its own
<1200 or <640h  page scrolls, rail drops under the sheet, stage fixed at 500 px
≤960            sidebar becomes a drawer with scrim, top nav hides
≤640            title wraps, tool labels hide, timeline shows only the current label
```

Never add a `max-width` to `.window`, `.app-shell`, `.app-main` or `.sheet`. Cap only prose measures inside `.doc__body`.

## Views

- Each destination is `<section class="view" data-view="<id>" hidden>`; `<id>` matches the `data-go` of its sidebar link.
- Showing a view hides the others, marks the sidebar item `.is-current`, opens its module, sets the area pill, writes `#<id>` with `history.replaceState`, and scrolls to the top.
- A lesson view's scene starts when the view is shown and stops (packets cleared, fullscreen closed) when it is left.
- `.view-nav` buttons and the lesson's last-step "Next" name the neighbouring view; never leave bare arrows.

## Keyboard

| key | action |
|---|---|
| `⌘K` / `Ctrl K` / `/` | open the palette |
| `↑ ↓ ↵ Esc` | move, open, close in the palette |
| `← →` | previous / next step; past the last step → next view |
| `R` | replay the current step's flows |
| `Space` | pause / resume packets |
| `Esc` | close palette, then fullscreen stage, then mobile drawer |

## Palette

The palette indexes every sidebar page (with its `.subtitle`) and every scene step. Empty query shows pages only, grouped by module with done counts; typing also matches steps. Picking a step opens its lesson at that step.

## Progress

- One `localStorage` key, one render function: sidebar marks, module counts, the progress meter and the per-module list all update together.
- Reads and writes are wrapped in `try/catch`; the page works without storage.
- Say once in `.foot` that progress stays in this browser.

## Accessibility

- The sidebar toggle keeps `aria-expanded`; a closed sidebar is `inert` and `aria-hidden`.
- Collapsed modules are `inert`.
- Interactive table rows are focusable and open with Enter or Space.
- Respect `prefers-reduced-motion`; it is already handled globally.
