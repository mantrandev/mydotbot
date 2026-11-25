const WORDS = {
  step: 'Bước', of: '/', next: 'Tiếp', back: 'Lùi', nextView: 'Bài sau', finish: 'Hết bài demo',
  changed: 'Thay đổi', inLesson: 'Trong bài này', replay: 'Phát lại', pause: 'Dừng', play: 'Chạy',
  expand: 'Phóng to', collapse: 'Đóng', hintStep: 'bước', hintReplay: 'phát lại', hintPause: 'dừng',
  done: 'Xong bài! Đã lưu tiến độ', steps: 'bước', pages: 'bài', none: 'Không tìm thấy', code: 'Code'
}
const SCENES = {}
const MODULES = [
  { title: '01. Mảng & con trỏ', folder: 'sand' },
  { title: '02. Stack, queue, đồ thị', folder: 'violet' },
  { title: '03. Cây, băm, DP', folder: 'green' }
]
const LESSONS = []
const LESSON = c => { LESSONS.push(c) }
const RECAP = ['Tóm tắt', 'ink']

LESSON({
  id: 'twoptr', mod: 1, title: 'Two pointers', minutes: 6, level: 'Cơ bản',
  subtitle: 'Tìm hai số có tổng bằng target trong mảng đã sắp xếp, mỗi bước loại hẳn một phần tử.',
  legend: [['cmp', 'đang xét'], ['cur', 'đáp án'], ['dim', 'đã loại']],
  goals: [['Đặt l ở đầu, r ở cuối', 2], ['Tổng lớn → giảm r, tổng nhỏ → tăng l', 4], ['Vì sao chỉ cần O(n)', 6]],
  scene: {
    lang: 'python',
    code: [
      'def two_sum(nums, target):',
      '    l, r = 0, len(nums) - 1',
      '    while l < r:',
      '        s = nums[l] + nums[r]',
      '        if s == target: return [l, r]',
      '        if s < target: l += 1',
      '        else: r -= 1'
    ],
    chips: [{ id: 'sum', label: 'nums[l] + nums[r]' }, { id: 'target', label: 'Target' }, { id: 'drop', label: 'Đã loại' }],
    nodes: { a: { kind: 'array', at: [0, 0], values: [1, 3, 4, 6, 8, 11, 15], label: 'nums · đã sắp xếp' } },
    steps: [
      {
        short: 'Bài toán', title: 'Tìm hai số có tổng 14', chapter: ['Bài toán', 'red'], show: ['a'], line: 1,
        body: '<p>Mảng 7 phần tử đã sắp xếp. Thử mọi cặp tốn <b>21 phép cộng</b> — O(n²).</p><p>Mảng đã sắp xếp cho ta một manh mối: biết tổng lớn hay nhỏ là biết nên dịch đầu nào.</p>',
        chips: { target: ['14'], drop: ['0 / 7'] }
      },
      {
        short: 'Hai đầu', title: 'Đặt l ở đầu, r ở cuối', chapter: ['Ý tưởng', 'violet'], line: 2,
        body: '<p><span class="term">Con trỏ</span> ở đây chỉ là một chỉ số trong mảng. <code>l</code> giữ số nhỏ nhất, <code>r</code> giữ số lớn nhất còn lại.</p>',
        ptrs: { a: { l: 0, r: 6 } }, marks: { a: { 0: 'cmp', 6: 'cmp' } }
      },
      {
        short: '16 > 14', title: '1 + 15 = 16, quá lớn → r giảm', line: [4, 7],
        body: '<p>15 cộng với số <b>nhỏ nhất</b> còn đã vượt 14, nên 15 không thể nằm trong đáp án. Loại 15, dịch <code>r</code> sang trái.</p>',
        chips: { sum: ['16', 'bad'] }, ptrs: { a: { r: 5 } }, marks: { a: { 6: 'dim', 5: 'cmp' } }
      },
      {
        short: '12 < 14', title: '1 + 11 = 12, quá nhỏ → l tăng', line: [4, 6],
        body: '<p>1 cộng với số <b>lớn nhất</b> còn vẫn thiếu, nên 1 cũng bị loại. Dịch <code>l</code> sang phải.</p>',
        chips: { sum: ['12', 'warn'], drop: ['1 / 7'] }, ptrs: { a: { l: 1 } }, marks: { a: { 0: 'dim', 1: 'cmp' } }
      },
      {
        short: 'Trúng', title: '3 + 11 = 14 — trả về [1, 5]', chapter: ['Kết quả', 'green'], line: 5,
        body: '<p>Ba phép cộng thay vì 21. Mỗi bước loại đúng một phần tử, nên tối đa n − 1 bước.</p>',
        chips: { sum: ['14', 'good'], drop: ['2 / 7', 'good'] }, marks: { a: { 1: 'cur', 5: 'cur' } }, focus: ['a']
      },
      {
        short: 'Tóm tắt', title: 'Two pointers: O(n) thời gian, O(1) bộ nhớ', chapter: RECAP,
        body: '<ul class="takeaways"><li>Cần mảng đã sắp xếp để biết dịch đầu nào.</li><li>Mỗi bước loại một phần tử → O(n).</li><li>Không cần hash map → O(1) bộ nhớ.</li></ul>',
        callout: { kind: 'next', title: 'Tiếp theo', text: 'Binary search cũng dùng con trỏ, nhưng mỗi bước loại <b>một nửa</b> mảng.' }
      }
    ]
  }
})

