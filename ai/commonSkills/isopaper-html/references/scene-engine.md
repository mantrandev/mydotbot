# Scene Engine

Read this before writing or changing an entry in `SCENES`. A scene is data; the engine in the template draws it, animates it and wires the guide, timeline, chips and goals.

## How a step plays

```
go(k)
 ├─ fold steps 0..k  → visible nodes, chips, notes, link styles
 ├─ draw state       → nodes spring in, links fade in, notes pop, chips flash on change
 ├─ guide            → old text slides out, new text slides in from the step direction
 ├─ timeline + goals → rail fills, dot turns green, goals with data-at ≤ k+1 tick
 └─ flows            → packets travel beat by beat, then loop after 1.1 s
```

Last step reached → the view is marked done, the sidebar and progress update, a toast confirms.

## Coordinates

Grid units on the floor. `x` grows down-right on screen, `y` grows down-left, height grows up. One unit is one grid diamond (28×14 px).

```
screen X = (x − y) × 14
screen Y = (x + y) × 7 − z × 14
```

To place something at a screen position, solve `x − y = X/14` and `x + y = Y/7`.

- Same `x − y` → same column on screen (stack servers vertically this way).
- Same `x + y` → same row on screen.
- A link along one axis looks like a clean iso line; use `via` corners for elbows.
- Leave at least 2 units between footprints, more when a node has a label or a note on that side.
- The viewBox fits the drawing automatically, with a minimum of 560×330, so absolute offsets do not matter.

## Scene shape

```js
SCENES.myScene = {
  words: { next: 'Tiếp' },
  chips: [{ id: 'lat', label: 'Latency' }],
  nodes: { a: {…}, b: {…} },
  links: { ab: {…} },
  steps: [{…}, {…}]
}
```

`words` overrides `WORDS` for this scene only.

## Nodes

| key | meaning |
|---|---|
| `kind` | `box` (default), `cyl` (database / store), `device` (slab with screen and keyboard); `array`, `grid`, `stack`, `dot` are in [DSA Primitives](dsa-primitives.md) |
| `at` | `[x, y]` centre of the footprint |
| `size` | box / device: `[w, d, h]`; default box `[3, 3, 2.6]`, device `[5, 4, 0.9]` |
| `r`, `h` | cylinder radius and height; default `1.5`, `2.4` |
| `tone` | `slab`, `orange`, `green`, `blue`, `yellow`, `purple`, `rose` |
| `screen` | device screen tone, default `purple` |
| `title`, `sub` | text on the block's front edge; keep `title` ≤ 6 chars |
| `lines` | rack slots on the right face (servers) |
| `label` | name pill below the node |
| `noteAt` | where step notes sit: `top` (default), `right`, `left`, `bottom` |

Pick tones by role and keep them consistent across lessons: `blue` compute, `purple` storage, `yellow` lookup / DNS / cache, `green` routing / load balancer, `orange` queue / producer, `rose` failure or external risk, `slab` clients and floors.

## Links

| key | meaning |
|---|---|
| `from`, `to` | node ids, or `node.cell` for a cell of an array / grid (`'b.2'`, `'g.1,3'`) |
| `via` | list of `[x, y]` corners, rounded automatically |
| `style` | default look: `dashed`, `off`, `beat`, `flow`, `cut`, `hot`, `hidden` (invisible, still carries packets) |
| `both` | arrowheads on both ends |
| `arrow` | `false` removes the arrowhead |
| `label` | pill on the link |
| `labelAt` | position along the link, `0..1`, default `0.5` — move it when the pill covers a node |

A link shows only while both ends are visible.

## Steps

| key | accumulates? | meaning |
|---|---|---|
| `short` | — | timeline label and "Next: …" text; 1–2 words |
| `title` | — | guide heading |
| `chapter` | — | `['Problem','red']`; tones `red`, `blue`, `violet`, `green`, `amber`, `sand`, `ink` |
| `body` | — | HTML; may use `<b>`, `<code>`, `.term`, `ul.takeaways`, `table.compare` |
| `callout` | — | `{ kind: 'insight'|'tip'|'warn'|'next', title, text }` |
| `changes` | — | `[['+','Database'], ['~','Total 135 → 540 ms'], ['-','Cache']]` |
| `show` | yes | node ids to add |
| `hide` | yes | node ids to remove |
| `chips` | yes | `{ id: ['540 ms', 'bad'] }`; level `good`, `warn`, `bad` or none |
| `notes` | yes | `{ nodeOrLinkId: ['400 ms · scanning', 'bad'] }`; levels `bad`, `warn`, `ok`, `info`; `null` removes; a link note replaces the link label |
| `linkStyle` | yes | `{ linkId: 'cut' }`; `null` restores the link's own style; `'hidden'` hides it |
| `focus` | — | node ids that get the green pad and a spotlight ring this step |
| `vals`, `set`, `marks`, `ptrs`, `swap`, `line` | see [DSA Primitives](dsa-primitives.md) | node values, cell colours, pointers, swap hops, code-line highlight |
| `flows` | — | packet choreography, below |

Accumulating keys mean you only write what changes. To undo something, write it again with `null`.

## Flows

`flows` is a list of beats. Beats run one after another; an array beat runs its packets at the same time. The whole list loops until the step changes or the reader pauses.

```js
flows: [
  { on: 'a' },
  [{ on: 'l1', kind: 'ping' }, { on: 'l2', kind: 'kill' }],
  { on: 'd', kind: 'slow', ms: 2200 },
  { wait: 400 },
  { on: 'a', kind: 'res', back: true }
]
```

| key | meaning |
|---|---|
| `on` | link id |
| `back` | travel `to → from` |
| `kind` | `req` (orange, default), `res` (green), `slow` (amber), `ping` (hollow green), `kill` (hollow red), `fail` (red, bursts on arrival), `mine` (violet), `push` (green), `empty`, `held` (pulsing), and squares `msg`, `write`, `heavy`, `poison` |
| `ms` | travel time; default scales with link length (520–1500 ms) |
| `wait` | a pause beat |

Arrivals pop a green ring; `fail`, `kill` and `poison` burst red with a cross. Add a matching `.lg--<kind>` dot to the stage legend for every kind a lesson uses.

## Checks before shipping a scene

- Step through every step in light and dark; no pill overlaps a node or another pill.
- Every flow references an existing link; every `show`, `focus` and note references an existing node.
- Chips start at `'—'` in step 1 so the first real value flashes.
- `data-at` values in `.goals` match the step that teaches each goal.
