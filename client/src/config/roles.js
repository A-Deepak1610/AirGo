import { 
  LayoutDashboard, 
  Database, 
  Receipt, 
  TrendingUp, 
  Activity, 
  History, 
  Server,
  PlayCircle,
  ShieldCheck,
  Layers,
  Plane,
  Sliders,
  Tag,
  FileSpreadsheet,
  Key,
  ScrollText,
  Users
} from 'lucide-react';

export const ALL_NAVIGATION_ITEMS = [
  // OVERVIEW
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', section: 'OVERVIEW' },
  
  // DATA
  { id: 'data_collection', label: 'Data Collection', icon: Database, path: '/data-collection', section: 'DATA' },
  { id: 'scraping_runs', label: 'Scraping Runs', icon: PlayCircle, path: '/scraping-runs', section: 'DATA', badge: '1.2k' },
  { id: 'airfare_data', label: 'Airfare Data', icon: Receipt, path: '/airfare-data', section: 'DATA' },
  { id: 'data_quality', label: 'Data Quality', icon: ShieldCheck, path: '/data-quality', section: 'DATA', badge: '7 alerts' },
  { id: 'source_catalog', label: 'Source Catalog', icon: Layers, path: '/source-catalog', section: 'DATA' },
  { id: 'route_basket', label: 'Route & Basket', icon: Plane, path: '/route-basket', section: 'DATA' },
  
  // INDEX
  { id: 'index_apix', label: 'Index / APIx', icon: TrendingUp, path: '/index-apix', section: 'INDEX' },
  { id: 'index_methodology', label: 'Index Methodology', icon: Sliders, path: '/index-methodology', section: 'INDEX' },
  { id: 'index_releases', label: 'Index Releases', icon: Tag, path: '/index-releases', section: 'INDEX' },
  { id: 'backtesting', label: 'Back-testing', icon: History, path: '/backtesting', section: 'INDEX' },
  
  // INSIGHTS
  { id: 'analytics', label: 'Analytics', icon: Activity, path: '/analytics', section: 'INSIGHTS' },
  { id: 'reports_exports', label: 'Reports & Exports', icon: FileSpreadsheet, path: '/reports-exports', section: 'INSIGHTS' },
  
  // PLATFORM
  { id: 'system_status', label: 'System/API Status', icon: Server, path: '/system-status', section: 'PLATFORM' },
  { id: 'api_access', label: 'API Access', icon: Key, path: '/api-access', section: 'PLATFORM' },
  { id: 'audit_log', label: 'Audit Log', icon: ScrollText, path: '/audit-log', section: 'PLATFORM' },
  { id: 'users_roles', label: 'User & Role Mgmt', icon: Users, path: '/users-roles', section: 'PLATFORM' }
];

