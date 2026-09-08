/**
 * Users and Role-Permission Matrix Dataset.
 * Governs platform identity, role assignments, and granular functional permissions.
 */

export const PLATFORM_USERS = [
  {
    id: 'USR-001',
    name: 'Vikram Sharma',
    email: 'vikram.sharma@dgca.gov.in',
    department: 'Directorate General of Civil Aviation (DGCA)',
    roleKey: 'PLATFORM_ADMIN',
    roleLabel: 'Platform Admin',
    status: 'ACTIVE',
    lastActive: '5 minutes ago',
    createdDate: '2024-01-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'USR-002',
    name: 'Dr. Ananya Rao',
    email: 'ananya.rao@mospi.gov.in',
    department: 'Ministry of Statistics & Programme Implementation (MoSPI)',
    roleKey: 'POLICY_REVIEWER',
    roleLabel: 'Policy / Reviewer',
    status: 'ACTIVE',
    lastActive: '12 minutes ago',
    createdDate: '2024-02-01',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'USR-003',
    name: 'Priya Patel',
    email: 'priya.patel@airgo.gov.in',
    department: 'AirGo Real-time Ingestion & Pipeline Team',
    roleKey: 'DATA_ENGINEER',
    roleLabel: 'Data Engineer',
    status: 'ACTIVE',
    lastActive: '2 minutes ago',
    createdDate: '2024-03-10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'USR-004',
    name: 'Rohan Sen',
    email: 'rohan.sen@mospi.gov.in',
    department: 'National Statistical Office (NSO) Price Statistics Wing',
    roleKey: 'DATA_ANALYST',
    roleLabel: 'Data Analyst',
    status: 'ACTIVE',
    lastActive: '28 minutes ago',
    createdDate: '2024-04-05',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'USR-005',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@rbi.org.in',
    department: 'Reserve Bank of India (RBI) Monetary Policy Department',
    roleKey: 'API_CONSUMER',
    roleLabel: 'API Consumer / External Viewer',
    status: 'ACTIVE',
    lastActive: '1 hour ago',
    createdDate: '2024-05-20',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop'
  },
  {
    id: 'USR-006',
    name: 'Suresh Menon',
    email: 'suresh.menon@moca.gov.in',
    department: 'Ministry of Civil Aviation (MoCA) Economic Cell',
    roleKey: 'API_CONSUMER',
    roleLabel: 'API Consumer / External Viewer',
    status: 'ACTIVE',
    lastActive: '3 hours ago',
    createdDate: '2024-06-12',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop'
  }
];

export const PERMISSION_DEFINITIONS = [
  { key: 'canManageUsers', label: 'User & Role Administration', category: 'Platform Governance' },
  { key: 'canViewAuditLog', label: 'Audit Log Inspection', category: 'Platform Governance' },
  { key: 'canManageApiKeys', label: 'API Key Provisioning & Revocation', category: 'Platform Governance' },
  { key: 'canConfigureSources', label: 'Source Catalog Configuration', category: 'Data Operations' },
  { key: 'canTriggerScraping', label: 'Trigger On-Demand Scraping Jobs', category: 'Data Operations' },
  { key: 'canInvestigateFailures', label: 'Scraper Diagnostics & Retry Triage', category: 'Data Operations' },
  { key: 'canRemediateDataQuality', label: 'Quality Anomaly Remediation & Overrides', category: 'Quality & Governance' },
  { key: 'canConfigureMethodology', label: 'Index Formula & Parameter Tuning', category: 'Econometrics' },
  { key: 'canApproveReleases', label: 'Official Index Release Sign-off', category: 'Quality & Governance' },
  { key: 'canGenerateReports', label: 'Custom Report Generation', category: 'Reporting' },
  { key: 'canDownloadReports', label: 'Download Published Bulletins & Datasets', category: 'Reporting' },
  { key: 'canExportData', label: 'Export Query Results (CSV/JSON)', category: 'Reporting' }
];

export const ROLE_PERMISSION_MATRIX = [
  {
    permission: 'User & Role Administration',
    key: 'canManageUsers',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: false,
    DATA_ANALYST: false,
    POLICY_REVIEWER: false,
    API_CONSUMER: false
  },
  {
    permission: 'View Compliance Audit Log',
    key: 'canViewAuditLog',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: false,
    DATA_ANALYST: false,
    POLICY_REVIEWER: true,
    API_CONSUMER: false
  },
  {
    permission: 'Manage API Keys & Quotas',
    key: 'canManageApiKeys',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: false,
    DATA_ANALYST: false,
    POLICY_REVIEWER: false,
    API_CONSUMER: false
  },
  {
    permission: 'Configure Sources & Rate Limits',
    key: 'canConfigureSources',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: true,
    DATA_ANALYST: false,
    POLICY_REVIEWER: false,
    API_CONSUMER: false
  },
  {
    permission: 'Trigger Scraping Jobs',
    key: 'canTriggerScraping',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: true,
    DATA_ANALYST: false,
    POLICY_REVIEWER: false,
    API_CONSUMER: false
  },
  {
    permission: 'Investigate Scraper Failures',
    key: 'canInvestigateFailures',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: true,
    DATA_ANALYST: false,
    POLICY_REVIEWER: false,
    API_CONSUMER: false
  },
  {
    permission: 'Remediate Data Quality Anomalies',
    key: 'canRemediateDataQuality',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: true,
    DATA_ANALYST: false,
    POLICY_REVIEWER: true,
    API_CONSUMER: false
  },
  {
    permission: 'Tune Index Methodology Parameters',
    key: 'canConfigureMethodology',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: false,
    DATA_ANALYST: true,
    POLICY_REVIEWER: false,
    API_CONSUMER: false
  },
  {
    permission: 'Sign-off Official Index Releases',
    key: 'canApproveReleases',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: false,
    DATA_ANALYST: false,
    POLICY_REVIEWER: true,
    API_CONSUMER: false
  },
  {
    permission: 'Generate Official Statistical Reports',
    key: 'canGenerateReports',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: true,
    DATA_ANALYST: true,
    POLICY_REVIEWER: true,
    API_CONSUMER: false
  },
  {
    permission: 'Download Published Bulletins & Data',
    key: 'canDownloadReports',
    PLATFORM_ADMIN: true,
    DATA_ENGINEER: true,
    DATA_ANALYST: true,
    POLICY_REVIEWER: true,
    API_CONSUMER: true
  }
];
