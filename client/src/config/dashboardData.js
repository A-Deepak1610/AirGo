export const KPI_METRICS = [
  {
    id: 'airfare_index',
    title: 'India Airfare Index',
    value: '128.6',
    change: '+1.8%',
    changeSub: 'vs July 2026',
    isPositive: true,
    tag: null
  },
  {
    id: 'avg_fare',
    title: 'Average Domestic Fare',
    value: '₹6,842',
    change: '+0.2%',
    changeSub: 'Month-over-Month',
    isPositive: true,
    tag: null
  },
  {
    id: 'passenger_traffic',
    title: 'Passenger Traffic',
    value: '12.84 Cr',
    change: '+6.7%',
    changeSub: 'DGCA Annualized',
    isPositive: true,
    tag: null
  },
  {
    id: 'routes_monitored',
    title: 'Routes Monitored',
    value: '486',
    change: '+1.8%',
    changeSub: 'Active domestic routes',
    isPositive: true,
    tag: null
  },
  {
    id: 'raw_observations',
    title: 'Raw Observations',
    value: '2.84M',
    change: '+4.5%',
    changeSub: 'Collected this month',
    isPositive: true,
    tag: null
  },
  {
    id: 'anomalies_detected',
    title: 'Anomalies Detected',
    value: '27',
    change: '8 high priority',
    changeSub: 'Active alerts',
    isPositive: false,
    tag: 'ALERT'
  }
];

export const HISTORICAL_TREND_DATA = [
  { month: 'Jan', index: 116.2, avgFare: 6180, yoy: 8.2 },
  { month: 'Feb', index: 118.0, avgFare: 6290, yoy: 8.9 },
  { month: 'Mar', index: 119.8, avgFare: 6380, yoy: 9.4 },
  { month: 'Apr', index: 121.5, avgFare: 6490, yoy: 9.9 },
  { month: 'May', index: 120.4, avgFare: 6420, yoy: 9.1 },
  { month: 'Jun', index: 123.8, avgFare: 6610, yoy: 10.1 },
  { month: 'Jul', index: 125.1, avgFare: 6720, yoy: 10.4 },
  { month: 'Aug', index: 128.6, avgFare: 6842, yoy: 10.7 }
];

export const DOMESTIC_FARE_MOVEMENT_DATA = [
  { route: 'DEL-BOM', aug26: 2800, jul26: 2200, aug25: 1420, total: '₹6,420' },
  { route: 'BOM-BLR', aug26: 2100, jul26: 1800, aug25: 1080, total: '₹4,980' },
  { route: 'DEL-BLR', aug26: 3100, jul26: 2500, aug25: 1640, total: '₹7,240' },
  { route: 'MAA-DEL', aug26: 3500, jul26: 2800, aug25: 1810, total: '₹8,110' },
  { route: 'HYD-DEL', aug26: 2400, jul26: 1950, aug25: 1270, total: '₹5,620' },
  { route: 'CCU-DEL', aug26: 2700, jul26: 2150, aug25: 1330, total: '₹6,180' }
];

export const FARE_PRESSURE_DATA = {
  highPressure: { pct: 5.6, count: 8, label: 'High Pressure', color: '#ef4444' },
  moderate: { pct: 8.9, count: 19, label: 'Moderate', color: '#f59e0b' },
  stable: { pct: 64.2, count: 312, label: 'Stable', color: '#10b981' },
  declining: { pct: 21.3, count: 147, label: 'Declining', color: '#3b82f6' },
  totalMonitored: 486
};

export const ROUTES_INFLATION_DATA = [
  {
    origin: 'Delhi',
    destination: 'Mumbai',
    passengers: '2,560,000',
    avgFare: '₹6,420',
    momChange: '+7.8%',
    momProgress: 78,
    indexContribution: '+0.82 pp',
    contributionProgress: 82,
    demandWeight: '8.4%'
  },
  {
    origin: 'Mumbai',
    destination: 'Bengaluru',
    passengers: '2,180,000',
    avgFare: '₹4,980',
    momChange: '+5.1%',
    momProgress: 51,
    indexContribution: '+0.66 pp',
    contributionProgress: 66,
    demandWeight: '7.2%'
  },
  {
    origin: 'Delhi',
    destination: 'Bengaluru',
    passengers: '2,120,000',
    avgFare: '₹7,240',
    momChange: '+6.9%',
    momProgress: 69,
    indexContribution: '+0.61 pp',
    contributionProgress: 61,
    demandWeight: '6.9%'
  },
  {
    origin: 'Chennai',
    destination: 'Delhi',
    passengers: '1,420,000',
    avgFare: '₹8,110',
    momChange: '+4.2%',
    momProgress: 42,
    indexContribution: '+0.47 pp',
    contributionProgress: 47,
    demandWeight: '4.7%'
  },
  {
    origin: 'Ahmedabad',
    destination: 'Mumbai',
    passengers: '1,180,000',
    avgFare: '₹4,630',
    momChange: '+3.1%',
    momProgress: 31,
    indexContribution: '+0.18 pp',
    contributionProgress: 18,
    demandWeight: '3.8%'
  }
];

export const PASSENGER_DEMAND_DATA = [
  { route: 'Delhi ↔ Mumbai', volume: '5.62M', widthPct: 98 },
  { route: 'Mumbai ↔ Bengaluru', volume: '4.82M', widthPct: 84 },
  { route: 'Delhi ↔ Bengaluru', volume: '4.20M', widthPct: 73 },
  { route: 'Delhi ↔ Hyderabad', volume: '3.72M', widthPct: 65 },
  { route: 'Mumbai ↔ Hyderabad', volume: '3.61M', widthPct: 63 },
  { route: 'Delhi ↔ Kolkata', volume: '3.16M', widthPct: 55 },
  { route: 'Chennai ↔ Bengaluru', volume: '2.96M', widthPct: 51 },
  { route: 'Ahmedabad ↔ Mumbai', volume: '2.54M', widthPct: 44 }
];

export const KEY_INSIGHTS_DATA = [
  {
    id: 'fare_pressure',
    title: 'Fare Pressure Increasing',
    iconType: 'trend_up',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    description: 'Airfare index increased 1.8% during August 2026, reaching an index value of 128.6... the highest in the last 8 months.',
    linkText: 'View Analysis'
  },
  {
    id: 'high_demand',
    title: 'High Demand Routes',
    iconType: 'plane',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: '5 trunk routes account for 38.4% of domestic passenger traffic, and are collectively contributing 2.62 pp to the airfare index.',
    linkText: 'View Analysis'
  },
  {
    id: 'capacity_constraint',
    title: 'Capacity Constraint',
    iconType: 'alert',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    description: 'Low-fare seat availability declined 14% on high-demand routes. This coincides with reduced elasticity in sub-7-day advance markets.',
    linkText: 'View Analysis'
  },
  {
    id: 'regional_trend',
    title: 'Regional Trend',
    iconType: 'compass',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    description: 'South-India sectors recorded the highest monthly fare growth at 4.2%. Chennai-Delhi leads with +9.2% MoM fare change.',
    linkText: 'View Analysis'
  }
];
