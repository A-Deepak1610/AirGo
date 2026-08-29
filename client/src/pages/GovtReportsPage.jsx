import React from 'react';
import { FileText, Download, ShieldCheck, Printer } from 'lucide-react';

export const GovtReportsPage = () => {
  const reports = [
    { title: 'MoSPI Monthly CPI Airfare Modernization Report (August 2026)', date: 'August 2026', size: '2.4 MB', type: 'PDF' },
    { title: 'DGCA Domestic Tariff Compliance & Surge Audit Summary', date: 'August 2026', size: '1.8 MB', type: 'PDF' },
    { title: 'Reserve Bank of India Monetary Policy Committee Briefing Pack', date: 'August 2026', size: '3.1 MB', type: 'PDF' },
    { title: 'Top-100 Domestic Sector Demand Weight Rebalancing Report', date: 'FY 2024-25', size: '1.2 MB', type: 'PDF' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Government & Regulatory Reports
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
          Automated executive briefings and compliance dossiers formatted for the National Statistical Office (NSO), DGCA, and Reserve Bank of India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r, idx) => (
          <div key={idx} className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{r.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{r.date} • {r.size} • {r.type}</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0 transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