LESSON({
  id: 'bsearch', mod: 1, title: 'Binary search', minutes: 6, level: 'Cơ bản',
  subtitle: 'Mỗi lần so sánh bỏ đi một nửa mảng — 1 tỷ phần tử chỉ cần 30 lần.',
  legend: [['cmp', 'a[mid]'], ['cur', 'tìm thấy'], ['dim', 'đã bỏ']],
  goals: [['lo, mid, hi nghĩa là gì', 2], ['Bỏ nửa nào và vì sao', 3], ['Đếm số lần so sánh: log₂ n', 5]],
  scene: {
    lang: 'python',
    code: [
      'def search(a, x):',
      '    lo, hi = 0, len(a) - 1',
      '    while lo <= hi:',
      '        mid = (lo + hi) // 2',
      '        if a[mid] == x: return mid',
      '        if a[mid] < x: lo = mid + 1',
      '        else: hi = mid - 1',
      '    return -1'
    ],
    chips: [{ id: 'range', label: 'Còn lại' }, { id: 'cmp', label: 'Số lần so sánh' }],
    nodes: { a: { kind: 'array', at: [0, 0], values: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], label: 'a · tìm x = 23' } },
    steps: [
      {
        short: 'Bài toán', title: 'Tìm 23 trong 10 số đã sắp xếp', chapter: ['Bài toán', 'red'], show: ['a'], line: 1,
        body: '<p>Duyệt từ trái sang cần 6 lần so sánh, trường hợp xấu là 10. Ta làm tốt hơn nhờ thứ tự.</p>',
        chips: { range: ['10 phần tử'], cmp: ['0'] }
      },
      {
        short: 'mid = 4', title: 'a[4] = 16 < 23 → bỏ nửa trái', chapter: ['Vòng 1', 'blue'], line: [4, 6],
        body: '<p><code>lo</code>, <code>hi</code> là hai đầu vùng còn tìm. <code>mid</code> là điểm giữa. 16 nhỏ hơn 23, nên mọi số bên trái 16 cũng nhỏ hơn — bỏ hết.</p>',
        ptrs: { a: { lo: 0, mid: 4, hi: 9 } }, marks: { a: { 4: 'cmp' } }, chips: { range: ['10 phần tử'], cmp: ['1'] }
      },
      {
        short: 'mid = 7', title: 'a[7] = 56 > 23 → bỏ nửa phải', chapter: ['Vòng 2', 'blue'], line: [4, 7],
        body: '<p><code>lo</code> nhảy lên 5. Vùng còn 5 phần tử. Điểm giữa mới là 56 — quá lớn, bỏ từ 56 trở đi.</p>',
        ptrs: { a: { lo: 5, mid: 7 } }, marks: { a: { '0..4': 'dim', 7: 'cmp' } }, chips: { range: ['5 phần tử', 'warn'], cmp: ['2'] }
      },
      {
        short: 'mid = 5', title: 'a[5] = 23 — tìm thấy', chapter: ['Vòng 3', 'green'], line: 5,
        body: '<p><code>hi</code> lùi về 6, <code>mid</code> = 5 trùng với <code>lo</code>. Ba lần so sánh thay vì sáu.</p>',
        ptrs: { a: { hi: 6, mid: 5 } }, marks: { a: { '7..9': 'dim', 5: 'cur' } }, chips: { range: ['2 phần tử', 'good'], cmp: ['3', 'good'] }
      },
      {
        short: 'Tóm tắt', title: 'Binary search: O(log n)', chapter: RECAP,
        body: '<table class="compare numbers"><tr><th>n</th><th>Duyệt</th><th>Binary</th></tr><tr><td>1 000</td><td>1 000</td><td>10</td></tr><tr><td>1 000 000</td><td>1 000 000</td><td>20</td></tr><tr><td>10⁹</td><td>10⁹</td><td>30</td></tr></table><ul class="takeaways"><li>Điều kiện: mảng đã sắp xếp, truy cập ngẫu nhiên O(1).</li><li><code>lo = mid + 1</code> và <code>hi = mid − 1</code> tránh lặp vô hạn.</li></ul>'
      }
    ]
  }
})

LESSON({
  id: 'bubble', mod: 1, title: 'Bubble sort — một lượt', minutes: 5, level: 'Cơ bản',
  subtitle: 'So sánh từng cặp kề nhau và đổi chỗ; số lớn nhất nổi dần về cuối.',
  legend: [['cmp', 'so sánh'], ['swap', 'đổi chỗ'], ['done', 'đã đúng chỗ']],
  goals: [['So sánh hai phần tử kề nhau', 2], ['Đổi chỗ khi sai thứ tự', 3], ['Sau một lượt, số lớn nhất về cuối', 6]],
  scene: {
    lang: 'python',
    code: [
      'for i in range(n):',
      '    for j in range(n - 1 - i):',
      '        if a[j] > a[j + 1]:',
      '            a[j], a[j + 1] = a[j + 1], a[j]'
    ],
    chips: [{ id: 'cmp', label: 'So sánh' }, { id: 'swap', label: 'Đổi chỗ' }],
    nodes: { a: { kind: 'array', at: [0, 0], cell: 2.4, values: [5, 1, 4, 2, 8], label: 'a' } },
    steps: [
      {
        short: 'Bài toán', title: 'Sắp xếp [5, 1, 4, 2, 8]', chapter: ['Bài toán', 'red'], show: ['a'], line: 1,
        body: '<p>Lượt đầu tiên: đi từ trái sang, sửa mọi cặp kề nhau bị ngược.</p>', chips: { cmp: ['0'], swap: ['0'] }
      },
      {
        short: 'j = 0', title: '5 > 1 — sai thứ tự', line: 3,
        body: '<p>So sánh <code>a[0]</code> và <code>a[1]</code>. Số lớn đứng trước, cần đổi.</p>',
        ptrs: { a: { j: 0 } }, marks: { a: { 0: 'cmp', 1: 'cmp' } }, chips: { cmp: ['1'] }
      },
      {
        short: 'Đổi', title: 'Đổi chỗ 5 và 1', line: 4,
        body: '<p>Hai ô nhảy qua nhau. 5 đi tiếp sang phải ở bước sau.</p>',
        vals: { a: [1, 5, 4, 2, 8] }, swap: { a: [0, 1] }, marks: { a: { 0: 'swap', 1: 'swap' } }, chips: { swap: ['1'] }
      },
      {
        short: 'j = 1', title: '5 > 4 → đổi', line: [3, 4],
        body: '<p>5 tiếp tục bị đẩy sang phải.</p>',
        vals: { a: [1, 4, 5, 2, 8] }, swap: { a: [1, 2] }, ptrs: { a: { j: 1 } }, marks: { a: { '*': null, 1: 'swap', 2: 'swap' } }, chips: { cmp: ['2'], swap: ['2'] }
      },
      {
        short: 'j = 2', title: '5 > 2 → đổi', line: [3, 4],
        body: '<p>Một lần nữa. Mỗi lần đổi chỉ sửa một cặp, nên bubble sort chậm.</p>',
        vals: { a: [1, 4, 2, 5, 8] }, swap: { a: [2, 3] }, ptrs: { a: { j: 2 } }, marks: { a: { '*': null, 2: 'swap', 3: 'swap' } }, chips: { cmp: ['3'], swap: ['3', 'warn'] }
      },
      {
        short: 'j = 3', title: '5 < 8 — giữ nguyên, 8 đã đúng chỗ', line: 3,
        body: '<p>Không đổi. Số lớn nhất 8 đã ở cuối và không bao giờ di chuyển nữa — lượt sau chỉ cần xét 4 ô.</p>',
        ptrs: { a: { j: 3 } }, marks: { a: { '*': null, 3: 'cmp', 4: 'done' } }, chips: { cmp: ['4'] }
      },
      {
        short: 'Tóm tắt', title: 'Bubble sort: O(n²) so sánh', chapter: RECAP,
        body: '<ul class="takeaways"><li>Lượt i đưa số lớn thứ i về đúng chỗ.</li><li>n lượt × n so sánh → O(n²).</li><li>Một lượt không có đổi chỗ nào → mảng đã sắp xếp, dừng sớm.</li></ul>',
        ptrs: { a: null }, marks: { a: { '*': null, 4: 'done' } }
      }
    ]
  }
})

