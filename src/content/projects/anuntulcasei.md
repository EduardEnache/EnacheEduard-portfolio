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
---
AnunțulCasei pulls listings from seven Romanian portals, deduplicates them into one property record and lets people
search Bucharest and Ilfov in one place. Saved searches send alerts when something new matches.

It is the flagship: scrapers, a geospatial database, a search engine, a public site and the monitoring around it,
all built and run end to end.
