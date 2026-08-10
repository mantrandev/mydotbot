---
name: html-template
description: "Standard blueprint template for any standalone HTML output (reports, RCAs, dashboards, diagrams, slides, recaps). Use EVERY time you generate an HTML file so output follows one consistent house style instead of ad-hoc theming."
---

# HTML Template

House style for all standalone HTML: technical-drawing blueprint. Monospace throughout, grid paper background, double-ruled sheet frame, square corners, one rust accent. Single look — no light/dark variants. Self-contained, no external assets.

## Steps

1. Copy the template as the starting point:
   ```bash
   TPL=~/dotfiles/ai/commonSkills/html-template/template.html
   ```
   Read it once to see the available component blocks.

2. Build the page by **reusing the existing blocks** — do not invent new styling:
   - `.sheet` — the double-ruled frame; always keep `width:100%;max-width:none`
   - `.content` — the root content surface inside `.sheet`; always keep `width:100%;max-width:none;min-width:0`
   - `h1` + `.sub` + `.meta` — masthead
   - `.tabs` / `.tab` — switching between views
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

3. Hard rules:
   - **Never change the `:root` token values.** Only consume them.
   - Keep the `<style>` block intact; add classes only if a token-based pattern is missing.
   - Square corners. No `border-radius` except badge circles and SVG `rx="2"`.
   - Hover lift is `box-shadow:3px 3px 0 var(--ink)` + `translateY(-2px)` — never a soft blur.
   - Keep `18px` between a filter field and the table below it. Interactive rows use `14px 16px` cell padding and `8px` row spacing so hover outlines never collide with adjacent content.
   - Lift only unselected interactive rows. A selected row stays still, uses `var(--rust-soft)` with a `var(--rust)` border, and must not inherit the hover transform or shadow.
   - Expand row content immediately after the selected row, never in a shared panel at the bottom and never by auto-scrolling the viewport. Move the single detail row after the selected row before opening it.
   - Animate `.detail-reveal` with `grid-template-rows:0fr` to `1fr`, opacity and a `4px` translate. Do not animate table-row height or detach the detail row. Hide it after the close transition, cancel any pending close timer before reopening, then force one layout read before adding `.open` so an old close cannot hide new content.
   - Respect `prefers-reduced-motion` for every hover and reveal transition.
   - For collapsible app navigation, keep the shell full-width in both states, keep the sidebar width fixed, and animate only `transform:translateX(...)`; never animate the sidebar width because menu rows will reflow.
   - Never add `max-width` to `.sheet` or `.content`. Cap only inner prose measures when necessary; dashboards, grids and app surfaces must consume all available width.
   - Keep desktop padding at `16px` for `body` and `22px` for `.sheet`; reduce them at mobile breakpoints without changing either root width.
   - Everything inline — no CDN fonts, scripts, or remote images.
   - Mermaid needs a ~3 MB bundle; draw diagrams as inline SVG using `.node`/`.edge` instead.
   - Syntax-highlight code with the `.c-red/.c-grn/.c-amb/.c-blu/.c-dim` spans.

4. Write the final file under `~/.agent/artifacts/` (per global Artifacts rule), then open it:
   ```bash
   open ~/.agent/artifacts/<name>.html
   ```

## Design intent

An engineering drawing, not a document: cool blue-grey grid paper, navy ink, burnt-rust accent used only for the consequential half. Everything monospace and small; hierarchy comes from rules, borders and letter-spacing rather than type size. Ink = neutral state, rust = what matters right now. Interactive pages get a stepper and hard-shadow hover so the sheet feels mechanical rather than soft.