LESSON({
  id: 'stack', mod: 2, title: 'Stack — ngoặc hợp lệ', minutes: 6, level: 'Cơ bản',
  subtitle: 'Ngoặc mở vào stack, ngoặc đóng phải khớp với đỉnh stack.',
  legend: [['push', 'push / pop'], ['cur', 'ký tự đang xét'], ['done', 'đã khớp']],
  goals: [['Push ngoặc mở', 2], ['Pop khi gặp ngoặc đóng', 4], ['Stack rỗng ở cuối = hợp lệ', 7]],
  scene: {
    lang: 'python',
    code: [
      'def valid(s):',
      '    st = []',
      '    for ch in s:',
      "        if ch in '([{': st.append(ch)",
      '        elif not st or st.pop() != pair[ch]:',
      '            return False',
      '    return not st'
    ],
    chips: [{ id: 'top', label: 'Đỉnh stack' }, { id: 'res', label: 'Kết quả' }],
    nodes: {
      s: { kind: 'array', at: [-4, 6], values: ['(', '[', ']', '{', '}', ')'], label: 's' },
      st: { kind: 'stack', at: [9, -5], cap: 4, values: [], label: 'stack' }
    },
    links: {
      p0: { from: 's.0', to: 'st', style: 'hidden' },
      p1: { from: 's.1', to: 'st', style: 'hidden' },
      p2: { from: 's.2', to: 'st', style: 'hidden' },
      p3: { from: 's.3', to: 'st', style: 'hidden' },
      p4: { from: 's.4', to: 'st', style: 'hidden' },
      p5: { from: 's.5', to: 'st', style: 'hidden' }
    },
    steps: [
      {
        short: 'Bài toán', title: '"([]{})" có hợp lệ không?', chapter: ['Bài toán', 'red'], show: ['s', 'st'], line: 1,
        body: '<p>Mỗi ngoặc đóng phải khớp với ngoặc mở <b>gần nhất chưa đóng</b>. "Gần nhất" chính là đỉnh của một <span class="term">stack</span> — cấu trúc vào sau, ra trước (LIFO).</p>',
        chips: { top: ['—'], res: ['—'] }
      },
      {
        short: "'('", title: "Gặp '(' → push", line: 4,
        body: '<p>Ngoặc mở chưa có gì để khớp, cất vào stack chờ.</p>',
        ptrs: { s: { i: 0 } }, marks: { s: { 0: 'cur' } }, vals: { st: ['('] }, flows: [{ on: 'p0', kind: 'push' }], chips: { top: ['('] }
      },
      {
        short: "'['", title: "Gặp '[' → push", line: 4,
        body: "<p>'[' nằm trên '('. Nó phải được đóng trước.</p>",
        ptrs: { s: { i: 1 } }, marks: { s: { 0: null, 1: 'cur' } }, vals: { st: ['(', '['] }, flows: [{ on: 'p1', kind: 'push' }], chips: { top: ['['] }
      },
      {
        short: "']'", title: "Gặp ']' → pop '[' — khớp", line: 5,
        body: "<p>Lấy đỉnh ra so: '[' khớp ']'. Cặp này xong.</p>",
        ptrs: { s: { i: 2 } }, marks: { s: { 1: 'done', 2: 'done' } }, vals: { st: ['('] }, flows: [{ on: 'p2', kind: 'res', back: true }], chips: { top: ['('] }
      },
      {
        short: "'{'", title: "Gặp '{' → push", line: 4,
        body: "<p>Stack lại có hai phần tử: '(' ở đáy, '{' ở đỉnh.</p>",
        ptrs: { s: { i: 3 } }, marks: { s: { 3: 'cur' } }, vals: { st: ['(', '{'] }, flows: [{ on: 'p3', kind: 'push' }], chips: { top: ['{'] }
      },
      {
        short: "'}'", title: "Gặp '}' → pop '{' — khớp", line: 5,
        body: "<p>Khớp tiếp. Chỉ còn '(' chờ.</p>",
        ptrs: { s: { i: 4 } }, marks: { s: { 3: 'done', 4: 'done' } }, vals: { st: ['('] }, flows: [{ on: 'p4', kind: 'res', back: true }], chips: { top: ['('] }
      },
      {
        short: "')'", title: "Gặp ')' → pop '(' — stack rỗng", chapter: ['Kết quả', 'green'], line: 7,
        body: '<p>Hết chuỗi và stack rỗng: mọi ngoặc mở đều đã được đóng đúng thứ tự.</p>',
        ptrs: { s: { i: 5 } }, marks: { s: { 0: 'done', 5: 'done' } }, vals: { st: [] }, flows: [{ on: 'p5', kind: 'res', back: true }], chips: { top: ['rỗng', 'good'], res: ['hợp lệ', 'good'] }
      },
      {
        short: 'Tóm tắt', title: 'Stack: O(n) thời gian, O(n) bộ nhớ', chapter: RECAP,
        body: '<ul class="takeaways"><li>Push và pop ở đỉnh đều O(1).</li><li>Sai khi: pop lúc stack rỗng, đỉnh không khớp, hoặc stack còn dư cuối chuỗi.</li></ul>',
        callout: { kind: 'tip', title: 'Dùng ở đâu', text: 'Undo, gọi hàm đệ quy (call stack), duyệt DFS, tính biểu thức.' },
        ptrs: { s: null }
      }
    ]
  }
})

