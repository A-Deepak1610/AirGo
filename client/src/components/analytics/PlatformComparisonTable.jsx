import React from 'react';

export const PlatformComparisonTable = ({ flight = null }) => {
  const defaultFlight = {
    flightNumber: '6E-201',
    airline: 'IndiGo',
    route: 'DEL-BOM',
    departureTime: '06:00',
    travelDate: '2026-09-19',
    fareClass: 'Economy Saver',
    platformQuotes: [
      { platform: 'IndiGo Direct', baseFare: 4800, taxes: 750, convenienceFee: 0, totalFare: 5550, isDirect: true, isLowest: true, premiumPct: 0.0 },
      { platform: 'EaseMyTrip', baseFare: 4800, taxes: 750, convenienceFee: 50, totalFare: 5600, isDirect: false, isLowest: false, premiumPct: 0.9 },
      { platform: 'Ixigo', baseFare: 4800, taxes: 750, convenienceFee: 150, totalFare: 5700, isDirect: false, isLowest: false, premiumPct: 2.7 },
      { platform: 'Cleartrip', baseFare: 4800, taxes: 750, convenienceFee: 190, totalFare: 5740, isDirect: false, isLowest: false, premiumPct: 3.4 },
      { platform: 'MakeMyTrip', baseFare: 4800, taxes: 750, convenienceFee: 250, totalFare: 5800, isDirect: false, isLowest: false, premiumPct: 4.5 }
    ]
  };

  const fData = flight || defaultFlight;
  const directQuote = fData.platformQuotes.find(q => q.isDirect) || fData.platformQuotes[0];
  const lowestQuote = [...fData.platformQuotes].sort((a, b) => a.totalFare - b.totalFare)[0];
  const highestQuote = [...fData.platformQuotes].sort((a, b) => b.totalFare - a.totalFare)[0];
  const spread = highestQuote.totalFare - lowestQuote.totalFare;
  const otaPremiumPct = parseFloat(((highestQuote.totalFare - directQuote.totalFare) / directQuote.totalFare * 100).toFixed(1));

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4 text-slate-900">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs">
              Canonical Product: {fData.flightNumber}
            </span>
            <span className="text-xs text-slate-700 font-semibold">{fData.airline} ({fData.route})</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dep: {fData.departureTime} | Travel Date: {fData.travelDate} | Class: {fData.fareClass}
          </p>
        </div>

        {/* Spread Metrics */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-right">
            <span className="text-[10px] text-slate-500 block uppercase">Platform Price Spread</span>
            <span className="text-sm font-bold text-slate-900">₹{spread}</span>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-right">
            <span className="text-[10px] text-slate-500 block uppercase">Max OTA Fee Premium</span>
            <span className="text-sm font-bold text-amber-600">+{otaPremiumPct}%</span>
          </div>
        </div>
      </div>

      {/* Disaggregation Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
              <th className="py-2.5 px-3 font-semibold">Platform Source</th>
              <th className="py-2.5 px-3 font-semibold">Base Fare</th>
              <th className="py-2.5 px-3 font-semibold">Airport Taxes (UDF/PSF)</th>
              <th className="py-2.5 px-3 font-semibold">Convenience Fee</th>
              <th className="py-2.5 px-3 font-semibold text-right font-bold text-slate-900">Total Mandatory Quote</th>
              <th className="py-2.5 px-3 font-semibold text-center">OTA Premium</th>
            </tr>
          </thead>
          <tbody>
            {fData.platformQuotes.map((q, idx) => {
              const isLowest = q.platform === lowestQuote.platform;
              return (
                <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${isLowest ? 'bg-emerald-50/60' : ''}`}>
                  <td className="py-2.5 px-3 font-medium text-slate-800 flex items-center gap-2">
                    <span>{q.platform}</span>
                    {q.isDirect && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">Direct Airline</span>
                    )}
                    {isLowest && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">Lowest Price</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">₹{q.baseFare.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">₹{q.taxes.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-amber-700">
                    {q.convenienceFee > 0 ? `₹${q.convenienceFee}` : '₹0 (Waived)'}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900 text-sm">
                    ₹{q.totalFare.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold">
                    {q.premiumPct === 0 ? (
                      <span className="text-emerald-600 text-[11px]">0.0% (Base)</span>
                    ) : (
                      <span className="text-amber-600 text-[11px]">+{q.premiumPct}%</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
        <span>* Base fare & official airport taxes are identical across portals for canonical flight products. Price variation stems from mandatory platform convenience fees.</span>
        <span className="font-bold text-slate-700">Audit Status: VALIDATED</span>
      </div>
    </div>
  );
};
