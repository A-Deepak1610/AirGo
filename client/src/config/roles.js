import { 
  LayoutDashboard, 
  Database, 
  Receipt, 
  TrendingUp, 
  Activity, 
  History, 
  Server
} from 'lucide-react';

export const USER_ROLES = {
  STATISTICAL_OFFICER: {
    id: 'statistical_officer',
    name: 'Dr. Ananya Rao',
    title: 'Senior Statistical Officer',
    department: 'MoSPI / DGCA Economic Statistics Division',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
    roleLabel: 'Statistical Officer / Policy Analyst',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    sections: [
      {
        title: 'NAVIGATION',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
          { id: 'data_collection', label: 'Data Collection', icon: Database, path: '/data-collection' },
          { id: 'airfare_data', label: 'Airfare Data', icon: Receipt, path: '/airfare-data' },
          { id: 'index_apix', label: 'Index / APIx', icon: TrendingUp, path: '/index-apix' },
          { id: 'analytics', label: 'Analytics', icon: Activity, path: '/analytics' },
          { id: 'backtesting', label: 'Back-testing', icon: History, path: '/backtesting' },
          { id: 'system_status', label: 'System/API Status', icon: Server, path: '/system-status' }
        ]
      }
    ]
  }
};

// Backward-compatibility alias
USER_ROLES.POLICY_ANALYST = USER_ROLES.STATISTICAL_OFFICER;