LESSON({
  id: 'bfs', mod: 2, title: 'BFS bằng hàng đợi', minutes: 8, level: 'Trung bình',
  subtitle: 'Duyệt đồ thị theo từng lớp: đỉnh nào vào hàng đợi trước thì được thăm trước.',
  legend: [['win', 'trong hàng đợi'], ['cur', 'đang thăm'], ['done', 'đã thăm'], ['ping', 'khám phá'], ['kill', 'đã thấy rồi']],
  goals: [['Hàng đợi FIFO giữ biên đang mở', 2], ['Đánh dấu seen khi enqueue', 3], ['Thứ tự BFS theo lớp', 6], ['Độ phức tạp O(V + E)', 7]],
  scene: {
    lang: 'python',
    code: [
      'q = deque([start]); seen = {start}',
      'while q:',
      '    u = q.popleft()',
      '    for v in adj[u]:',
      '        if v not in seen:',
      '            seen.add(v); q.append(v)'
    ],
    chips: [{ id: 'q', label: 'Hàng đợi' }, { id: 'seen', label: 'Đã thấy' }],
    nodes: {
      A: { kind: 'dot', at: AT(-12, -6), title: 'A' },
      B: { kind: 'dot', at: AT(-20, 4), title: 'B', noteAt: 'left' },
      C: { kind: 'dot', at: AT(-4, 4), title: 'C', noteAt: 'right' },
      D: { kind: 'dot', at: AT(-24, 14), title: 'D', noteAt: 'left' },
      E: { kind: 'dot', at: AT(-12, 14), title: 'E', noteAt: 'bottom' },
      F: { kind: 'dot', at: AT(0, 14), title: 'F', noteAt: 'right' },
      q: { kind: 'array', at: [13, -3], cap: 6, values: [], index: false, label: 'thứ tự vào hàng đợi' }
    },
    links: {
      ab: { from: 'A', to: 'B', arrow: false, style: 'off' },
      ac: { from: 'A', to: 'C', arrow: false, style: 'off' },
      bd: { from: 'B', to: 'D', arrow: false, style: 'off' },
      be: { from: 'B', to: 'E', arrow: false, style: 'off' },
      ce: { from: 'C', to: 'E', arrow: false, style: 'off' },
      cf: { from: 'C', to: 'F', arrow: false, style: 'off' }
    },
    steps: [
      {
        short: 'Bài toán', title: 'Thăm mọi đỉnh từ A, gần trước xa sau', chapter: ['Bài toán', 'red'], show: ['A', 'B', 'C', 'D', 'E', 'F', 'q'], line: 1,
        body: '<p>6 đỉnh, 6 cạnh. BFS thăm hết các đỉnh cách A một cạnh, rồi mới tới các đỉnh cách hai cạnh.</p>',
        chips: { q: ['[]'], seen: ['0'] }
      },
      {
        short: 'Bắt đầu', title: 'Đưa A vào hàng đợi', line: 1,
        body: '<p><span class="term">Hàng đợi</span> (queue) vào trước ra trước. Nó giữ các đỉnh đã thấy nhưng chưa thăm.</p>',
        vals: { q: ['A'] }, marks: { A: 'win', q: { 0: 'win' } }, ptrs: { q: { head: 0 } }, chips: { q: ['[A]'], seen: ['1'] }
      },
      {
        short: 'Thăm A', title: 'Lấy A ra, đẩy B và C vào', chapter: ['Lớp 1', 'blue'], line: [3, 6],
        body: '<p>Đánh dấu <code>seen</code> ngay lúc đẩy vào, không đợi lúc lấy ra — nếu không, một đỉnh có thể vào hàng đợi hai lần.</p>',
        vals: { q: ['A', 'B', 'C'] }, marks: { A: 'cur', B: 'win', C: 'win', q: { 0: 'cur', 1: 'win', 2: 'win' } },
        linkStyle: { ab: 'solid', ac: 'solid' }, flows: [[{ on: 'ab', kind: 'ping' }, { on: 'ac', kind: 'ping' }]], chips: { q: ['[B, C]'], seen: ['3'] }
      },
      {
        short: 'Thăm B', title: 'Lấy B ra, đẩy D và E vào', chapter: ['Lớp 2', 'violet'], line: [3, 6],
        body: '<p>B là đỉnh vào sớm nhất còn lại. D và E xếp sau C.</p>',
        vals: { q: ['A', 'B', 'C', 'D', 'E'] }, ptrs: { q: { head: 1 } },
        marks: { A: 'done', B: 'cur', D: 'win', E: 'win', q: { 0: 'done', 1: 'cur', 3: 'win', 4: 'win' } },
        linkStyle: { bd: 'solid', be: 'solid' }, flows: [[{ on: 'bd', kind: 'ping' }, { on: 'be', kind: 'ping' }]], chips: { q: ['[C, D, E]'], seen: ['5'] }
      },
      {
        short: 'Thăm C', title: 'Lấy C ra: E đã thấy, chỉ đẩy F', line: [3, 5],
        body: '<p>Cạnh C–E dẫn tới E, nhưng E đã có trong <code>seen</code>. Bỏ qua.</p>',
        vals: { q: ['A', 'B', 'C', 'D', 'E', 'F'] }, ptrs: { q: { head: 2 } },
        marks: { B: 'done', C: 'cur', F: 'win', q: { 1: 'done', 2: 'cur', 5: 'win' } }, notes: { E: ['đã thấy', 'warn'] },
        linkStyle: { cf: 'solid', ce: 'dashed' }, flows: [[{ on: 'ce', kind: 'kill' }, { on: 'cf', kind: 'ping' }]], chips: { q: ['[D, E, F]'], seen: ['6', 'good'] }
      },
      {
        short: 'Lớp cuối', title: 'D, E, F không mở thêm đỉnh nào', chapter: ['Lớp 3', 'green'], line: 2,
        body: '<p>Lấy lần lượt D, E, F ra. Hàng đợi rỗng → dừng. Thứ tự vào hàng đợi chính là thứ tự BFS: <b>A B C D E F</b>.</p>',
        ptrs: { q: null }, notes: { E: null },
        marks: { C: 'done', D: 'done', E: 'done', F: 'done', q: { '0..5': 'done' } }, chips: { q: ['[]', 'good'] }
      },
      {
        short: 'Tóm tắt', title: 'BFS: O(V + E)', chapter: RECAP,
        body: '<ul class="takeaways"><li>Mỗi đỉnh vào và ra hàng đợi đúng một lần → O(V).</li><li>Mỗi cạnh được xét một lần mỗi đầu → O(E).</li><li>Trên đồ thị không trọng số, BFS cho đường đi ngắn nhất.</li></ul>',
        callout: { kind: 'next', title: 'So với DFS', text: 'Thay hàng đợi bằng stack là ra DFS: đi sâu một nhánh trước rồi mới quay lui.' }
      }
    ]
  }
})

