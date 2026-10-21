'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  Database,
  Building,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { generateMonthlyPeriods } from '@epn/periods';

interface FormRow {
  code: string;
  name: string;
  value: string;
  previousValue: string;
  status: 'saved' | 'saving' | 'dirty' | 'error';
}

export default function DataEntryPage() {
  const [selectedDataSet, setSelectedDataSet] = useState('ds_pharma_monthly');
  const [selectedFacility, setSelectedFacility] = useState('Kilome Mission Hospital');
  const [periodIndex, setPeriodIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);

  const periods = generateMonthlyPeriods(12);
  const currentPeriod = periods[periodIndex] || periods[0];

  const [formRows, setFormRows] = useState<FormRow[]>([
    {
      code: 'TRACER_AVAIL_COUNT',
      name: 'Tracer Medicines Available On Day of Assessment',
      value: '45',
      previousValue: '42',
      status: 'saved'
    },
    {
      code: 'TRACER_TOTAL_COUNT',
      name: 'Total Tracer Medicines Assessed (Cohort)',
      value: '50',
      previousValue: '50',
      status: 'saved'
    },
    {
      code: 'STOCKOUT_DAYS_COUNT',
      name: 'Facility-Days with Stock-out of Any Tracer Item',
      value: '2',
      previousValue: '4',
      status: 'saved'
    },
    {
      code: 'FACILITY_DAYS_OBSERVED',
      name: 'Facility-Days Observed in Period',
      value: '30',
      previousValue: '30',
      status: 'saved'
    },
    {
      code: 'EML_ITEM_COUNT',
      name: 'Essential Medicines List Size (Items Adopted)',
      value: '48',
      previousValue: '46',
      status: 'saved'
    },
    {
      code: 'HCW_TRAINED_TOTAL',
      name: 'Healthcare Workers Trained in Period',
      value: '4',
      previousValue: '6',
      status: 'saved'
    }
  ]);

  const handleCellChange = (index: number, val: string) => {
    const updated = [...formRows];
    updated[index].value = val;
    updated[index].status = 'dirty';
    setFormRows(updated);

    // Simulate instant auto-save on change / blur
    setTimeout(() => {
      setFormRows(prev => {
        const next = [...prev];
        if (next[index]) next[index].status = 'saved';
        return next;
      });
    }, 600);
  };

  const handleRunValidation = () => {
    // Check validation rules from spec:
    // 1. Stockout days <= days in month
    const stockoutDays = parseInt(formRows[2].value, 10) || 0;
    const daysInMonth = parseInt(formRows[3].value, 10) || 30;

    if (stockoutDays > daysInMonth) {
      setValidationResult(`VIOLATION: Stockout days (${stockoutDays}) cannot exceed observed days in period (${daysInMonth}).`);
      return;
    }

    // 2. Tracer available <= total tracer
    const avail = parseInt(formRows[0].value, 10) || 0;
    const total = parseInt(formRows[1].value, 10) || 0;
    if (avail > total) {
      setValidationResult(`VIOLATION: Available items (${avail}) cannot exceed total items assessed (${total}).`);
      return;
    }

    setValidationResult('PASSED: All DHIS2 data validation rules satisfied.');
  };

  const handleMarkComplete = () => {
    handleRunValidation();
    setIsComplete(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Top DHIS2 Selector Bar (Section 8.3) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                DHIS2 Form Engine
              </span>
              <h1 className="text-xl font-bold text-slate-900">Facility Monthly Data Entry</h1>
            </div>

            {/* Offline sync status */}
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Wifi className="w-3.5 h-3.5" />
              <span>Offline Ready • Local Sync Up-to-Date</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Data Set selector */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Data Set (Form):</label>
              <select
                value={selectedDataSet}
                onChange={e => setSelectedDataSet(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
              >
                <option value="ds_pharma_monthly">Pharmaceutical Services Monthly Report (Monthly)</option>
                <option value="ds_committee">Committee Functionality & Meetings (Quarterly)</option>
                <option value="ds_facility_profile">Facility Annual Profile & Bed Capacity (Yearly)</option>
                <option value="ds_workforce">Workforce & Training Snapshot (Yearly)</option>
              </select>
            </div>

            {/* Org unit selector */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Health Facility (Org Unit):</label>
              <select
                value={selectedFacility}
                onChange={e => setSelectedFacility(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
              >
                <option value="Kilome Mission Hospital">Kilome Mission Hospital (CHAK, Kenya)</option>
                <option value="Kijabe Hospital">Kijabe Hospital (CHAK, Kenya)</option>
                <option value="St. Gerard Catholic Hospital">St. Gerard Catholic Hospital Kaduna (CHAN, Nigeria)</option>
                <option value="Mbingo Baptist Hospital">Mbingo Baptist Hospital (CBCHS, Cameroon)</option>
              </select>
            </div>

            {/* Period selector with prev/next */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Reporting Period:</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPeriodIndex(Math.min(periods.length - 1, periodIndex + 1))}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100"
                  title="Previous Period"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 p-2 border border-slate-300 rounded-lg bg-slate-50 font-bold text-center">
                  {currentPeriod.nameEn} ({currentPeriod.iso})
                </div>
                <button
                  onClick={() => setPeriodIndex(Math.max(0, periodIndex - 1))}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100"
                  title="Next Period"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Form Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Section 1: Tracer Medicine Stock & Governance</h3>
              <p className="text-xs text-slate-500">Values are validated and auto-saved on field blur</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunValidation}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Run Validation</span>
              </button>

              <button
                onClick={handleMarkComplete}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg text-white flex items-center gap-1.5 shadow-xs transition-colors ${
                  isComplete ? 'bg-emerald-600' : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isComplete ? 'Completed & Locked' : 'Complete Form'}</span>
              </button>
            </div>
          </div>

          {/* Validation Banner if run */}
          {validationResult && (
            <div
              className={`p-3 text-xs font-semibold border-b ${
                validationResult.startsWith('PASSED')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {validationResult}
            </div>
          )}

          {/* Form Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 w-12">#</th>
                  <th className="py-2.5 px-4">Data Element</th>
                  <th className="py-2.5 px-4 w-32 text-center">Previous Value</th>
                  <th className="py-2.5 px-4 w-44">Current Value</th>
                  <th className="py-2.5 px-4 w-28 text-center">Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formRows.map((row, idx) => (
                  <tr key={row.code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{row.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{row.code}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500 tabular-nums">
                      {row.previousValue}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={row.value}
                        onChange={e => handleCellChange(idx, e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 tabular-nums"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.status === 'saved' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Saved</span>
                        </span>
                      )}
                      {row.status === 'saving' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 font-medium animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>Saving...</span>
                        </span>
                      )}
                      {row.status === 'dirty' && (
                        <span className="text-[11px] text-amber-700 font-medium">Edited</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
