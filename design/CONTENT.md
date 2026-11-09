# Content brief (public facts only: no phone number, IPs, hostnames or ports)

## Person
Eduard Enache. QA Engineer at Orange Services, Bucharest (May 2025 to present).
Pitch: "QA engineer who builds things end to end: data pipelines, dashboards and self-hosted products, from the
scraper to the monitoring." Sub-line: MSc Mobile Communications, 6G thesis graded 10/10.
CTAs: "See the work" (portfolio), "Download CV" (phone-free PDF), "Get in touch".
Contact: email form, linkedin.com/in/eduard-florentin-enache, github.com/EduardEnache.

## CV
- QA Engineer, Orange Services, May 2025 to present
- Front Office Engineer (SSPO), Orange Services, Oct 2023 to May 2025
- Customer Support Specialist, Majorel (Bolt UK), remote, Aug 2021 to Sep 2022
- MSc Mobile Communications, POLITEHNICA Bucharest, 2024 to 2026, 9.14/10. Thesis: "Multiple Access Techniques
  for 6G Systems (NOMA, RSMA, OAM)", 10/10
- BEng Telecommunications and Communication Systems, POLITEHNICA Bucharest, 2020 to 2024
- Skills: Power BI (Power Query, DAX), Grafana, SQL, Python, ETL, REST APIs; PostgreSQL, MySQL, MongoDB, SQLite;
  Ubuntu Server, Proxmox, systemd, Bash; Docker, Compose, Nginx; Prometheus, Loki; Tailscale, Cloudflare, Azure;
  Git, Jira; JS/TS, Java, MATLAB, Verilog, C#, C++
- Certifications: Microsoft Azure AI, AI Fluency, Change Management, Cloud Fundamentals, MATLAB Onramp,
  Cambridge English C2, ECDL

## Projects (fan order)
1. **AnunțulCasei** (flagship, live, anuntulcasei.ro): free real-estate aggregator for Bucharest and Ilfov with
   saved searches and alerts. ~122k active listings from 7 portals deduplicated to ~67k properties; ~42.6k found on
   two or more sites; 977 SEO landing pages. FastAPI, PostGIS, Redis, Meilisearch, Next.js, Playwright scrapers.
2. **Homelab platform** (live): Proxmox + Ubuntu VM running Docker Compose stacks. Watchdog every 5 minutes,
   Telegram alerts, dead-man switch, weekly updates with health gate and automatic rollback, scripted rebuild.
3. **ONE·WAY** (live): Instagram follow-graph analyzer that runs fully in the browser; nothing is uploaded
   (CSP `connect-src 'none'`). Vanilla JS, no build step.
4. **Grafana observability** (live): Prometheus, Grafana, Loki, Alloy, cAdvisor, custom exporters; one command-centre
   dashboard with a row per project.
5. **Minecraft SMP** (live): Fabric vanilla+ server for friends: public BlueMap, death leaderboard, Telegram feed,
   backups. Live status and leaderboard come from the homelab.
6. **fælles.** (retired 2026-10): shared trip photo and video app: resumable uploads, map of where each photo was
   taken. Fastify, SQLite, React 19, MapLibre. 153 tests.
7. **Copenhagen Pass Maximizer** (retired 2026-10): trip planner that works out which city card pays off. Vite,
   React, TypeScript. 73 tests.
8. **București Bites & Vibes** (archived): mobile-first app to discover Bucharest venues. Postgres, Prisma,
   Google OAuth and Maps.

## Screenshots
Have: copenhagen (4), faelles (3, mobile), oneway (3) in `design/assets/projects/`.
Missing: AnunțulCasei (capture from the public site), homelab, Grafana, Bites & Vibes, Minecraft.
