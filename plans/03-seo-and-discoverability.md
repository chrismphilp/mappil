# SEO And Discoverability Plan

**Recommendation:** Add a crawlable landing-page layer around the current React game, using clean URLs and prerendered or otherwise static HTML for search-facing pages, while keeping the interactive globe game as the main conversion destination.

**Why this approach:** The live site currently serves a very thin app shell: generic title, generic description, no canonical tag, no Open Graph or Twitter tags, no structured data, no real sitemap response, and almost no meaningful HTML body content before JavaScript runs. Search engine snippets already reflect that weakness. On the current Create React App setup, discoverability will stay limited until Mappil exposes indexable content in the initial HTML response.

**Primary v1 goal:** Make Mappil discoverable for high-intent geography quiz searches such as world and continent map quizzes, not just for branded queries.

**Scope rule for v1:** Prioritize crawlability, landing pages, metadata, and search indexing infrastructure before trying to scale content marketing, backlinks, or a full framework migration.

---

## 1. Current Gap Snapshot

### Confirmed issues on the current site
- `public/index.html` ships only `<title>Mappil</title>` and a short generic description
- the live HTML response at `https://mappil.com` is still effectively the same thin app shell
- there is no canonical URL tag
- there are no Open Graph tags
- there are no Twitter card tags
- there is no visible structured data implementation
- `public/robots.txt` allows crawling but does not reference a sitemap
- `https://mappil.com/sitemap.xml` currently resolves to the app shell instead of a real XML sitemap
- the repo has no routing, prerendering, or SEO metadata management library

### Likely consequence
Google can render JavaScript, but the current setup still makes indexing and snippet quality weaker than they need to be. Mappil is asking crawlers to infer relevance from a mostly empty shell instead of serving clear, targeted page content.

---

## 2. Recommendation

### Chosen implementation
Keep the interactive game, but add a search-facing content layer with:
- clean URLs for landing pages
- prerendered or static HTML for those landing pages
- route-specific metadata
- internal links into the playable experience

### Preferred URL structure
- `/` for the main marketing and discovery homepage
- `/play` for the interactive game
- dedicated landing pages for search intent and internal linking

### Why not rely on the current SPA homepage
Do not try to win SEO with the current JavaScript-only root page alone. Even if Google can sometimes render the app, that is still weaker than returning meaningful HTML immediately.

### Why not migrate the whole app first
Do not start by rewriting Mappil into Next.js or another SSR framework unless the team already wants that migration for broader reasons. A smaller crawlable landing-page layer solves the main discoverability problem sooner.

---

## 3. V1 Search Surface

### Landing pages to ship first
Create pages only for experiences the app actually supports today.

Recommended first set:
- `/`
- `/play`
- `/world-map-quiz`
- `/africa-map-quiz`
- `/asia-map-quiz`
- `/europe-map-quiz`
- `/north-america-map-quiz`
- `/south-america-map-quiz`
- `/oceania-map-quiz`

These map cleanly to the continent filters already present in `src/types/game.types.ts`.

### What each landing page should contain
Each page should have:
- one clear H1 aligned to the search intent
- a short explanation of what the quiz covers
- visible text describing difficulty and game-mode options
- a clear CTA into the playable quiz
- internal links to related quiz pages
- a short FAQ section written for users, not keyword stuffing

### Content rule
Do not publish pages for unsupported experiences. If Mappil does not currently offer a live US states or UK regions mode in production, do not create SEO pages for those topics yet.

---

## 4. Technical Design

### A. Routing and rendering

#### [MODIFY] `package.json`

Add:
- a router for clean, crawlable paths
- route-level metadata support
- a prerender step for search-facing routes

Recommended packages:
- `react-router-dom`
- `react-helmet-async`
- a prerender tool compatible with the chosen route setup

Do not lock the plan to exact package versions. Choose the latest compatible versions at implementation time.

#### [MODIFY] `src/index.tsx`
Wrap the app in the router and metadata provider.

#### [MODIFY] `src/App.tsx`
Turn `App.tsx` into a route shell instead of a single-page-only entry.

#### [NEW] route components
Recommended route split:
- `src/pages/HomePage.tsx`
- `src/pages/PlayPage.tsx`
- `src/pages/landing/ContinentQuizPage.tsx`

### B. Landing page to game conversion

#### [MODIFY] app bootstrap or game state initialization

Allow landing pages to link into configured quiz states with URL parameters such as:

```text
/play?continent=europe&difficulty=easy&mode=quick
```

