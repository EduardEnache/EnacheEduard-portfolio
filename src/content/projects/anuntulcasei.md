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
# "path | alt text"; entries without " | " get a generic alt
screenshots:
  - "anuntulcasei/home-1440.webp | AnunțulCasei home page on desktop: the headline 'all for-sale listings in one place' beside a live feed of new Bucharest listings with prices and source tags"
  - "anuntulcasei/home-390.webp | AnunțulCasei home page on a phone: headline, call-to-action buttons and the feed of new listings stacked in one column"
  - "anuntulcasei/home-full-1440.webp | The full AnunțulCasei home page on desktop: hero with the new-listings feed, three feature points, a 15-second intro video, live counters, the seven tracked portals, a sample Telegram alert and popular searches"
---
AnunțulCasei pulls listings from seven Romanian portals, deduplicates them into one property record and lets people
search Bucharest and Ilfov in one place. Saved searches send alerts when something new matches.

It is the flagship: scrapers, a geospatial database, a search engine, a public site and the monitoring around it,
all built and run end to end.
