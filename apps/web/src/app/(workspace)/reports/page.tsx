'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { FileSpreadsheet, Download, Printer, CheckCircle, FileText, ChevronRight, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'SCORECARD' | 'DONOR' | 'ANNUAL'>('SCORECARD');
  const [selectedProject, setSelectedProject] = useState('ACCESS_II');

  const scorecardRows = [
    {
      indicator: 'Tracer Medicine Availability (%)',
      baseline: '65.0%',
      target: '85.0%',
      current: '88.5%',
      peerAverage: '82.0%',
      status: 'TARGET_MET'
    },
    {
      indicator: 'Stock-out Rate (%)',
      baseline: '28.0%',
      target: '<5.0%',
      current: '6.8%',
      peerAverage: '9.4%',
      status: 'APPROACHING'
    },
    {
      indicator: 'Drug & Therapeutics Committee Functional (%)',
      baseline: '42.0%',
      target: '80.0%',
      current: '82.0%',
      peerAverage: '71.0%',
      status: 'TARGET_MET'
    },
    {
      indicator: 'Facilities with Active DRF Ring-fenced Fund (%)',
      baseline: '50.0%',
      target: '85.0%',
      current: '78.0%',
      peerAverage: '68.0%',
      status: 'APPROACHING'
    },
    {
      indicator: 'Healthcare Worker Training Reach (Female %)',
      baseline: '38.0%',
      target: '50.0%',
      current: '63.0%',
      peerAverage: '52.0%',
      status: 'TARGET_MET'
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                Section 8.8 Reporting Suite
              </span>
              <h1 className="text-xl font-bold text-slate-900">Reports, Member Scorecards & Donor Packs</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated executive scorecards, donor PDF compilations, and EPN annual general meeting packs.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Report mode selector */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setReportType('SCORECARD')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  reportType === 'SCORECARD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Member Scorecard
              </button>
              <button
                onClick={() => setReportType('DONOR')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  reportType === 'DONOR' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Donor Report Builder
              </button>
              <button
                onClick={() => setReportType('ANNUAL')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  reportType === 'ANNUAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual Report Pack
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
          </div>
        </div>

        {/* Scorecard View */}
        {reportType === 'SCORECARD' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded uppercase">
                  Executive Performance Card
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Christian Health Association of Kenya (CHAK)</h2>
                <div className="text-xs text-slate-500">Benchmark Period: October 2026 • 584 Affiliated Facilities</div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Overall Scorecard Rating</span>
                <span className="text-xl font-extrabold text-emerald-600">Grade A (Benchmark Leader)</span>
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="py-2.5 px-4">Core Indicator</th>
                    <th className="py-2.5 px-3 text-right">Baseline</th>
                    <th className="py-2.5 px-3 text-right">Target</th>
                    <th className="py-2.5 px-3 text-right">Current Value</th>
                    <th className="py-2.5 px-3 text-right">Anonymised Peer Avg</th>
                    <th className="py-2.5 px-4 text-center">Traffic Light</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scorecardRows.map(row => (
                    <tr key={row.indicator} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.indicator}</td>
                      <td className="py-3 px-3 text-right text-slate-500 font-mono tabular-nums">{row.baseline}</td>
                      <td className="py-3 px-3 text-right text-slate-700 font-bold font-mono tabular-nums">{row.target}</td>
                      <td className="py-3 px-3 text-right font-extrabold text-sky-700 font-mono tabular-nums">{row.current}</td>
                      <td className="py-3 px-3 text-right text-slate-500 font-mono tabular-nums">{row.peerAverage}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === 'TARGET_MET' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {row.status === 'TARGET_MET' ? '● On Track' : '▲ In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donor Report Builder View */}
        {reportType === 'DONOR' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Donor Project Report Generator</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated assembly of financial disbursements, verified indicator outputs, and consent-verified impact stories.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg text-xs font-bold"
                >
                  <option value="ACCESS_II">ACCESS Phase II (Bread for the World)</option>
                  <option value="IMPACT">IMPACT (BMZ via action medeor)</option>
                  <option value="MNCH_FBO">MNCH FBO Initiative (Gates Foundation)</option>
                  <option value="MINILAB_NET">Minilab Screening Network (Difaem)</option>
                </select>

                <button className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Donor PDF</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900">Pre-Compiled Executive Summary:</span>
              <p className="text-slate-600 leading-relaxed">
                Project ACCESS Phase II supported 100 mission health facilities across Kenya, Tanzania, Zambia, Cameroon, and Lesotho with Bread for the World financing. 381 health professionals completed clinical pharmacy and supply chain governance training. Amoxicillin stock-out days reduced by 68% in the target cohort.
              </p>
            </div>
          </div>
        )}

        {/* Annual Report Pack */}
        {reportType === 'ANNUAL' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">EPN Annual General Assembly Data Pack (2025/2026)</h2>
              <span className="text-xs text-slate-500">Official reconciliations aligned with AGM4 verified figures</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Total Network Members</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">149 Members</div>
                <span className="text-slate-400">38 Countries (29 in Africa)</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Project Funds Mobilized</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">USD 1,418,142</div>
                <span className="text-slate-400">Up from USD 380,042 in 2021</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Active DRF Bank Accounts</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">250 Facilities</div>
                <span className="text-slate-400">Dedicated ring-fenced pharmacy capital</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