This allows a continent landing page to send users into a relevant game state instead of dumping everyone into a generic default experience.

Recommended implementation point:
- parse `URLSearchParams` before building the initial game state

### C. Metadata

#### [MODIFY] `public/index.html`

Upgrade the base document with:
- stronger default title
- stronger default description
- canonical placeholder strategy
- default social metadata
- better favicon and social asset references if available

#### [NEW] route-level metadata helper

Each landing page should set:
- title
- meta description
- canonical URL
- Open Graph title, description, URL, image
- Twitter card metadata

### D. Structured data

Add visible-page-aligned JSON-LD for:
- `WebSite`
- `SoftwareApplication`
- `BreadcrumbList` on landing pages where appropriate

Do not add structured data that is not supported by visible page content. Keep the markup conservative and valid.

### E. Crawlability assets

#### [MODIFY] `public/robots.txt`

Add:

```text
Sitemap: https://mappil.com/sitemap.xml
```

#### [NEW] `scripts/generate-sitemap.js`

Generate a real XML sitemap from the search-facing routes.

#### [NEW] build output for `sitemap.xml`

Ensure `https://mappil.com/sitemap.xml` returns XML, not the app shell.

#### [NEW] `public/404.html`

Serve a real 404 page for missing URLs so search engines do not see soft-404 style fallbacks on unknown paths.

### F. Social previews

#### [NEW] social preview assets

Create share images for:
- homepage
- world map quiz
- continent quiz templates

Recommended path:
- `public/og/`

These assets should be used by both Open Graph and Twitter metadata.

---

## 5. Content Architecture

### Homepage role
The homepage should explain:
- what Mappil is
- who it is for
- what quiz types are available now
- why it is different from generic geography quizzes
- how to start playing

### Landing-page template
Each continent page should follow the same structure:
1. query-aligned title and intro
2. what you will practice
3. difficulty and mode options
4. why this quiz is useful
5. CTA into the relevant `/play` state
6. related quiz links
7. short FAQ

### Internal linking rule
Every landing page should link to:
- the homepage
- the playable route
- at least two related continent pages

This helps both users and crawlers discover the rest of the site.

---

## 6. Discoverability Beyond On-Page SEO

### Search platform setup
After the technical changes ship:
- verify the site in Google Search Console
- verify the site in Bing Webmaster Tools
- submit the sitemap
- inspect the homepage and at least two landing pages manually

### Initial distribution work
Support the technical SEO work with a small distribution pass:
- update social profiles to link to the best landing page, not only the root app
- publish a short launch post for geography learners and teachers
- submit the site to relevant educational and quiz directories

Do not over-invest in outreach before the landing pages and snippets are in good shape.

---

## 7. Implementation Order

1. Introduce routes for homepage, `/play`, and landing pages.
2. Add route-level metadata support.
3. Add prerender or static generation for search-facing routes.
4. Add landing page copy and internal links.
5. Add query-parameter entry into the correct game state.
6. Generate a real sitemap and update `robots.txt`.
7. Add structured data and social preview assets.
8. Verify indexing setup in Google Search Console and Bing Webmaster Tools.

---

## 8. Measurement

### Primary success metrics
Track:
- indexed landing-page count
- non-branded impressions
- non-branded clicks
- click-through rate on homepage and landing pages
- queries that include `map quiz`, `world map quiz`, and continent terms

### Secondary signals
Track:
- engagement from landing pages into `/play`
- bounce rate from landing pages
- whether search snippets show useful descriptions instead of thin app-shell text

---

## 9. Risks And Mitigations

### Risk: prerendering conflicts with the interactive globe
Mitigation: prerender only search-facing routes and lazy-load the heavy play experience on `/play`.

### Risk: thin or duplicate landing pages
Mitigation: keep the initial page set small and write distinct copy tied to real quiz configurations.

### Risk: `/play` competes with landing pages in search
Mitigation: make landing pages the primary search targets and consider `noindex` for `/play` if it remains too thin.

### Risk: the plan becomes a content project without technical fixes
Mitigation: ship crawlability and metadata first. Content alone will not fix indexing quality on the current app shell.

---

## 10. Exit Criteria

This plan is complete when:
- Mappil serves crawlable landing pages with meaningful initial HTML
- the site has clean URLs for homepage, play, and continent quiz pages
- each key page has route-specific metadata and structured data
- `robots.txt` references a real XML sitemap
- the sitemap is submitted and inspectable in search tools
- Mappil can start earning non-branded search impressions for geography quiz intent
