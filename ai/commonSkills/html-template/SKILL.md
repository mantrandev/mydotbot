---
name: html-template
description: "Standard blueprint template for any standalone HTML output (reports, RCAs, dashboards, diagrams, slides, recaps). Use EVERY time you generate an HTML file so output follows one consistent house style instead of ad-hoc theming."
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

   For courses and any page with primary navigation, read [Course Sidebar](references/course-sidebar.md). When using a searchable table or inline detail reveal, read [Interactive Patterns](references/interactive-patterns.md).

3. Hard rules:
   - **Never change the `:root` token values.** Only consume them.
   - Square corners. No `border-radius` except badge circles and SVG `rx="2"`.
   - Hover lift is `box-shadow:3px 3px 0 var(--ink)` + `translateY(-2px)` — never a soft blur.
   - Courses and pages with primary navigation must use the collapsible sidebar. Never use a top menubar as primary navigation. Keep overall progress and group counts in the sidebar.
   - Keep the sidebar open and collapsible on desktop. At `900px` and below, turn it into a closed-by-default drawer with a scrim. Both modes must preserve the same navigation hierarchy and active/completed states.
   - Never add `max-width` to `.sheet` or `.content`. Cap only inner prose measures when necessary; dashboards, grids and app surfaces must consume all available width.
   - Keep desktop padding at `16px` for `body` and `22px` for `.sheet`; reduce them at mobile breakpoints without changing either root width.
   - Every page must include a topic-relevant SVG favicon through `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">` in `<head>`. Draw it with the existing palette, keep it legible at `16×16`, percent-encode reserved characters such as `#` as `%23`, and do not use emoji, text, external files or base64 blobs.
   - Everything inline — no CDN fonts, scripts, or remote images.
   - Syntax-highlight code with the `.c-red/.c-grn/.c-amb/.c-blu/.c-dim` spans.

4. Open the finished artifact:
   ```bash
   open ~/.agent/artifacts/<name>.html
   ```

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

## Design intent

An engineering drawing, not a document: cool blue-grey grid paper, navy ink, burnt-rust accent used only for the consequential half. Everything monospace and small; hierarchy comes from rules, borders and letter-spacing rather than type size. Ink = neutral state, rust = what matters right now. Interactive pages get a stepper and hard-shadow hover so the sheet feels mechanical rather than soft.
