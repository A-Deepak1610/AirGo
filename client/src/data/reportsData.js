/**
 * Institutional Reports & Official Exports Dataset.
 * Provides downloadable statistical bulletins, econometric summaries, and scheduled exports.
 */

export const AVAILABLE_REPORT_TYPES = [
  {
    id: 'daily_apix',
    title: 'Daily APIx Index Summary',
    description: 'Headline and sub-index closing values for all 25 representative city-pairs with 24h price change.',
    category: 'Index Bulletin',
    formats: ['CSV', 'JSON', 'PDF', 'EXCEL'],
    frequency: 'Daily (23:59 IST)',
    targetAudience: 'RBI Nowcasting Cell, MoSPI Economic Division'
  },
  {
    id: 'weekly_bulletin',
    title: 'Weekly National Airfare Bulletin',
    description: 'Econometric analysis of 7-day advance booking dynamics, flash spikes, and weekend load factor premiums.',
    category: 'Analytical',
    formats: ['PDF', 'EXCEL'],
    frequency: 'Weekly (Every Monday 06:00 IST)',
    targetAudience: 'DGCA Economic Directorate'
  },
  {
    id: 'monthly_economic',
    title: 'Monthly Airfare Inflation Review',
    description: 'Comprehensive Laspeyres index report with weights re-normalization, corridor inflation contributions, and DGCA passenger correlation.',
    category: 'Index Bulletin',
    formats: ['PDF', 'EXCEL', 'JSON'],
    frequency: 'Monthly (1st of each month)',
    targetAudience: 'MoSPI National Accounts Division (CPI Sub-Index)'
  },
  {
    id: 'route_elasticity',
    title: 'Route-wise Lead Time & Elasticity Report',
    description: 'Disaggregated carrier-level price trajectories across T+1, T+7, T+15, T+30, and T+45 booking windows.',
    category: 'Market Intelligence',
    formats: ['CSV', 'EXCEL'],
    frequency: 'On-Demand / Weekly',
    targetAudience: 'Aviation Economists & Research Institutions'
  },
  {
    id: 'carrier_dispersion',
    title: 'Carrier Price Dispersion & Fare Class Analysis',
    description: 'Market share, fare dispersion, ancillary fuel surcharge compliance, and convenience fee breakdown by airline.',
    category: 'Compliance',
    formats: ['EXCEL', 'PDF'],
    frequency: 'Monthly',
    targetAudience: 'Competition Commission & DGCA'
  },
  {
    id: 'data_quality_audit',
    title: 'Data Quality & Anomaly Audit Log',
    description: 'Traceability report of winsorized observations, outlier remediations, and zero-dummy compliance certifications.',
    category: 'Quality Assurance',
    formats: ['CSV', 'PDF'],
    frequency: 'Weekly',
    targetAudience: 'Statistical Quality Assurance Board'
  },
  {
    id: 'scraping_performance',
    title: 'Scraper Infrastructure & Anti-Bot Reliability Report',
    description: 'Comprehensive operational telemetry covering 11 ingestion engines, latency percentiles, and CAPTCHA bypass rates.',
    category: 'Operations',
    formats: ['EXCEL', 'JSON'],
    frequency: 'Bi-Weekly',
    targetAudience: 'Platform Engineering Team'
  },
  {
    id: 'backtesting_certification',
    title: 'DGCA Econometric Back-testing Certification',
    description: 'Statistical validation comparing real-time APIx index series against official DGCA passenger yield benchmarks.',
    category: 'Validation',
    formats: ['PDF'],
    frequency: 'Quarterly',
    targetAudience: 'Ministry of Civil Aviation / NSO'
  }
];

export const GENERATED_REPORTS_ARCHIVE = [
  {
    id: 'REP-2026-0831-MTH',
    reportType: 'Monthly Airfare Inflation Review',
    title: 'AirGo Monthly National Airfare Index - August 2026',
    format: 'PDF',
    dateRange: 'Aug 01, 2026 - Aug 31, 2026',
    fileSize: '3.4 MB',
    generatedBy: 'Dr. Ananya Rao (Chief Statistical Advisor)',
    generatedAt: '2026-09-01 14:20 IST',
    status: 'CERTIFIED',
    downloadUrl: '#'
  },
  {
    id: 'REP-2026-0907-DLY',
    reportType: 'Daily APIx Index Summary',
    title: 'Daily APIx Closing Snapshot - 07 Sep 2026',
    format: 'CSV',
    dateRange: 'Sep 07, 2026',
    fileSize: '412 KB',
    generatedBy: 'Automated Pipeline Job (cron-00:00)',
    generatedAt: '2026-09-08 00:01 IST',
    status: 'COMPLETED',
    downloadUrl: '#'
  },
  {
    id: 'REP-2026-0901-WKL',
    reportType: 'Weekly National Airfare Bulletin',
    title: 'Weekly Fare Volatility & Advance Horizon Curve - W35',
    format: 'EXCEL',
    dateRange: 'Aug 24, 2026 - Aug 31, 2026',
    fileSize: '1.8 MB',
    generatedBy: 'Rohan Sen (Senior Econometrician)',
    generatedAt: '2026-09-01 09:15 IST',
    status: 'COMPLETED',
    downloadUrl: '#'
  },
  {
    id: 'REP-2026-0828-DQA',
    reportType: 'Data Quality & Anomaly Audit Log',
    title: 'Weekly Ingestion Quality & Zero-Dummy Audit Report',
    format: 'PDF',
    dateRange: 'Aug 21, 2026 - Aug 28, 2026',
    fileSize: '2.1 MB',
    generatedBy: 'Priya Patel (Lead Pipeline Engineer)',
    generatedAt: '2026-08-28 17:30 IST',
    status: 'CERTIFIED',
    downloadUrl: '#'
  },
  {
    id: 'REP-2026-0815-BKT',
    reportType: 'DGCA Econometric Back-testing Certification',
    title: 'DGCA Benchmark Validation: Q2 2026 Residual Analysis',
    format: 'PDF',
    dateRange: 'Apr 01, 2026 - Jun 30, 2026',
    fileSize: '4.8 MB',
    generatedBy: 'Dr. Ananya Rao & DGCA Econometric Team',
    generatedAt: '2026-08-15 11:00 IST',
    status: 'CERTIFIED',
    downloadUrl: '#'
  }
];

export const SCHEDULED_REPORTS = [
  {
    id: 'SCHED-01',
    name: 'Daily NSO / MoSPI Ingestion Dispatch',
    reportType: 'Daily APIx Index Summary',
    frequency: 'Daily at 00:30 IST',
    format: 'JSON & CSV',
    recipients: 'nso-cpi-feed@mospi.gov.in, apix-data@rbi.org.in',
    status: 'ACTIVE'
  },
  {
    id: 'SCHED-02',
    name: 'Weekly DGCA Regulatory Tariff Digest',
    reportType: 'Weekly National Airfare Bulletin',
    frequency: 'Mondays at 06:00 IST',
    format: 'PDF & EXCEL',
    recipients: 'tariff-monitoring@dgca.gov.in',
    status: 'ACTIVE'
  },
  {
    id: 'SCHED-03',
    name: 'Monthly CPI Air Transport Sub-Index Feed',
    reportType: 'Monthly Airfare Inflation Review',
    frequency: '1st of month at 02:00 IST',
    format: 'PDF, CSV, EXCEL',
    recipients: 'economic-adviser@moca.gov.in',
    status: 'ACTIVE'
  }
];
