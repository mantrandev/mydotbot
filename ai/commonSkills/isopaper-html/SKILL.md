---
name: isopaper-html
description: "Warm-paper isometric house style for standalone HTML — interactive step-through lessons with animated isometric diagrams (packets moving between servers, databases, devices; arrays, pointers, stacks, trees, graphs, DP grids and a code-trace panel for DSA / algorithm labs), plus the matching report blocks. Light and dark themes, JetBrains Mono, hard-shadow 'pop' buttons, cream paper with grain. Start from the bundled assets/template.html and reuse its blocks, tokens and scene engine. Use when the user asks for the isopaper / designed-to-scale look, an animated system-design or algorithm explainer, or a lesson the reader steps through; otherwise blueprint-html stays the default."
---

# Isopaper HTML

House style for interactive explainers: warm cream paper, ink outlines, pastel isometric blocks, one green "pop" accent for the current thing. A lesson is a stage the reader steps through — each step adds nodes, moves packets along links, updates metric chips and slides in new guide text. Report pages use the same paper, cards and callouts without the stage.

## Steps

1. Copy the bundled [template asset](assets/template.html) to `<project>/.agent/artifacts/<name>.html` (`<project>` = git root, or the cwd outside a repo). Resolve the asset relative to this `SKILL.md`; never use a hard-coded checkout or mirror path.

2. Build the page from existing blocks. Add a token-based class only when no pattern fits.

   Shell (keep as is):
   - `.window` — full-viewport frame with grain overlay and top glow
   - `.topbar` → `.menu-btn`, `.brand` (`.brand__name span` = marker highlight), `.nav` → `.nav__item[data-area][data-go]` or `[data-soon]`, `.search` (opens the ⌘K palette), `.theme-btn`
   - `.app-shell` → `.sidebar` + `.nav-scrim` + `.app-main`
   - `.sidebar` → `.tree-root`, `.course` → `.mod` (`.mod__head` + `.folder--<tone>` + `.mod__count[data-count]`) → `.mod__lessons` → `.lesson > a[data-go]` (`.is-soon` + `.soon` for placeholders), `.progress` (expandable, auto-filled)
   - `.toast`, `.sx` palette — auto-wired, never hand-filled. It searches titles, subtitles, step text, callouts and doc bodies, ignores Vietnamese accents, and requires every typed word. Put synonyms (English terms for a Vietnamese page, abbreviations) in `data-keywords` on the `section.view`

   Lesson view `section.view.view--lesson[data-scene]`:
   - `.lesson-grid` → `.sheet` + `.rail`
   - `.lesson-head` → `.crumb`, `.title`, `.tags` → `.tag--sand|violet|mint|blue|rose|amber`, `.subtitle`
   - `.stage` → empty `.stage__hud`, `.stage__tools`, `.stage__canvas > svg.stage-svg`, plus a hand-written `.stage__legend` of `.lg--<kind>` dots
   - `.card.timeline` and `.card.guide` — empty; the engine fills them
   - `.card.goals` → `li[data-at="<step number>"] > .check` — ticks itself when the reader reaches that step

   Doc view `section.view.view--doc` → `.sheet` → `.lesson-head` + `.doc__body`:
   - `.tiles` → `.tile[data-level=good|warn|bad]` (`.k` label, `.v` value, `.u` comparison)
   - `.callout--insight|tip|warn|next` with `.callout__icon[data-icon]`
   - `.panel` → `.desc` + `.mind` (the chosen / consequential side)
   - `table.compare` (tinted columns), `table.plain`, `.yes` / `.no`
   - `.hbar` → `.hbar__lbl` + `.meter` (`.hot` for the dominant cost)
   - `pre > code` with `.c-red/.c-grn/.c-amb/.c-blu/.c-dim`
   - `ol.steps` (`li.is-current`), `ul.takeaways`, `.changes` → `.chg--add|mod|del`
   - `.filter-field > input[data-filter=<table id>]` + `.interactive-table tr[data-interactive]` + `.inline-detail-row` → `.detail-reveal` → `.detail-reveal-inner`
   - `.card.task` → `.task__top` + `.btn-ghost.done-btn[data-done=<view id>]` with `.check`
   - `details.ex` → `summary` (`.exno`) + `.sol`
   - `.view-nav` → `[data-view-step="-1"]` / `[data-view-step="1"]` — labels name the neighbour automatically
   - `.foot`

   Buttons: `.btn-pop` (primary, green, hard shadow), `.btn-ghost` (secondary), `.tool` (small stage control), `kbd`.

