# DSA Primitives

Read this before writing a scene about data structures or algorithms. It adds node kinds, step keys and helpers on top of [Scene Engine](scene-engine.md); everything there still applies.

Working examples: [DSA demo lessons](../assets/dsa-demo.js) — two pointers, binary search, bubble sort, stack, BFS, BST, hash chaining, grid DP, linked-list reversal. Build them with `python3 scripts/build_dsa_demo.py [out.html]` (default `~/.agent/artifacts/isopaper-dsa-demo.html`).

## Pick the primitive

| You show | Use |
|---|---|
| array, string, queue, bucket table | `kind: 'array'` |
| DP table, matrix, maze | `kind: 'grid'` |
| stack, call stack | `kind: 'stack'` |
| tree or graph vertex | `kind: 'dot'` (or `TREE(...)` for a whole binary tree) |
| linked-list node, record, chain entry | low `box` (height < 1.6 puts the value on top), or `CHAIN(...)` |
| index variables `i`, `l`, `r`, `lo`, `mid` | step `ptrs` |
| comparing, swapping, sorted, discarded | step `marks` |
| current code line | scene `code` + step `line` |

## Node kinds

| kind | keys |
|---|---|
| `array` | `values`, `cap` (slot count, default `values.length`), `cell` (default `2`), `h` (`0.9`), `axis` (`'x'` default, `'y'`), `index` (`false` hides, or a label list), `tone` |
| `grid` | `values` (rows of cells), `cell` (`2.2`), `h` (`0.3`), `rows` / `cols` (axis labels), `tone` |
| `stack` | `values` (bottom → top), `cap` (sets the drawn height), `cell` (`3`), `h` (slab height, `1.5`), `tone` (`yellow`) |
| `dot` | `title` (value on the top face), `r` (`1.1`), `h` (`0.7`), `tone` |

`at` is always the centre of the whole footprint. Array cell `k` sits at `at + (k − (n−1)/2) × cell` along its axis. Grid rows run along `y`, columns along `x`. Empty slots (`null` or `''`) draw faded with no value.

## Step keys

All of these accumulate like `show` and `chips`, except `swap` and `line`.

| key | shape | meaning |
|---|---|---|
| `vals` | `{ a: [..], g: [[..]], n5: '9' }` | replace a structure's values, or a node's title |
| `set` | `{ a: { 3: 9 }, g: { '1,2': 4 } }` | change single cells on top of the current values |
| `marks` | `{ a: { 2: 'cmp', '4..7': 'dim' }, n5: 'cur' }` | colour cells (structures) or whole nodes |
| `ptrs` | `{ a: { l: 0, r: [6, 'warn'] } }` | named pointer pills over cells; `null` removes one, `{ a: null }` removes all |
| `swap` | `{ a: [i, j] }` | cells `i` and `j` hop over each other; write the swapped `vals` in the same step |
| `line` | `3` or `[4, 5, 6]` | highlight these exact lines in the code panel — a list, not a range |

Marks on a structure merge per cell. `null` clears a cell, `'*': null` clears the whole structure before applying the rest, `{ a: null }` clears all. `'2..5'` is an inclusive index range (arrays and stacks).

### Mark vocabulary

| mark | tone | use for |
|---|---|---|
| `cur` | green | the one element being processed or the answer |
| `cmp` | yellow | elements being compared or read |
| `swap` | orange | elements being moved or written |
| `win` | blue | window, frontier, range, queue members |
| `done` | purple | finalised, sorted, visited, matched |
| `bad` | rose | collision, conflict, invalid |
| `dim` | faded | discarded, out of range |

A raw tone name (`'blue'`) also works. Keep green for one current thing per step. Add the matching `.lg--cur|cmp|swap|win|done|bad|dim` squares to `.stage__legend`.

## Pointers

Pointers sit over the back corner of a cell, so they never cover its value. Two pointers on the same cell stack upward; the first one has the stem. A pointer that changes cell slides there. Value is an index (`3`), a grid key (`'1,2'`), or `[index, level]` with level `ok | warn | bad | info`.

## Links into cells

A link end may name a cell: `from: 'b.2'` (array index 2), `to: 'g.1,3'` (grid cell). Use it for hash buckets → chain nodes, merge outputs, adjacency lists. Links with `style: 'hidden'` stay invisible but still carry packets — use them to move a value between structures (push from a string cell into a stack).

`linkStyle` values for algorithms: `'solid'` (default look, use to reveal a hidden link or mark a tree edge), `'off'` (unexplored edge), `'dashed'`, `'cut'` (removed pointer), `'hidden'`. Set `arrow: false` for undirected edges.

## Code panel

```js
SCENES.bsearch = {
  lang: 'python',
  code: ['def search(a, x):', '    lo, hi = 0, len(a) - 1', …],
  …
  steps: [{ line: [4, 6], … }]
}
```

The engine adds a `.card.trace` under the guide when `code` is set; place one by hand in `.rail` to control its position. Numbers and common keywords are tinted. Keep it to 5–10 lines of at most ~42 characters: longer lines scroll sideways, and every extra line takes height from the guide card. The panel scrolls the active line into view.

## Layout helpers

Defined before `SCENES`, usable in scene data.

| helper | returns | notes |
|---|---|---|
| `AT(col, row)` | `[x, y]` | screen-style placement: `col` steps 14 px right, `row` steps 7 px down. Use it for graphs |
| `TREE(levelOrder, { prefix: 'n', at: [col, row], gap: 4, dy: 9, tone, arrow, noteAt })` | `{ nodes, links }` | LeetCode-style level order with `null` gaps. Node ids are `prefix + value` (values must be unique), link ids `n8-n3` |
| `CHAIN(values, { prefix: 'l', at: [col, row], gap: 8, size, tone, noteAt })` | `{ nodes, links }` | a horizontal linked list; ids `l0…`, links `l0-l1` |

Spread the result into the scene: `nodes: { ...t.nodes, q: {…} }`, `links: t.links`.

## Spacing

- Arrays: up to ~10 cells at `cell: 2` fit the stage; use `axis: 'y'` for bucket columns.
- Graph dots: at least 8 `col` or 9 `row` apart in `AT` units.
- Keep notes on structures to `noteAt: 'bottom'` or a side when pointers are in use — pointers own the space above.

## Checks before shipping a DSA scene

- `vals` after a `swap` match the swapped order.
- Every `ptrs`, `marks` and `set` key is inside `cap` / the grid.
- Step 1 has no pointers and no marks, so the reader sees the raw input first.
- The recap step clears pointers (`ptrs: { a: null }`) and leaves only the result marks.
- Run `python3 scripts/build_dsa_demo.py` after engine changes and step every demo in light and dark.
