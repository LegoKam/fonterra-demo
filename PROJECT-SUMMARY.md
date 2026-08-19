# NZMP → AEM Edge Delivery Services — Project Summary

**Source site:** https://www.nzmp.com/global/en (Fonterra / NZMP)
**Target:** AEM Edge Delivery Services (crosswalk / Universal Editor project, `fonterra-demo`)
**Working branch:** `aem-20260813-1735`
**Last updated:** 2026-08-19

---

## 1. Objective

Migrate the NZMP global/en website into AEM Edge Delivery Services:

1. **Homepage + all main section pages** → migrated as authored EDS pages (JCR content).
2. **News section** (`/global/en/news/*`) → migrated as structured **AEM Content Fragments**,
   per the agreed split: *we generate the model spec + CF data + tooling; model creation
   and credential opt-in are author-side*.

---

## 2. Current status at a glance

| Workstream | Status |
|------------|--------|
| Homepage migration | ✅ Complete (merged to `main`, PR #3) |
| Section pages (310 URLs, 14 templates) | ✅ Complete (310/310) |
| Design/token migration + block styling | ✅ Complete |
| md2jcr blockers (Form, Breadcrumb) | ✅ Resolved (stripped at import) |
| LCP / PageSpeed on carousel-banner | ✅ Fixed (Performance 100) |
| JCR XML well-formedness (package build) | ✅ Fixed (314 files, 0 issues) |
| News CF data + payloads (315 articles) | ✅ Complete |
| News CF **instance** package (installable) | ✅ Built (`nzmp-news-cf.zip`) |
| News CF **model** package + refined spec | ✅ Built (`nzmp-news-cf-model.zip` + `cf-model-spec.md`) |
| News CF **model created in AEM** | ⏳ **Author-side (pending)** |
| News CF **instances created in AEM** | ⏳ Blocked on model + install |
| Push of latest commit `c57291c` to GitHub | ⏳ Blocked (environment git credentials) |

---

## 3. Page migration

### Templates (14)
Discovered via structural clustering of the section URLs. One import script per template:

- `import-home-page.js`
- `import-section-landing.js`
- `import-category-landing.js`
- `import-ingredient-category.js`
- `import-ingredient-listing.js`
- `import-ingredient-product-detail.js`
- `import-application-concept-detail.js`
- `import-section-generic.js`

(plus their `.bundle.js` counterparts produced by the import bundler)

**Coverage:** 314 JCR content XML files generated under `migration-work/jcr-content/`
(homepage + 310 section pages across the 14 templates).

### Import pipeline
`aem-import-bundle.sh` → `run-bulk-import.js`, driven by:
- **Parsers** (`tools/importer/parsers/*.js`) — HTML → block tables. Notably
  `carousel-news.js` handles 5 distinct source structures (latest-news, tile carousel,
  surestart cards, tile listing).
- **Transformers** (`tools/importer/transformers/*.js`):
  - `nzmp-cleanup.js` — strips GDPR banner, contact forms, modals, email-subscription
    bars, and **breadcrumbs** (the components that don't exist in the target and broke md2jcr).
  - `nzmp-sections.js` — inserts `<hr>` section breaks + Section Metadata (runs in
    `beforeTransform`).
- **`page-templates.json`** — 14 templates, all 310 section URLs assigned, `projectType=xwalk`.

### Blocks (styled for NZMP)
Boilerplate blocks plus new/variant blocks built for this site:
`carousel-banner`, `carousel-news`, `carousel-category`, `cards-benefit`, `cards-category`,
`cards-value`, `cards-teaser`, `columns-product`, `columns-feature`, `columns-banner`,
`accordion-featured`.

### Design system
- `styles/brand.css` — NZMP design tokens (colors, type).
- `styles/styles.css` — section variants (dark-blue, blue, grey), layout.

---

## 4. Issues resolved during migration

| Issue | Cause | Fix |
|-------|-------|-----|
| `The component 'Form' does not exist` | Contact/email-subscribe forms have no target block | Removed from import scripts + templates; strip `.emailsubscription.esBar` in cleanup |
| `The component 'Breadcrumb' does not exist` (~75 pages) | Breadcrumb block not in target | Strip breadcrumb selectors in cleanup; removed from scripts/templates; re-imported 220 pages |
| Empty image cells | Parsers matched only `<img>`; live site uses CSS `background-image` | Added `bgUrl()`/`resolveImage()` helpers |
| carousel-news empty on some pages | Multiple distinct source markup structures | Extended parser to 5 structures + routing guard |
| Section boundaries collapsing | sections ran in `afterTransform` | Moved to `beforeTransform` |
| PageSpeed Performance 0 (LCP unmeasurable) | First hero slide image was lazy | Set first slide `loading="eager"` + `fetchpriority="high"` → Performance 100 |
| **Package creation: "Unescaped '<' not allowed in attribute values"** | md2jcr stored rich text in attributes; raw `<`/`>`/`&` (e.g. `<1% lactose`, `RTDs (<12.5%)`) broke XML | Attribute-aware escaper: 157 escapes across 42 files; **verified 0 remaining across all 314 files** |

---

## 5. News → Content Fragments

**315 articles** extracted from `/global/en/news/*` (0 fetch failures).

### Deliverables (in `migration-work/news-cf/`)
- `news-articles.json` — 315 structured records (title, summary, publishDate, readTime,
  category, tags, heroImage, body [rich HTML], sourceUrl, slug).
- `cf-model-spec.md` — **refined, unambiguous** UI build guide for the CF Model: 10 fields
  with exact property names, data types, and settings.
- `payloads/*.json` — 315 ready-to-POST AEM Assets API payloads (real model path baked in).
- `categories-observed.json` — category distribution (14 distinct values observed).
- `POST-INSTRUCTIONS.md` — three routes to create the instances.

### Field coverage (of 315)
title 315 · summary 315 · body 315 · slug 315 · sourceUrl 315 · heroImage 290 ·
category 288 · tags 288 · publishDate 275 · readTime 275.
(25 bodies fall back to summary for content-thin source stubs; 40 pages have no date.)

### Tooling (in `tools/importer/`)
- `extract-news-cf.js` — re-runnable extractor.
- `create-news-cf-instances.js` — Assets-API importer (dry-run / emit / commit).
- `build-news-cf-package.js` — generates the **instance** FileVault package.
- `build-news-cf-model-package.js` — generates the **model** FileVault package.

### Installable packages (in `tools/importer/cf-package/`)
- `nzmp-news-cf.zip` — 315 CFs as `dam:Asset` nodes under
  `/content/dam/fonterra-demo/news/{slug}`, bound to the model path below.
- `nzmp-news-cf-model.zip` — the `News Article` CF Model at
  `/conf/fonterra-demo/settings/dam/cfm/models/news-article` (fallback to UI build).

### Why the API route was blocked
Direct creation via the AEM Assets HTTP API requires an authenticated session to the
author instance (`author-p152232-e1579634.adobeaemcloud.com`), which returns **401
`www-authenticate: Basic realm="Sling (Development)"`** from this environment. The
injected credentials cover `admin.hlx.page` / Document Authoring, **not** the raw
`*.adobeaemcloud.com` author API. The **package route** (Package Manager upload)
sidesteps this entirely.

---

## 6. Remaining steps (author-side)

1. **Create the `News Article` CF Model** at
   `/conf/fonterra-demo/settings/dam/cfm/models/news-article` — build in the UI from the
   refined `cf-model-spec.md` (recommended), or try installing `nzmp-news-cf-model.zip`.
   Field **property names must match** the spec table.
2. **Install `nzmp-news-cf.zip`** via Package Manager → creates the 315 CF instances.
3. **Verify:** browse `/content/dam/fonterra-demo/news` in AEM Assets, or
   `GET {author}/api/assets/content/dam/fonterra-demo/news.json` (expect 315 entries).
4. *(Optional)* Enable git credentials in Settings → LLM Permissions so commit `c57291c`
   (CF packages + generators) can be pushed to the branch.

---

## 7. Deployment reference

- **Feature preview:** `https://aem-20260813-1735--fonterra-demo--LegoKam.aem.page/`
- **Production preview:** `https://main--fonterra-demo--LegoKam.aem.page/`
- **Production live:** `https://main--fonterra-demo--LegoKam.aem.live/`

Content pages (homepage + sections) were merged to `main` via **PR #3**. The News CF
packages + generators are committed locally (`c57291c`) awaiting push.
