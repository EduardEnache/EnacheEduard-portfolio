---
order: 2
title: "Homelab platform"
tagline: "A self-hosted platform that watches, updates and rebuilds itself."
status: live
year: 2026
live: health
numbers:
  - { value: 7, label: "Compose stacks in the registry" }
  - { value: 5, suffix: " min", label: "between watchdog checks" }
  - { value: 3, suffix: " min", label: "health gate before a rollback" }
  - { value: 12, suffix: " h", label: "repeat reminder while open" }
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
  - label: The hard part
    title: "Updates that undo themselves"
    text: "Once a week the updater tags the current images as a rollback point, pulls and rebuilds, and waits up to three minutes for every container to report healthy. If one does not, it restores the old images and recreates the stack. I proved the rollback on a throwaway stack first, and I keep the Minecraft server out of the weekly run because its mods have to match each game version."
  - label: Result
    title: "A crash that changed the rules"
    text: "A test run that opened browsers without a limit filled memory and swap and froze the whole VM for about an hour. Since then every heavy workload runs under a memory cap, and containers have limits too. The box can be rebuilt from one bootstrap script and a written recovery guide, and every service is its own git repo with a changelog."
screenshots: []
flow:
  title: "Watched every five minutes, updated every week"
  intro: "Every service is a Docker Compose stack. One loop watches them, another updates them, and both end in a message to me or an automatic undo."
  stages:
    - label: Run
      nodes:
        - { id: registry, label: Service registry, note: "What should be running", kind: store }
        - { id: stacks, label: Compose stacks, note: "One stack and one git repo per service", kind: store }
    - label: Check
      nodes:
        - { id: watchdog, label: Watchdog, note: "Every 5 minutes: containers, disk, memory, failed units, pending reboot", kind: process }
        - { id: updater, label: Weekly updater, note: "Tags a rollback point, pulls, rebuilds", kind: process }
    - label: Decide
      nodes:
        - { id: telegram, label: Telegram alert, note: "Only when the state changes", kind: output }
        - { id: deadman, label: Dead-man switch, note: "An outside service expects a ping on every run", kind: output }
        - { id: gate, label: Health gate, note: "Every container healthy within 3 minutes", kind: process }
    - label: Recover
      nodes:
        - { id: rollback, label: Automatic rollback, note: "Old images restored, stack recreated", kind: output }
  edges:
    - { from: stacks, to: watchdog, main: true }
    - { from: registry, to: watchdog }
    - { from: stacks, to: updater }
    - { from: watchdog, to: telegram, main: true }
    - { from: watchdog, to: deadman, label: "pings on every run" }
    - { from: updater, to: gate, main: true }
    - { from: gate, to: rollback, label: "if a container is not healthy" }
---
A Proxmox host runs an Ubuntu VM that hosts every service as a Docker Compose stack. A watchdog checks the stacks every
five minutes and sends Telegram alerts; a dead-man switch tells me if the watchdog itself stops.

Updates run weekly behind a health gate and roll back automatically if a service does not come back. The whole box can
be rebuilt from a script.
