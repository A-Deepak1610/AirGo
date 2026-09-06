/**
 * AirGo India Aviation Geographic Data & Flight Corridor Definitions
 * High-accuracy coordinates for Indian airports, DGCA routes, and India boundary polygon.
 */

// Major Indian Airport Hubs
export const AIRPORTS = {
  DEL: { code: 'DEL', name: 'Indira Gandhi Int\'l', city: 'Delhi', lat: 28.5562, lng: 77.1000, state: 'Delhi', paxM: 73.6, tier: 'Mega Hub', fir: 'DEL-FIR' },
  BOM: { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', lat: 19.0896, lng: 72.8656, state: 'Maharashtra', paxM: 51.5, tier: 'Mega Hub', fir: 'BOM-FIR' },
  BLR: { code: 'BLR', name: 'Kempegowda Int\'l', city: 'Bengaluru', lat: 13.1986, lng: 77.7066, state: 'Karnataka', paxM: 37.5, tier: 'Trunk Hub', fir: 'MAA-FIR' },
  HYD: { code: 'HYD', name: 'Rajiv Gandhi Int\'l', city: 'Hyderabad', lat: 17.2403, lng: 78.4294, state: 'Telangana', paxM: 25.0, tier: 'Trunk Hub', fir: 'MAA-FIR' },
  CCU: { code: 'CCU', name: 'Netaji Subhash Chandra Bose', city: 'Kolkata', lat: 22.6547, lng: 88.4467, state: 'West Bengal', paxM: 19.8, tier: 'Trunk Hub', fir: 'CCU-FIR' },
  MAA: { code: 'MAA', name: 'Chennai Int\'l', city: 'Chennai', lat: 12.9941, lng: 80.1709, state: 'Tamil Nadu', paxM: 21.2, tier: 'Trunk Hub', fir: 'MAA-FIR' },
  AMD: { code: 'AMD', name: 'Sardar Vallabhbhai Patel', city: 'Ahmedabad', lat: 23.0772, lng: 72.6347, state: 'Gujarat', paxM: 11.4, tier: 'Major Metro', fir: 'BOM-FIR' },
  GOI: { code: 'GOI', name: 'Goa Dabolim / MOPA', city: 'Goa', lat: 15.3808, lng: 73.8314, state: 'Goa', paxM: 9.8, tier: 'Leisure Focus', fir: 'BOM-FIR' },
  PNQ: { code: 'PNQ', name: 'Pune Airport', city: 'Pune', lat: 18.5822, lng: 73.9197, state: 'Maharashtra', paxM: 9.2, tier: 'Regional Metro', fir: 'BOM-FIR' },
  COK: { code: 'COK', name: 'Cochin Int\'l', city: 'Kochi', lat: 10.1520, lng: 76.3922, state: 'Kerala', paxM: 10.5, tier: 'Southern Hub', fir: 'MAA-FIR' },
  JAI: { code: 'JAI', name: 'Jaipur Int\'l', city: 'Jaipur', lat: 26.8242, lng: 75.8122, state: 'Rajasthan', paxM: 5.4, tier: 'Regional Hub', fir: 'DEL-FIR' },
  SXR: { code: 'SXR', name: 'Sheikh ul-Alam Int\'l', city: 'Srinagar', lat: 33.9871, lng: 74.7741, state: 'J&K', paxM: 4.8, tier: 'Northern Focus', fir: 'DEL-FIR' },
  GAU: { code: 'GAU', name: 'Lokpriya Gopinath Bordoloi', city: 'Guwahati', lat: 26.1061, lng: 91.5859, state: 'Assam', paxM: 6.2, tier: 'North-East Hub', fir: 'CCU-FIR' },
  LKO: { code: 'LKO', name: 'Chaudhary Charan Singh', city: 'Lucknow', lat: 26.7606, lng: 80.8893, state: 'Uttar Pradesh', paxM: 5.6, tier: 'Northern Metro', fir: 'DEL-FIR' },
  IXC: { code: 'IXC', name: 'Shaheed Bhagat Singh', city: 'Chandigarh', lat: 30.6735, lng: 76.7885, state: 'Punjab', paxM: 4.1, tier: 'Northern Hub', fir: 'DEL-FIR' },
  PAT: { code: 'PAT', name: 'Jay Prakash Narayan', city: 'Patna', lat: 25.5913, lng: 85.0880, state: 'Bihar', paxM: 4.6, tier: 'Eastern Focus', fir: 'CCU-FIR' },
  BBI: { code: 'BBI', name: 'Biju Patnaik Int\'l', city: 'Bhubaneswar', lat: 20.2444, lng: 85.8178, state: 'Odisha', paxM: 4.3, tier: 'Eastern Metro', fir: 'CCU-FIR' },
  VTZ: { code: 'VTZ', name: 'Visakhapatnam Airport', city: 'Visakhapatnam', lat: 17.7212, lng: 83.2245, state: 'Andhra Pradesh', paxM: 2.9, tier: 'Coastal Focus', fir: 'MAA-FIR' },
  TRV: { code: 'TRV', name: 'Thiruvananthapuram Int\'l', city: 'Thiruvananthapuram', lat: 8.4821, lng: 76.9200, state: 'Kerala', paxM: 3.8, tier: 'Southern Focus', fir: 'MAA-FIR' },
  IXR: { code: 'IXR', name: 'Birsa Munda Airport', city: 'Ranchi', lat: 23.3143, lng: 85.3217, state: 'Jharkhand', paxM: 2.6, tier: 'Eastern Focus', fir: 'CCU-FIR' }
};

// Top DGCA Aviation Corridors with Pricing & Yield Metrics
export const FLIGHT_CORRIDORS = [
  { id: 'DEL-BOM', from: 'DEL', to: 'BOM', label: 'Delhi ↔ Mumbai', weightPct: 5.85, avgFare: 5940, baselineFare: 4800, index: 123.8, dodChange: 1.4, volatility: 4.8, activeCarriers: ['IndiGo', 'Air India', 'Akasa Air', 'SpiceJet'], duration: '2h 10m', flightsDaily: 84, pressure: 'high' },
  { id: 'BLR-DEL', from: 'BLR', to: 'DEL', label: 'Bengaluru ↔ Delhi', weightPct: 4.00, avgFare: 6420, baselineFare: 5200, index: 123.5, dodChange: 0.8, volatility: 4.2, activeCarriers: ['IndiGo', 'Air India', 'Akasa Air'], duration: '2h 45m', flightsDaily: 62, pressure: 'high' },
  { id: 'BLR-BOM', from: 'BLR', to: 'BOM', label: 'Bengaluru ↔ Mumbai', weightPct: 3.51, avgFare: 4350, baselineFare: 3700, index: 117.6, dodChange: -0.4, volatility: 3.6, activeCarriers: ['IndiGo', 'Air India', 'Akasa Air'], duration: '1h 40m', flightsDaily: 56, pressure: 'moderate' },
  { id: 'DEL-HYD', from: 'DEL', to: 'HYD', label: 'Delhi ↔ Hyderabad', weightPct: 2.82, avgFare: 5120, baselineFare: 4300, index: 119.1, dodChange: 0.6, volatility: 3.4, activeCarriers: ['IndiGo', 'Air India', 'SpiceJet'], duration: '2h 15m', flightsDaily: 48, pressure: 'moderate' },
  { id: 'DEL-PNQ', from: 'DEL', to: 'PNQ', label: 'Delhi ↔ Pune', weightPct: 2.50, avgFare: 5680, baselineFare: 4600, index: 123.5, dodChange: 1.8, volatility: 4.6, activeCarriers: ['IndiGo', 'Air India', 'SpiceJet'], duration: '2h 10m', flightsDaily: 38, pressure: 'high' },
  { id: 'CCU-DEL', from: 'CCU', to: 'DEL', label: 'Kolkata ↔ Delhi', weightPct: 2.37, avgFare: 5850, baselineFare: 4700, index: 124.5, dodChange: 2.1, volatility: 4.5, activeCarriers: ['IndiGo', 'Air India', 'SpiceJet'], duration: '2h 20m', flightsDaily: 42, pressure: 'high' },
  { id: 'MAA-DEL', from: 'MAA', to: 'DEL', label: 'Chennai ↔ Delhi', weightPct: 2.14, avgFare: 6150, baselineFare: 5100, index: 120.6, dodChange: 0.5, volatility: 3.8, activeCarriers: ['IndiGo', 'Air India'], duration: '2h 50m', flightsDaily: 36, pressure: 'moderate' },
  { id: 'BOM-GOI', from: 'BOM', to: 'GOI', label: 'Mumbai ↔ Goa', weightPct: 1.95, avgFare: 3650, baselineFare: 3200, index: 114.1, dodChange: -1.2, volatility: 4.9, activeCarriers: ['IndiGo', 'Akasa Air', 'SpiceJet'], duration: '1h 15m', flightsDaily: 32, pressure: 'stable' },
  { id: 'AMD-DEL', from: 'AMD', to: 'DEL', label: 'Ahmedabad ↔ Delhi', weightPct: 1.88, avgFare: 4200, baselineFare: 3600, index: 116.7, dodChange: 0.2, volatility: 3.1, activeCarriers: ['IndiGo', 'Air India', 'SpiceJet'], duration: '1h 35m', flightsDaily: 30, pressure: 'moderate' },
  { id: 'BOM-HYD', from: 'BOM', to: 'HYD', label: 'Mumbai ↔ Hyderabad', weightPct: 1.76, avgFare: 3950, baselineFare: 3400, index: 116.2, dodChange: 0.4, volatility: 3.2, activeCarriers: ['IndiGo', 'Air India'], duration: '1h 30m', flightsDaily: 28, pressure: 'moderate' },
  { id: 'BLR-CCU', from: 'BLR', to: 'CCU', label: 'Bengaluru ↔ Kolkata', weightPct: 1.62, avgFare: 5740, baselineFare: 4900, index: 117.1, dodChange: 0.9, volatility: 3.7, activeCarriers: ['IndiGo', 'Air India', 'Akasa Air'], duration: '2h 35m', flightsDaily: 26, pressure: 'moderate' },
  { id: 'DEL-SXR', from: 'DEL', to: 'SXR', label: 'Delhi ↔ Srinagar', weightPct: 1.54, avgFare: 6890, baselineFare: 5200, index: 132.5, dodChange: 3.4, volatility: 5.4, activeCarriers: ['IndiGo', 'Air India', 'SpiceJet'], duration: '1h 45m', flightsDaily: 24, pressure: 'high' },
  { id: 'COK-DEL', from: 'COK', to: 'DEL', label: 'Kochi ↔ Delhi', weightPct: 1.48, avgFare: 6980, baselineFare: 5800, index: 120.3, dodChange: 0.3, volatility: 3.5, activeCarriers: ['IndiGo', 'Air India'], duration: '3h 15m', flightsDaily: 22, pressure: 'moderate' },
  { id: 'BLR-HYD', from: 'BLR', to: 'HYD', label: 'Bengaluru ↔ Hyderabad', weightPct: 1.45, avgFare: 3420, baselineFare: 3100, index: 110.3, dodChange: -0.8, volatility: 2.8, activeCarriers: ['IndiGo', 'Air India', 'Akasa Air'], duration: '1h 10m', flightsDaily: 34, pressure: 'stable' },
  { id: 'DEL-GAU', from: 'DEL', to: 'GAU', label: 'Delhi ↔ Guwahati', weightPct: 1.38, avgFare: 6250, baselineFare: 5100, index: 122.5, dodChange: 1.1, volatility: 4.1, activeCarriers: ['IndiGo', 'Air India', 'SpiceJet'], duration: '2h 30m', flightsDaily: 20, pressure: 'high' },
  { id: 'BOM-CCU', from: 'BOM', to: 'CCU', label: 'Mumbai ↔ Kolkata', weightPct: 1.32, avgFare: 5980, baselineFare: 5000, index: 119.6, dodChange: 0.7, volatility: 3.9, activeCarriers: ['IndiGo', 'Air India'], duration: '2h 40m', flightsDaily: 22, pressure: 'moderate' },
  { id: 'MAA-BOM', from: 'MAA', to: 'BOM', label: 'Chennai ↔ Mumbai', weightPct: 1.28, avgFare: 4420, baselineFare: 3800, index: 116.3, dodChange: -0.2, volatility: 3.3, activeCarriers: ['IndiGo', 'Air India'], duration: '1h 55m', flightsDaily: 24, pressure: 'moderate' },
  { id: 'BOM-COK', from: 'BOM', to: 'COK', label: 'Mumbai ↔ Kochi', weightPct: 1.18, avgFare: 4650, baselineFare: 4000, index: 116.3, dodChange: 0.5, volatility: 3.4, activeCarriers: ['IndiGo', 'Air India'], duration: '2h 00m', flightsDaily: 18, pressure: 'moderate' },
  { id: 'DEL-PAT', from: 'DEL', to: 'PAT', label: 'Delhi ↔ Patna', weightPct: 1.12, avgFare: 4950, baselineFare: 4100, index: 120.7, dodChange: 1.5, volatility: 4.3, activeCarriers: ['IndiGo', 'SpiceJet'], duration: '1h 45m', flightsDaily: 20, pressure: 'high' },
  { id: 'BLR-GOI', from: 'BLR', to: 'GOI', label: 'Bengaluru ↔ Goa', weightPct: 1.05, avgFare: 3280, baselineFare: 3000, index: 109.3, dodChange: -1.5, volatility: 4.4, activeCarriers: ['IndiGo', 'Akasa Air'], duration: '1h 15m', flightsDaily: 18, pressure: 'stable' }
];

// India Geographic Boundary Coordinates (Simplified high-fidelity polygon for vector rendering)
export const INDIA_BOUNDARY = [
  [35.5, 76.8], [34.8, 78.5], [33.2, 79.2], [32.0, 78.8], [31.0, 78.4],
  [30.2, 80.5], [29.0, 80.2], [27.4, 88.1], [27.8, 88.6], [27.2, 89.0],
  [26.8, 92.0], [27.5, 93.5], [28.2, 95.0], [28.6, 96.8], [27.2, 96.5],
  [26.0, 95.2], [24.5, 94.2], [23.2, 93.3], [22.0, 93.0], [22.8, 91.8],
  [24.0, 91.8], [25.0, 91.0], [25.4, 89.8], [22.5, 89.0], [21.6, 87.5],
  [20.5, 86.8], [19.8, 86.0], [18.8, 84.5], [17.7, 83.3], [16.2, 81.2],
  [14.5, 80.2], [13.1, 80.3], [11.8, 79.8], [10.2, 79.8], [9.3, 79.1],
  [8.1, 77.5], [8.5, 76.9], [9.5, 76.3], [11.0, 75.8], [12.5, 74.9],
  [14.0, 74.4], [15.4, 73.8], [16.8, 73.3], [18.2, 72.8], [19.1, 72.8],
  [20.5, 72.7], [20.9, 70.8], [21.5, 69.5], [22.4, 69.0], [23.2, 68.6],
  [23.8, 69.0], [24.2, 71.0], [25.5, 70.8], [26.8, 70.4], [28.0, 71.8],
  [29.5, 73.2], [30.8, 74.5], [32.0, 74.8], [33.2, 74.2], [34.5, 74.3],
  [35.5, 76.8]
];

// Major Airspace FIR Boundaries
export const AIRSPACE_FIRS = [
  { name: 'DELHI FIR (VIDF)', code: 'VIDF', lat: 28.5, lng: 77.0, radiusKm: 650, color: '#38bdf8' },
  { name: 'MUMBAI FIR (VABF)', code: 'VABF', lat: 19.1, lng: 72.9, radiusKm: 700, color: '#818cf8' },
  { name: 'CHENNAI FIR (VOMF)', code: 'VOMF', lat: 13.0, lng: 80.2, radiusKm: 750, color: '#34d399' },
  { name: 'KOLKATA FIR (VECF)', code: 'VECF', lat: 22.6, lng: 88.4, radiusKm: 680, color: '#f59e0b' }
];
