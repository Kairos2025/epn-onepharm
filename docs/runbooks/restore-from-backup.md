# Runbook: Restore PostgreSQL Database from Backup

## RPO & RTO Objectives
- **RPO Target**: 15 minutes.
- **RTO Target**: 4 hours.

## Recovery Procedure
1. **Identify Target Checkpoint**:
   - Locate the latest clean WAL archive or daily snapshot in S3 encrypted bucket.
2. **Provision Isolation Container / Database**:
   ```bash
   docker exec -it epn-postgres psql -U postgres -c "CREATE DATABASE epn_restore;"
   ```
3. **Restore Snapshot**:
   ```bash
   pg_restore -U postgres -d epn_restore /backups/epn_onepharm_snapshot_latest.dump
   ```
4. **Integrity Validation**:
   - Verify table row counts against previous day summary (`SELECT count(*) FROM data_values;`).
   - Run seed integrity checks: `pnpm --filter @epn/db seed --epn`.
5. **Switch Traffic**:
   - Update `DATABASE_URL` connection strings in environment configuration.
