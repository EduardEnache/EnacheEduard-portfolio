---
order: 4
title: "Grafana observability"
tagline: "One command-centre dashboard with a row per project."
status: live
year: 2026
live: monitoring
numbers:
  - { value: 63, label: "panels on the command centre" }
  - { value: 8, label: "rows, one per area or project" }
  - { value: 14, suffix: " days", label: "of metric history kept" }
  - { value: 6, label: "Prometheus scrape jobs" }
stack:
  - { group: Metrics and logs, items: [Prometheus, Loki, Alloy, cAdvisor, "node-exporter"] }
  - { group: Custom exporters, items: ["Python (standard library only)"] }
  - { group: Dashboards, items: [Grafana, "Provisioned from JSON in git", "SQL and PromQL panels"] }
facts:
  - { label: Dashboard, value: "one command centre, a row per project" }
  - { label: Retention, value: "14 days of metrics" }
story:
  - label: Problem
    title: "docker ps is not observability"
    text: "Several projects share one machine, and I wanted one screen that says whether all of it is fine, including a display that runs unattended on the hypervisor. I also wanted the same view to show what each project is doing, not only CPU and RAM."
    shot: "grafana/command-center.webp | Grafana command-center dashboard in dark mode: stat tiles for running services, targets up, CPU, memory and disk, then a table of running services by stack with CPU, memory and network, and graphs of CPU and memory per stack"
  - label: How it works
    title: "Standard collectors plus two small exporters"
    text: "Prometheus scrapes the containers, the VM and the Proxmox host. I wrote two exporters in plain Python: one turns the AnunțulCasei crawler status into metrics, the other reports traffic and errors for the public ONE·WAY demo. Alloy ships container logs to Loki, and Grafana loads dashboards and data sources from JSON files in git."
  - label: The hard part
    title: "Making it cheap and self-maintaining"
    text: "One cAdvisor metric group made the disk read hundreds of MB per second and pushed the load above 20 under its memory cap, so I switched it off after checking that no panel used it. Container panels filter on the Compose project label, so a new stack appears on its own and ad-hoc containers stay off. When the end-of-life log shipper was replaced by Alloy I kept the same labels, so no dashboard query had to change."
  - label: Result
    title: "Plain-language panels, edited in git"
    text: "The command centre has 63 panels in 8 rows, from the VM and Proxmox host to each project. A second dashboard for AnunțulCasei has a table that states in words what looks off, for example overdue or blocked crawlers, and it compares counts rather than percentages while the numbers are small. Dashboard edits go into git, because changes made only in the UI would sit in a volume without a backup."
screenshots:
  - "grafana/command-center.webp | Grafana command-center dashboard in dark mode: stat tiles for running services, targets up, CPU, memory and disk, then a table of running services by stack with CPU, memory and network, and graphs of CPU and memory per stack"
flow:
  title: "From every container to one screen"
  intro: "Standard collectors cover the machines. Two small exporters cover what only a project knows about itself."
  stages:
    - label: Sources
      nodes:
        - { id: hosts, label: Containers and hosts, note: "The VM, the hypervisor, every stack", kind: source }
        - { id: crawl, label: Crawler status, note: "From AnunțulCasei", kind: source }
        - { id: demo, label: Demo traffic, note: "Requests and errors on the ONE·WAY demo", kind: source }
        - { id: logs, label: Container logs, kind: source }
    - label: Collect
      nodes:
        - { id: std, label: cAdvisor and node-exporter, kind: process }
        - { id: custom, label: Two small exporters, note: "Plain Python, standard library only", kind: process }
        - { id: alloy, label: Alloy, note: "Ships logs, keeps the labels", kind: process }
    - label: Store
      nodes:
        - { id: prom, label: Prometheus, note: "14 days of metrics", kind: store }
        - { id: loki, label: Loki, note: "Logs", kind: store }
    - label: Show
      nodes:
        - { id: graf, label: Grafana, note: "Dashboards provisioned from JSON in git", kind: process }
    - label: Read
      nodes:
        - { id: cc, label: Command centre, note: "63 panels in 8 rows, also on an unattended display", kind: output }
        - { id: ac, label: AnunțulCasei dashboard, note: "States in words what looks off", kind: output }
  edges:
    - { from: hosts, to: std, main: true }
    - { from: logs, to: alloy }
    - { from: crawl, to: custom }
    - { from: demo, to: custom }
    - { from: std, to: prom, main: true }
    - { from: custom, to: prom }
    - { from: alloy, to: loki }
    - { from: prom, to: graf, main: true }
    - { from: loki, to: graf }
    - { from: graf, to: cc, main: true }
    - { from: graf, to: ac }
---
Prometheus, Loki and Alloy collect metrics and logs from every stack, cAdvisor covers the containers and custom
exporters cover the projects. Grafana ties it together in a single command-centre dashboard with a row per project.
