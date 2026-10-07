---
name: blueprint-html
description: "The blueprint house style for standalone HTML output — reports, RCAs, dashboards, diagrams, slides, recaps, and study material such as revision pages, course notes, worked solutions and practice exams. Start from the bundled assets/template.html and reuse its component blocks and design tokens. Use every time an HTML file is generated, so output stays on one consistent theme instead of ad-hoc styling."
---

# HTML Template

House style for all standalone HTML: technical-drawing blueprint. Monospace throughout, grid paper background, double-ruled sheet frame, square corners, one rust accent. Single look — no light/dark variants.

## Steps

1. Copy the bundled [template asset](assets/template.html) directly to `~/.agent/artifacts/<name>.html`. Resolve the asset relative to this `SKILL.md`; never use a hard-coded checkout or mirror path.

2. Build the page by reusing the existing blocks. Add a token-based class only when no existing pattern fits:
   - `.sheet` — the double-ruled frame; always keep `width:100%;max-width:none`
   - `.content` — the root content surface inside `.sheet`; always keep `width:100%;max-width:none;min-width:0`
   - `.app-shell` + `.sidebar-slot` + `.sidebar` + `.app-main` — collapsible application shell
   - `.nav-progress` — overall course progress inside the sidebar
   - `.nav-group` + `.nav-group-toggle` + `.nav-children` + `.nav-child` — expandable course hierarchy
   - `.nav-topline` + `.nav-scrim` — desktop toggle and mobile drawer controls
   - `h1` + `.sub` + `.meta` — masthead
   - `.tabs` / `.tab` — secondary switching inside the current view, never primary navigation
   - `.stage-wrap` + inline `<svg>` — diagram or chart canvas (`.node`, `.edge`, `.divider`, `.lanehdr`)
   - `.tiles` / `.tile` (`.hot`) — stat tiles
   - `.panel` → `.desc` + `.mind` — paired commentary, neutral left / rust right
   - `.k` kicker, `.cost` metric line, `.flag` (`.hot` / `.ok`) — dashed callout
   - `.bar` (`.hot`) — horizontal magnitude bars
   - `table`, `pre`/`code`, `ol.steps` — content blocks
   - `.filter-field` + `.interactive-table tr[data-interactive]` (`.selected`) — searchable row directory with stable hover/selected states
   - `.inline-detail-row` (`.open`) → `.detail-reveal` + `.detail-reveal-inner` — content that expands directly below its selected row
   - `.legend` → `.lg` (`.hot`) with numbered `.item b` badges
   - `.controls` + `button` (`.ghost`) + `.dots` — stepper
   - `.foot`

   Study material adds four blocks on top of those — see [Study Material](references/study-material.md) for their anatomy and the progress wiring:
   - `.card` + `.card-top` + `.dang` + `.done-btn` — one lesson or one problem type, with a toggle the reader keeps
   - `.paper` + `.paper-head` + `.q` + `.ans` — an exam paper with a worked answer under each question
   - `details.ex` + `.exno` + `.sol` — a practice item whose solution stays hidden until asked for
   - `pre.mat` and `.eq` — a derivation slab and a single-line result

   For every page with more than one section (courses, plans, roadmaps, reports, RCAs, multi-area dashboards), read [Course Sidebar](references/course-sidebar.md). When using a searchable table or inline detail reveal, read [Interactive Patterns](references/interactive-patterns.md).

