import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, CheckCircle, ArrowUpRight, Flame } from 'lucide-react';

export const AnomalyDetectionPage = () => {
  const anomalies = [
    { id: 'ANO-842', route: 'DEL-SXR', type: 'Surge Anomaly', severity: 'HIGH', diff: '+48.2%', fare: '₹14,800', date: '2026-08-28', status: 'Under Review', desc: 'Sudden spike in sub-24hr economy quotes across IndiGo & SpiceJet.' },
    { id: 'ANO-841', route: 'BOM-GOI', type: 'Weekend Surge', severity: 'MEDIUM', diff: '+31.5%', fare: '₹8,920', date: '2026-08-27', status: 'Verified Spike', desc: 'Long-weekend demand surge matching historical seasonality.' },
    { id: 'ANO-840', route: 'CCU-GAU', type: 'Tariff Band Deviation', severity: 'HIGH', diff: '+54.1%', fare: '₹11,200', date: '2026-08-26', status: 'Alert Sent', desc: 'Exceeded regional standard tariff cap by ₹3,200.' },
    { id: 'ANO-839', route: 'DEL-PAT', type: 'Sub-7-Day Disconnect', severity: 'MEDIUM', diff: '+28.0%', fare: '₹9,450', date: '2026-08-25', status: 'Resolved', desc: 'Flight cancellation caused momentary capacity choke on route.' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-2">
            <Flame className="w-3.5 h-3.5" /> 27 Active Real-Time Price Anomalies Detected
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Airfare Surge & Regulatory Anomaly Detection
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
            Automated machine learning anomaly detection engine monitoring sudden tariff jumps, unapproved surge pricing, and capacity constraints across 486 routes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-bold shadow-sm">
            8 High Priority
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
            19 Moderate
          </span>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
          Active Anomaly Stream (Last 48 Hours)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                <th className="py-3 px-4">Alert ID</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Anomaly Type</th>
                <th className="py-3 px-4">Observed Fare</th>
                <th className="py-3 px-4">Deviation</th>
                <th className="py-3 px-4">Detection Date</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {anomalies.map((a) => (
                <tr key={a.id} className="hover:bg-red-50/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{a.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{a.route}</td>
                  <td className="py-3.5 px-4">{a.type}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{a.fare}</td>
                  <td className="py-3.5 px-4 text-red-600 font-bold">{a.diff}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{a.date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.severity === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800'}`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-semibold text-slate-800">{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
