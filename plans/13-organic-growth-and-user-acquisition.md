# Organic Growth And User Acquisition Plan

**Recommendation:** Grow Mappil organically by combining three layers: stronger search capture, product-led sharing loops, and audience-specific distribution surfaces that give the site more reasons to be linked, revisited, and recommended.

**Why this approach:** Mappil now has more of the right raw ingredients than it did earlier in the project: a real landing-page layer, daily challenges, friend challenge links, player profiles, personal bests, leaderboard context, and a more distinctive product feel. What it still lacks is a coherent acquisition system. Right now the site can be discovered and played, but it does not yet create enough repeatable reasons for people to share it, link to it, reference it in classrooms, or return to it outside one-off gameplay.

**Primary v1 goal:** Increase qualified organic visits and convert more of those visits into first runs, repeat runs, and link-worthy moments without depending on paid acquisition.

**Scope rule for v1:** Focus on product, content, and distribution loops that can be supported by the current statically deployed Next.js site. Do not add paid ads, heavy account infrastructure, or a full creator/referral platform in the first pass.

---

## 1. Role Of This Plan

This plan is not a replacement for the earlier discoverability work. It is the next layer above it.

Related plans:
- [SEO And Discoverability](./completed/03-seo-and-discoverability.md)
- [Gamification And Replayability](./05-gamification-and-replayability.md)
- [Onboarding And First Run Experience](./06-onboarding-and-first-run-experience.md)
- [Personal Bests And Player Profile](./completed/08-personal-bests-and-player-profile.md)
- [Additional Map Modes And Content Expansion](./09-additional-map-modes-and-content-expansion.md)

This document should coordinate:
- what acquisition loops Mappil should lean into
- which site surfaces should be created next
- which product moments need to become more shareable
- how to measure whether growth work is actually compounding

---

## 2. Current Growth Baseline

### What already exists
- landing pages for the homepage and map-quiz intent
- daily challenges
- friend challenge creation and sharing
- leaderboard submission and viewing
- local player identity and personal best context
- a distinctive interactive 3D map game rather than a generic text quiz

### What is still thin
- very little content depth beyond the main landing pages
- almost no audience-specific pages for teachers, students, trivia players, or geography learners
- no durable “share this result” artifact beyond challenge links
- no systematic internal-linking strategy beyond the current landing pages
- no explicit distribution loops for:
  - teachers
  - social creators
  - challenge communities
  - directory and roundup inclusion
- limited analytics clarity around acquisition source to first run to repeat run

### Likely consequence
Mappil can earn some discoverability through search and some sharing through challenge links, but it still lacks enough surface area and product moments to compound into meaningful organic growth.

---

## 3. Product Direction

### Chosen growth direction
Make Mappil grow through:
- searchable learning intent
- shareable challenge moments
- repeatable utility for small communities

### Core principle
Organic growth should come from:
- being useful for a clear audience
- creating outcomes people want to show others
- publishing more indexable, linkable, and referenceable pages

Not from:
- thin keyword spam
- artificial virality mechanics
- generic “invite friends” prompts with no real value

---

## 4. Growth Pillars

### Pillar A: Search intent expansion
Capture more search traffic from people already looking for:
- geography games
- map quizzes
- country learning tools
- classroom geography resources
- daily trivia or challenge experiences

### Pillar B: Product-led sharing
Make strong runs, daily attempts, and challenge results feel worth sharing.

### Pillar C: Audience-specific utility
Build a few surfaces that make Mappil useful enough for:
- teachers
- students
- trivia communities
- travel/geography hobbyists

### Pillar D: Distribution readiness
Give the site assets and pages that can be:
- linked in roundups
- posted in communities
- embedded in newsletters
- referenced in classroom resource lists

---

## 5. Layer 1: Strengthen Search Capture

### A. Expand landing-page coverage deliberately

#### [NEW] search-facing content layer beyond current quiz pages

The current landing-page set is a start, but it is still too small to create a meaningful topic footprint.

Recommended next page groups:
- `/geography-games`
- `/world-map-game`
- `/country-quiz`
- `/learn-countries`
- `/geography-game-for-kids`
- `/classroom-geography-game`
- `/daily-geography-challenge`

Rule:
- each page must map to a real product use case
- do not create near-duplicate SEO shells

### B. Add audience-specific pages

#### [NEW] audience intent pages

