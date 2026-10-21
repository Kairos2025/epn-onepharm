# ADR 0001: Technology Stack Selection for EPN OnePharm

## Context
EPN requires a centralized health information platform serving 149 members in 38 countries (29 in Africa), covering over 25,000 facilities. The platform must combine an open, high-performance public portal with rich, authenticated DHIS2-like analytical and data entry tools, while supporting low-bandwidth African mobile environments and strict data sovereignty.

## Decision
We select:
- **Language**: TypeScript across backend, frontend, and shared libraries for end-to-end type safety.
- **Monorepo**: pnpm workspaces + Turborepo for fast caching, dependency isolation, and shared packages.
- **Frontend**: Next.js (App Router) + React, Tailwind CSS, Radix UI primitives.
- **Visuals**: Apache ECharts for analytical charting; MapLibre GL for offline-compatible open vector maps.
- **Backend API**: NestJS with Fastify adapter for high throughput, modular dependency injection, and automatic OpenAPI generation.
- **Database**: PostgreSQL 16 + PostGIS for spatial geometries + ltree for hierarchical organisation unit paths.
- **Cache & Async**: Redis + BullMQ for queue management and analytics query rollup caching.

## Consequences
- Single language reduces context switching across teams and sub-projects.
- Complete alignment with DHIS2's conceptual model while leveraging modern TypeScript toolchains.
- Easy deployment as lightweight containerized services or serverless targets.
