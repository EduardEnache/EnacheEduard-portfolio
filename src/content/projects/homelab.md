---
order: 2
title: "Homelab platform"
tagline: "A self-hosted platform that watches, updates and rebuilds itself."
status: live
year: 2026
live: health
numbers:
  - { value: 7, label: "Compose stacks in the service registry" }
  - { value: 5, suffix: " min", label: "between watchdog checks" }
  - { value: 3, suffix: " min", label: "health gate before an update rolls back" }
  - { value: 12, suffix: " h", label: "repeat reminder for a problem that stays open" }
stack:
  - { group: Platform, items: [Proxmox, "Ubuntu Server", "Docker Compose"] }
  - { group: Automation, items: [systemd, Bash, "Unattended upgrades"] }
  - { group: Alerting, items: ["Telegram bot", "healthchecks.io dead-man switch", diun] }
  - { group: Networking, items: [Tailscale, "Cloudflare Tunnel"] }
facts:
  - { label: Watchdog, value: "every 5 minutes" }
  - { label: Alerts, value: "Telegram, plus a dead-man switch" }
  - { label: Updates, value: "weekly, with health gate and automatic rollback" }
  - { label: Recovery, value: "scripted rebuild" }
story:
  - label: Problem
    title: "Real services on one small machine"
    text: "A public real-estate site, a game server and several tools run on one Ubuntu VM on a Proxmox mini PC. I wanted to hear about a failure before a user did, and not have to babysit updates, so I treated the box like a small production system with a registry of what should run."
  - label: Watching
    title: "An alert only when something changes"
    text: "A watchdog runs every five minutes and checks for containers that are down, unhealthy or restarting, a full disk, low memory, failed units and a pending reboot. It messages me on Telegram when the state changes and repeats after 12 hours, so the channel stays readable. It also pings an outside dead-man switch on every run, so if the VM, the power or the network goes down I still get told."
    shot: "grafana/command-center.webp | Grafana command-center dashboard in dark mode: stat tiles for running services, targets up, CPU, memory and disk, then a table of running services by stack with CPU, memory and network, and graphs of CPU and memory per stack"
  - label: The hard part
    title: "Updates that undo themselves"
    text: "Once a week the updater tags the current images as a rollback point, pulls and rebuilds, and waits up to three minutes for every container to report healthy. If one does not, it restores the old images and recreates the stack. I proved the rollback on a throwaway stack first, and I keep the Minecraft server out of the weekly run because its mods have to match each game version."
  - label: Result
    title: "A crash that changed the rules"
    text: "A test run that opened browsers without a limit filled memory and swap and froze the whole VM for about an hour. Since then every heavy workload runs under a memory cap, and containers have limits too. The box can be rebuilt from one bootstrap script and a written recovery guide, and every service is its own git repo with a changelog."
screenshots:
  - "grafana/command-center.webp | Grafana command-center dashboard in dark mode: stat tiles for running services, targets up, CPU, memory and disk, then a table of running services by stack with CPU, memory and network, and graphs of CPU and memory per stack"
---
A Proxmox host runs an Ubuntu VM that hosts every service as a Docker Compose stack. A watchdog checks the stacks every
five minutes and sends Telegram alerts; a dead-man switch tells me if the watchdog itself stops.

Updates run weekly behind a health gate and roll back automatically if a service does not come back. The whole box can
be rebuilt from a script.
