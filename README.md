# EPN OnePharm

[![Production Deployment](https://img.shields.io/badge/Deployment-Vercel-success?style=flat-square&logo=vercel)](https://epn-onepharm.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Kairos2025%2Fepn--onepharm-blue?style=flat-square&logo=github)](https://github.com/Kairos2025/epn-onepharm)
[![License: Proprietary](https://img.shields.io/badge/License-EPN-green?style=flat-square)](LICENSE)

> **Centralized health information and pharmaceutical systems strengthening platform for the Ecumenical Pharmaceutical Network (EPN)**, connecting 149 member organizations, 25,000+ church health facilities across 29 African nations.

---

## 🌐 Live Production Access

- **Production Portal**: [https://epn-onepharm.vercel.app](https://epn-onepharm.vercel.app)
- **Deployment Platform**: Vercel (Edge-optimized Next.js 15 App Router)
- **GitHub Repository**: [https://github.com/Kairos2025/epn-onepharm](https://github.com/Kairos2025/epn-onepharm)

---

## 🏛️ Platform Architecture

EPN OnePharm is architected following DHIS2-inspired health informatics standards:

```text
epn-onepharm/
├── apps/
│   ├── web/           # Next.js 15 App Router web portal (15 pre-rendered routes, <140 kB JS)
│   └── api/           # Express/NestJS modular REST API with Swagger & full validation
├── packages/
│   ├── domain/        # Pure TypeScript models, enums & Zod runtime schemas
│   ├── expression/    # Deterministic DHIS2 indicator math parser & safe evaluator
│   ├── periods/       # ISO 8601 period generator (Daily, Weekly, Monthly, Bi-monthly, Quarterly, Yearly)
│   ├── i18n/          # Bilingual translation engine (English & French)
│   ├── ui/            # Reusable accessible component library (Tailwind CSS, Lucide icons)
│   ├── db/            # SQLite/PostgreSQL schema layer, repositories & EPN seed dataset
│   └── sdk/           # Isomorphic typed HTTP client for OnePharm API
├── docs/              # Architectural decision records & deployment specifications
└── infra/             # Docker compose & deployment configurations
```

---

## 🚀 Key Functional Modules

1. **Dashboard (`/dashboard`)**: Aggregated network KPIs, member facility reporting progress, and real-time trends.
2. **Data Entry (`/data-entry`)**: DHIS2-style matrix data capture with client-side validation rules and auto-period generation.
3. **Data Visualizer (`/visualizer`)**: Multi-dimensional pivot tables, bar charts, and indicator time-series aggregations.
4. **GIS Maps (`/maps`)**: Interactive choropleth and facility pinpoint mapping across 18+ African partner countries.
5. **Medicine Stock Sentinel (`/medstock`)**: Essential medicines tracking, stockout alert engine, and expiry monitoring.
6. **Maintenance & Metadata (`/maintenance`)**: Data elements, indicator definitions, datasets, category combos, and org unit hierarchies.
7. **Quality & AMR Stewardship (`/quality`)**: Antimicrobial resistance surveillance and infection prevention auditing.
8. **Billing & Subscriptions (`/billing`)**: Member chapter tier management, subscription invoices, and payment tracking.
9. **Impact Stories (`/stories`)**: Field testimonies, capacity building outcomes, and donor report exports.
10. **Reports & Exports (`/reports`)**: Automated PDF/Excel export pipeline for EPN Secretariat and donor partners.

---

## 🛠️ Development & Toolchain

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 10.0.0 (v12 supported)
- Turbo >= 2.4.0

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Kairos2025/epn-onepharm.git
cd epn-onepharm

# Install workspace dependencies
pnpm install

# Run database seed (19 chapters, 18 countries, 11 facilities, 12 data elements, 5 indicators)
pnpm db:seed

# Run all test suites across the monorepo
pnpm test

# Build all packages and applications
pnpm build

# Start development servers
pnpm dev
```

---

## 🔒 Security & Data Principles

- **Macro Aggregate Focus**: Zero Patient Identifiable Information (PII) stored; only facility and national level aggregates.
- **Member Data Ownership**: Member organizations own their primary data with sovereign access controls.
- **Standards Compliant**: 100% interoperable with national DHIS2 instances via standard category combinations and period formats.
- **Strictly Typed**: Zod runtime schema validation at API boundaries and end-to-end TypeScript typings.
- **Bilingual by Design**: Complete English and French language parity across all views.
