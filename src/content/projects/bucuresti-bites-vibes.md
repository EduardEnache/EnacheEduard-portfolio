---
order: 8
title: "București Bites & Vibes"
tagline: "A mobile-first app to discover Bucharest venues."
status: archived
year: 2026
live: bucuresti-bites-vibes
numbers:
  - { value: 4, label: "venue states, to-try to visited" }
  - { value: 7, label: "activity event kinds in the feed" }
  - { value: 3, label: "Google APIs: Maps, Places, Geo" }
stack:
  - { group: Frontend, items: ["Next.js 14", "Tailwind CSS", "Framer Motion"] }
  - { group: Backend, items: ["Next.js route handlers", PostgreSQL, Prisma, "NextAuth (Google OAuth)"] }
  - { group: Integrations, items: ["Google Maps JavaScript API", "Places API", "Geocoding API"] }
  - { group: Delivery, items: [Docker, nginx, "Cloudflare Tunnel"] }
facts:
  - { label: Focus, value: "mobile-first venue discovery" }
  - { label: Status, value: "archived" }
story:
  - label: Problem
    title: "Restaurants, cafes and bars, tracked in one place"
    text: "Good places in Bucharest end up scattered across saved map pins, chats and memory. I built a self-hosted, mobile-first app to collect venues, mark whether I have been, and find them again on a map."
  - label: How it works
    title: "Venues, lists and an activity feed"
    text: "Each venue stores its type, tags, price level, neighbourhood and sector, coordinates, opening hours and my own rating and notes. It can be synced with Google Places data. Venues go into lists and move between four states, and every change is written to an activity feed."
  - label: The hard part
    title: "Sign-in and hosting without a cloud bill"
    text: "Login uses Google OAuth through NextAuth, and the map uses Google Maps keys. The whole thing runs as a Docker Compose stack behind nginx and a Cloudflare Tunnel, so nothing needs an open port at home. The README walks through every setup step, from OAuth credentials to the first database migration and seed."
screenshots: []
---
A mobile-first app for finding places to eat and hang out in Bucharest, with Google sign-in and Maps. Archived.