LESSON({
  id: 'bst', mod: 3, title: 'Tìm trong cây BST', minutes: 6, level: 'Cơ bản',
  subtitle: 'Mỗi lần so sánh chọn một nhánh và bỏ hẳn nhánh còn lại.',
  legend: [['cur', 'đang xét'], ['done', 'đã đi qua'], ['dim', 'đã bỏ'], ['req', 'đi xuống']],
  goals: [['Tính chất BST: trái < gốc < phải', 1], ['Chọn nhánh theo phép so sánh', 3], ['O(h) và vì sao cây cần cân bằng', 6]],
  scene: (() => {
    const t = TREE([8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13])
    return {
      lang: 'python',
      code: [
        'def search(node, x):',
        '    while node:',
        '        if x == node.val: return node',
        '        if x < node.val: node = node.left',
        '        else: node = node.right',
        '    return None'
      ],
      chips: [{ id: 'x', label: 'Tìm' }, { id: 'cmp', label: 'Số lần so sánh' }],
      nodes: t.nodes,
      links: t.links,
      steps: [
        {
          short: 'Bài toán', title: 'Tìm 7 trong cây 9 nút', chapter: ['Bài toán', 'red'], show: Object.keys(t.nodes), line: 1,
          body: '<p><span class="term">BST</span> (cây nhị phân tìm kiếm): mọi nút bên trái nhỏ hơn gốc, mọi nút bên phải lớn hơn.</p>',
          chips: { x: ['7'], cmp: ['0'] }
        },
        {
          short: 'Gốc 8', title: '7 < 8 → sang trái', chapter: ['So sánh 1', 'blue'], line: [3, 4],
          body: '<p>Cả nhánh phải đều lớn hơn 8, nên lớn hơn 7. Bỏ 3 nút một lần.</p>',
          marks: { n8: 'cur', n10: 'dim', n14: 'dim', n13: 'dim' }, notes: { n8: ['7 < 8', 'info'] }, chips: { cmp: ['1'] }
        },
        {
          short: 'Nút 3', title: '7 > 3 → sang phải', chapter: ['So sánh 2', 'blue'], line: [3, 5],
          body: '<p>Đi xuống theo cạnh trái. 7 lớn hơn 3 nên bỏ nút 1.</p>',
          marks: { n8: 'done', n3: 'cur', n1: 'dim' }, notes: { n8: null, n3: ['7 > 3', 'info'] }, flows: [{ on: 'n8-n3' }], chips: { cmp: ['2'] }
        },
        {
          short: 'Nút 6', title: '7 > 6 → sang phải', chapter: ['So sánh 3', 'blue'], line: [3, 5],
          body: '<p>Bỏ nút 4. Chỉ còn một ứng viên.</p>',
          marks: { n3: 'done', n6: 'cur', n4: 'dim' }, notes: { n3: null, n6: ['7 > 6', 'info'] }, flows: [{ on: 'n3-n6' }], chips: { cmp: ['3'] }
        },
        {
          short: 'Nút 7', title: 'Tìm thấy 7', chapter: ['Kết quả', 'green'], line: 3,
          body: '<p>Bốn lần so sánh — đúng bằng độ sâu của nút 7 cộng một.</p>',
          marks: { n6: 'done', n7: 'cur' }, notes: { n6: null, n7: ['tìm thấy', 'ok'] }, flows: [{ on: 'n6-n7', kind: 'res' }], chips: { cmp: ['4', 'good'] }
        },
        {
          short: 'Tóm tắt', title: 'Tìm trong BST: O(h)', chapter: RECAP,
          body: '<ul class="takeaways"><li>h là chiều cao cây.</li><li>Cây cân bằng: h ≈ log₂ n.</li><li>Chèn dãy đã sắp xếp → cây thành danh sách, h = n.</li></ul>',
          callout: { kind: 'warn', title: 'Cạm bẫy', text: 'BST không tự cân bằng. Dùng AVL hoặc red-black tree khi dữ liệu có thể đến theo thứ tự.' }
        }
      ]
    }
  })()
})