3. Write the diagrams as data in the `SCENES` object, one entry per `data-scene`. Read [Scene Engine](references/scene-engine.md) before writing or changing a scene — it covers coordinates, node kinds, links, flows, notes, chips and what accumulates across steps.

   For data structures and algorithms, also read [DSA Primitives](references/dsa-primitives.md): arrays, grids, stacks, tree/graph dots, pointers, cell marks, swaps, links into cells, the code-trace panel and the `AT` / `TREE` / `CHAIN` helpers. Copy patterns from [the DSA demo](assets/dsa-demo.js); `python3 scripts/build_dsa_demo.py` builds it into `./.agent/artifacts/isopaper-dsa-demo.html`.

4. For a page with more than one section, read [Layout and Navigation](references/layout-nav.md).

5. Translate the UI strings in `WORDS` (and per-scene `words`) when the page is not in English. Keep `lang` on `<html>` in sync.

6. Verify with the bundled checker (`scripts/check.mjs`, resolved relative to this `SKILL.md`) until it prints `PASS` in all three modes. Never hand over a page that fails:
   ```bash
   node scripts/check.mjs <project>/.agent/artifacts/<name>.html --shots=/tmp/iso-shots
   node scripts/check.mjs <project>/.agent/artifacts/<name>.html --dark
   node scripts/check.mjs <project>/.agent/artifacts/<name>.html --mobile
   ```
   Fix every reported overlap by changing the layout (spacing, `via`, `labelSide`, `noteAt`, shorter pill text), then rerun. Look at a few screenshots per lesson as well. See [Scene Engine › Layout pitfalls](references/scene-engine.md).

7. Open the finished artifact:
   ```bash
   open <project>/.agent/artifacts/<name>.html
   ```

## Hard rules

- **Never change token values in `:root` or `:root[data-theme="dark"]`.** Only consume them. Every new colour must be a token defined in both themes, or the dark theme breaks.
- Both themes ship. The theme button, the pre-paint `<script>` in `<head>` and the `isopaper:theme` key stay.
- Shape language: rounded corners (`8px` buttons, `9–10px` chips and inner cards, `12px` cards, `14px` sheets). Primary emphasis is `1.5px solid var(--ink)` + `var(--pop-shadow)` — a hard offset shadow, never a soft blur. Soft blur is only for the ambient `--card-shadow`.
- Press feedback is `transform:translate(1px,1.5px)` + shadow removed. Hover on cards is at most `translateY(-1px)`.
- Motion uses the three easings: `--ease` for slides and reveals, `--spring` for things that pop in (checks, nodes, theme icon), `--swing` for the timeline rail. Keep durations in the template's range (`.15s`–`.7s`); loops only for packets, `held`, `pulse`, `moved`, `march`.
- Every animation must survive `prefers-reduced-motion`: the template already zeroes CSS motion and skips packet flows — do not bypass it with inline styles.
- Green (`--green`) marks the current item only: active nav, current lesson, current step dot, primary button. Status uses the level trio `good / warn / bad`. Rust is for a single hot metric or link, not decoration.
- Every page with more than one section uses the sidebar, one view per section. The sidebar selects a view; it never scroll-spies one long page.
- Diagrams with steps, branches or states go in a scene, not in Mermaid and not in a static image.
- Algorithm state (indices, comparisons, swaps, visited sets) is shown with `ptrs` and `marks`, never with ad-hoc text pills on cells. One `cur` (green) per step.
- Everything inline. The only remote resource is the JetBrains Mono stylesheet; the stack falls back to local monospace when it is blocked. No CDN scripts, no remote images.
- Every page has a topic-relevant SVG favicon as a percent-encoded data URI (`#` → `%23`), legible at 16×16, drawn in the palette.
- Completion state lives in `localStorage` under `isopaper-done:` + `location.pathname`. Keep that key shape so `file://` pages don't overwrite each other.
- A page is done only when `scripts/check.mjs` prints `PASS` in light, `--dark` and `--mobile`.
- No comments in generated HTML, CSS or JS.

## Content rules

- Lead with the answer. A doc view opens with `.tiles` and the key callout; a lesson's step 1 states the problem in one sentence.
- One idea per step. The guide title says what changes in this step; the body is at most two short paragraphs.
- Every number has a unit and a comparison: `540 ms — was 135 ms`. Chips carry `good / warn / bad`.
- Name real things: `ORDER BY score · 400 ms`, not `slow thing`.
- Use `.term` the first time a term appears in a step and explain it in the same sentence.
- When a source is wrong, say so in a `.callout--warn` with the wrong value, the right one, and why.
- End each lesson with a recap step (`chapter: ['Recap', 'ink']`) holding `ul.takeaways` and a `.callout--next`.

## Design intent

A hand-built sketchbook rather than a drawing: cream paper with grain, ink-outlined pastel blocks on a fading isometric grid, chunky monospace headings. The page feels physical — buttons sit on hard shadows and press down, checks spring in, chips flash when a number changes, packets travel the links so the reader watches the cost happen instead of reading about it. Dark mode keeps the same objects in lamp-lit browns. Calm by default, one green thing at a time.
