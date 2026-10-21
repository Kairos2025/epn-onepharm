# Runbook: Onboard National DHIS2 Inbound Connection

## Context
When a member country grants access to national health data (e.g. Kenya KHIS or Tanzania DHIS2), an inbound connection is registered to pull facility reporting metrics.

## Setup Steps
1. **Connection Registration**:
   - Register endpoint in `dhis2_connections`: base URL, authentication token (stored AES-256 encrypted), and polling schedule.
2. **Metadata Mapping**:
   - Map national org unit UIDs to EPN facility IDs (`facility_profiles.dhis2_org_unit_uid`).
   - Map national data element / indicator codes to EPN data elements in `dhis2_mappings`.
3. **Dry-Run Pull Verification**:
   - Execute dry-run fetch:
     `GET /api/v1/dhis2/pull?connectionId=khis_ke&dryRun=true`
   - Verify unmapped records count is under 5%.
4. **Scheduled Activation**:
   - Enable BullMQ nightly synchronization job.
   - Captured values populate `data_values` with `source = 'DHIS2'`.
