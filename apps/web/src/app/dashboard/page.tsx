'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Building,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Share2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { generateMonthlyPeriods } from '@epn/periods';

export default function DashboardPage() {
  const [selectedOrgUnit, setSelectedOrgUnit] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('202610');

  const periods = generateMonthlyPeriods(12);

  // Sample analytics trends
  const trendData = [
    { month: 'Nov 25', availability: 68.2, stockouts: 22.1 },
    { month: 'Dec 25', availability: 70.1, stockouts: 20.4 },
    { month: 'Jan 26', availability: 71.8, stockouts: 18.5 },
    { month: 'Feb 26', availability: 73.2, stockouts: 16.2 },
    { month: 'Mar 26', availability: 75.0, stockouts: 14.8 },
    { month: 'Apr 26', availability: 76.4, stockouts: 13.1 },
    { month: 'May 26', availability: 78.1, stockouts: 11.5 },
    { month: 'Jun 26', availability: 79.5, stockouts: 10.2 },
    { month: 'Jul 26', availability: 81.2, stockouts: 9.1 },
    { month: 'Aug 26', availability: 82.6, stockouts: 8.3 },
    { month: 'Sep 26', availability: 83.8, stockouts: 7.4 },
    { month: 'Oct 26', availability: 84.2, stockouts: 6.8 }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Top Header & Filters bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                DHIS2 Compatible
              </span>
              <span className="text-xs text-slate-500">Live Analytics Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Network Performance Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated pharmaceutical systems indicators across 149 members and 25,000 facilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Org unit filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedOrgUnit}
                onChange={e => setSelectedOrgUnit(e.target.value)}
                className="bg-transparent font-medium outline-none text-slate-700"
              >
                <option value="ALL">All Network (EPN Total)</option>
                <option value="KE">Kenya (CHAK & MEDS)</option>
                <option value="NG">Nigeria (CHAN & Medi-Pharm)</option>
                <option value="TZ">Tanzania (CSSC)</option>
                <option value="CM">Cameroon (CBCHS & PCC)</option>
              </select>
            </div>

            {/* Period filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="bg-transparent font-medium outline-none text-slate-700"
              >
                {periods.map(p => (
                  <option key={p.iso} value={p.iso}>
                    {p.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors shadow-xs">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/visualizer"
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-xs"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Open in Visualizer</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary Indicator Cards with Definitions (Section 11.4 Tooltip & As-of) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Tracer Medicine Availability</span>
              <span className="flex items-center text-emerald-600 font-bold gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +16.0%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">84.2%</div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Target: 85.0%</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">On Track</span>
            </div>
            <p className="text-[10px] text-slate-400">Formula: Available tracer items / items assessed. As of Oct 2026.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Stock-out Rate</span>
              <span className="flex items-center text-emerald-600 font-bold gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> -15.3%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">6.8%</div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Target: &lt;5.0%</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Improving</span>
            </div>
            <p className="text-[10px] text-slate-400">Formula: Facility-days with stock-out / observed days. As of Oct 2026.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Functional Committees</span>
              <span className="flex items-center text-sky-600 font-bold gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +36.5%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">78.5%</div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>DTC / IPC / AMS</span>
              <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-medium">400+ Total</span>
            </div>
            <p className="text-[10px] text-slate-400">Formula: Facilities with committee meeting within quarter.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Drug Revolving Funds</span>
              <span className="flex items-center text-sky-600 font-bold gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +6.0%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">73.0%</div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Tracking Revenue</span>
              <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-medium">250 Accounts</span>
            </div>
            <p className="text-[10px] text-slate-400">Formula: Facilities tracking revenue & ring-fenced bank account.</p>
          </div>
        </div>

        {/* 12-Month Analytical Trend Visualization & Committee Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trend Chart Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  12-Month Performance Trend: Tracer Availability vs Stock-out Rate
                </h3>
                <p className="text-xs text-slate-500">Visualizing medicine availability growth alongside reduced stock-out frequency</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-sky-700 font-medium">
                  <span className="w-3 h-3 rounded-sm bg-sky-600"></span> Availability (%)
                </span>
                <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                  <span className="w-3 h-3 rounded-sm bg-rose-500"></span> Stock-outs (%)
                </span>
              </div>
            </div>

            {/* Accessible Chart Representation */}
            <div className="pt-6">
              <div className="h-64 flex items-end gap-2 pb-6 border-b border-slate-200">
                {trendData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div>Avail: {d.availability}%</div>
                      <div>Stockout: {d.stockouts}%</div>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Availability bar */}
                      <div
                        className="w-1/2 bg-sky-600 rounded-t transition-all group-hover:bg-sky-700"
                        style={{ height: `${d.availability}%` }}
                      />
                      {/* Stockout bar */}
                      <div
                        className="w-1/2 bg-rose-500 rounded-t transition-all group-hover:bg-rose-600"
                        style={{ height: `${d.stockouts * 2}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium mt-1 rotate-45 origin-left truncate">
                      {d.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex justify-between items-center pt-2">
              <span>Source: Core Analytics Partition `analytics_value`</span>
              <span>Refreshed: 1 minute ago (Warm Cache)</span>
            </div>
          </div>

          {/* Committee Functionality & Workforce Snapshot Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Governance & Quality Structures</h3>
              <p className="text-xs text-slate-500 mt-0.5">Facility committee functionality across the network</p>

              <div className="space-y-4 mt-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Drug & Therapeutics (DTC)</span>
                    <span className="text-slate-900">82% (410 Facilities)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Infection Prevention (IPC)</span>
                    <span className="text-slate-900">76% (380 Facilities)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Antimicrobial Stewardship (AMS)</span>
                    <span className="text-slate-900">64% (320 Facilities)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Quality Improvement (QIT)</span>
                    <span className="text-slate-900">71% (355 Facilities)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '71%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-sky-50 rounded-lg border border-sky-100 text-xs space-y-1">
              <span className="font-bold text-sky-900">Capacity Building Milestone:</span>
              <p className="text-sky-800 text-[11px] leading-relaxed">
                Over 1,200 healthcare workers trained in EmONC, supply chain forecasting, and AMR surveillance. 63% female participation in the Ecumenical Scholarship Programme.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