LESSON({
  id: 'hash', mod: 3, title: 'Hash table — chaining', minutes: 7, level: 'Trung bình',
  subtitle: 'Hàm băm chọn bucket; các key va chạm nối thành danh sách trong bucket đó.',
  legend: [['req', 'hash(key)'], ['cur', 'bucket đang dùng'], ['bad', 'va chạm']],
  goals: [['hash(key) % m chọn bucket', 2], ['Va chạm nối thành chuỗi', 4], ['Load factor và khi nào resize', 7]],
  scene: {
    lang: 'python',
    code: [
      'def put(key, val):',
      '    i = hash(key) % 5',
      '    for node in table[i]:',
      '        if node.key == key: node.val = val; return',
      '    table[i].append(Node(key, val))'
    ],
    chips: [{ id: 'n', label: 'Số key' }, { id: 'lf', label: 'Load factor' }],
    nodes: {
      h: { kind: 'box', at: [-9, 0], size: [3, 3, 2], tone: 'yellow', title: 'hash', sub: '% 5' },
      b: { kind: 'array', at: [0, 0], axis: 'y', cell: 2.4, values: ['0', '1', '2', '3', '4'], index: false, tone: 'blue', label: 'table' },
      cat: { kind: 'box', at: [6.5, 0], size: [2.4, 2.4, 1.2], title: 'cat', noteAt: 'right' },
      ant: { kind: 'box', at: [12, 0], size: [2.4, 2.4, 1.2], title: 'ant', noteAt: 'right' },
      dog: { kind: 'box', at: [6.5, -4.8], size: [2.4, 2.4, 1.2], title: 'dog' },
      emu: { kind: 'box', at: [6.5, 4.8], size: [2.4, 2.4, 1.2], title: 'emu', noteAt: 'right' }
    },
    links: {
      h0: { from: 'h', to: 'b.0', style: 'hidden' },
      h2: { from: 'h', to: 'b.2', style: 'hidden' },
      h4: { from: 'h', to: 'b.4', style: 'hidden' },
      b2: { from: 'b.2', to: 'cat' },
      ca: { from: 'cat', to: 'ant' },
      b0: { from: 'b.0', to: 'dog' },
      b4: { from: 'b.4', to: 'emu' }
    },
    steps: [
      {
        short: 'Bài toán', title: 'Lưu key vào 5 bucket', chapter: ['Bài toán', 'red'], show: ['h', 'b'], line: 1,
        body: '<p>Mảng 5 ô. Muốn tìm một key trong O(1), ta cần biết ngay nó nằm ở ô nào.</p>',
        chips: { n: ['0'], lf: ['0.0'] }
      },
      {
        short: 'cat → 2', title: 'hash("cat") % 5 = 2', chapter: ['put', 'blue'], line: [2, 5],
        body: '<p><span class="term">Hàm băm</span> biến key thành một số; lấy dư cho 5 ra chỉ số bucket.</p>',
        show: ['cat'], marks: { b: { 2: 'cur' } }, notes: { h: ['cat → 2', 'info'] }, flows: [{ on: 'h2' }, { on: 'b2' }], chips: { n: ['1'], lf: ['0.2', 'good'] }
      },
      {
        short: 'dog → 0', title: 'hash("dog") % 5 = 0', line: [2, 5],
        body: '<p>Bucket trống, nối thẳng vào.</p>',
        show: ['dog'], marks: { b: { '*': null, 0: 'cur' } }, notes: { h: ['dog → 0', 'info'] }, flows: [{ on: 'h0' }, { on: 'b0' }], chips: { n: ['2'], lf: ['0.4', 'good'] }
      },
      {
        short: 'ant → 2', title: 'hash("ant") % 5 = 2 — va chạm', chapter: ['Va chạm', 'amber'], line: [2, 5],
        body: '<p>Bucket 2 đã có cat. <span class="term">Chaining</span>: nối ant vào cuối chuỗi của bucket đó thay vì ghi đè.</p>',
        show: ['ant'], marks: { b: { '*': null, 2: 'bad' } }, notes: { h: ['ant → 2', 'warn'], ant: ['va chạm', 'warn'] },
        flows: [{ on: 'h2' }, { on: 'b2' }, { on: 'ca' }], chips: { n: ['3'], lf: ['0.6', 'warn'] }
      },
      {
        short: 'emu → 4', title: 'hash("emu") % 5 = 4', line: [2, 5],
        body: '<p>Bucket 4 trống. Bảng có 4 key trên 5 bucket.</p>',
        show: ['emu'], marks: { b: { '*': null, 4: 'cur' } }, notes: { h: ['emu → 4', 'info'], ant: null }, flows: [{ on: 'h4' }, { on: 'b4' }], chips: { n: ['4'], lf: ['0.8', 'bad'] }
      },
      {
        short: 'get ant', title: 'Tìm "ant": bucket 2, so 2 key', chapter: ['get', 'green'], line: [2, 4],
        body: '<p>Băm ra bucket 2, rồi duyệt chuỗi: cat ≠ ant, ant = ant. Chuỗi càng dài, tìm càng chậm.</p>',
        marks: { b: { '*': null, 2: 'cur' }, cat: 'cmp', ant: 'cur' }, notes: { h: ['ant → 2', 'info'], ant: ['tìm thấy', 'ok'] },
        flows: [{ on: 'h2' }, { on: 'b2' }, { on: 'ca', kind: 'res' }]
      },
      {
        short: 'Tóm tắt', title: 'Trung bình O(1 + α)', chapter: RECAP,
        body: '<ul class="takeaways"><li>α = số key / số bucket (<span class="term">load factor</span>).</li><li>α vượt ~0.75 → gấp đôi số bucket và băm lại.</li><li>Hàm băm tệ dồn mọi key vào một bucket → O(n).</li></ul>',
        marks: { b: null, cat: null, ant: null }, notes: { h: null, ant: null }
      }
    ]
  }
})

