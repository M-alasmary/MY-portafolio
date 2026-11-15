# Mohammed Alasmary — portfolio

Dependency-free static portfolio for Mohammed Alasmary: software engineer working across AI, cyber defense, and autonomous systems.

Live site: https://mohammed-alasmary-portfolio.reassuringtoucan1.chatgpt.site/

## What the site presents

- **SkyCrypt** — an intelligence platform for aerial missions that Mohammed leads. Covers the six-capability architecture, the dual-platform 5-inch / 10-inch reference design, and the AI Core v0.2: YOLO11 nano detection, ByteTrack tracking, deterministic zone-entry events with CSV export, a Streamlit dashboard with SQLite mission history, validated mission proposals via Ollama (offline) or OpenAI (online), and seven passing backend tests.
- **ACDS — Autonomous Cyber Defense System** — Mohammed's lead-author research at Al Yamamah University. PPO and DQN agents in CybORG (10 hosts, 3 subnets, 8-feature state, 8-action response space), evaluated against six attack categories plus a concurrent multi-vector case, with evaluation objectives of ≥95% attack detection, ≤10 ms decision latency, and ≤5% false positives. The [ACDS-Fullstack](https://github.com/M-alasmary/ACDS-Fullstack) platform adds Admin / SOC / Research workspaces, secure sessions, role and environment scopes, approval-gated responses, and a hash-chained audit log.
- **Defensethon 2026** — team leader of the first-place team, integrating Pixhawk, NVIDIA Jetson, Raspberry Pi, and UAV technologies.
- Experience, coursework, professional strengths, and all seventeen certifications and training programs from the current CV.

Content is owner-confirmed and kept consistent with `dist/documents/mohammed-alasmary-cv.pdf`.

## Structure

```
dist/
  index.html        Page structure, content, and inline SVG icon sprite
  styles.css        Design tokens, layout, responsive breakpoints, reduced-motion rules
  script.js         Interactions (navigation, filters, explorers, walkthrough, dialogs, command palette)
  assets/skycrypt/  SkyCrypt brand and concept artwork
  assets/acds/      ACDS research poster (student-ID area removed)
  documents/        Downloadable CV
  favicon.svg, og.svg, robots.txt, sitemap.xml
.openai/hosting.json  Hosting configuration (serves dist/)
```

## Interactions

- Project filters, credential search and issuer filters (with live result counts)
- SkyCrypt perception / mission loop toggle, capability explorer with relationship highlighting, platform selector
- ACDS decision-loop stepper, role workspaces (ARIA tabs), and a step-by-step incident walkthrough labeled as sample data
- Keyboard-accessible gallery dialog (arrow keys, previous / next), CV preview dialog with download, and a `Ctrl/⌘ + K` command palette

## Local preview

Serve `dist/` from its root (asset paths are root-absolute):

```bash
python -m http.server 8090 --directory dist
```

## Privacy

- The phone number and student IDs are not exposed in searchable HTML.
- The downloadable CV is the original PDF and retains its own contact details.
- The ACDS poster image keeps the student-ID section removed.
- SkyCrypt imagery is concept and brand artwork.
