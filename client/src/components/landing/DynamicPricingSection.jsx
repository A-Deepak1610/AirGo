import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Clock, Calendar, TrendingUp, Info, Plane } from 'lucide-react';

const WINDOW_PROFILES = {
  'T+1': {
    label: 'T+1 (Tomorrow / Urgent)',
    avgFare: 9850,
    peakFare: 12400,
    lowestFare: 7800,
    surgeNote: 'Severe dynamic surge — remaining 5% seat inventory released at highest yield tier.',
    points: [
      { time: '00:00', fare: 7800, carrier: 'IndiGo' },
      { time: '04:00', fare: 8100, carrier: 'Akasa Air' },
      { time: '06:00', fare: 9400, carrier: 'Air India' },
      { time: '08:00', fare: 11200, carrier: 'IndiGo' },
      { time: '10:00', fare: 11900, carrier: 'Air India' },
      { time: '12:00', fare: 10400, carrier: 'SpiceJet' },
      { time: '14:00', fare: 9800, carrier: 'IndiGo' },
      { time: '16:00', fare: 11500, carrier: 'Air India' },
      { time: '18:00', fare: 12400, carrier: 'IndiGo' },
      { time: '20:00', fare: 11100, carrier: 'Air India' },
      { time: '22:00', fare: 9900, carrier: 'Akasa Air' }
    ]
  },
  'T+7': {
    label: 'T+7 (1 Week Ahead)',
    avgFare: 7420,
    peakFare: 9600,
    lowestFare: 6100,
    surgeNote: 'Business traveler demand ramp-up — morning and evening prime departure bank surge.',
    points: [
      { time: '00:00', fare: 6100, carrier: 'IndiGo' },
      { time: '04:00', fare: 6300, carrier: 'Akasa Air' },
      { time: '06:00', fare: 7200, carrier: 'Air India' },
      { time: '08:00', fare: 8800, carrier: 'IndiGo' },
      { time: '10:00', fare: 8950, carrier: 'Air India' },
      { time: '12:00', fare: 7900, carrier: 'SpiceJet' },
      { time: '14:00', fare: 7300, carrier: 'IndiGo' },
      { time: '16:00', fare: 8600, carrier: 'Air India' },
      { time: '18:00', fare: 9600, carrier: 'IndiGo' },
      { time: '20:00', fare: 8400, carrier: 'Air India' },
      { time: '22:00', fare: 7100, carrier: 'Akasa Air' }
    ]
  },
  'T+15': {
    label: 'T+15 (2 Weeks Ahead)',
    avgFare: 6600,
    peakFare: 8200,
    lowestFare: 5200,
    surgeNote: 'Standard balanced pricing window — baseline domestic corporate and planned travel.',
    points: [
      { time: '00:00', fare: 5200, carrier: 'Akasa Air' },
      { time: '04:00', fare: 5400, carrier: 'IndiGo' },
      { time: '06:00', fare: 5850, carrier: 'Air India' },
      { time: '08:00', fare: 6800, carrier: 'IndiGo' },
      { time: '10:00', fare: 7100, carrier: 'Air India' },
      { time: '12:00', fare: 6700, carrier: 'SpiceJet' },
      { time: '14:00', fare: 6400, carrier: 'IndiGo' },
      { time: '16:00', fare: 7500, carrier: 'Air India' },
      { time: '18:00', fare: 8200, carrier: 'IndiGo' },
      { time: '20:00', fare: 7400, carrier: 'Air India' },
      { time: '22:00', fare: 6900, carrier: 'Akasa Air' }
    ]
  },
  'T+30': {
    label: 'T+30 (1 Month Ahead)',
    avgFare: 5120,
    peakFare: 6600,
    lowestFare: 4300,
    surgeNote: 'Advanced purchase discount bucket — stable pricing with low algorithmic volatility.',
    points: [
      { time: '00:00', fare: 4300, carrier: 'Akasa Air' },
      { time: '04:00', fare: 4400, carrier: 'IndiGo' },
      { time: '06:00', fare: 4800, carrier: 'Air India' },
      { time: '08:00', fare: 5600, carrier: 'IndiGo' },
      { time: '10:00', fare: 5900, carrier: 'Air India' },
      { time: '12:00', fare: 5200, carrier: 'SpiceJet' },
      { time: '14:00', fare: 4950, carrier: 'IndiGo' },
      { time: '16:00', fare: 5800, carrier: 'Air India' },
      { time: '18:00', fare: 6600, carrier: 'IndiGo' },
      { time: '20:00', fare: 5700, carrier: 'Air India' },
      { time: '22:00', fare: 4900, carrier: 'Akasa Air' }
    ]
  },
  'T+45': {
    label: 'T+45 (Early Baseline)',
    avgFare: 4250,
    peakFare: 5300,
    lowestFare: 3600,
    surgeNote: 'Base economic inventory anchor — lowest consumer fare threshold across all carriers.',
    points: [
      { time: '00:00', fare: 3600, carrier: 'Akasa Air' },
      { time: '04:00', fare: 3750, carrier: 'IndiGo' },
      { time: '06:00', fare: 4100, carrier: 'Air India' },
      { time: '08:00', fare: 4700, carrier: 'IndiGo' },
      { time: '10:00', fare: 4900, carrier: 'Air India' },
      { time: '12:00', fare: 4350, carrier: 'SpiceJet' },
      { time: '14:00', fare: 4150, carrier: 'IndiGo' },
      { time: '16:00', fare: 4800, carrier: 'Air India' },
      { time: '18:00', fare: 5300, carrier: 'IndiGo' },
      { time: '20:00', fare: 4600, carrier: 'Air India' },
      { time: '22:00', fare: 3950, carrier: 'Akasa Air' }
    ]
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 text-white rounded-xl p-3 shadow-xl text-xs font-sans">
        <div className="flex items-center justify-between gap-4 font-mono text-slate-400">
          <span>DEPARTURE TIME</span>
          <span className="font-bold text-white">{data.time}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-4">
          <span className="text-slate-400">Sampled Quote:</span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            ₹{data.fare.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between gap-4">
          <span>Carrier:</span>
          <span className="text-blue-400 font-medium">{data.carrier}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const DynamicPricingSection = () => {
  const [selectedWindow, setSelectedWindow] = useState('T+15');
  const [animatedIndex, setAnimatedIndex] = useState(4); // cursor position
  const activeProfile = WINDOW_PROFILES[selectedWindow];

  // Subtle automated cursor sweep across points
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIndex((prev) => (prev + 1) % activeProfile.points.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [activeProfile]);

  const activePoint = activeProfile.points[animatedIndex];

  return (
    <section id="dynamic-pricing" className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>HIGH-FREQUENCY VOLATILITY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              One route. Multiple prices.
            </h2>
            <p className="mt-2 text-base text-slate-600 font-normal max-w-xl">
              Tracking intraday fare volatility on India's heaviest trunk corridor across 24 hours of airline departures.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl self-start md:self-auto">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <Plane className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Selected Corridor</div>
              <div className="text-sm font-bold font-mono text-slate-900">
                DEL → BOM (Delhi ↔ Mumbai)
              </div>
            </div>
          </div>
        </div>

        {/* Advance Booking Window Tabs */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block sm:inline mr-3">
              Advance booking window:
            </span>
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs mt-2 sm:mt-0">
              {['T+1', 'T+7', 'T+15', 'T+30', 'T+45'].map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWindow(w)}
                  className={`px-3.5 py-1.5 rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                    selectedWindow === w
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
            <div>
              Lowest: <strong className="text-emerald-700">₹{activeProfile.lowestFare.toLocaleString()}</strong>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              Peak (18:00): <strong className="text-red-600">₹{activeProfile.peakFare.toLocaleString()}</strong>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              Spread: <strong className="text-slate-900">₹{(activeProfile.peakFare - activeProfile.lowestFare).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* 24-Hour Airfare Chart Card */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs relative">
          
          {/* Active Cursor Floating Callout */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
              <span className="text-slate-500 font-medium">Scanned Departure:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {activePoint.time}
              </span>
              <span className="text-slate-500">· Fare:</span>
              <span className="font-mono font-bold text-blue-600 text-sm bg-white px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                ₹{activePoint.fare.toLocaleString()}
              </span>
              <span className="text-slate-500">({activePoint.carrier})</span>
            </div>

            <span className="text-[11px] text-slate-500 font-medium italic">
              {activeProfile.surgeNote}
            </span>
          </div>

          {/* Area Chart Container */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeProfile.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fareGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[
                    Math.floor(activeProfile.lowestFare * 0.9 / 500) * 500, 
                    Math.ceil(activeProfile.peakFare * 1.08 / 500) * 500
                  ]}
                  stroke="#94a3b8" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="fare" 
                  stroke="#2563eb" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#fareGrad)" 
                  activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 6 Key Time Points Summary Cards */}
          <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
            {[
              { time: '00:00', fare: activeProfile.points[0].fare },
              { time: '06:00', fare: activeProfile.points[2].fare },
              { time: '10:00', fare: activeProfile.points[4].fare },
              { time: '14:00', fare: activeProfile.points[6].fare },
              { time: '18:00', fare: activeProfile.points[8].fare },
              { time: '22:00', fare: activeProfile.points[10].fare }
            ].map((pt) => (
              <div 
                key={pt.time} 
                className={`p-2.5 rounded-xl border transition-all ${
                  activePoint.time === pt.time 
                    ? 'bg-blue-50/80 border-blue-300 shadow-2xs font-semibold' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="font-mono text-slate-500 text-[11px]">{pt.time}</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5 text-sm tabular-nums">
                  ₹{pt.fare.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
