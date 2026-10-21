# Runbook: Incident Response & Service Outage

## Severity Levels
- **P1 (Critical)**: Core API down, database inaccessible, data privacy breach, or unauthorized elevation of privilege.
- **P2 (High)**: Data entry or Medstock PWA synchronization failing for a member cluster; analytics rebuild stall.
- **P3 (Medium)**: Public portal degraded, single non-critical report export failing.

## Initial Response Steps (Within 15 Minutes)
1. **Declare Incident Commander**: Assign lead engineer and communications point.
2. **Triage Logs & Metrics**:
   - Check API health endpoint: `GET /api/v1/health`.
   - Inspect container logs via `docker compose logs -f api` or cloud logging.
   - Query error rates in Prometheus / Grafana.
3. **Data Protection Containment**:
   - If suspected unauthorized data exposure, revoke active sessions immediately via JWT blacklist and restrict RLS policies.
4. **Communication**:
   - Update EPN IT Lead and affected member technical focal points.
