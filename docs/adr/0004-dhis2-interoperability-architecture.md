# ADR 0004: DHIS2 Interoperability Architecture

## Context
DHIS2 is the predominant national health management information system (HMIS) across Sub-Saharan Africa. EPN needs to ingest national metrics where available and allow external actors to consume EPN data via DHIS2 conventions.

## Decision
1. **Outbound API Compatibility**: Expose DHIS2-compliant endpoints:
   - `GET /api/v1/analytics` (returning headers, metadata, rows format)
   - `GET /api/v1/dataValueSets` (supporting JSON/CSV data value sets)
   - Metadata exports mapped to DXF / DHIS2 schema conventions.
2. **Inbound Connectors**:
   - Connection profiles storing endpoint, credentials (encrypted), synchronization cadence.
   - Org unit and Data Element mapping tables (`dhis2_mappings`).
   - Sync workers pulling from remote DHIS2 instances and storing raw payloads before translating to `data_values` with `source = 'DHIS2'`.
