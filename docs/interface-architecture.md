# Main Interface Architecture — Finalized Design

**Status**: Agreed (design session, October 2026) — this document finalizes the main interface
architecture based on the shared meeting report and the official EPN program pages
([epnetwork.org/programs](https://www.epnetwork.org/programs/)).

---

## 1. Context

EPN OnePharm is the centralized health information and pharmaceutical systems strengthening
platform for the Ecumenical Pharmaceutical Network (IPN/EPN): a health network operating across
**29 African countries**, serving **300 million people** through **25,000 health facilities** and
**149 member organizations**.

Key agreements from the design session:

- **Tiered, subscription-based access** — monthly or hourly subscription; access levels range from
  partial to full data insight; a third-party contact process exists for extended/full access.
- **DHIS2 as a national data source** — agreed parameters (e.g., patient-care-evolution aggregates)
  are extracted from national DHIS2 instances and pushed into EPN's system (macro level, no PII).
- **Macro-level data management** — the platform tracks facility/network aggregates, not granular
  real-time tracking. Simpler, clearer, easier to adopt (supersedes the earlier real-time
  supply-chain-map concept).
- **One platform** — everything lives in a single workspace organized by the categories below.

## 2. Top-level structure: 7 data categories

The authenticated workspace is organized into **7 top-level categories (blocks)**, each supporting
**up to 9 sub-categories**. This mirrors the domain taxonomy (`DataCategory`) 1:1.

| # | Category | Icon | Landing route | Scope |
|---|----------|------|---------------|-------|
| 1 | **Membership** | users | `/explorer` | Member identities, health facility links, group composition, chapters, fees, data-sharing agreements |
| 2 | **Projects** | briefcase | `/programs` | Projects by program area and health priority, funders, periods, results |
| 3 | **Health Facilities** | building | `/explorer` | Facility registry and profiles, geography, reporting completeness, facility–member links |
| 4 | **Medicines & Supply** (renamed from *Pharmaceuticals*) | pill | `/medstock` | Procurement, consumption, availability (tracers), stockouts, expiry, Minilab quality, innovative products |
| 5 | **Workforce Data** (renamed from *Human Resources*) | graduation | `/workforce` | Trainings held, people trained, champions, workforce metrics, EPN Learning Portal |
| 6 | **Financial Data** | wallet | `/explorer` | Funding received, business activity of members/DSOs, ongoing jobs, billing, financial reports |
| 7 | **Insights** | chart | `/dashboard` | Dashboards, data entry, visualizer, thematic maps, reports/exports, stories, metadata maintenance |

The **canonical definitions** (bilingual EN/FR labels, sub-category lists, hrefs) live in
`packages/domain/src/workspace.ts` (`WORKSPACE_CATEGORIES`) and drive the workspace sidebar —
the UI and the data model cannot drift apart.

### 2.1 Public summary layer

`/` (no login required) shows headline network metrics — **300M people · 25,000 facilities ·
29 countries · 149 members** — plus published stories and the Africa map, to engage visitors.
Everything beyond the public layer requires credentials; full insight requires a subscription
(see §4).

## 3. Programs and health priorities (from the official EPN site)

**Program areas** (5, confirmed at epnetwork.org/programs — matches `STRATEGIC_PROGRAMMES_2021_2025`):

1. Training and Capacity Development
2. Pharmaceutical Systems Strengthening
3. Supply Chain and Quality Assurance
4. Member Engagement
5. Donor Partnerships and Sustainability

**Health priority areas** (cross-cutting axis — `HEALTH_PRIORITIES`):
MNCH/RH · IPC & AMR · NCDs · NTDs.

**Navigation duality**: users browse either the **project list** or **by program**; each view links
to the other (implemented on `/programs`). Every project is tied to a program *and* a health
priority area. Reference projects already seeded: ACCESS II/III (381 + 160 workers trained, 160
champions), ISP (10 countries, 13 members), online/continuous training programs, MINILAB network,
SAFER, MNCH FBO.

## 4. Circular navigation model

Navigation is **interconnected, not hierarchical**: users can start from **Member**, **Health
Facility**, **Funder (Buyer)**, or **Project** and reach all related data from any entry point.

```text
        ┌─────────┐  funded by  ┌────────┐
        │ Project │◄────────────│ Funder │
        └─┬───────┘             └────────┘
   belongs to│      implements          ▲
        ┌────▼─────┐              runs    │
        │ Program  │           ┌──────────┴─┐
        └──────────┘           │  Member    │
        targets│               └──┬─────┬───┘
        ┌──────▼────┐      owns   │     │ participates in
        │ Priority  │        ┌────▼──┐  │
        └───────────┘        │Facility│◄─┘
                             └────────┘
```

- Clicking a **funder** → all their funded projects, amounts and periods.
- Clicking a **project** → its funder, program, priority area, countries and members.
- Clicking a **member** → its identity, facilities, participating projects and funders.
- Every entity page exposes cross-links; the sidebar "Start From" block lists the four entry
  points; the API exposes `/api/v1/graph/navigate` (funder→projects, member→facilities).

## 5. Access tiers (subscription-based)

| Tier | Access | Billing |
|------|--------|---------|
| PUBLIC | Public summary layer only | None |
| REGISTERED | Headline aggregates + published data | Registered account |
| BASIC | Partial data insight per category | Monthly subscription |
| PRO | Extended category insight + exports | Monthly subscription |
| FULL | Full data insight (contract-level) | Third-party contact process with the Secretariat |

The five tiers are defined in `ACCESS_TIERS` (domain) and surfaced in `/billing`.

## 6. DHIS2 integration

- National DHIS2 instances are the **central national data source**; agreed aggregate parameters
  (e.g., patient-care evolution, service statistics) are extracted and pushed into OnePharm.
- Inbound: `dhis2-connector.ts` transforms DHIS2 `dataValueSets` (mapping table + sync worker,
  M8). Outbound: `/api/v1/analytics` DHIS2-compatible endpoint for two-way exchange.
- Macro aggregates only — no patient-identifiable information ever leaves or enters.

## 7. Implementation mapping (restart of the previous work)

Route-group restart applied in this iteration:

- `apps/web/src/app/(workspace)/*` — all authenticated pages now live under a shared workspace
  layout with the **7-category sidebar** (`components/Sidebar.tsx`).
- `/` remains the public summary layer with its own navbar.
- New routes: `/programs` (programs ↔ projects dual browsing), `/workforce` (Workforce Data).
- App launcher (`Navbar`) reduced from 12 apps to the 7 categories + Public Portal.
- Domain: `WORKSPACE_CATEGORIES`, `START_FROM_ENTRY_POINTS` added; sub-category hrefs map to
  current routes and graduate to dedicated routes as milestones (M1–M10) progress.

## 8. Open items for next iterations

1. Deep-link support for explorer tabs (`?tab=members|projects|funders|facilities`) so sidebar
   sub-categories land on the exact view.
2. Program/priority assignment of projects becomes configurable metadata (M1), replacing the
   seed-level `PROJECT_PROGRAM_MAP`.
3. Financial Data module: funding received ledger with funder/period drill-down.
4. Hourly subscription metering vs monthly — pricing model confirmation with EPN Secretariat.
5. DHIS2 parameter extraction list (which indicators constitute "patient care evolution").
