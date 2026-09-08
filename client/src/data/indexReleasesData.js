/**
 * Index Releases Dataset.
 * Governs the multi-stage publication pipeline of official APIx index benchmarks,
 * with release certification, reviewer sign-offs, and historical comparison metrics.
 */

export const INDEX_RELEASES = [
  {
    id: 'REL-2026-M08',
    title: 'National Airfare Price Index - August 2026 (Official Bulletin)',
    period: 'August 2026 (2026-08-01 to 2026-08-31)',
    status: 'PUBLISHED',
    headlineApix: 118.4,
    momChange: '+3.77%',
    yoyChange: '+8.2%',
    methodologyVersion: 'v1.2.0',
    basketVersion: 'v2026.2',
    dataCoveragePct: 99.85,
    observationsCount: 442100,
    reviewedBy: 'Dr. Ananya Rao (Chief Statistical Advisor)',
    approvedBy: 'Vikram Sharma (Director DGCA / Steering Chair)',
    approvalTimestamp: '2026-09-01 11:30 IST',
    publicationTimestamp: '2026-09-02 00:00 IST',
    changeSummary: 'Seasonal demand pressures on northern corridors (DEL-SXR, DEL-IXL) drove headline index upward by +3.8% MoM. Fuel surcharges remained stable at ₹400/sector.',
    sectorIndices: {
      'BOM-DEL': 122.1,
      'BLR-DEL': 119.4,
      'BLR-BOM': 114.2,
      'DEL-HYD': 116.8,
      'CCU-DEL': 124.5,
      'BOM-GOI': 112.0
    }
  },
  {
    id: 'REL-2026-M07',
    title: 'National Airfare Price Index - July 2026 (Official Bulletin)',
    period: 'July 2026 (2026-07-01 to 2026-07-31)',
    status: 'PUBLISHED',
    headlineApix: 114.1,
    momChange: '+1.42%',
    yoyChange: '+6.1%',
    methodologyVersion: 'v1.2.0',
    basketVersion: 'v2026.2',
    dataCoveragePct: 99.72,
    observationsCount: 436800,
    reviewedBy: 'Dr. Ananya Rao (Chief Statistical Advisor)',
    approvedBy: 'Vikram Sharma (Director DGCA)',
    approvalTimestamp: '2026-08-01 10:45 IST',
    publicationTimestamp: '2026-08-02 00:00 IST',
    changeSummary: 'Monsoon dip observed on leisure routes (BOM-GOI down -8.4%). Trunk corporate sectors remained resilient.',
    sectorIndices: {
      'BOM-DEL': 118.2,
      'BLR-DEL': 116.1,
      'BLR-BOM': 112.5,
      'DEL-HYD': 113.9,
      'CCU-DEL': 121.2,
      'BOM-GOI': 104.8
    }
  },
  {
    id: 'REL-2026-M06',
    title: 'National Airfare Price Index - June 2026 (Official Bulletin)',
    period: 'June 2026 (2026-06-01 to 2026-06-30)',
    status: 'ARCHIVED',
    headlineApix: 112.5,
    momChange: '+2.10%',
    yoyChange: '+5.4%',
    methodologyVersion: 'v1.2.0',
    basketVersion: 'v2026.1',
    dataCoveragePct: 99.40,
    observationsCount: 428900,
    reviewedBy: 'Dr. Ananya Rao (Chief Statistical Advisor)',
    approvedBy: 'Vikram Sharma (Director DGCA)',
    approvalTimestamp: '2026-07-01 14:15 IST',
    publicationTimestamp: '2026-07-02 00:00 IST',
    changeSummary: 'Summer holiday peak demand elevated T+1 and T+7 fares across northern tourist sectors.',
    sectorIndices: {
      'BOM-DEL': 116.0,
      'BLR-DEL': 114.8,
      'BLR-BOM': 111.0,
      'DEL-HYD': 111.5,
      'CCU-DEL': 118.4,
      'BOM-GOI': 114.2
    }
  },
  {
    id: 'REL-2026-M09-PRE',
    title: 'National Airfare Price Index - September 2026 (Preliminary Ingestion)',
    period: 'September 2026 (2026-09-01 to Present)',
    status: 'UNDER_REVIEW',
    headlineApix: 119.2,
    momChange: '+0.68%',
    yoyChange: '+8.9%',
    methodologyVersion: 'v1.2.0',
    basketVersion: 'v2026.2',
    dataCoveragePct: 99.90,
    observationsCount: 114200,
    reviewedBy: 'Rohan Sen (Senior Econometrician)',
    approvedBy: 'Pending Policy Reviewer Sign-off',
    approvalTimestamp: 'Pending',
    publicationTimestamp: 'Scheduled 2026-10-02',
    changeSummary: 'Preliminary 8-day snapshot showing early festive booking surge for October Dussehra and Diwali advance windows (T+30, T+45).',
    sectorIndices: {
      'BOM-DEL': 123.5,
      'BLR-DEL': 120.8,
      'BLR-BOM': 115.1,
      'DEL-HYD': 117.2,
      'CCU-DEL': 125.8,
      'BOM-GOI': 114.0
    }
  }
];

export const RELEASE_COMPARISON_METRICS = {
  primary: 'REL-2026-M08',
  secondary: 'REL-2026-M07',
  headlineDelta: '+4.3 points (+3.77%)',
  observationsDelta: '+5,300 observations (+1.21%)',
  sectorsComparison: [
    { corridor: 'BOM-DEL', weight: '5.85%', primaryIndex: 122.1, secondaryIndex: 118.2, delta: '+3.9', trend: 'UP' },
    { corridor: 'BLR-DEL', weight: '4.00%', primaryIndex: 119.4, secondaryIndex: 116.1, delta: '+3.3', trend: 'UP' },
    { corridor: 'BLR-BOM', weight: '3.51%', primaryIndex: 114.2, secondaryIndex: 112.5, delta: '+1.7', trend: 'UP' },
    { corridor: 'DEL-HYD', weight: '2.82%', primaryIndex: 116.8, secondaryIndex: 113.9, delta: '+2.9', trend: 'UP' },
    { corridor: 'CCU-DEL', weight: '2.37%', primaryIndex: 124.5, secondaryIndex: 121.2, delta: '+3.3', trend: 'UP' },
    { corridor: 'BOM-GOI', weight: '2.26%', primaryIndex: 112.0, secondaryIndex: 104.8, delta: '+7.2', trend: 'UP' }
  ]
};
