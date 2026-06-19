---
name: html-template
description: "Standard editorial template for any standalone HTML output (reports, RCAs, dashboards, diagrams, slides, recaps). Use EVERY time you generate an HTML file so output follows one consistent house style instead of ad-hoc theming."
args: [theme]
---

# HTML Template

House style for all standalone HTML. Light editorial by default, dark variant for dashboards/diagrams. Self-contained, no external assets.

**`theme`** — `light` (default) or `dark`.

## Steps

1. Copy the template as the starting point:
   ```bash
   TPL=~/dotfiles/ai/commonSkills/html-template/template.html
   ```
   Read it once to see the available component blocks.

2. Set the theme on `<html>`:
   - `data-theme="light"` — reports, RCAs, write-ups (default)
   - `data-theme="dark"` — dashboards, diagrams, data-heavy pages

3. Build the page by **reusing the existing blocks** — do not invent new styling:
   - `.eyebrow` + `h1` + `.lede` + `.meta` — masthead
   - `.summary` — TL;DR
   - `section` + `.num` + `h2` — numbered sections
   - `.note` (`.warn` / `.good`) — callouts
   - `table`, `pre`/`code`, `ol.flow`, `ol.steps` — content blocks
   - `footer`

4. Hard rules:
   - **Never change the `:root` / `[data-theme="dark"]` token values.** Only consume them.
   - Keep the `<style>` block intact; add classes only if a token-based pattern is missing.
   - Everything inline — no CDN fonts, scripts, or remote images.
   - Syntax-highlight code with the `.c-red/.c-grn/.c-amb/.c-blu/.c-dim` spans (they adapt per theme).

5. Write the final file under `~/.agent/artifacts/` (per global Artifacts rule), then open it:
   ```bash
   open ~/.agent/artifacts/<name>.html
   ```

## Design intent

Editorial, not dashboard: warm paper background, serif body, narrow single column, generous whitespace, one accent color, hierarchy via size + space — never via loud color. The page should read like a printed brief.