LESSON({
  id: 'dp', mod: 3, title: 'DP đếm đường đi', minutes: 7, level: 'Trung bình',
  subtitle: 'Mỗi ô bằng tổng ô trên và ô trái; điền bảng một lần thay vì thử mọi đường.',
  legend: [['win', 'biên = 1'], ['cmp', 'ô dùng lại'], ['cur', 'ô đang tính']],
  goals: [['Định nghĩa dp[r][c]', 2], ['Công thức truy hồi', 3], ['Điền bảng: O(m·n)', 6]],
  scene: {
    lang: 'python',
    code: [
      'dp = [[1] * n for _ in range(m)]',
      'for r in range(1, m):',
      '    for c in range(1, n):',
      '        dp[r][c] = dp[r - 1][c] + dp[r][c - 1]',
      'return dp[m - 1][n - 1]'
    ],
    chips: [{ id: 'ans', label: 'Số đường đi' }, { id: 'cells', label: 'Ô đã tính' }],
    nodes: {
      g: { kind: 'grid', at: [0, 0], cell: 2.6, values: [['', '', '', ''], ['', '', '', ''], ['', '', '', '']], rows: ['r0', 'r1', 'r2'], cols: ['c0', 'c1', 'c2', 'c3'], label: 'dp · 3 × 4' }
    },
    steps: [
      {
        short: 'Bài toán', title: 'Từ (0,0) đến (2,3), chỉ đi phải hoặc xuống', chapter: ['Bài toán', 'red'], show: ['g'], line: 1,
        body: '<p>Có bao nhiêu đường? Liệt kê từng đường tăng theo cấp số mũ khi lưới lớn.</p>',
        chips: { ans: ['—'], cells: ['0 / 12'] }
      },
      {
        short: 'Biên', title: 'Hàng 0 và cột 0 đều bằng 1', chapter: ['Khởi tạo', 'blue'], line: 1,
        body: '<p><code>dp[r][c]</code> = số đường từ (0,0) tới ô (r,c). Ô trên biên chỉ có một đường: đi thẳng.</p>',
        set: { g: { '0,0': 1, '0,1': 1, '0,2': 1, '0,3': 1, '1,0': 1, '2,0': 1 } }, marks: { g: { '0,0': 'win', '0,1': 'win', '0,2': 'win', '0,3': 'win', '1,0': 'win', '2,0': 'win' } },
        chips: { cells: ['6 / 12'] }
      },
      {
        short: '(1,1)', title: 'dp[1][1] = 1 + 1 = 2', chapter: ['Truy hồi', 'violet'], line: 4,
        body: '<p>Muốn tới (1,1) phải đi qua ô trên hoặc ô trái. Cộng hai số đó lại.</p>',
        set: { g: { '1,1': 2 } }, marks: { g: { '*': null, '0,1': 'cmp', '1,0': 'cmp', '1,1': 'cur' } }, chips: { cells: ['7 / 12'] }
      },
      {
        short: 'Hàng 1', title: 'Hết hàng 1: 3 và 4', line: [3, 4],
        body: '<p>dp[1][2] = 1 + 2 = 3, dp[1][3] = 1 + 3 = 4. Mỗi ô chỉ đọc hai ô đã có.</p>',
        set: { g: { '1,2': 3, '1,3': 4 } }, marks: { g: { '*': null, '0,3': 'cmp', '1,2': 'cmp', '1,3': 'cur' } }, chips: { cells: ['9 / 12'] }
      },
      {
        short: 'Hàng 2', title: 'Hàng 2: 3, 6, 10', chapter: ['Kết quả', 'green'], line: [4, 5],
        body: '<p>dp[2][3] = 4 + 6 = <b>10</b>. Đó là đáp án.</p>',
        set: { g: { '2,1': 3, '2,2': 6, '2,3': 10 } }, marks: { g: { '*': null, '1,3': 'cmp', '2,2': 'cmp', '2,3': 'cur' } }, chips: { ans: ['10', 'good'], cells: ['12 / 12', 'good'] }
      },
      {
        short: 'Tóm tắt', title: 'DP: mỗi bài con giải một lần', chapter: RECAP,
        body: '<ul class="takeaways"><li>Trạng thái: dp[r][c]. Truy hồi: trên + trái. Biên: 1.</li><li>12 ô × O(1) → O(m·n), thay vì thử mọi đường.</li><li>Chỉ cần hàng trước → giảm bộ nhớ còn O(n).</li></ul>',
        marks: { g: null }
      }
    ]
  }
})