Recommended first set:
- `/for-teachers`
- `/for-students`
- `/for-trivia-fans`

These should explain:
- what Mappil helps with
- how it can be used
- which existing modes fit that audience
- clear calls to action into relevant game states

### C. Create a lightweight resource/content layer

#### [NEW] evergreen content pages

Do not jump straight to a full blog if it will go stale. Start with evergreen utility content.

Recommended content types:
- “How to memorize world countries by region”
- “Best way to learn African countries on a map”
- “Fast geography warmups for classrooms”
- “Daily geography challenge habits”

The goal is to support:
- long-tail search
- internal linking
- external links from educational and trivia sites

### D. Improve internal-link architecture

#### [MODIFY] landing pages and future content pages

Each search-facing page should link intentionally to:
- related quiz pages
- relevant game modes
- daily challenge entry points
- teacher/student resource pages where relevant

This should behave like a real topic cluster, not isolated pages.

---

## 6. Layer 2: Build Better Sharing Loops

### A. Turn results into shareable artifacts

#### [MODIFY] `src/components/game/GameCompleteModal.tsx`
#### [NEW] result-share UI or image generation path

Challenge links are good, but they are not enough on their own.

Recommended direction:
- add result cards worth screenshotting or sharing
- highlight:
  - score
  - rank or grade
  - streak
  - ruleset
  - “Can you beat this?”

Optional v1 variants:
- simple in-browser share card component
- downloadable image
- social-preview-style summary card

### B. Strengthen daily challenge sharing

#### [MODIFY] daily challenge completion flows

Daily runs should feel like a recurring shared event, not just another mode.

Recommended additions:
- “Share today’s board”
- “Challenge a friend on today’s seed”
- “Come back tomorrow” framing

### C. Improve friend challenge propagation

#### [MODIFY] friend challenge UX

Friend challenge links already exist, but the flow can do more work.

Recommended improvements:
- clearer challenge-copy text
- stronger rematch framing
- visible reason to share after a strong run
- better preview copy around “same seed, same rules”

### D. Expose public-proof moments

#### [MODIFY] leaderboard and profile surfaces

Recommended moments worth sharing:
- top-10 placement
- new best score
- best streak milestone
- daily leaderboard placement
- friend challenge win

The point is to give players a reason to post Mappil as part of their achievement, not just as a raw link.

---

## 7. Layer 3: Build Audience-Specific Utility

### A. Teacher-friendly mode framing

#### [NEW] teacher-focused page and usage guidance

Teachers are a strong organic-growth audience because they:
- look for classroom tools
- share resources with peers
- revisit useful sites

Recommended teacher surface:
- explain how to use Mappil as:
  - a warm-up
  - a region quiz
  - a daily class challenge
- suggest specific difficulty and continent combinations
- include a short “how to run this in class” section

### B. Student/practice framing

#### [NEW] student study page

Students searching for help are often not looking for “games”; they are looking for ways to study.

Recommended page themes:
- geography revision
- learning countries by continent
- short practice sessions
- improving from mistakes

### C. Trivia and challenge framing

#### [NEW] trivia/community page

Mappil can appeal to:
- quiz fans
- pub trivia players
- challenge communities

Recommended framing:
- daily competitive challenge
- friend challenge format
- best-streak chasing

This gives the product a clearer identity outside pure education.

---

## 8. Layer 4: Make The Site More Linkable

### A. Publish pages that are worth citing

#### [NEW] durable reference pages

Examples:
- “All Mappil geography game modes”
- “Continent quiz collection”
- “Daily geography challenge archive or explainer”

These pages help with:
- roundup inclusion
- directory inclusion
- educational resource referencing

### B. Create social-preview and media assets

#### [NEW] reusable OG and promo assets

Make it easy for external sites and social posts to present Mappil well.

Recommended asset set:
- product hero image
- daily challenge image
- classroom/teacher image
- continent quiz image templates

### C. Prepare directory-friendly descriptions

#### [NEW] small copy library

Create a set of reusable descriptions for:
- app directories
- educational resource lists
- indie web/game roundups
- newsletter blurbs

This keeps outreach consistent and lowers the friction to submit Mappil to relevant places.

---

## 9. Layer 5: Improve Conversion From Visit To First Run

### A. Clarify the first action on landing pages

#### [MODIFY] homepage and landing-page CTAs

Organic traffic is wasted if too many people bounce before playing.

