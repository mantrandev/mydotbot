import { createRequire } from 'module'
import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

const args = process.argv.slice(2)
const file = path.resolve(args.find(a => a.endsWith('.html')) || '')
if (!fs.existsSync(file)) { console.error('usage: node check.mjs <page.html> [--only=id,id] [--shots=dir] [--dark] [--mobile]'); process.exit(2) }
const only = (args.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean)
const shotDir = (args.find(a => a.startsWith('--shots=')) || '').slice(8)
const dark = args.includes('--dark'), mobile = args.includes('--mobile')

const deps = path.join(os.homedir(), '.cache/isopaper-check')
const req = createRequire(path.join(deps, 'index.js'))
let puppeteer
try { puppeteer = req('puppeteer-core') } catch (e) {
  fs.mkdirSync(deps, { recursive: true })
  execSync('npm install --silent --no-audit --no-fund puppeteer-core@23', { cwd: deps, stdio: 'ignore' })
  puppeteer = req('puppeteer-core')
}
const chrome = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => p && fs.existsSync(p))
if (!chrome) { console.error('no Chrome found; set CHROME_PATH'); process.exit(2) }
if (shotDir) fs.mkdirSync(shotDir, { recursive: true })

const b = await puppeteer.launch({ executablePath: chrome, headless: 'new' })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push('pageerror: ' + e.message))
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
const wait = ms => new Promise(r => setTimeout(r, ms))
await p.setViewport(mobile ? { width: 390, height: 844, isMobile: true } : { width: 1440, height: 900 })
await p.goto('file://' + file, { waitUntil: 'networkidle0' })
await p.evaluate(d => { localStorage.clear(); if (d) localStorage.setItem('isopaper:theme', '"dark"') }, dark)
await p.reload({ waitUntil: 'networkidle0' })