LESSON({
  id: 'rev', mod: 3, title: 'Đảo linked list', minutes: 6, level: 'Trung bình',
  subtitle: 'Ba con trỏ prev, cur, nxt; mỗi bước quay một mũi tên.',
  legend: [['cur', 'cur'], ['done', 'đã đảo']],
  goals: [['Giữ nxt trước khi sửa cur.next', 3], ['Quay mũi tên về prev', 4], ['O(n) thời gian, O(1) bộ nhớ', 6]],
  scene: (() => {
    const c = CHAIN([1, 2, 3, 4], { at: [-12, 0], gap: 8 })
    const back = k => ({ from: 'l' + k, to: 'l' + (k - 1), via: [AT(-12 + k * 8 - 1.5, -6), AT(-12 + (k - 1) * 8 + 1.5, -6)], style: 'hidden' })
    return {
      lang: 'python',
      code: [
        'def reverse(head):',
        '    prev, cur = None, head',
        '    while cur:',
        '        nxt = cur.next',
        '        cur.next = prev',
        '        prev, cur = cur, nxt',
        '    return prev'
      ],
      chips: [{ id: 'head', label: 'head' }, { id: 'done', label: 'Đã đảo' }],
      nodes: c.nodes,
      links: Object.assign({}, c.links, { r1: back(1), r2: back(2), r3: back(3) }),
      steps: [
        {
          short: 'Bài toán', title: '1 → 2 → 3 → 4 thành 4 → 3 → 2 → 1', chapter: ['Bài toán', 'red'], show: Object.keys(c.nodes), line: 1,
          body: '<p>Mỗi nút chỉ biết nút sau nó. Không quay lại được, nên phải sửa mũi tên khi đi qua.</p>', chips: { head: ['1'], done: ['0 / 4'] }
        },
        {
          short: 'Bắt đầu', title: 'prev = None, cur = 1', line: 2,
          body: '<p><code>cur</code> là nút đang sửa. <code>prev</code> là phần đã đảo xong — lúc đầu rỗng.</p>',
          marks: { l0: 'cur' }, notes: { l0: ['cur', 'ok'] }
        },
        {
          short: 'Giữ nxt', title: 'Lưu nxt = 2 trước khi cắt', chapter: ['Vòng 1', 'blue'], line: [4, 5],
          body: '<p>Sửa <code>1.next</code> thì mất đường tới 2. Nên giữ 2 trong <code>nxt</code> trước, rồi mới cắt.</p>',
          notes: { l1: ['nxt', 'info'] }, linkStyle: { 'l0-l1': 'cut' }
        },
        {
          short: '2 → 1', title: 'Vòng 2: 2.next = 1', chapter: ['Vòng 2', 'blue'], line: [4, 6],
          body: '<p>1 đã xong (trỏ về None). Dời <code>prev</code> = 1, <code>cur</code> = 2, rồi quay mũi tên của 2 về 1.</p>',
          marks: { l0: 'done', l1: 'cur' }, notes: { l0: ['prev', 'info'], l1: ['cur', 'ok'] }, linkStyle: { 'l0-l1': 'hidden', 'l1-l2': 'cut', r1: 'solid' },
          flows: [{ on: 'r1', kind: 'push' }], chips: { done: ['2 / 4'] }
        },
        {
          short: '3, 4', title: 'Lặp lại cho 3 và 4', chapter: ['Kết quả', 'green'], line: [6, 7],
          body: '<p>Hai vòng nữa. <code>cur</code> thành None, vòng lặp dừng, <code>prev</code> = 4 là head mới.</p>',
          marks: { l1: 'done', l2: 'done', l3: 'cur' }, notes: { l0: null, l1: null, l3: ['head mới', 'ok'] },
          linkStyle: { 'l1-l2': 'hidden', 'l2-l3': 'hidden', r2: 'solid', r3: 'solid' }, flows: [{ on: 'r3', kind: 'push' }, { on: 'r2', kind: 'push' }, { on: 'r1', kind: 'push' }],
          chips: { head: ['4', 'good'], done: ['4 / 4', 'good'] }
        },
        {
          short: 'Tóm tắt', title: 'Đảo tại chỗ: O(n), O(1)', chapter: RECAP,
          body: '<ul class="takeaways"><li>Thứ tự bắt buộc: lưu nxt → sửa next → dời prev, cur.</li><li>Không cấp phát nút mới.</li></ul>',
          callout: { kind: 'tip', title: 'Thử thêm', text: 'Viết bản đệ quy và so sánh bộ nhớ: call stack sâu n tầng.' },
          marks: { l3: 'done' }, notes: { l3: null }
        }
      ]
    }
  })()
})

;(() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
  const FOLDER = '<path d="M1.5 3.2Q1.5 1.6 3.1 1.6H6.6L8.3 3.4H14.9Q16.5 3.4 16.5 5V11.8Q16.5 13.4 14.9 13.4H3.1Q1.5 13.4 1.5 11.8Z"/><path class="folder__lip" d="M1.5 5.6H16.5"/>'
  const CHEV = '<svg class="mod__chev" width="10" height="10" viewBox="0 0 10 10"><path d="M3.5 1.8 6.7 5 3.5 8.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const CLOCK = '<svg class="i" width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.6V8l2.3 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
  const LEVEL = { 'Cơ bản': 'mint', 'Trung bình': 'amber', 'Nâng cao': 'rose' }
  LESSONS.forEach(c => { SCENES[c.id] = c.scene })

  document.getElementById('courseNav').innerHTML = MODULES.map((m, mi) => {
    const items = LESSONS.filter(c => c.mod === mi + 1)
    return `<div class="mod${mi === 0 ? ' is-open' : ''}">` +
      `<button class="mod__head" type="button" aria-expanded="${mi === 0}">${CHEV}<svg class="folder folder--${m.folder}" width="18" height="15" viewBox="0 0 18 15">${FOLDER}</svg>` +
      `<span class="mod__title">${esc(m.title)}</span><span class="mod__count" data-count="${items.map(c => c.id).join(',')}">0/${items.length}</span></button>` +
      `<div class="mod__body"><div class="mod__clip"><ul class="mod__lessons">` +
      items.map(c => `<li class="lesson"><a href="#${c.id}" data-go="${c.id}"><span class="lesson__mark"></span><span class="lesson__title">${esc(c.title)}</span></a></li>`).join('') +
      `</ul></div></div></div>`
  }).join('')
  document.getElementById('courseCount').textContent = LESSONS.length + ' bài'

  document.getElementById('main').innerHTML = LESSONS.map(c => {
    const m = MODULES[c.mod - 1], k = LESSONS.filter(x => x.mod === c.mod).indexOf(c) + 1, n = LESSONS.filter(x => x.mod === c.mod).length
    const tags = `<span class="tag tag--sand">${CLOCK}${c.minutes} phút</span><span class="tag tag--${LEVEL[c.level]}">${esc(c.level)}</span><span class="tag tag--violet">${c.scene.steps.length} bước</span>`
    const legend = c.legend.map(([kd, label]) => `<span><i class="lg${kd === 'req' ? '' : ' lg--' + kd}"></i>${esc(label)}</span>`).join('')
    const goals = c.goals.map(([t, at]) => `<li data-at="${at}"><span class="check"></span>${esc(t)}</li>`).join('')
    return `<section class="view view--lesson" data-view="${c.id}" data-area="learn" data-scene="${c.id}" hidden><div class="lesson-grid"><div class="sheet">` +
      `<header class="lesson-head"><div class="crumb">${esc(m.title)} <span>/</span> Bài ${k} / ${n}</div>` +
      `<div class="lesson-head__row"><h1 class="title">${esc(c.title)}</h1><div class="tags">${tags}</div></div><p class="subtitle">${esc(c.subtitle)}</p></header>` +
      `<div class="stage"><div class="stage__hud"></div><div class="stage__tools"></div><div class="stage__canvas"><svg class="stage-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(c.title)}"></svg></div>` +
      `<div class="stage__legend">${legend}</div></div><div class="card timeline"></div></div>` +
      `<div class="rail"><div class="card guide"></div><div class="card goals"><div class="eyebrow">Bạn sẽ học</div><ul>${goals}</ul></div></div></div></section>`
  }).join('')
})()
