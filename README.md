# Azure Status Dashboard

A single-page application that displays real-time Azure service health status, incident timelines, region status, and Azure product updates. Built with React, TypeScript, and Tailwind CSS, deployed on GitHub Pages.

## Features

- **Service Health Grid** -- Real-time status of Azure services grouped by category, with search and filters
- **Incident Timeline** -- Chronological list of active and recent incidents with expandable details
- **Region Status** -- Health overview across all Azure regions, grouped by geography
- **Azure Updates Feed** -- Latest Azure product announcements with category filtering and search
- **Dark/Light Theme** -- Toggle between themes, persisted to localStorage
- **Auto-refresh** -- Data refreshes automatically every 5 minutes

## Data Sources

All data comes from publicly available Azure RSS/Atom feeds:

- [Azure Status Feed](https://azure.status.microsoft/en-us/status/feed/)
- [Azure Updates Feed](https://azure.microsoft.com/en-us/updates/feed/)

## Tech Stack

- **Vite** -- Build tool
- **React 19** -- UI framework
- **TypeScript** -- Type safety with strict mode
- **Tailwind CSS** -- Utility-first styling
- **Lucide React** -- Icon library
- **Vitest** -- Test runner

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

```
src/
  components/       Reusable UI components
    ui/             Base UI primitives (Card, Badge, StatusIndicator, etc.)
    layout/         App shell, header, theme toggle, dashboard
  features/         Self-contained feature modules
    service-health/ Service health grid with filters
    incident-timeline/ Incident timeline with expandable cards
    region-status/  Region health overview by geography
    azure-updates/  Azure updates feed with search
  hooks/            Shared React hooks (useTheme, useFetch)
  services/         Data access layer (interfaces + implementations)
  types/            Shared TypeScript types
  lib/              Utilities (RSS parsing, formatting, CORS proxy)
  config/           App constants and configuration
```

## Deployment

The app auto-deploys to GitHub Pages on push to `main` via GitHub Actions. The workflow runs lint, type-check, tests, and build before deploying.

## License

MIT