3. Hard rules:
   - **Never change the `:root` token values.** Only consume them. `--hand` is the one sanctioned addition, and only for the handwriting layer below.
   - Square corners. No `border-radius` except badge circles and SVG `rx="2"`.
   - Hover lift is `box-shadow:3px 3px 0 var(--ink)` + `translateY(-2px)` — never a soft blur.
   - **Every page with more than one section uses the collapsible sidebar menu, one view per section.** This covers courses, plans, roadmaps, reports, RCAs and multi-area dashboards, not only courses. Only a page whose whole content fits a single view may delete the sidebar block. Never stack several `h2` sections on one long scrolling page, and never remove the template's sidebar because the page "is just a report". Never use a top menubar as primary navigation.
   - Keep overall progress and group counts in the sidebar when the page has completion state (study items, or plan phases with a `.done-btn`). A page with no completion state drops the `.nav-progress` block and the group counts, but keeps the menu.
   - Completion state lives in `localStorage` under a key unique to the page. The template derives it from `location.pathname`; keep that, because every `file://` page shares one storage origin and a fixed key makes pages overwrite each other's progress.
   - **The sidebar selects a view; it does not scroll one long page.** Choosing an item shows that view and hides the rest. A reader who has to scroll past twenty topics to reach the one they came for cannot tell where they are, and the sidebar's active state becomes a guess. One view at a time also makes the back/next stepper meaningful. See [Course Sidebar](references/course-sidebar.md).
   - Keep the sidebar open and collapsible on desktop. At `900px` and below, turn it into a closed-by-default drawer with a scrim. Both modes must preserve the same navigation hierarchy and active/completed states.
   - Never add `max-width` to `.sheet` or `.content`. Cap only inner prose measures when necessary; dashboards, grids and app surfaces must consume all available width.
   - Keep desktop padding at `16px` for `body` and `22px` for `.sheet`; reduce them at mobile breakpoints without changing either root width.
   - Every page must include a topic-relevant SVG favicon through `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">` in `<head>`. Draw it with the existing palette, keep it legible at `16×16`, percent-encode reserved characters such as `#` as `%23`, and do not use emoji, text, external files or base64 blobs.
   - Everything inline — no CDN scripts or remote images. The handwriting face below is the single exception.
   - Syntax-highlight code with the `.c-red/.c-grn/.c-amb/.c-blu/.c-dim` spans.

4. Open the finished artifact:
   ```bash
   open ~/.agent/artifacts/<name>.html
   ```

## The handwriting layer

Pages a person studies from read better when the headings look written rather than typeset — the sheet stops feeling like generated output and starts feeling like someone's notes. Patrick Hand carries full Vietnamese diacritics, which most handwriting faces do not, so it is the default:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap">
```
```css
--hand:"Patrick Hand",ui-rounded,"Segoe Print",var(--mono);
```

Spend it on `h1`, `h3`, `h4` and the title line of an exam paper, and nowhere else. Body copy, tables, `.k` labels, `pre`, `.eq` and every matrix stay `--mono`, because the sheet's legibility comes from fixed-width alignment — handwriting in a matrix destroys the column grid, and handwriting in a long derivation is tiring to read. Always end the stack with `var(--mono)` so a blocked font still leaves a readable page.

This is the only remote resource the house style permits, and only because no local face covers Vietnamese handwriting. If the font file is available locally, inline it as a base64 `@font-face` and drop the link. For a report, an RCA or a dashboard, skip the layer entirely — `--mono` headings are the default look.

## Content rules

- Every label must name a real thing, not a mood.
  - Bad: `USER BEHAVIOR — SOMETHING IS WRONG`
  - Good: `Hypothesis: users stop returning after day 3`
- Use plain language. Keep a technical term in English when translating it would make it harder to read, then explain it once: `retention (the share of users who return)`.
- Keep each tile, node or heading to one short idea.
- Give every number a unit and something to compare against. `2.3s` says nothing.
  `2.3s — previously 0.4s` does.
- If content has steps, branches or states, draw it with `.stage-wrap` + inline
  SVG (`.node`, `.edge`) instead of Mermaid.
- In study material, close every worked example with a cheap re-check the reader can repeat under exam pressure — substitute the answer back into the original statement, or set a parameter to a value whose result is already known. The check is the part they will actually reuse.
- Say plainly when a source document is wrong. Put the correction in a `.flag.hot` next to the topic it belongs to, with the wrong value, the right one, and why the mistake happens. Quietly fixing it teaches nothing and the reader will hit the same trap in the original.

## Design intent

An engineering drawing, not a document: cool blue-grey grid paper, navy ink, burnt-rust accent used only for the consequential half. Everything monospace and small; hierarchy comes from rules, borders and letter-spacing rather than type size. Ink = neutral state, rust = what matters right now. Interactive pages get a stepper and hard-shadow hover so the sheet feels mechanical rather than soft. Study pages add one handwritten layer on the headings so the sheet reads as notes a person would keep, without giving up the drawing's precision anywhere it carries meaning.
