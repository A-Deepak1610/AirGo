import { 
  LayoutDashboard, 
  TrendingUp, 
  Compass, 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Database, 
  Activity, 
  CheckCircle2, 
  History, 
  FileText, 
  Download, 
  Shield, 
  Settings,
  Scale,
  Briefcase
} from 'lucide-react';

export const USER_ROLES = {
  POLICY_ANALYST: {
    id: 'policy_analyst',
    name: 'Dr. Ananya Rao',
    title: 'Senior Policy Analyst',
    department: 'MoSPI / NSO Economic Statistics',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
    roleLabel: 'Senior Policy Analyst',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    sections: [
      {
        title: 'OVERVIEW',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', active: true }
        ]
      },
      {
        title: 'INTELLIGENCE',
        items: [
          { id: 'airfare_index', label: 'Airfare Index', icon: TrendingUp, path: '/airfare-index' },
          { id: 'route_intelligence', label: 'Route Intelligence', icon: Compass, path: '/route-intelligence' },
          { id: 'fare_analytics', label: 'Fare Analytics', icon: BarChart3, path: '/fare-analytics' },
          { id: 'passenger_demand', label: 'Passenger Demand', icon: Users, path: '/passenger-demand' },
          { id: 'anomaly_detection', label: 'Anomaly Detection', icon: AlertTriangle, path: '/anomaly-detection', badge: '27' }
        ]
      },
      {
        title: 'DATA',
        items: [
          { id: 'data_sources', label: 'Data Sources', icon: Database, path: '/data-sources' },
          { id: 'scraping_monitor', label: 'Scraping Monitor', icon: Activity, path: '/scraping-monitor' },
          { id: 'data_quality', label: 'Data Quality', icon: CheckCircle2, path: '/data-quality' },
          { id: 'historical_data', label: 'Historical Data', icon: History, path: '/historical-data' }
        ]
      },
      {
        title: 'REPORTS',
        items: [
          { id: 'govt_reports', label: 'Government Reports', icon: FileText, path: '/govt-reports' },
          { id: 'export_centre', label: 'Export Centre', icon: Download, path: '/export-centre' }
        ]
      },
      {
        title: 'ADMINISTRATION',
        items: [
          { id: 'users_roles', label: 'Users & Roles', icon: Shield, path: '/users-roles' },
          { id: 'system_settings', label: 'System Settings', icon: Settings, path: '/system-settings' }
        ]
      }
    ]
  },

  DGCA_AUDITOR: {
    id: 'dgca_auditor',
    name: 'Rajesh Verma',
    title: 'DGCA Tariff Auditor',
    department: 'Directorate General of Civil Aviation',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    roleLabel: 'Tariff Regulator',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    sections: [
      {
        title: 'OVERVIEW',
        items: [
          { id: 'dashboard', label: 'Tariff Compliance Dashboard', icon: LayoutDashboard, path: '/', active: true }
        ]
      },
      {
        title: 'REGULATORY AUDIT',
        items: [
          { id: 'airfare_index', label: 'Sector Tariff Compliance', icon: Scale, path: '/airfare-index' },
          { id: 'route_intelligence', label: 'High Demand Surge Audit', icon: Compass, path: '/route-intelligence' },
          { id: 'anomaly_detection', label: 'Surge Price Anomalies', icon: AlertTriangle, path: '/anomaly-detection', badge: '12' }
        ]
      },
      {
        title: 'EVIDENCE & DATA',
        items: [
          { id: 'scraping_monitor', label: 'Live Scraping Audits', icon: Activity, path: '/scraping-monitor' },
          { id: 'data_quality', label: 'OTA Ground-Truth Verifier', icon: CheckCircle2, path: '/data-quality' },
          { id: 'historical_data', label: 'Historical DGCA Tariff Archive', icon: History, path: '/historical-data' }
        ]
      },
      {
        title: 'REPORTS',
        items: [
          { id: 'govt_reports', label: 'DGCA Tariff Reports', icon: FileText, path: '/govt-reports' },
          { id: 'export_centre', label: 'Compliance Audit Exports', icon: Download, path: '/export-centre' }
        ]
      }
    ]
  },

  RBI_OFFICER: {
    id: 'rbi_officer',
    name: 'Dr. Sunita Deshmukh',
    title: 'RBI Monetary Policy Analyst',
    department: 'Reserve Bank of India (Monetary Policy Dept)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop',
    roleLabel: 'Monetary Policy Officer',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    sections: [
      {
        title: 'OVERVIEW',
        items: [
          { id: 'dashboard', label: 'CPI Air Transport Dashboard', icon: LayoutDashboard, path: '/', active: true }
        ]
      },
      {
        title: 'MACRO INFLATION',
        items: [
          { id: 'airfare_index', label: 'Real-Time APIx Series', icon: TrendingUp, path: '/airfare-index' },
          { id: 'fare_analytics', label: 'CPI Basket Weight Impact', icon: BarChart3, path: '/fare-analytics' },
          { id: 'passenger_demand', label: 'Transport Demand Deflator', icon: Users, path: '/passenger-demand' }
        ]
      },
      {
        title: 'FORECASTING',
        items: [
          { id: 'historical_data', label: 'Monthly CPI Historical Comparison', icon: History, path: '/historical-data' },
          { id: 'govt_reports', label: 'Monetary Policy Committee Reports', icon: FileText, path: '/govt-reports' },
          { id: 'export_centre', label: 'RBI Macro Data Feeds (JSON/CSV)', icon: Download, path: '/export-centre' }
        ]
      }
    ]
  }
};
