# ADR 0003: Cloud Hosting, Data Residency, and Compliance

## Context
EPN is headquartered in Nairobi, Kenya, operating under Kenya's Data Protection Act 2019, while serving members across 29 African nations, with European partner and donor relationships (Bread for the World, BMZ, Difaem, action medeor) invoking GDPR considerations.

## Decision
1. **Primary Hosting Region**: AWS Africa (Cape Town `af-south-1`) or GCP/Azure equivalent with Low-latency CDN edge PoPs across East, West, and Southern Africa (Nairobi, Lagos, Johannesburg).
2. **Data Minimization Principle**: Patient-level and individually identifiable health data are strictly excluded from the system. Facility-level data aggregates and anonymized health worker training counts are stored.
3. **Encryption & Compliance**:
   - TLS 1.3 in transit and AES-256 at rest.
   - Fine-grained data sharing agreements (DSA) per member to govern visibility tiers.
   - Comprehensive audit logging for all metadata and data value alterations.
