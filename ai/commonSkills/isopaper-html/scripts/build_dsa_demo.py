import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / 'assets/template.html'
DEMO = ROOT / 'assets/dsa-demo.js'
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path.cwd() / '.agent/artifacts/isopaper-dsa-demo.html'
ICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
        "%3Crect x='2' y='14' width='9' height='9' rx='2' fill='%23f7f0e7' stroke='%231d1b18' stroke-width='2'/%3E"
        "%3Crect x='11.5' y='14' width='9' height='9' rx='2' fill='%23d1e9c2' stroke='%231d1b18' stroke-width='2'/%3E"
        "%3Crect x='21' y='14' width='9' height='9' rx='2' fill='%23f7f0e7' stroke='%231d1b18' stroke-width='2'/%3E"
        "%3Cpath d='M16 3v7M12.5 7 16 10.5 19.5 7' fill='none' stroke='%231d1b18' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")


def swap(s, a, b):
    if s.count(a) != 1:
        raise SystemExit(f'expected 1 match, found {s.count(a)}: {a[:70]!r}')
    return s.replace(a, b)


def swap_re(s, pattern, b):
    s2, n = re.subn(pattern, lambda _: b, s, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f'pattern not found: {pattern[:70]!r}')
    return s2


s = TEMPLATE.read_text()
s = swap(s, '<html lang="en">', '<html lang="vi">')
s = swap(s, '<title>TITLE — replace me</title>', '<title>DSA &amp; Algo Lab — demo isopaper</title>')
s = swap_re(s, r'<link rel="icon" type="image/svg\+xml" href="[^"]*">', f'<link rel="icon" type="image/svg+xml" href="{ICON}">')
s = swap(s, '<span class="brand__name">Course <span>Title</span></span>', '<span class="brand__name">DSA <span>Lab</span></span>')
s = swap_re(s, r'<nav class="nav" aria-label="Areas">.*?</nav>',
            '<nav class="nav" aria-label="Khu vực"><button class="nav__item" type="button" data-area="learn" data-go="twoptr">'
            '<svg class="i" width="15" height="15" viewBox="0 0 16 16"><path d="M2 3.2Q5 2 8 3.6Q11 2 14 3.2V13Q11 11.8 8 13.4Q5 11.8 2 13Z M8 3.6V13.4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>Lab</button></nav>')
s = swap(s, '<span class="search__hint">Search lessons &amp; steps…</span>', '<span class="search__hint">Tìm bài, bước, khái niệm…</span>')
s = swap(s, 'placeholder="Search lessons, steps, ideas…"', 'placeholder="Tìm bài học, bước, khái niệm…"')
s = swap(s, 'Course<span class="tree-root__meta">3 pages</span>', 'DSA Lab<span class="tree-root__meta" id="courseCount"></span>')
s = swap_re(s, r'<nav class="course">.*?</nav>', '<nav class="course" id="courseNav"></nav>')
s = swap(s, '<span class="eyebrow">Progress</span>', '<span class="eyebrow">Tiến độ</span>')
s = swap_re(s, r'<main class="app-main" id="main">.*?</main>', '<main class="app-main" id="main"></main>')
s = swap_re(s, r'const WORDS = \{.*?\n(?=;\(\(\) => \{\n  const root)', DEMO.read_text() + '\n')

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(s)
print(f'{OUT} · {len(s) // 1024} KB')
