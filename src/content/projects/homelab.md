---
order: 2
title: "Homelab platform"
tagline: "A self-hosted platform that watches, updates and rebuilds itself."
status: live
year: 2026

stack:
  - { group: Platform, items: [Proxmox, Ubuntu Server, Docker Compose] }
  - { group: Automation, items: [systemd, Bash] }
facts:
  - { label: Watchdog, value: "every 5 minutes" }
  - { label: Alerts, value: "Telegram, plus a dead-man switch" }
  - { label: Updates, value: "weekly, with health gate and automatic rollback" }
  - { label: Recovery, value: "scripted rebuild" }
screenshots: []
---
A Proxmox host runs an Ubuntu VM that hosts every service as a Docker Compose stack. A watchdog checks the stacks every
five minutes and sends Telegram alerts; a dead-man switch tells me if the watchdog itself stops.

Updates run weekly behind a health gate and roll back automatically if a service does not come back. The whole box can
be rebuilt from a script.