Recommended v1 rule:
- one clear primary CTA into the relevant playable mode
- one secondary CTA for exploration
- less ambiguity around what happens after the click

### B. Match landing-page intent to starting state

#### [MODIFY] playable entry links

A teacher page should not drop people into a generic world quick-play default if the pitch was about African practice or classroom challenge use.

Recommended direction:
- each landing page launches into a sensible preconfigured state

### C. Add lightweight trust and proof

#### [MODIFY] search-facing and audience pages

Recommended proof elements:
- number of ranked players on featured boards
- examples of available modes
- short “why people use this” copy
- selected challenge or leaderboard examples

Do not overdo social proof if the numbers are still small. Keep it honest.

---

## 10. Layer 6: Distribution Workflows

### A. Educational outreach readiness

#### [NEW] submission checklist

Prepare Mappil for:
- teacher newsletters
- classroom tool directories
- homeschool resource lists
- school geography communities

This does not require a large campaign first. It requires pages and assets that make the site easy to recommend.

### B. Community and roundup submissions

#### [NEW] repeatable outreach list

Build and maintain a small list of:
- geography and trivia communities
- educational resource sites
- indie web and game directories
- “best geography games” roundup opportunities

The point is not mass outreach. It is focused submissions once the site is ready.

### C. Creator-friendly hooks

#### [NEW] creator-facing usage angle

Some creators will only share the site if there is a clear format.

Recommended formats:
- “Can you beat my score?”
- “Today’s geography challenge”
- “Region challenge of the week”

This works especially well if daily and friend challenge surfaces become more visually shareable.

---

## 11. Layer 7: Measurement And Feedback

### A. Track acquisition by landing surface

#### [DECIDE] analytics sink if not already chosen

Track:
- landing page viewed
- CTA clicked
- first run started
- run completed
- replay started
- challenge link shared
- leaderboard opened

Segment by:
- homepage
- quiz landing pages
- teacher/student pages
- daily challenge pages

### B. Track share-loop quality

Key questions:
- how often do players create or share friend challenges?
- how often do recipients actually start a run?
- how often does a daily visit turn into a replay?

### C. Track SEO and content compounding

Metrics to watch:
- non-branded search impressions
- non-branded clicks
- pages receiving organic entrances
- pages earning backlinks or referrals
- organic visitor to first-run conversion rate

### D. Measure returning-user lift

Organic growth quality matters more than raw traffic if Mappil wants habitual use.

Recommended KPIs:
- repeat sessions per user
- percentage of players returning within 7 days
- daily challenge return rate
- friend challenge revisit rate

---

## 12. Recommended Delivery Order

### Phase 1: High-leverage organic foundations
- expand landing-page coverage around real use cases
- add teacher/student/trivia pages
- improve internal links and CTA matching
- prepare reusable media and directory copy

### Phase 2: Product-led sharing upgrades
- make completion moments more shareable
- improve daily and friend challenge share loops
- expose stronger public-proof moments

### Phase 3: Outreach and compounding content
- publish evergreen educational/resource content
- submit to targeted directories and roundups
- start focused community distribution

### Phase 4: Optimization
- measure best-performing landing surfaces
- improve conversion on weak pages
- expand only the page types that are earning real traffic and links

---

## 13. Success Criteria

This plan is successful if:
- Mappil earns more non-branded organic traffic
- more visitors start a run on their first session
- daily and friend challenge flows create measurable returning traffic
- the site develops a larger footprint of pages that can rank, be linked, and be recommended
- teachers, students, and trivia players each have at least one clearly relevant entry surface
- organic growth becomes less dependent on the homepage alone

---

## 14. File Impact Summary

### Likely content and routing work
- [MODIFY] `src/lib/landingContent.ts`
- [MODIFY] `src/app/page.tsx`
- [MODIFY] existing landing pages in `src/app/` and `src/views/`
- [NEW] additional audience and resource pages under `src/app/`

### Likely product-share surfaces
- [MODIFY] `src/components/game/GameCompleteModal.tsx`
- [MODIFY] friend challenge and daily challenge flows
- [MODIFY] leaderboard or profile surfaces for shareable proof moments

### Likely assets and metadata
- [NEW] social and OG assets in `public/`
- [MODIFY] sitemap and metadata generation paths

### Related implementation work
- analytics sink decision
- content production workflow
- outreach list and directory-submission process
