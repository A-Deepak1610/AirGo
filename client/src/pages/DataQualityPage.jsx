import React from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle, FileCheck, Database } from 'lucide-react';

export const DataQualityPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Data Quality & Zero-Dummy Data Assurance
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl">
          Automated validation pipelines ensuring 100% real observed quotes directly from rendered browser DOM with complete exclusion of simulated or mock numbers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-2">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Zero-Dummy Policy Enforced</h3>
          <p className="text-xs text-slate-500">Every quote corresponds to a real airline flight ID, actual booking seat map, and checkout total.</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 w-fit">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Schema & Checksum Verification</h3>
          <p className="text-xs text-slate-500">Strict Pydantic schema validation on all RawQuoteSchema data points before database insertion.</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-2">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 w-fit">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Audit Traceability</h3>
          <p className="text-xs text-slate-500">Every single observation stores the full screenshot proof and rendered DOM file locally.</p>
        </div>
      </div>
    </div>
  );
};
