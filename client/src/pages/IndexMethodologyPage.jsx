import React, { useState } from 'react';
import { 
  Sliders, 
  Binary, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Calculator, 
  Clock, 
  Tag, 
  Layers, 
  RotateCcw,
  Info,
  Calendar,
  Settings
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionGuard } from '../components/common/ActionGuard';
import { METHODOLOGY_CONFIG } from '../data/methodologyData';

export const IndexMethodologyPage = () => {
  const [activeTab, setActiveTab] = useState('pipeline'); // pipeline, parameters, windows, history
  const [config, setConfig] = useState(METHODOLOGY_CONFIG);
  const [selectedParam, setSelectedParam] = useState(null);
  const [paramValue, setParamValue] = useState('');
  const [saveNotice, setSaveNotice] = useState('');

  const handleUpdateParam = (e) => {
    e.preventDefault();
    if (!selectedParam) return;

    setConfig(prev => ({
      ...prev,
      parameters: prev.parameters.map(p => p.id === selectedParam.id ? { ...p, currentValue: paramValue } : p)
    }));

    setSaveNotice(`Updated parameter "${selectedParam.name}" to "${paramValue}"`);
    setTimeout(() => setSaveNotice(''), 3000);
    setSelectedParam(null);
  };

  return (
    <div className="space-y-6 text-[#111827] font-sans animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <PageHeader
        title="Index Methodology & Econometric Configuration"
        description="Transparent mathematical and statistical specification governing the Real-time Airfare Price Index (APIx), Laspeyres aggregation, Jevons elementary formulation, and booking window weightings."
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            Active Specification: {config.currentVersion} · Laspeyres-Jevons
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'pipeline' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Synthesis Flow
            </button>
            <button
              onClick={() => setActiveTab('parameters')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'parameters' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Parameters ({config.parameters.length})
            </button>
            <button
              onClick={() => setActiveTab('windows')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'windows' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Advance Window Weights
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'history' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Version History
            </button>
          </div>
        }
      />

      {/* Save Notification */}
      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {saveNotice}
        </div>
      )}

      {/* Key Methodological Metadata Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold text-[10px] uppercase">Base Period</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">{config.basePeriod}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Aligned with MoSPI CPI revision</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold text-[10px] uppercase">Headline Formula</span>
            <p className="text-base font-bold text-blue-700 mt-0.5">{config.headlineFormula.split(' with ')[0]}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Fixed passenger volume base</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold text-[10px] uppercase">Calculation Cadence</span>
            <p className="text-base font-bold text-slate-900 mt-0.5">Every 15 Minutes</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Daily settlement at 23:59 IST</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold text-[10px] uppercase">Approved By</span>
            <p className="text-base font-bold text-emerald-700 mt-0.5">MoSPI / DGCA</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Certified on {config.effectiveDate}</p>
          </div>
        </div>
      </div>

      {/* Tab 1: Synthesis Flow (Methodology -> Data -> Calculation -> Index) */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Econometric Architecture</span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Methodology → Data Ingestion → Weight Normalization → Real-Time APIx
              </h3>
            </div>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded text-slate-300 font-mono">
              v1.2.0 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.pipelineStages.map((stage, idx) => (
              <div key={stage.step} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                      {stage.step}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Step {stage.step} of 4</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2">{stage.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{stage.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-800 text-center font-bold">
                    {stage.formula}
                  </div>
                  <ul className="text-[10px] text-slate-500 space-y-0.5 list-disc list-inside">
                    {stage.rules.map((rule, rIdx) => (
                      <li key={rIdx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Parameters Table */}
      {activeTab === 'parameters' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Econometric Parameter Tuning</h3>
            <span className="text-xs text-slate-500">Authorized configuration overrides</span>
          </div>
          <div className="divide-y divide-slate-100">
            {config.parameters.map((param) => (
              <div key={param.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400">{param.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{param.name}</h4>
                  </div>
                  <p className="text-slate-600 text-xs">{param.rationale}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-bold font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded text-xs inline-block">
                      {param.currentValue}
                    </span>
                  </div>

                  <ActionGuard permission="canConfigureMethodology" requiredRoleLabel="Data Analyst or Admin">
                    <button
                      onClick={() => {
                        setSelectedParam(param);
                        setParamValue(param.currentValue);
                      }}
                      className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3 text-slate-500" />
                      <span>Tune</span>
                    </button>
                  </ActionGuard>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Advance Purchase Weights */}
      {activeTab === 'windows' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Advance Purchase Lead-Time Weights</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Derived empirically from DGCA passenger reservation manifests to reflect true domestic booking curve distributions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {config.advancePurchaseWeights.map((win) => (
              <div key={win.horizon} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-sm text-slate-900">{win.horizon}</span>
                  <span className="text-base font-bold text-blue-700">{win.weightPct}%</span>
                </div>
                <p className="text-xs font-semibold text-slate-800">{win.label}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{win.shareExplanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Version History */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-900">Methodology Version Audit Log</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {config.versionHistory.map((ver) => (
              <div key={ver.version} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 text-xs">
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs shrink-0">
                  {ver.version}
                </span>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{ver.author}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{ver.date}</span>
                  </div>
                  <p className="text-slate-700">{ver.changes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tune Parameter Modal */}
      {selectedParam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tune Econometric Parameter</h3>
                <p className="text-xs text-slate-500">{selectedParam.name}</p>
              </div>
              <button
                onClick={() => setSelectedParam(null)}
                className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateParam} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Active Formulation</label>
                <select
                  value={paramValue}
                  onChange={(e) => setParamValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-medium"
                >
                  {selectedParam.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                <span className="font-bold text-slate-800 block mb-0.5">Statistical Rationale:</span>
                <p className="text-[11px] leading-relaxed">{selectedParam.rationale}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedParam(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Save Parameter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
