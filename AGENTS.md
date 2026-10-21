# EPN OnePharm - Agent & Developer Guide

## System Overview
EPN OnePharm is the centralized health information and pharmaceutical systems strengthening platform for the Ecumenical Pharmaceutical Network (EPN), modelled on the architectural principles and ergonomics of DHIS2. It tracks facility-level and member-level aggregates across 149 member organizations in 38 countries (29 in Africa), reaching over 25,000 health facilities and 300 million people.

## Main Interface Architecture (agreed Oct 2026)
The authenticated workspace is organized into **7 top-level data categories**, each with up to 9 sub-categories:
Membership, Projects, Health Facilities, Medicines & Supply (renamed from Pharmaceuticals), Workforce Data (renamed from Human Resources), Financial Data, Insights.
- Canonical definitions: `packages/domain/src/workspace.ts` (`WORKSPACE_CATEGORIES`) — drives the workspace sidebar.
- Circular navigation: enter from Member, Health Facility, Funder, or Project; every entity links to related data (`/api/v1/graph/navigate`).
- Programs = the 5 official EPN program areas (epnetwork.org/programs); health priorities = MNCH/RH, IPC & AMR, NCDs, NTDs. Browse by program or by project list (`/programs`).
- Public summary layer at `/` shows headline network metrics without login; higher tiers via subscription, full access via Secretariat contact.
- Full design: `docs/interface-architecture.md`. Authenticated pages live in `apps/web/src/app/(workspace)/`.

## Product Principles
- **P1: Macro level, not micro**: Track facility-level aggregates, not patient-level prescription records.
- **P2: Members own their data**: Fine-grained data sharing agreements control visibility.
- **P3: Adoption before analytics**: Offline-first, fast, accessible value for facilities and members.
- **P4: DHIS2-compatible by design**: Org unit tree, data elements, periods, indicators, and two-way exchange.
- **P5: Everything is configurable metadata**: Programmes, pillars, indicators, and forms are data, not code.
- **P6: Low bandwidth, low device**: Fast SSR public portal, offline PWA with IndexedDB sync.
- **P7: World-class UX**: Fast, clean, bilingual (EN/FR), zero emojis in UI, accessible WCAG AA.
- **P8: Auditable**: Every change is tracked with who, when, old value, and new value.

## Monorepo Structure
```
epn-onepharm/
  AGENTS.md
  apps/
    web/                 # Next.js 15 App Router: Public portal + authenticated app suite
    api/                 # NestJS Fastify backend API & DHIS2-compatible endpoints
    worker/              # BullMQ asynchronous processing & analytics rollups
  packages/
    domain/              # Shared types, Zod schemas, constants, metadata models
    expression/          # Pure DHIS2 indicator expression parser & evaluator
    periods/             # Period math (daily, weekly, monthly, quarterly, yearly, ISO)
    ui/                  # Tailwind design system tokens and Radix UI components
    sdk/                 # Typed API client
    db/                  # Migrations, schema definitions, seed scripts (--minimal, --epn, --demo)
    i18n/                # Bilingual messages (en.json, fr.json)
  infra/
    docker/              # Docker compose for PostgreSQL/PostGIS, Redis, etc.
    terraform/           # Infrastructure as Code skeleton
  docs/
    adr/                 # Architecture Decision Records
    open-questions.md    # Log of open questions for EPN
```

## Milestone Roadmap & Current State
- **Current Milestone**: M0 Foundations & Core Platform (Architecture, Core Packages, Data Model, API, and Web Portal)
- Next Milestones:
  - M1: Metadata & Org Units Management
  - M2: Data Entry & Completeness Engine
  - M3: Analytics Engine & Visualizer
  - M4: Thematic Maps
  - M5: Network Explorer & Public Portal
  - M6: Access Tiers & Billing
  - M7: Medstock Inventory & Operations
  - M8: DHIS2 Interoperability
  - M9: Stories & M&E
  - M10: Production Hardening

## Common Commands
- `pnpm install`: Install workspace dependencies
- `pnpm dev`: Start development environment (Web + API)
- `pnpm build`: Build all packages and applications
- `pnpm test`: Execute test suite (expression engine, period maths, unit & integration)
- `pnpm db:seed`: Seed database (`--epn`, `--demo`, `--minimal`)
