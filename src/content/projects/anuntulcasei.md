---
order: 1
title: "AnunțulCasei"
tagline: "A free real-estate aggregator for Bucharest and Ilfov, with saved searches and alerts."
status: live
year: 2026
url: https://anuntulcasei.ro
stack:
  - { group: Backend, items: [FastAPI, PostGIS, Redis, Meilisearch] }
  - { group: Frontend, items: [Next.js] }
  - { group: Data, items: [Playwright scrapers] }
facts:
  - { label: Active listings, value: "~122k from 7 portals" }
  - { label: Unique properties, value: "~67k after deduplication" }
  - { label: On two or more sites, value: "~42.6k" }
  - { label: SEO landing pages, value: "977" }
screenshots: []
---
AnunțulCasei pulls listings from seven Romanian portals, deduplicates them into one property record and lets people
search Bucharest and Ilfov in one place. Saved searches send alerts when something new matches.

It is the flagship: scrapers, a geospatial database, a search engine, a public site and the monitoring around it,
all built and run end to end.
