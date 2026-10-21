'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  BarChart3,
  LineChart,
  PieChart,
  Table as TableIcon,
  Download,
  Share2,
  Calendar,
  Building,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';

export default function VisualizerPage() {
  const [selectedDx, setSelectedDx] = useState('indTracerAvail');
  const [chartType, setChartType] = useState<'COLUMN' | 'LINE' | 'TABLE'>('COLUMN');

  const chartSeries = [
    { label: 'CHAK (Kenya)', val: 88.5, baseline: 65.0, target: 85.0 },
    { label: 'MEDS Network', val: 92.1, baseline: 70.0, target: 85.0 },
    { label: 'CHAN (Nigeria)', val: 78.4, baseline: 60.0, target: 85.0 },
    { label: 'CSSC (Tanzania)', val: 84.0, baseline: 62.0, target: 85.0 },
    { label: 'CBCHS (Cameroon)', val: 89.2, baseline: 68.0, target: 85.0 },
    { label: 'BUFMAR (Rwanda)', val: 91.0, baseline: 72.0, target: 85.0 }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Top visualizer control bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                DHIS2 Visualizer
              </span>
              <h1 className="text-xl font-bold text-slate-900">Analytical Visualizer & Chart Studio</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Explore multi-dimensional data across time and member chapters.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Chart Type toggles */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setChartType('COLUMN')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                  chartType === 'COLUMN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Column</span>
              </button>
              <button
                onClick={() => setChartType('LINE')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                  chartType === 'LINE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Trend</span>
              </button>
              <button
                onClick={() => setChartType('TABLE')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                  chartType === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Data Table</span>
              </button>
            </div>

            <button className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg font-semibold shadow-xs">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Dimension & Canvas Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Dimension Selector Panel (Section 8.4) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider">Dimension Selector</h3>

            {/* Data Dimension (dx) */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Indicator (dx):</label>
              <select
                value={selectedDx}
                onChange={e => setSelectedDx(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
              >
                <option value="indTracerAvail">Tracer Medicine Availability (%)</option>
                <option value="indStockoutRate">Stock-out Rate (%)</option>
                <option value="indDtcFunctionality">Facilities with Functional DTC (%)</option>
                <option value="indRevenueTracking">Facilities Tracking Revenue (%)</option>
              </select>
            </div>

            {/* Period Dimension (pe) */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Period (pe):</label>
              <select className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium">
                <option>October 2026 (202610)</option>
                <option>Last 3 Months (Relative)</option>
                <option>Last 12 Months (Relative)</option>
                <option>Year 2026 (2026)</option>
              </select>
            </div>

            {/* Org Unit Dimension (ou) */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Org Unit Level (ou):</label>
              <select className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium">
                <option>Level 3: Member Chapters</option>
                <option>Level 2: Countries</option>
                <option>Level 4: Consented Facilities</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700">Indicator Metadata:</span>
              <p>Numerator: Available tracer items / assessed.</p>
              <p>Baseline: 65.0% • Target: 85.0%.</p>
            </div>
          </div>

          {/* Center Chart / Table Canvas */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedDx === 'indTracerAvail' ? 'Tracer Medicine Availability (%) Across Member Chapters' : 'Selected Indicator'}
                </h3>
                <span className="text-xs text-slate-500">Benchmark comparison vs EPN 85% Target</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-0.5 bg-emerald-500"></span> 85% Target Line
                </span>
              </div>
            </div>

            {chartType === 'COLUMN' && (
              <div className="pt-6">
                <div className="h-72 flex items-end justify-between gap-4 pb-6 border-b border-slate-200 relative">
                  {/* Target reference dashed line at 85% */}
                  <div className="absolute left-0 right-0 top-[15%] border-b-2 border-dashed border-emerald-500 z-10">
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-1 ml-2">Target: 85%</span>
                  </div>

                  {chartSeries.map(item => (
                    <div key={item.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-xs font-bold text-slate-900 tabular-nums">{item.val}%</div>
                      <div
                        className="w-full max-w-[48px] bg-sky-600 hover:bg-sky-700 rounded-t transition-all"
                        style={{ height: `${item.val}%` }}
                      />
                      <span className="text-[11px] text-slate-600 font-semibold text-center truncate max-w-[90px]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {chartType === 'TABLE' && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                    <tr>
                      <th className="py-2.5 px-3">Organisation Unit</th>
                      <th className="py-2.5 px-3 text-right">Reported Value</th>
                      <th className="py-2.5 px-3 text-right">Baseline</th>
                      <th className="py-2.5 px-3 text-right">Target</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chartSeries.map(s => (
                      <tr key={s.label} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{s.label}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-sky-700 tabular-nums">{s.val}%</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">{s.baseline}%</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">{s.target}%</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.val >= s.target ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.val >= s.target ? 'Target Met' : 'Approaching'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Accessibility data summary */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                <b>Accessible Chart Summary:</b> Average availability across 6 member chapters is 87.3%. All members except CHAN have exceeded the 85% target line for the October 2026 period.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
