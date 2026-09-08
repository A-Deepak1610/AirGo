import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionGuard } from '../components/common/ActionGuard';
import { AVAILABLE_REPORT_TYPES, GENERATED_REPORTS_ARCHIVE, SCHEDULED_REPORTS } from '../data/reportsData';

export const ReportsExportsPage = () => {
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, archive, schedules
  const [selectedFormat, setSelectedFormat] = useState('CSV');
  const [dateRange, setDateRange] = useState('August 2026');
  const [downloadNotice, setDownloadNotice] = useState('');

  const triggerExport = (report) => {
    // Generate realistic JSON or CSV downloadable payload
    const reportData = {
      reportId: `EXPORT-${Date.now().toString().slice(-6)}`,
      reportTitle: report.title,
      category: report.category,
      period: dateRange,
      format: selectedFormat,
      generatedAt: new Date().toISOString(),
      institution: 'Ministry of Statistics & Programme Implementation (MoSPI) / DGCA',
      benchmarkIndex: 118.4,
      methodology: 'Laspeyres Price Index (Base 2024=100)',
      dataSummary: {
        totalCityPairs: 25,
        observationsAnalyzed: 442100,
        zeroDummyCertified: true,
        qualityScore: '99.2%'
      }
    };

    const dataStr = selectedFormat === 'JSON'
      ? "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2))
      : "data:text/csv;charset=utf-8," + encodeURIComponent(
          "Report,Period,GeneratedAt,Format,IndexValue,Observations\n" +
          `"${report.title}","${dateRange}","${new Date().toISOString()}","${selectedFormat}",118.4,442100`
        );

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `airgo_${report.id}_${dateRange.replace(/\s+/g, '_')}.${selectedFormat.toLowerCase()}`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadNotice(`Downloaded ${report.title} (${selectedFormat}) successfully.`);
    setTimeout(() => setDownloadNotice(''), 3500);
  };

  return (
    <div className="space-y-6 text-[#111827] font-sans animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <PageHeader
        title="Official Reports & Institutional Export Center"
        description="Downloadable econometric bulletins, disaggregated price observation extracts, and automated statistical dispatches for MoSPI, RBI, and DGCA analysts."
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            8 Standardized Formats · Multi-Format Export
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'catalog' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Report Catalog ({AVAILABLE_REPORT_TYPES.length})
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'archive' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Generated Archive ({GENERATED_REPORTS_ARCHIVE.length})
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'schedules' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Scheduled Dispatches ({SCHEDULED_REPORTS.length})
            </button>
          </div>
        }
        filters={
          activeTab === 'catalog' && (
            <div className="flex items-center justify-between gap-3 flex-wrap w-full text-[13px]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#4B5563]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-500">Period:</span>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-transparent font-bold text-[#111827] focus:outline-none cursor-pointer"
                  >
                    <option value="August 2026">August 2026 (Official Release)</option>
                    <option value="July 2026">July 2026</option>
                    <option value="June 2026">June 2026</option>
                    <option value="FY 2025-26">Full Year FY 2025-26</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#4B5563]">
                  <span className="font-semibold text-slate-500">Target Format:</span>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="bg-transparent font-bold text-[#111827] focus:outline-none cursor-pointer"
                  >
                    <option value="CSV">CSV (Spreadsheet Ingestion)</option>
                    <option value="JSON">JSON (Automated API Feed)</option>
                    <option value="EXCEL">Excel (.xlsx)</option>
                    <option value="PDF">PDF (Formal Briefing)</option>
                  </select>
                </div>
              </div>

              <span className="text-xs text-[#6B7280]">
                Downloads authenticated and digitally watermarked
              </span>
            </div>
          )
        }
      />

      {/* Download Alert Toast */}
      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {downloadNotice}
        </div>
      )}

      {/* Tab 1: Available Report Catalog */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_REPORT_TYPES.map((rep) => (
            <div
              key={rep.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 flex flex-col justify-between hover:border-blue-300 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {rep.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Cadence: {rep.frequency}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-tight">{rep.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{rep.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Consumer:</p>
                  <p className="text-[11px] font-medium text-slate-700">{rep.targetAudience}</p>
                </div>

                <ActionGuard permission="canDownloadReports" requiredRoleLabel="Authorized Stakeholder">
                  <button
                    onClick={() => triggerExport(rep)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {selectedFormat}</span>
                  </button>
                </ActionGuard>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Generated Archive */}
      {activeTab === 'archive' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Historical Generated Reports Archive</h3>
            <span className="text-xs text-slate-500">Certified statistical releases stored on disk</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Report Title & Type</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">Period</th>
                  <th className="p-3">Generated By</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {GENERATED_REPORTS_ARCHIVE.map((gen) => (
                  <tr key={gen.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{gen.id}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-900">{gen.title}</p>
                      <p className="text-[10px] text-slate-400">{gen.reportType}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-700">
                        {gen.format}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{gen.dateRange}</td>
                    <td className="p-3">
                      <p className="font-medium text-slate-800">{gen.generatedBy}</p>
                      <p className="text-[10px] text-slate-400">{gen.generatedAt}</p>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{gen.fileSize}</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {gen.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <ActionGuard permission="canDownloadReports" requiredRoleLabel="Authorized Stakeholder">
                        <button
                          onClick={() => triggerExport({ id: gen.id, title: gen.title, category: 'Archive' })}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Get</span>
                        </button>
                      </ActionGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Scheduled Reports */}
      {activeTab === 'schedules' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scheduled Automated Dispatches</h3>
              <p className="text-xs text-slate-500">Cron jobs dispatching certified data feeds to institutional consumers</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {SCHEDULED_REPORTS.map((sched) => (
              <div key={sched.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400">{sched.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{sched.name}</h4>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                      {sched.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{sched.reportType} · Formats: <span className="font-mono font-bold">{sched.format}</span></p>
                  <p className="text-[11px] text-slate-400">Recipients: <span className="font-mono">{sched.recipients}</span></p>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold font-mono text-xs inline-block">
                    {sched.frequency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
