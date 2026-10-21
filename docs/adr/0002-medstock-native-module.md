# ADR 0002: Medstock Build vs Adopt Evaluation

## Context
Section 9 of the Build Spec requires evaluating whether to adopt/fork an existing open-source warehouse/LMIS system (e.g., OpenLMIS or OpenBoxes) or build a native module within the EPN OnePharm monorepo.

## Decision
We choose to implement **Medstock as a native module** in the monorepo, paired with an open JSON/CSV adapter for facilities using third-party software.

## Justification
1. **Lightweight Scope**: EPN's primary need is facility-level macro indicators (availability of tracer medicines, stock-out days, months of stock, expiry loss), not micro patient dispensation or multi-tier international shipping logistics.
2. **Offline-First PWA**: OpenBoxes and OpenLMIS are complex monolithic server-side systems that require significant server infrastructure and do not have lightweight client-side IndexedDB offline sync designed for 3G mobile environments in rural dispensaries.
3. **Seamless Shared Types**: Building native allows direct sharing of the organisation unit tree, product master catalog, and data values sync protocol.
4. **Third-party Interoperability**: Third-party inventory tools can push aggregate daily/monthly summaries using the standard API adapter.
