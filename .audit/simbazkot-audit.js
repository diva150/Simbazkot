export const meta = {
  name: 'simbazkot-audit',
  description: '6-dimension parallel audit of the BAZNAS Sistem Informasi codebase with adversarial verification',
  phases: [
    { title: 'Find (parallel)' },
    { title: 'Verify' },
    { title: 'Synthesize' },
  ],
}

const FINDING = {
  type: 'object',
  properties: {
    file: { type: 'string' },
    line: { type: 'integer' },
    severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
    category: { type: 'string' },
    summary: { type: 'string' },
    detail: { type: 'string' },
    evidence: { type: 'string' },
    fix: { type: 'string' },
  },
  required: ['file', 'severity', 'category', 'summary', 'detail'],
}

const VERDICT = {
  type: 'object',
  properties: {
    file: { type: 'string' },
    line: { type: 'integer' },
    summary: { type: 'string' },
    survives: { type: 'boolean' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reason: { type: 'string' },
  },
  required: ['file', 'line', 'summary', 'survives', 'confidence', 'reason'],
}

const ROOT = 'C:\\laragon\\www\\Simbazkot'

const FINDERS = [
  {
    key: 'security',
    prompt: `Audit the BAZNAS Sistem Informasi codebase at ${ROOT} for SECURITY issues only. This is a Next.js 14 App Router + TypeScript app handling ZIS (zakat) financial data for BAZNAS Kota Gorontalo.

SCOPE: Read all .ts/.tsx files under app/, src/. Look for:

1. XSS vectors — dangerouslySetInnerHTML, unescaped template strings in href/src, untrusted text rendered as HTML. Pay special attention to print views (DisposisiPrint, KwitansiZisPrint, LaporanKeuanganPrint) which render user data into document templates.

2. Input validation gaps — form handlers that do not validate, NaN propagation, no length limits on text inputs, NIK validation (should be 16 digits starting with 7571 for Gorontalo), phone validation.

3. Mock data leaks — does any file in app/ or src/ import mock-data.ts and accidentally ship hardcoded fake data to a real output (e.g. into a public landing page or print template that someone could run for real)? Hardcoded credentials in LoginModal.

4. Auth flow weakness — LoginModal client-side mock auth — what stops a user from setting localStorage user to ketua and getting full access? Is access control actually enforced? (Look at src/lib/access.ts and how it is used in Sidebar/page.tsx)

5. PII handling — NIK numbers, addresses, phone numbers stored in mock-data.ts — are they exposed anywhere they should not be (e.g. console.log, error messages)?

6. Prototype pollution / unsafe spreads — patterns like { ...userInput } or Object.assign in places that process untrusted data.

7. Excel/docx import — ImportExcelModal and excel-utils.ts: does parsing handle malicious files (XXE, formula injection, etc.)? Can a malicious cell break out of the cell context? Look at how cells are read and how their values flow into the UI.

8. Financial calculation integrity — getTerbilangRupiah, formatRupiah, summing functions. Any place where Number is used where bigint is needed, or where floating-point could corrupt totals (especially summing across many records).

9. localStorage tampering — anything that reads from localStorage without validation that could crash or be exploited.

10. Print injection — print templates often concatenate strings; check for unescaped backticks, quotes, or newlines that could break the template.

CONTEXT FILES TO READ:
- app/page.tsx (main orchestrator, has login + nav)
- src/components/Sidebar.tsx (uses access.ts)
- src/lib/access.ts (RBAC)
- src/lib/mock-data.ts (996 lines of sample data)
- src/lib/excel-utils.ts
- src/lib/word-utils.ts
- src/components/common/ImportExcelModal.tsx
- src/components/print/*.tsx (3 files)
- src/components/public/LoginModal.tsx (auth)
- src/components/public/PublicLandingView.tsx (public-facing)

OUTPUT: Return JSON {findings: [...]} where each finding has file, line (or 0 if multi-location), severity, category, summary, detail (1-3 sentences), evidence (quoted code if possible), fix (concrete suggested fix). Only report issues that have REAL impact — not theoretical concerns. If you find nothing in a category, say so explicitly.`,
  },
  {
    key: 'correctness',
    prompt: `Audit the BAZNAS Sistem Informasi codebase at ${ROOT} for CORRECTNESS / TYPE-SAFETY / REACT anti-patterns only. Next.js 14 App Router + TypeScript strict.

SCOPE: Read all .ts/.tsx files under app/, src/.

Look for:

1. as any / unsafe casts — search for "as any" in the codebase. Memory rule says NEVER use this. List every occurrence.

2. Mutable state bugs — useState holding objects/arrays that are mutated in place (e.g. setUsers(users.push(...))). Look at all useState calls.

3. Stale closures in event handlers — common in large files like Bidang1View (1458 lines), Bidang2View (1906), AdminUserManagementView (1116), KetuaView (819). Look for callbacks defined inside components that close over state, especially setTimeout/setInterval/async handlers.

4. useEffect dependency issues — missing deps, unnecessary deps, deps that change on every render (objects/arrays created inline).

5. Key prop mistakes — using index as key in lists that can be reordered/filtered, or missing key entirely.

6. Type narrowing failures — discriminated unions (look at src/lib/types.ts) — are switch/if statements exhaustive? Any place where "as" is used to force narrowing that should be done with proper checks.

7. Mutating props — child components that mutate objects passed via props. React props are read-only.

8. Memory leaks — setTimeout/setInterval/event listeners not cleaned up in useEffect returns.

9. Race conditions in async handlers — fetch/setTimeout patterns where two clicks could fire two parallel updates with the same id.

10. Numeric / date arithmetic — timezone bugs, off-by-one on month boundaries, integer overflow on big amounts (BAZNAS collects billions of rupiah — does it use Number or string?).

11. Localstorage/JSON.parse without try/catch — any place that parses user-controlled JSON could crash the whole app.

12. Sidebar 889 lines — there was a recent commit about sidebar auto open/close on cursor — check if the mouseleave/hover logic has bugs (e.g. debounce issues, hover state leaking across page navigations, focus stealing).

13. Header.tsx 329 lines + QuickSearchModal.tsx 292 lines — recently added. Check for input handling, escape key, click-outside, focus trap bugs.

14. page.tsx 615 lines — orchestrator with many useState. Check for state that should be derived vs stored.

CONTEXT FILES TO READ (largest first):
- src/components/modules/Bidang2View.tsx (1906 lines)
- src/components/modules/Bidang1View.tsx (1458 lines)
- src/components/modules/Bidang4View.tsx (1347 lines)
- src/components/modules/AdminUserManagementView.tsx (1116 lines)
- src/components/Sidebar.tsx (889 lines)
- src/components/modules/KetuaView.tsx (819 lines)
- app/page.tsx (615 lines)
- src/lib/types.ts (all interfaces)
- src/lib/mock-data.ts

OUTPUT: Return JSON {findings: [...]} with file, line, severity, category, summary, detail, evidence (quoted code), fix. Only report issues with REAL impact, not stylistic complaints. If a category is clean, say so.`,
  },
  {
    key: 'design-system',
    prompt: `Audit the BAZNAS Sistem Informasi codebase at ${ROOT} for DESIGN SYSTEM COMPLIANCE issues only. The project has strict brand rules from PANDUAN IDENTITAS DESAIN 2022.

THE RULES (from project memory):
- Color palette: ONLY baznas-green (50-950), baznas-gold (50-900), baznas-gold-display, baznas-paper, baznas-ink. NO bg-slate-*, NO bg-gray-*, NO bg-zinc-*, NO random pastels (rose, blue, emerald, amber).
- NEVER use bg-gradient-* (was 0 in project)
- NEVER use rounded-full for status badges
- NEVER use shadow-2xl — use shadow-lift instead
- NEVER use rounded-3xl on modal containers
- Text opacity: minimum 70 (85 preferred) for body text, 85+ for dark surfaces
- Use BAZNASMark component for logo, not raw img tags pointing to /baznas-logo.png
- For active sidebar item: border-l-4 border-baznas-gold-display
- Buttons: primary = bg-baznas-ink, secondary = border hairline
- REGIONAL: this is BAZNAS KOTA GORONTALO. NEVER reference Manado, Sulawesi Utara, Disdik Sulut, Pemkot Manado. NIK prefix is 7571, phone area code 0435.

CRITICAL REGRESSION CHECK: There was a CSS bug at app/globals.css where forcing color in .display-1/2/3/hero classes (defined OUTSIDE @layer, AFTER @tailwind utilities) overrode Tailwind text-* utilities, making big numbers invisible on dark backgrounds. Fix was to remove color: var(--baznas-ink) from those classes.

SCOPE: Read all .ts/.tsx files under app/, src/, plus app/globals.css, tailwind.config.ts.

Look for:

1. Display class CSS bug — does app/globals.css STILL have the forced color rule on .display-1/2/3/hero? If yes, this is a CRITICAL regression.

2. Regional leaks — grep for "Manado", "Sulawesi Utara", "Sulut", "7171" (wrong NIK prefix), "(0431)" (wrong phone), "Disdik Sulut", "Pemkot Manado". Should all be 0 hits.

3. Slate/gray colors — grep for "bg-slate-", "bg-gray-", "bg-zinc-", "bg-neutral-", "text-slate-", "text-gray-" in source. List every occurrence with file:line.

4. Pastel abuse — bg-rose-, bg-blue-, bg-emerald-, bg-amber-, bg-pink-, bg-purple-, bg-orange- (the 5 random pastels anti-pattern).

5. Gradient usage — bg-gradient-, from-, via-, to-* — should be 0.

6. rounded-full abuse — used on non-circular elements (badges, buttons) instead of geometric shapes.

7. shadow-2xl / shadow-xl — heavy shadows.

8. rounded-3xl on modals — anti-pattern.

9. Text contrast failures — text-baznas-ink/X where X < 70 (fails WCAG AA), text-white/X where X < 80 on dark surfaces, especially in stat values and labels.

10. Raw img logo — anywhere using <img src="/baznas-logo.png" /> or similar instead of <BAZNASMark variant="mark|full|icon" />.

11. Hardcoded hex colors — color: # in style attributes, or in CSS files, when baznas tokens exist.

12. Star8 decorative in landing/login — should be 0 in PublicLandingView and LoginModal (per memory all Star8 removed). Check src/components/brand/IslamicOrnament.tsx — is Star8 still used inappropriately?

13. Border colors — border-blue-200, border-emerald-200, etc. — should use border-baznas-* tokens.

14. BAZNASMark variants — is the icon variant (SVG monogram) used where it should be (small chips) vs the mark variant (full PNG) for hero/sidebar/print?

OUTPUT: Return JSON {findings: [...]} with file, line, severity, category, summary, detail, evidence (quoted code or grep snippet), fix. Severity critical for: display class CSS regression, regional leaks. High for slate/pastel/gradient. Medium for shadow-2xl, rounded-3xl on modal, low-opacity text.`,
  },
  {
    key: 'a11y-ux',
    prompt: `Audit the BAZNAS Sistem Informasi codebase at ${ROOT} for ACCESSIBILITY & UX issues only. Target audience includes older users (per UX-IMPROVEMENT-PLAN-30-60.md). WCAG 2.1 AA minimum, AAA preferred.

SCOPE: Read all .ts/.tsx files under app/, src/.

Look for:

1. Missing focus management — modals (LoginModal, ImportExcelModal, ConfirmDialog, QuickSearchModal) without focus trap, focus return, or initial focus on first input.

2. Click-outside handlers — do they fire when user is interacting with form fields? Do they steal focus?

3. Keyboard navigation — buttons as divs, missing onKeyDown on clickable elements, no Escape handler on modals.

4. aria-* attributes — missing aria-label on icon-only buttons (lucide-react icons inside buttons), missing aria-modal/role=dialog on modals, missing aria-current on active sidebar item, missing aria-expanded on collapsible sections.

5. Form labels — inputs without <label> or aria-label, placeholder used as label.

6. Error announcements — form errors shown visually but not announced to screen readers (aria-live=polite/assertive).

7. Touch target size — buttons smaller than 44x44 (Tailwind has t-target: 44px token). Check for h-8, h-9, h-10 buttons especially in dense tables.

8. Color-only meaning — status indicated by color alone (no icon, no text). Especially in badges, table cells, charts.

9. Heading hierarchy — h1 to h2 to h3 skips. Multiple h1s per page.

10. Alt text — <img> without alt, decorative <img> with non-empty alt.

11. Color contrast on colored backgrounds — e.g. text on bg-baznas-gold-500, text-baznas-green-600 on white, text on bg-amber-*. Especially badges.

12. Print accessibility — print views should be readable standalone. Headers, page breaks, font size.

13. Tab order — tabindex > 0 (anti-pattern), or positive tabindex on multiple elements.

14. Skip links — main app page (post-login) probably does not have a skip to main content link. PublicLandingView probably does not either.

15. Loading states — actions with no loading indicator (button does not disable, no spinner), so users can double-click.

16. Toast/notification accessibility — Toast.tsx: are toasts announced via aria-live? Can they be dismissed by keyboard?

17. Sidebar (889 lines) — auto-collapse on mouse leave: keyboard users have no way to open it. Focus users will be stuck.

18. QuickSearchModal — keyboard shortcut? Recent items list accessible?

19. PrintPreview / window.print() — focus management before/after print dialog?

20. Form validation messages — are they clear for older users? Bahasa Indonesia? Specific (e.g. NIK harus 16 digit) not generic (Invalid)?

OUTPUT: Return JSON {findings: [...]} with file, line, severity, category, summary, detail, evidence, fix. Critical for: missing alt text on logo, missing focus trap on LoginModal, sidebar inaccessible to keyboard. High for: small touch targets, color-only meaning, missing aria on icon buttons.`,
  },
  {
    key: 'performance',
    prompt: `Audit the BAZNAS Sistem Informasi codebase at ${ROOT} for PERFORMANCE issues only. Next.js 14 App Router client-rendered SPA (no SSR/SSG detected — check app/page.tsx — uses use client or not).

SCOPE: Read all .ts/.tsx files under app/, src/.

Look for:

1. use client usage — app/page.tsx is 615 lines and probably the entire app. Is it use client? That means zero SSR, all 14k LOC ships as JS bundle. Search for use client vs use server across app/.

2. Bundle size — xlsx (large), docx (large) imported at top level. Are they dynamically imported? If not, they bloat the initial bundle even on the public landing page.

3. Re-render storms — large parent components passing many props to many children. Look at page.tsx (615 lines) orchestrator and 4 Bidang views (each 500-2000 lines). Are sub-components wrapped in React.memo? Are callbacks wrapped in useCallback?

4. useState for derivable state — useState values that are always derived from props/other state. Should be useMemo or just inline.

5. List rendering — large lists rendered with .map() and no virtualization. Look at mock-data.ts (996 lines = many records). Tables with hundreds of rows?

6. Inline object/array creation in props — style={{ ... }}, className={['a','b']}, options=[...]. These create new references every render and break memo.

7. Inline function in render — onClick={() => ...} on a list of items — creates new function per item per render.

8. Image optimization — baznas-logo.png (130KB) — using next/image? <img> tag wastes LCP. Check if next/image is used.

9. Unnecessary re-renders from context — is there a Context provider that bundles many values? When any one changes, all consumers re-render.

10. Heavy computations in render — filter/sort/map on every render of large arrays. Should be useMemo.

11. Search/filter debouncing — QuickSearchModal: does it debounce? Or filter on every keystroke over 996 lines of mock data?

12. localStorage reads on every render — page.tsx reads localStorage in useState initializer (good if it does) or in render (bad).

13. Re-creating regex/parser on every call — utils.ts, excel-utils.ts, word-utils.ts.

14. Animation jank — long-running CSS animations (globals.css has animate-float, animate-pulse-glow, etc.). Are they GPU-accelerated (transform/opacity only) or do they trigger layout (width/height/top/left)?

15. Modal mount cost — LoginModal (413 lines), ImportExcelModal (204 lines), ConfirmDialog (199 lines). Are they always mounted or lazy?

16. Print view performance — KwitansiZisPrint (324 lines), LaporanKeuanganPrint (270 lines), DisposisiPrint (196 lines) — does rendering all rows block the UI?

17. Bundle splitting opportunities — Print views, Excel/Word utilities should be in separate chunks loaded on demand.

18. Font loading — globals.css imports Plus Jakarta Sans via @import. Is this render-blocking?

OUTPUT: Return JSON {findings: [...]} with file, line, severity, category, summary, detail, evidence, fix. Critical for: xlsx/docx in main bundle (affects landing page load). High for: no use client/server split (no SSR), list re-render storms, no virtualization. Medium for: inline objects, missing memo.`,
  },
  {
    key: 'code-quality',
    prompt: `Audit the BAZNAS Sistem Informasi codebase at ${ROOT} for CODE QUALITY / MAINTAINABILITY issues only. Next.js 14 App Router + TypeScript strict, ~14k LOC across 42 files.

SCOPE: Read all .ts/.tsx files under app/, src/.

Look for:

1. Dead code — exported functions/components never imported. Unused state, unused imports, unreachable branches.

2. Duplicated code — long inline blocks repeated across files. E.g. badge styling, form input styling, button styling.

3. Magic numbers/strings — hardcoded colors, sizes, durations that should be tokens.

4. Inconsistent naming — same concept named differently across files (e.g. userId vs user_id vs id_user).

5. Comment drift — comments that contradict the code (e.g. says TODO: implement but the code is implemented, or fixed in v1.2 referencing a version that does not exist).

6. Long files — files > 1000 lines (Bidang1View, Bidang2View, Bidang4View, AdminUserManagementView, PublicLandingView, mock-data.ts). Should they be split?

7. God components — components that do too much. Look at page.tsx (615 lines orchestrator).

8. Prop drilling — props passed through 3+ levels when Context would be cleaner.

9. Type vs interface inconsistency — some types use type X = {...} others interface X {...}. Pick one.

10. Default export vs named export inconsistency — Next.js convention says default for pages, named for everything else. Check.

11. Tailwind class soup — className strings > 200 chars that should be extracted to a constant or cva() variant.

12. Comments in Indonesian vs English — mixed. Decide on one. The PRD and BAZNAS context is Indonesian, so Indonesian may be fine, but should be consistent.

13. Error handling gaps — try/catch with empty catch, or just catch(e) { console.error(e) } without user feedback.

14. Console.log/debugger/XXX left in — search for console.log in src/components and src/lib.

15. Version control hygiene — any commented-out blocks of code? Any TODOs without context?

16. Mock data realism — names like "Test User 1", addresses like "Jl. Test", phone numbers like "08123456789". Should be realistic Gorontalo-flavored data per memory.

17. Inconsistent data shapes — same concept stored as different shapes (date as string in some places, Date object in others).

18. Print template duplication — 3 print files (Kwitansi, Disposisi, Laporan) likely have duplicated header/footer logic. Should be a shared PrintHeader / PrintFooter.

19. Empty src/components/common/index.ts (10 lines) — barrel export. Check if all components are exported, and if it is used.

20. access.ts (183 lines) RBAC — is the role/permission matrix documented? Easy to maintain?

OUTPUT: Return JSON {findings: [...]} with file, line, severity, category, summary, detail, evidence, fix. Critical for: dead code that has user impact (e.g. unused function that should run, removed import breaking build). High for: long files with clear extraction opportunities. Medium for: naming inconsistencies, console.log left in.`,
  },
]

phase('Find (parallel)')
log('Dispatching 6 parallel finders across the codebase...')
const finderResults = await parallel(FINDERS.map(f => () =>
  agent(f.prompt, {label: `find:${f.key}`, phase: 'Find (parallel)', schema: {
    type: 'object',
    properties: { findings: { type: 'array', items: FINDING } },
    required: ['findings'],
  }})
))

const seen = new Set()
const all = []
for (const r of finderResults) {
  if (!r) continue
  for (const f of r.findings || []) {
    const key = `${f.file}::${f.line}::${f.category}::${(f.summary || '').slice(0, 60)}`
    if (seen.has(key)) continue
    seen.add(key)
    all.push(f)
  }
}
log(`${all.length} unique findings after dedup. Severity: ${all.filter(f => f.severity === 'critical').length} critical, ${all.filter(f => f.severity === 'high').length} high, ${all.filter(f => f.severity === 'medium').length} medium, ${all.filter(f => f.severity === 'low').length} low`)

const ranked = [...all].sort((a, b) => {
  const order = { critical: 0, high: 1, medium: 2, low: 3 }
  return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
})
const toVerify = ranked.slice(0, 40)
log(`Adversarially verifying top ${toVerify.length} findings (refute-first)...`)

phase('Verify')
const verdicts = await parallel(toVerify.map(f => () =>
  agent(`You are a skeptical reviewer. Try to REFUTE this finding. Default to survives=false if uncertain.

Finding: ${f.summary}
File: ${f.file}:${f.line}
Category: ${f.category}
Severity claimed: ${f.severity}

Detail: ${f.detail}
Evidence: ${f.evidence || '(none provided)'}
Suggested fix: ${f.fix || '(none)'}

Read the relevant file in ${ROOT} and judge:
- Is this a REAL issue, or false positive?
- Is the severity appropriate (over/under-stated)?
- Is the fix correct?

Return JSON with survives (boolean), confidence (high/medium/low), and reason.`,
    {label: `verify:${f.file.split('\\\\').pop()}:${f.line}`, phase: 'Verify', schema: VERDICT})
))

const verified = []
for (let i = 0; i < toVerify.length; i++) {
  const f = toVerify[i]
  const v = verdicts[i]
  if (!v) continue
  if (v.survives && v.confidence !== 'low') {
    verified.push({ ...f, verdict: v })
  } else if (!v.survives) {
    log(`REFUTED: ${f.file}:${f.line} — ${v.reason}`)
  }
}
const unverified = all.filter(f => !toVerify.includes(f))
log(`After adversarial verify: ${verified.length} confirmed, ${unverified.length} unverified (lower priority)`)

phase('Synthesize')
const confirmed = [...verified, ...unverified]
const bySeverity = {
  critical: confirmed.filter(f => f.severity === 'critical'),
  high: confirmed.filter(f => f.severity === 'high'),
  medium: confirmed.filter(f => f.severity === 'medium'),
  low: confirmed.filter(f => f.severity === 'low'),
}
const byCategory = {}
for (const f of confirmed) {
  byCategory[f.category] = (byCategory[f.category] || 0) + 1
}

return {
  summary: {
    totalRaw: all.length,
    verifiedCount: verified.length,
    unverifiedCount: unverified.length,
    bySeverity: Object.fromEntries(Object.entries(bySeverity).map(([k, v]) => [k, v.length])),
    byCategory,
  },
  criticalAndHigh: confirmed.filter(f => f.severity === 'critical' || f.severity === 'high'),
  mediumAndLow: confirmed.filter(f => f.severity === 'medium' || f.severity === 'low'),
}
