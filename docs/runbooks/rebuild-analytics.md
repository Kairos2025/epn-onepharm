# Runbook: Analytics Rollup Table Rebuild

## Purpose
When indicator formulas are updated or when recovering from out-of-order bulk imports, the partition tables in `analytics_value` must be rebuilt from the raw fact table `data_values`.

## Execution
1. **Trigger Worker Rebuild Command**:
   ```bash
   pnpm --filter @epn/api analytics:rebuild --from 2021
   ```
2. **Execution Steps Automated by Pipeline**:
   - Recompute resource dimension tables: `analytics_org_unit_structure`, period tables.
   - Truncate and reload partitions of `analytics_value` using Kysely batch queries.
   - Invalidate Redis analytics query cache keys (`redis-cli KEYS "analytics:*" | xargs redis-cli DEL`).
3. **Verification**:
   - Query test indicator: `GET /api/v1/analytics?dimension=dx:indTracerAvail&dimension=pe:202610&dimension=ou:epnNetwork1`.
   - Ensure latency is under 2.0 seconds with warm cache.
