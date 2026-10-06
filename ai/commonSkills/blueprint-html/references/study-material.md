# Study Material

Read this for revision pages, course notes, worked solutions and practice exams. These four blocks sit on top of the standard set; everything else on the page is the normal house style.

## Problem-type card

One card per lesson or per problem type. The reader scans the rust kicker to find the type they are stuck on, so the kicker names the type and its exam frequency, not a mood.

```html
<div class="card" id="d1">
  <div class="card-top">
    <span class="dang">TYPE 1 — APPEARS IN ALMOST EVERY PAPER</span>
    <button class="done-btn" type="button" data-done="d1">○ GOT IT</button>
  </div>
  <h3>What the reader will be asked to do</h3>
  <p class="flag">How to recognise it: the wording or shape that identifies this type in a question.</p>
  <ol class="steps">…fixed procedure…</ol>
  <h4>Worked example</h4>
  <pre class="mat">…</pre>
  <div class="flag ok"><span class="lab">Check</span>…the cheap re-check…</div>
  <div class="flag hot"><span class="lab">Trap</span>…where marks are lost…</div>
  <details class="ex">…practice item…</details>
</div>
```

The card `id` is what the sidebar's `data-go` points at, so keep the two in step. Order the inner blocks recognise → procedure → worked example → check → trap → practice; a reader who already knows the type stops after the first line, and that only works if the identification comes first.

## Exam paper

Reproduce the paper's own framing — institution, time limit, marks per question — because part of revision is getting used to the real layout.

```html
<div class="paper" id="paperA">
  <div class="paper-head">
    <p class="sch">INSTITUTION · DEPARTMENT</p>
    <p class="ttl">Paper title</p>
    <p class="sub">TERM · 90 MINUTES · CLOSED BOOK</p>
  </div>
  <div class="paper-body">
    <div class="q">
      <div class="q-head"><span class="q-no">Question 1.</span><span class="q-pt">2.0 marks</span></div>
      <div class="q-body">
        <p>…the question as printed…</p>
        <div class="ans"><span class="lab">Solution</span>…full working…</div>
      </div>
    </div>
  </div>
</div>
```

`.ttl` is the one place inside a paper that takes `--hand`. A paper the reader should attempt first wraps each `.ans` in `details.ex` instead, so the solution is one click away but not on screen.

## Hidden solution

```html
<details class="ex">
  <summary><span class="exno">P 1.2</span><span>The practice question, stated in full.</span></summary>
  <div class="sol">…the solution…</div>
</details>
```

`summary::after` carries the affordance — label it in the page's language and flip it to a close label under `[open]`. Keep the question itself visible in the summary: a reader deciding whether to attempt it needs to see what it asks.

## Derivation slabs

`pre.mat` holds anything where columns must line up — matrices, long divisions, aligned equations. Draw matrices with box characters and put the operation on the arrow, so the reader can follow what changed between steps:

```
⎡ 1   2  -3 │ 0 ⎤  d2 - 2d1   ⎡ 1   2  -3 │ 0 ⎤
⎢ 2   1   4 │ 0 ⎥ ──────────> ⎢ 0  -3  10 │ 0 ⎥
⎣ 1  -1   2 │ 0 ⎦             ⎣ 1  -1   2 │ 0 ⎦
```

This beats a math-typesetting library here: it needs no remote script, it survives copy-paste into notes, and the alignment is exactly what the reader must reproduce on paper. `.eq` is its one-line counterpart for a result worth isolating — rust border, centred, horizontally scrollable.

## Progress wiring

When the page has a sidebar and the reader works through it over days, the `.done-btn` toggles are the page's main state. Persist them and reflect them in three places at once, or the sidebar starts lying:

- `.nav-progress` — `completed/total` plus `--progress` on the fill
- `.nav-child.done` — `·` becomes `✓`
- `.nav-count` — per-group `2/4`, `.hot` while partial, `.ok` when the group is finished

Keep the whole thing in one `localStorage` key and re-render from a single function, so a toggle, a page load and a group completion all go through the same path. Wrap reads and writes in `try/catch` — the page must still work when storage is blocked, just without memory. Tell the reader once, in `.foot`, that progress is local to their browser; otherwise they will expect it on their phone.
