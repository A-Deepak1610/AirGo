/**
 * Data Quality Center Dataset.
 * Dedicated quality-assurance metrics, validation rules, anomaly triage queues,
 * and remediation histories for observed airfare observations.
 */

export const DATA_QUALITY_METRICS = {
  overallScore: 99.2,
  totalAuditedQuotes: 442100,
  cleanQuotesCount: 438563,
  flaggedAnomaliesCount: 7,
  remediatedThisMonth: 142,
  rejectedOutliers: 28,
  breakdown: [
    { metric: 'Missing Mandatory Fields', score: '99.98%', count: 8, status: 'HEALTHY' },
    { metric: 'Duplicate Quote Observations', score: '100.0%', count: 0, status: 'HEALTHY' },
    { metric: 'Price Outliers (>3.0 StdDev)', score: '99.6%', count: 18, status: 'MONITORING' },
    { metric: 'Sudden Fare Spikes (>75% in 1h)', score: '99.8%', count: 7, status: 'ACTION_REQUIRED' },
    { metric: 'Base Fare < Taxes Inconsistency', score: '99.9%', count: 4, status: 'HEALTHY' },
    { metric: 'Currency & Exchange Inconsistencies', score: '100.0%', count: 0, status: 'HEALTHY' },
    { metric: 'Convenience Fee Inconsistency', score: '99.7%', count: 12, status: 'HEALTHY' },
    { metric: 'Sold-Out / Stale Flight Listings', score: '99.5%', count: 22, status: 'MONITORING' }
  ]
};

export const VALIDATION_RULES = [
  {
    id: 'VR-01',
    name: 'Outlier Winsorization Guard',
    description: 'Flags fare observations that exceed 3.0 standard deviations from the corridor advance-window mean.',
    threshold: 'Z-score > 3.0 or < -2.5',
    action: 'Flag for Review & Winsorize at 99th percentile',
    severity: 'MEDIUM',
    status: 'ACTIVE'
  },
  {
    id: 'VR-02',
    name: 'Sudden Flash Spike Detector',
    description: 'Identifies sudden fare spikes exceeding 75% within a 60-minute window without holiday proximity.',
    threshold: 'Δ Price > +75% within 1 hour',
    action: 'Hold from APIx Publication until Certified',
    severity: 'HIGH',
    status: 'ACTIVE'
  },
  {
    id: 'VR-03',
    name: 'Zero Dummy Data Enforcement',
    description: 'Strictly blocks hardcoded mock seats (e.g. 18-F) or synthetic rounded fare figures.',
    threshold: 'Synthetic pattern detection',
    action: 'Fail-fast and reject record immediately',
    severity: 'CRITICAL',
    status: 'ACTIVE'
  },
  {
    id: 'VR-04',
    name: 'Base vs Tax Econometric Floor',
    description: 'Verifies that statutory aviation taxes (UDF + PSF + GST) conform to MoCA circular rates.',
    threshold: 'UDF < ₹250 or PSF < ₹91 for Tier-1',
    action: 'Trigger Scraper Tax Extraction Inspection',
    severity: 'MEDIUM',
    status: 'ACTIVE'
  },
  {
    id: 'VR-05',
    name: 'Convenience Surcharge Masking Check',
    description: 'Checks for undisclosed checkout add-ons injected at the final payment gateway.',
    threshold: 'Checkout Total - Listing Price > ₹450',
    action: 'Flag as Hidden Surcharge in Disaggregated Index',
    severity: 'HIGH',
    status: 'ACTIVE'
  }
];

export const ANOMALY_QUEUE = [
  {
    id: 'ANOM-2026-081',
    route: 'DEL-BOM',
    flightNumber: 'AI-805',
    carrier: 'Air India',
    source: 'MakeMyTrip',
    window: 'T+1',
    observedPrice: 38400,
    expectedPriceRange: '₹6,500 - ₹12,800',
    anomalyType: 'Extreme Fare Spike (+280%)',
    confidenceScore: 98.4,
    detectedAt: '2026-09-08 08:30 IST',
    status: 'PENDING_REVIEW',
    suggestedCleanValue: 12800,
    cleanReason: 'Winsorize to 99th percentile peak capacity cap',
    rawContext: 'Business class inventory incorrectly flagged as Economy fare by scraper parser'
  },
  {
    id: 'ANOM-2026-082',
    route: 'BLR-DEL',
    flightNumber: '6E-2114',
    carrier: 'IndiGo',
    source: 'Cleartrip',
    window: 'T+7',
    observedPrice: 850,
    expectedPriceRange: '₹4,200 - ₹7,900',
    anomalyType: 'Implausible Sub-Floor Fare (-82%)',
    confidenceScore: 99.1,
    detectedAt: '2026-09-08 07:15 IST',
    status: 'PENDING_REVIEW',
    suggestedCleanValue: null,
    cleanReason: 'Discard observation; likely partial fare missing base component',
    rawContext: 'Search card showed partial segment price before baggage addition'
  },
  {
    id: 'ANOM-2026-083',
    route: 'BOM-GOI',
    flightNumber: 'SG-198',
    carrier: 'SpiceJet',
    source: 'EaseMyTrip',
    window: 'T+15',
    observedPrice: 19500,
    expectedPriceRange: '₹3,800 - ₹6,500',
    anomalyType: 'Sudden Flash Spike (+205%)',
    confidenceScore: 94.2,
    detectedAt: '2026-09-08 06:45 IST',
    status: 'UNDER_INVESTIGATION',
    suggestedCleanValue: 6500,
    cleanReason: 'Impute median fare of surviving nonstop carrier quotes',
    rawContext: 'Single seat remaining on festival weekend'
  },
  {
    id: 'ANOM-2026-079',
    route: 'DEL-HYD',
    flightNumber: 'QP-1402',
    carrier: 'Akasa Air',
    source: 'Ixigo',
    window: 'T+30',
    observedPrice: 4200,
    expectedPriceRange: '₹4,100 - ₹5,800',
    anomalyType: 'Convenience Fee Discrepancy',
    confidenceScore: 89.0,
    detectedAt: '2026-09-07 22:10 IST',
    status: 'REMEDIATED',
    suggestedCleanValue: 4599,
    remediatedValue: 4599,
    cleanReason: 'Added mandatory ₹399 payment gateway surcharge observed at checkout',
    reviewedBy: 'Dr. Ananya Rao (Policy Reviewer)',
    reviewedAt: '2026-09-08 07:00 IST',
    rawContext: 'Gateway convenience fee added to total all-inclusive consumer fare'
  }
];

export const REMEDIATION_AUDIT_TRAIL = [
  {
    id: 'REM-1092',
    anomalyId: 'ANOM-2026-079',
    date: '2026-09-08 07:00 IST',
    reviewer: 'Dr. Ananya Rao',
    role: 'Policy Reviewer',
    route: 'DEL-HYD',
    originalValue: '₹4,200',
    cleanedValue: '₹4,599',
    reason: 'Normalized convenience fee surcharge to represent true consumer out-of-pocket cost',
    status: 'APPROVED_FOR_APIX'
  },
  {
    id: 'REM-1091',
    anomalyId: 'ANOM-2026-075',
    date: '2026-09-07 18:30 IST',
    reviewer: 'Priya Patel',
    role: 'Data Engineer',
    route: 'CCU-DEL',
    originalValue: '₹42,000',
    cleanedValue: '₹14,500',
    reason: 'Winsorized non-standard last-minute emergency fare per Methodology Rule 3.2',
    status: 'APPROVED_FOR_APIX'
  }
];
