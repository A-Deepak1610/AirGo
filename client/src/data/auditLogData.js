/**
 * Compliance Audit Log Dataset.
 * Immutable administrative and governance event trail for statistical and infrastructure changes.
 */

export const AUDIT_LOG_EVENTS = [
  {
    id: 'AUD-2026-9042',
    timestamp: '2026-09-08 09:45:12 IST',
    userName: 'Vikram Sharma',
    userRole: 'PLATFORM_ADMIN',
    action: 'API_KEY_ROTATED',
    entity: 'API Consumer Key (ag_live_rbi_... )',
    entityType: 'Security Credential',
    oldValue: 'Key SHA: 8a4f91... (Expires 2026-09-15)',
    newValue: 'Key SHA: c3e120... (Expires 2027-09-08)',
    ipAddress: '10.14.20.104 (DGCA Secure Gateway)',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-2026-9041',
    timestamp: '2026-09-08 08:32:05 IST',
    userName: 'Dr. Ananya Rao',
    userRole: 'POLICY_REVIEWER',
    action: 'DATA_RECORD_REMEDIATED',
    entity: 'Quote #AUDIT-DEL-BOM-AI805 (T+1)',
    entityType: 'Data Quality Anomaly',
    oldValue: 'Observed Fare: ₹38,400 (Unverified Spike)',
    newValue: 'Remediated Fare: ₹12,800 (99th %tile Winsorized)',
    ipAddress: '10.12.8.45 (MoSPI Statistics VPN)',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-2026-9040',
    timestamp: '2026-09-08 07:15:20 IST',
    userName: 'Priya Patel',
    userRole: 'DATA_ENGINEER',
    action: 'SCRAPER_RATE_LIMIT_UPDATED',
    entity: 'Source: MakeMyTrip Scraper Engine',
    entityType: 'Source Configuration',
    oldValue: 'Rate Limit: 45 req/min, Concurrency: 3',
    newValue: 'Rate Limit: 30 req/min, Concurrency: 2',
    ipAddress: '10.18.4.19 (AirGo Pipeline Cluster)',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-2026-9039',
    timestamp: '2026-09-07 16:40:10 IST',
    userName: 'Vikram Sharma',
    userRole: 'PLATFORM_ADMIN',
    action: 'USER_ROLE_MODIFIED',
    entity: 'User: rohan.sen@mospi.gov.in',
    entityType: 'User Authorization',
    oldValue: 'Role: JUNIOR_ANALYST (Read Only)',
    newValue: 'Role: DATA_ANALYST (Full Econometric Modeling)',
    ipAddress: '10.14.20.104 (DGCA Secure Gateway)',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-2026-9038',
    timestamp: '2026-09-06 18:20:00 IST',
    userName: 'Dr. Ananya Rao',
    userRole: 'POLICY_REVIEWER',
    action: 'INDEX_RELEASE_CERTIFIED',
    entity: 'Release: REL-2026-M08 (August 2026)',
    entityType: 'Index Publication',
    oldValue: 'Status: UNDER_REVIEW (Coverage 99.85%)',
    newValue: 'Status: PUBLISHED (APIx = 118.4, Certified)',
    ipAddress: '10.12.8.45 (MoSPI Statistics VPN)',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-2026-9037',
    timestamp: '2026-09-05 14:10:30 IST',
    userName: 'Priya Patel',
    userRole: 'DATA_ENGINEER',
    action: 'SOURCE_RECOVERY_DISPATCHED',
    entity: 'Source: Cleartrip Engine',
    entityType: 'Scraper Engine',
    oldValue: 'Status: DEGRADED (CDP Click Timeout)',
    newValue: 'Status: HEALTHY (Patchright Context Restored)',
    ipAddress: '10.18.4.19 (AirGo Pipeline Cluster)',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-2026-9036',
    timestamp: '2026-09-04 11:05:44 IST',
    userName: 'Dr. Ananya Rao',
    userRole: 'POLICY_REVIEWER',
    action: 'ROUTE_WEIGHT_ADJUSTED',
    entity: 'Corridor: BOM-DEL (Rank 1)',
    entityType: 'Route Basket Versioning',
    oldValue: 'Weight: 5.72% (v2026.1)',
    newValue: 'Weight: 5.85% (v2026.2 DGCA Actuals)',
    ipAddress: '10.12.8.45 (MoSPI Statistics VPN)',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-2026-9035',
    timestamp: '2026-09-03 09:30:15 IST',
    userName: 'Vikram Sharma',
    userRole: 'PLATFORM_ADMIN',
    action: 'API_CLIENT_PROVISIONED',
    entity: 'Client: Reserve Bank of India (Monetary Policy)',
    entityType: 'API Consumer Access',
    oldValue: 'Status: PENDING_SECURITY_REVIEW',
    newValue: 'Status: ACTIVE (Quota: 25,000 req/day)',
    ipAddress: '10.14.20.104 (DGCA Secure Gateway)',
    status: 'SUCCESS'
  }
];
