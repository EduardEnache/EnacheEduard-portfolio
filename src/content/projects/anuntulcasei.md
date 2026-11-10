---
order: 1
title: "AnunțulCasei"
tagline: "Seven property portals, one deduplicated search for Bucharest and Ilfov, with alerts."
status: live
year: 2026
url: https://anuntulcasei.ro
flagship: true
stack:
  - { group: Backend, items: [FastAPI, SQLAlchemy, Alembic, "PostgreSQL + PostGIS", Redis, arq] }
  - { group: Search, items: [Meilisearch, imgproxy] }
  - { group: Frontend, items: ["Next.js", TypeScript, MapLibre] }
  - { group: Data, items: ["Python crawlers", Playwright] }
  - { group: Operations, items: ["Docker Compose", "Cloudflare Tunnel", Grafana] }
facts:
  - { label: Active listings, value: "~122k from 7 portals" }
  - { label: Unique properties, value: "~67k after deduplication" }
  - { label: On two or more sites, value: "~42.6k" }
  - { label: SEO landing pages, value: "977" }
# "path | alt text"; entries without " | " get a generic alt
live: anuntulcasei
numbers:
  - { value: 7, label: "portals crawled" }
  - { value: 977, label: "SEO landing pages" }
  - { value: 1300, suffix: "+", label: "automated tests" }
  - { value: 3071, label: "listings re-sectored in one pass" }
story:
  - label: Problem
    title: "The same flat on four sites, at four prices"
    text: "Looking for an apartment in Bucharest means opening several portals and spotting the same listing again under a different price and different photos. I built a free search for sale listings in Bucharest and Ilfov that reads seven portals and shows each property once."
    shot: "anuntulcasei/home-1440.webp | AnunțulCasei home page on desktop: the headline 'all for-sale listings in one place' beside an example feed of new Bucharest listings with prices and source tags (STO, OLX, P24)"
  - label: How it works
    title: "One schema for seven sources"
    text: "Each portal has its own crawler, polite and rate-limited, that turns the page or API into one listing format and keeps the raw payload next to it. PostgreSQL with PostGIS stores them, Meilisearch serves search, and a worker matches every new or cheaper listing against saved searches and sends a Telegram or push alert."
    shot: "anuntulcasei/sources-alerts-1440.webp | AnunțulCasei home page on desktop: live counters for active listings and new listings today, the seven tracked portals, and an example Telegram alert with price, area and links to the original listing"
  - label: The hard part
    title: "Deciding what counts as the same property"
    text: "Deduplication compares location, area, rooms, floor, price and photo hashes, and I only accepted it after it reached 95% precision on a labelled set of pairs. Seller-picked sectors turned out to be wrong often, so I derived the sector from map polygons, ran the fix as a dry run first, and then corrected 3,071 stored listings. When one portal put a captcha in front of its pages I dropped it instead of working around it."
  - label: Result
    title: "Public, tested and watched"
    text: "The site is live at anuntulcasei.ro with open sign-up, 977 generated landing pages and a Lighthouse SEO score of 92. The API and crawlers have more than 1,300 automated tests, a load test stayed comfortable at 100 simulated users, and a nightly report and a Grafana dashboard tell me what the crawlers and visitors did."
    shot: "anuntulcasei/home-390.webp | AnunțulCasei home page on a phone: headline, call-to-action buttons and the feed of new listings stacked in one column"
screenshots:
  - "anuntulcasei/home-1440.webp | AnunțulCasei home page on desktop: the headline 'all for-sale listings in one place' beside an example feed of new Bucharest listings with prices and source tags (STO, OLX, P24)"
  - "anuntulcasei/sources-alerts-1440.webp | AnunțulCasei home page on desktop: live counters for active listings and new listings today, the seven tracked portals, and an example Telegram alert with price, area and links to the original listing"
  - "anuntulcasei/home-390.webp | AnunțulCasei home page on a phone: headline, call-to-action buttons and the feed of new listings stacked in one column"
flow:
  title: "Seven crawlers in, one searchable record out"
  intro: "Each portal has its own polite crawler. Everything lands in one format, is matched against what is already known, and is served from one database and one search index."
  stages:
    - label: Crawl
      nodes:
        - { id: olx, label: OLX, kind: source }
        - { id: storia, label: Storia, kind: source }
        - { id: publi24, label: Publi24, kind: source }
        - { id: anuntul, label: Anunțul Telefonic, kind: source }
        - { id: homezz, label: homezz, kind: source }
        - { id: lajumate, label: lajumate, kind: source }
        - { id: romimo, label: romimo, kind: source }
    - label: Normalise
      nodes:
        - { id: dedup, label: Validation and dedup, note: "One format, raw payload kept; duplicates matched", kind: process }
    - label: Store
      nodes:
        - { id: pg, label: PostgreSQL + PostGIS, note: "One record per property", kind: store }
        - { id: search, label: Meilisearch, note: "Search index", kind: store }
    - label: Serve
      nodes:
        - { id: api, label: API, note: "FastAPI", kind: process }
        - { id: alerts, label: Alert worker, note: "Matches saved searches, sends Telegram or push", kind: output }
    - label: Use
      nodes:
        - { id: web, label: Web app, note: "Search, map and saved searches", kind: output }
  edges:
    - { from: olx, to: dedup }
    - { from: storia, to: dedup }
    - { from: publi24, to: dedup }
    - { from: anuntul, to: dedup }
    - { from: homezz, to: dedup }
    - { from: lajumate, to: dedup }
    - { from: romimo, to: dedup }
    - { from: dedup, to: pg, main: true }
    - { from: dedup, to: search }
    - { from: pg, to: api, main: true }
    - { from: search, to: api }
    - { from: pg, to: alerts, label: "new and cheaper listings" }
    - { from: api, to: web, main: true }
---
AnunțulCasei pulls listings from seven Romanian portals, deduplicates them into one property record and lets people
search Bucharest and Ilfov in one place. Saved searches send alerts when something new matches.

It is the flagship: scrapers, a geospatial database, a search engine, a public site and the monitoring around it,
all built and run end to end.
