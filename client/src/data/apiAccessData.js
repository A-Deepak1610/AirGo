/**
 * API Access and External Consumer Management Dataset.
 * Governs institutional API keys, rate limit quotas, and developer endpoint documentation.
 */

export const API_CONSUMER_KEYS = [
  {
    id: 'KEY-RBI-001',
    clientName: 'Reserve Bank of India (Monetary Policy Dept)',
    keyPrefix: 'ag_live_rbi_9a4f...',
    status: 'ACTIVE',
    scopes: ['apix:read', 'sectors:summary', 'bulletin:download'],
    rateLimitPerMin: 120,
    dailyQuota: 25000,
    monthlyRequests: 184500,
    lastUsed: '2 minutes ago',
    createdAt: '2025-06-01',
    expiresAt: '2027-06-01',
    contactEmail: 'monetary-nowcast@rbi.org.in'
  },
  {
    id: 'KEY-MOSPI-002',
    clientName: 'MoSPI National Accounts Division',
    keyPrefix: 'ag_live_mospi_c2e1...',
    status: 'ACTIVE',
    scopes: ['apix:read', 'quotes:read', 'elasticity:read', 'reports:all'],
    rateLimitPerMin: 300,
    dailyQuota: 50000,
    monthlyRequests: 412000,
    lastUsed: '15 minutes ago',
    createdAt: '2025-01-10',
    expiresAt: '2028-01-10',
    contactEmail: 'cpi-data@mospi.gov.in'
  },
  {
    id: 'KEY-DGCA-003',
    clientName: 'DGCA Tariff Monitoring Directorate',
    keyPrefix: 'ag_live_dgca_7f88...',
    status: 'ACTIVE',
    scopes: ['* (Full Administrative Read)'],
    rateLimitPerMin: 500,
    dailyQuota: 100000,
    monthlyRequests: 620000,
    lastUsed: 'Just now',
    createdAt: '2024-11-01',
    expiresAt: '2028-11-01',
    contactEmail: 'tariff-cell@dgca.gov.in'
  },
  {
    id: 'KEY-IIMA-004',
    clientName: 'IIM Ahmedabad (Aviation Economics Lab)',
    keyPrefix: 'ag_live_iima_3b11...',
    status: 'ACTIVE',
    scopes: ['apix:read', 'elasticity:read'],
    rateLimitPerMin: 60,
    dailyQuota: 5000,
    monthlyRequests: 32400,
    lastUsed: '4 hours ago',
    createdAt: '2026-02-15',
    expiresAt: '2027-02-15',
    contactEmail: 'transport-lab@iima.ac.in'
  },
  {
    id: 'KEY-MOCA-005',
    clientName: 'Ministry of Civil Aviation (Planning Cell)',
    keyPrefix: 'ag_revoked_moca_001',
    status: 'REVOKED',
    scopes: ['apix:read'],
    rateLimitPerMin: 60,
    dailyQuota: 10000,
    monthlyRequests: 0,
    lastUsed: '2026-08-10',
    createdAt: '2025-03-01',
    expiresAt: '2026-08-10 (Revoked for rotation)',
    contactEmail: 'planning@moca.gov.in'
  }
];

export const API_ENDPOINTS_DOCUMENTATION = [
  {
    path: '/api/v1/index/realtime',
    method: 'GET',
    title: 'Real-time National APIx Headline Index',
    description: 'Retrieves the latest synthesized national airfare price index number, 24-hour change, and base weights.',
    authRequired: true,
    requiredScope: 'apix:read',
    queryParams: [
      { name: 'base', type: 'string', default: '2024', description: 'Base period index year reference' },
      { name: 'corridors', type: 'string', default: 'ALL', description: 'Comma-separated list of route codes (e.g. BOM-DEL,BLR-DEL)' }
    ],
    sampleCurl: 'curl -X GET "https://airgo.gov.in/api/v1/index/realtime?base=2024" \\\n  -H "Authorization: Bearer ag_live_rbi_9a4f..."',
    sampleResponse: {
      timestamp: '2026-09-08T09:45:00Z',
      headline_index: 118.4,
      base_year: 2024,
      mom_inflation_pct: 3.77,
      formula: 'Laspeyres',
      routes_count: 25,
      status: 'PUBLISHED'
    }
  },
  {
    path: '/api/v1/institutional/nso-feed',
    method: 'GET',
    title: 'MoSPI / NSO Official CPI Transport Feed',
    description: 'Structured ingestion endpoint delivering standardized air transport consumer price relatives for CPI synthesis.',
    authRequired: true,
    requiredScope: 'reports:all',
    queryParams: [
      { name: 'month', type: 'string', default: '2026-08', description: 'Target statistical accounting month (YYYY-MM)' }
    ],
    sampleCurl: 'curl -X GET "https://airgo.gov.in/api/v1/institutional/nso-feed?month=2026-08" \\\n  -H "Authorization: Bearer ag_live_mospi_c2e1..."',
    sampleResponse: {
      sub_index: 'AIR_TRANSPORT_DOMESTIC',
      index_value: 118.4,
      weights_basket_version: 'v2026.2',
      observations_audited: 442100,
      zero_dummy_certified: true
    }
  },
  {
    path: '/api/v1/quotes',
    method: 'GET',
    title: 'Disaggregated Airfare Quote Observations',
    description: 'Queries cleaned and verified flight fare observations with base fare, mandatory taxes, and lead-time window.',
    authRequired: true,
    requiredScope: 'quotes:read',
    queryParams: [
      { name: 'route', type: 'string', required: true, description: 'Origin-Destination pair (e.g. BOM-DEL)' },
      { name: 'horizon', type: 'string', default: 'T+1', description: 'Advance window: T+1, T+7, T+15, T+30, T+45' },
      { name: 'limit', type: 'integer', default: 50, description: 'Maximum records to return' }
    ],
    sampleCurl: 'curl -X GET "https://airgo.gov.in/api/v1/quotes?route=BOM-DEL&horizon=T+1" \\\n  -H "Authorization: Bearer ag_live_dgca_7f88..."',
    sampleResponse: {
      count: 2,
      quotes: [
        {
          flight_number: '6E-6027',
          carrier: 'IndiGo',
          base_fare: 4709,
          taxes: 1720,
          total_fare: 6429,
          advance_window: 'T+1',
          verified: true
        }
      ]
    }
  }
];