const views = await p.$$eval('.view[data-view]', vs => vs.map(v => ({ id: v.dataset.view, scene: !!v.dataset.scene })))
const report = []
let bad = 0
for (const v of views) {
  if (only.length && !only.includes(v.id)) continue
  await p.evaluate(id => { location.hash = id }, v.id)
  await wait(500)
  if (!v.scene) {
    const issues = await p.evaluate(id => {
      const view = document.querySelector(`.view[data-view="${id}"]`), out = []
      view.querySelectorAll('table, pre').forEach(t => { if (t.scrollWidth > t.parentElement.clientWidth + 2 && getComputedStyle(t).overflowX === 'visible') out.push(`${t.tagName.toLowerCase()} wider than its column`) })
      return out
    }, v.id)
    if (shotDir) await p.screenshot({ path: `${shotDir}/${v.id}.png` })
    if (issues.length) bad++
    report.push(`${v.id}: doc ${issues.length ? issues.join('; ') : 'ok'}`)
    continue
  }
  const n = await p.$$eval(`.view[data-view="${v.id}"] .timeline__steps button`, bs => bs.length)
  for (let k = 0; k < n; k++) {
    await p.click(`.view[data-view="${v.id}"] .timeline__steps button[data-k="${k}"]`)
    await wait(1700)
    const issues = await p.evaluate((id, mobile) => {
      const view = document.querySelector(`.view[data-view="${id}"]`), svg = view.querySelector('.stage-svg'), out = []
      const r = el => el.getBoundingClientRect()
      const hit = (a, c, pad = 2) => a.left + pad < c.right && c.left + pad < a.right && a.top + pad < c.bottom && c.top + pad < a.bottom
      const pills = [...view.querySelectorAll('.layer-notes .pill-body, .ent:not(.is-off) .pill-body')].map(e => ({ e, r: r(e), t: e.parentNode.querySelector('text').textContent }))
      const ents = [...view.querySelectorAll('.ent:not(.is-off)')]
      const bodies = ents.map(g => {
        const parts = [...g.querySelectorAll('.iso-edge')].map(r)
        if (!parts.length) return null
        return { id: g.dataset.id, g, r: { left: Math.min(...parts.map(x => x.left)), right: Math.max(...parts.map(x => x.right)), top: Math.min(...parts.map(x => x.top)), bottom: Math.max(...parts.map(x => x.bottom)) } }
      }).filter(Boolean)
      for (let i = 0; i < pills.length; i++) for (let j = i + 1; j < pills.length; j++) if (hit(pills[i].r, pills[j].r)) out.push(`pill "${pills[i].t}" overlaps pill "${pills[j].t}"`)
      if (!mobile) {
        const edges = g => [...g.querySelectorAll('.iso-edge')]
        const inside = (g, x, y) => { const dp = new DOMPoint(x, y); return edges(g).some(e => e.isPointInFill && e.isPointInFill(dp)) }
        const outline = g => edges(g).flatMap(e => { const L = e.getTotalLength(), o = []; for (let k = 0; k < 48; k++) { const q = e.getPointAtLength(L * k / 48); o.push([q.x, q.y]) } return o })
        const userRect = e => { const b = e.getBBox(), m = e.parentNode.parentNode.transform.baseVal.consolidate(), dx = m ? m.matrix.e : 0, dy = m ? m.matrix.f : 0; return { x: b.x + dx, y: b.y + dy, w: b.width, h: b.height } }
        const ring = q => { const o = []; for (let k = 0; k <= 10; k++) o.push([q.x + q.w * k / 10, q.y], [q.x + q.w * k / 10, q.y + q.h]); for (let k = 1; k < 4; k++) o.push([q.x, q.y + q.h * k / 4], [q.x + q.w, q.y + q.h * k / 4]); o.push([q.x + q.w / 2, q.y + q.h / 2]); return o }
        const inRect = (q, x, y) => x > q.x + 2 && x < q.x + q.w - 2 && y > q.y + 2 && y < q.y + q.h - 2
        for (const pl of pills) {
          const own = pl.e.closest('.ent'), q = userRect(pl.e), pts = ring(q)
          for (const bd of bodies) {
            if (own && own.dataset.id === bd.id) continue
            if (pts.some(([x, y]) => inside(bd.g, x, y)) || outline(bd.g).some(([x, y]) => inRect(q, x, y))) out.push(`pill "${pl.t}" overlaps node ${bd.id}`)
          }
        }
        for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
          const A = bodies[i], B = bodies[j]
          if (!hit(A.r, B.r, 0)) continue
          if (outline(A.g).some(([x, y]) => inside(B.g, x, y)) || outline(B.g).some(([x, y]) => inside(A.g, x, y))) out.push(`node ${A.id} overlaps node ${B.id}`)
        }
        view.querySelectorAll('.layer-links .link:not(.is-off)').forEach(lk => {
          if (!lk.dataset.a) return
          const len = lk.getTotalLength(), crossed = new Set()
          for (let t = 0.06; t < 0.95; t += 0.02) {
            const pt = lk.getPointAtLength(len * t), dp = new DOMPoint(pt.x, pt.y)
            for (const bd of bodies) {
              if (bd.id === lk.dataset.a || bd.id === lk.dataset.b || crossed.has(bd.id)) continue
              if ([...bd.g.querySelectorAll('.iso-edge')].some(e => e.isPointInFill && e.isPointInFill(dp))) crossed.add(bd.id)
            }
          }
          crossed.forEach(id => out.push(`link ${lk.dataset.a}→${lk.dataset.b} passes through node ${id}`))
        })
      }
      const stage = r(view.querySelector('.stage')), canvas = r(view.querySelector('.stage__canvas'))
      const hud = [...view.querySelectorAll('.chip')].map(r)
      for (const pl of pills) {
        if (pl.r.left < stage.left || pl.r.right > stage.right || pl.r.bottom > stage.bottom || pl.r.top < stage.top) out.push(`pill "${pl.t}" outside stage`)
        if (hud.some(h => hit(pl.r, h))) out.push(`pill "${pl.t}" under the chip row`)
      }
      for (const bd of bodies) if (hud.some(h => hit(bd.r, h))) out.push(`node ${bd.id} under the chip row`)
      const gc = view.querySelector('.guide__content')
      if (!mobile && gc.scrollHeight > gc.clientHeight + 4) out.push(`guide text overflows by ${gc.scrollHeight - gc.clientHeight}px`)
      return out
    }, v.id, mobile)
    if (shotDir) await (await p.$(`.view[data-view="${v.id}"] .lesson-grid`)).screenshot({ path: `${shotDir}/${v.id}-${k + 1}.png` })
    if (issues.length) bad++
    report.push(`${v.id} step ${k + 1}/${n}: ${issues.length ? [...new Set(issues)].join('; ') : 'ok'}`)
  }
}
console.log(report.join('\n'))
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors')
console.log(bad || errs.length ? `FAIL: ${bad} step(s) with issues` : 'PASS')
await b.close()
process.exit(bad || errs.length ? 1 : 0)
