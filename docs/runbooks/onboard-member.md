# Runbook: Member Onboarding Procedure

## Process Flow
1. **Member Registration**:
   - Insert new row in `members` table with ISO country code and member type (`CHA`, `DSO`, `CHI`, `HSS`).
   - Create Level 3 Organisation Unit (`org_units` with `kind = 'MEMBER'`).
2. **Data-Sharing Agreement (DSA)**:
   - Establish `data_sharing_agreements` record specifying default visibility tiers per data category (`PHARMACEUTICAL`, `WORKFORCE`, `FINANCIAL`).
3. **Facility Ingestion**:
   - Run the Facility Master List Importer with the member's official facility directory:
     ```bash
     pnpm --filter @epn/db facility:import --file member_facilities.csv --member CHAK
     ```
   - Resolve duplicates flagged in the review queue.
4. **User Invitation**:
   - Issue administrative credentials with `MEMBER_ADMIN` role and org unit scope set to the member's chapter path.