export const USER_ROLES = {
  PLATFORM_ADMIN: {
    id: 'platform_admin',
    name: 'Vikram Sharma',
    title: 'Director of IT & Cyber Security',
    department: 'Directorate General of Civil Aviation (DGCA)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    roleLabel: 'Platform Admin',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Full administrative authority across all infrastructure, user identity, security, and governance modules.',
    allowedPathPrefixes: [
      '/dashboard',
      '/data-collection',
      '/scraping-runs',
      '/airfare-data',
      '/data-quality',
      '/source-catalog',
      '/route-basket',
      '/index-apix',
      '/index-methodology',
      '/index-releases',
      '/backtesting',
      '/analytics',
      '/reports-exports',
      '/system-status',
      '/api-access',
      '/audit-log',
      '/users-roles'
    ],
    permissions: {
      canManageUsers: true,
      canConfigureSources: true,
      canTriggerScraping: true,
      canInvestigateFailures: true,
      canRemediateDataQuality: true,
      canConfigureMethodology: true,
      canApproveReleases: true,
      canGenerateReports: true,
      canDownloadReports: true,
      canManageApiKeys: true,
      canViewAuditLog: true,
      canExportData: true
    }
  },

  DATA_ENGINEER: {
    id: 'data_engineer',
    name: 'Priya Patel',
    title: 'Lead Pipeline Engineer',
    department: 'AirGo Real-time Ingestion & Distributed Scrapers Team',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    roleLabel: 'Data Engineer',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Specialized access for scraper health, job execution triage, anti-bot mitigation, and data quality diagnostics.',
    allowedPathPrefixes: [
      '/dashboard',
      '/data-collection',
      '/scraping-runs',
      '/airfare-data',
      '/data-quality',
      '/source-catalog',
      '/route-basket',
      '/system-status',
      '/api-access'
    ],
    permissions: {
      canManageUsers: false,
      canConfigureSources: true,
      canTriggerScraping: true,
      canInvestigateFailures: true,
      canRemediateDataQuality: true,
      canConfigureMethodology: false,
      canApproveReleases: false,
      canGenerateReports: true,
      canDownloadReports: true,
      canManageApiKeys: false,
      canViewAuditLog: false,
      canExportData: true
    }
  },

  DATA_ANALYST: {
    id: 'data_analyst',
    name: 'Rohan Sen',
    title: 'Senior Econometrician',
    department: 'National Statistical Office (NSO) / MoSPI',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    roleLabel: 'Data Analyst',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Empowered to query observed flight quotes, run elasticity analyses, configure index weights, and generate reports.',
    allowedPathPrefixes: [
      '/dashboard',
      '/airfare-data',
      '/data-quality',
      '/index-apix',
      '/index-methodology',
      '/index-releases',
      '/backtesting',
      '/analytics',
      '/reports-exports'
    ],
    permissions: {
      canManageUsers: false,
      canConfigureSources: false,
      canTriggerScraping: false,
      canInvestigateFailures: false,
      canRemediateDataQuality: false,
      canConfigureMethodology: true,
      canApproveReleases: false,
      canGenerateReports: true,
      canDownloadReports: true,
      canManageApiKeys: false,
      canViewAuditLog: false,
      canExportData: true
    }
  },

  POLICY_REVIEWER: {
    id: 'policy_reviewer',
    name: 'Dr. Ananya Rao',
    title: 'Chief Statistical Advisor',
    department: 'MoSPI / DGCA Economic Statistics Division',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
    roleLabel: 'Policy / Reviewer',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Review-oriented authority to validate price anomalies, certify official APIx index releases, and inspect compliance audits.',
    allowedPathPrefixes: [
      '/dashboard',
      '/airfare-data',
      '/data-quality',
      '/index-apix',
      '/index-methodology',
      '/index-releases',
      '/backtesting',
      '/analytics',
      '/reports-exports',
      '/audit-log'
    ],
    permissions: {
      canManageUsers: false,
      canConfigureSources: false,
      canTriggerScraping: false,
      canInvestigateFailures: false,
      canRemediateDataQuality: true,
      canConfigureMethodology: false,
      canApproveReleases: true,
      canGenerateReports: true,
      canDownloadReports: true,
      canManageApiKeys: false,
      canViewAuditLog: true,
      canExportData: true
    }
  },

  API_CONSUMER: {
    id: 'api_consumer',
    name: 'Rajesh Kumar',
    title: 'Integration Architect',
    department: 'Reserve Bank of India (RBI) Monetary Policy Department',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    roleLabel: 'API Consumer / External Viewer',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'External institutional consumer with read-only access to published APIx index values, approved bulletins, and developer credentials.',
    allowedPathPrefixes: [
      '/dashboard',
      '/index-apix',
      '/reports-exports',
      '/api-access'
    ],
    permissions: {
      canManageUsers: false,
      canConfigureSources: false,
      canTriggerScraping: false,
      canInvestigateFailures: false,
      canRemediateDataQuality: false,
      canConfigureMethodology: false,
      canApproveReleases: false,
      canGenerateReports: false,
      canDownloadReports: true,
      canManageApiKeys: false,
      canViewAuditLog: false,
      canExportData: true
    }
  }
};

// Backward-compatibility aliases
USER_ROLES.STATISTICAL_OFFICER = USER_ROLES.POLICY_REVIEWER;
USER_ROLES.POLICY_ANALYST = USER_ROLES.POLICY_REVIEWER;

/**
 * Builds categorized navigation sections filtered by the current user's role.
 */
export function getSectionsForRole(role) {
  if (!role || !role.allowedPathPrefixes) {
    return [];
  }

  const sectionsMap = {
    OVERVIEW: { title: 'OVERVIEW', items: [] },
    DATA: { title: 'DATA', items: [] },
    INDEX: { title: 'INDEX', items: [] },
    INSIGHTS: { title: 'INSIGHTS', items: [] },
    PLATFORM: { title: 'PLATFORM', items: [] }
  };

  ALL_NAVIGATION_ITEMS.forEach(item => {
    const isAllowed = role.allowedPathPrefixes.some(prefix => item.path.startsWith(prefix));
    if (isAllowed && sectionsMap[item.section]) {
      sectionsMap[item.section].items.push(item);
    }
  });

  return Object.values(sectionsMap).filter(sec => sec.items.length > 0);
}

export const ROLES = USER_ROLES;
