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
   - `.sheet` — the double-ruled frame that fills the viewport minus the `16px` body padding; add `.compact` for reports capped at `1040px` or `.wide` for layouts capped at `1600px`
   - `h1` + `.sub` + `.meta` — masthead
   - `.tabs` / `.tab` — switching between views
   - `.stage-wrap` + inline `<svg>` — diagram or chart canvas (`.node`, `.edge`, `.divider`, `.lanehdr`)
   - `.tiles` / `.tile` (`.hot`) — stat tiles
   - `.panel` → `.desc` + `.mind` — paired commentary, neutral left / rust right
   - `.k` kicker, `.cost` metric line, `.flag` (`.hot` / `.ok`) — dashed callout
   - `.bar` (`.hot`) — horizontal magnitude bars
   - `table`, `pre`/`code`, `ol.steps` — content blocks
   - `.legend` → `.lg` (`.hot`) with numbered `.item b` badges
   - `.controls` + `button` (`.ghost`) + `.dots` — stepper
   - `.foot`

3. Hard rules:
   - **Never change the `:root` token values.** Only consume them.
   - Keep the `<style>` block intact; add classes only if a token-based pattern is missing.
   - Square corners. No `border-radius` except badge circles and SVG `rx="2"`.
   - Hover lift is `box-shadow:3px 3px 0 var(--ink)` + `translateY(-2px)` — never a soft blur.
   - For collapsible app navigation, keep the shell full-width in both states, keep the sidebar width fixed, and animate only `transform:translateX(...)`; never animate the sidebar width because menu rows will reflow.
   - Keep the primary reading surface capped near `1600px` even when the shell fills the viewport.
   - Everything inline — no CDN fonts, scripts, or remote images.
   - Mermaid needs a ~3 MB bundle; draw diagrams as inline SVG using `.node`/`.edge` instead.
   - Syntax-highlight code with the `.c-red/.c-grn/.c-amb/.c-blu/.c-dim` spans.

4. Write the final file under `~/.agent/artifacts/` (per global Artifacts rule), then open it:
   ```bash
   open ~/.agent/artifacts/<name>.html
   ```

## Design intent

An engineering drawing, not a document: cool blue-grey grid paper, navy ink, burnt-rust accent used only for the consequential half. Everything monospace and small; hierarchy comes from rules, borders and letter-spacing rather than type size. Ink = neutral state, rust = what matters right now. Interactive pages get a stepper and hard-shadow hover so the sheet feels mechanical rather than soft.
