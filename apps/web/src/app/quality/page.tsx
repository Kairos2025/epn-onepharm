'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CheckCircle2, AlertTriangle, ShieldCheck, Activity, BarChart, Clock, HelpCircle, FileCheck } from 'lucide-react';

export default function DataQualityPage() {
  const [selectedScoreFilter, setSelectedScoreFilter] = useState<'ALL' | 'HIGH' | 'REVIEW'>('ALL');

  const facilityQualityScores = [
    {
      name: 'Kilome Mission Hospital',
      member: 'CHAK',
      country: 'KE',
      overallScore: 98,
      completeness: '100%',
      timeliness: '96%',
      validity: '100%',
      consistency: '96%',
      status: 'EXCELLENT'
    },
    {
      name: 'Kijabe Hospital & Outpatient Center',
      member: 'CHAK',
      country: 'KE',
      overallScore: 95,
      completeness: '100%',
      timeliness: '92%',
      validity: '100%',
      consistency: '88%',
      status: 'EXCELLENT'
    },
    {
      name: 'Mbingo Baptist Hospital',
      member: 'CBCHS',
      country: 'CM',
      overallScore: 92,
      completeness: '96%',
      timeliness: '90%',
      validity: '95%',
      consistency: '87%',
      status: 'GOOD'
    },
    {
      name: 'St. Gerard Catholic Hospital Kaduna',
      member: 'CHAN',
      country: 'NG',
      overallScore: 84,
      completeness: '88%',
      timeliness: '80%',
      validity: '90%',
      consistency: '78%',
      status: 'NEEDS_REVIEW'
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
                Section 8.12 App Ecosystem
              </span>
              <h1 className="text-xl font-bold text-slate-900">Data Quality & Validation Engine</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated audits for completeness, timeliness, mathematical consistency, and statistical outlier detection.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Network Score: 92.4% (Tier A)</span>
            </span>
          </div>
        </div>

        {/* 4 Quality Dimensions Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Completeness Rate</span>
            <div className="text-2xl font-extrabold text-slate-900">96.8%</div>
            <span className="text-[10px] text-emerald-600 font-medium">+2.1% this quarter</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Timeliness (On-Time)</span>
            <div className="text-2xl font-extrabold text-slate-900">88.4%</div>
            <span className="text-[10px] text-slate-500">Within 15 days of month end</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Mathematical Validity</span>
            <div className="text-2xl font-extrabold text-emerald-600">99.1%</div>
            <span className="text-[10px] text-slate-500">Validation rules verified</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Outliers Flagged</span>
            <div className="text-2xl font-extrabold text-amber-600">3 Cells</div>
            <span className="text-[10px] text-amber-600 font-medium">Modified Z-score &gt; 3.0</span>
          </div>
        </div>

        {/* Facility Quality Scorecards Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Facility Quality Audit Matrix</h3>
            <span className="text-xs text-slate-500">Calculated over rolling 12 months</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-4">Health Facility</th>
                  <th className="py-2.5 px-4">Member Chapter</th>
                  <th className="py-2.5 px-4 text-center">Completeness</th>
                  <th className="py-2.5 px-4 text-center">Timeliness</th>
                  <th className="py-2.5 px-4 text-center">Validity</th>
                  <th className="py-2.5 px-4 text-center">Consistency</th>
                  <th className="py-2.5 px-4 text-right">Overall Quality</th>
                  <th className="py-2.5 px-4 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilityQualityScores.map(fac => (
                  <tr key={fac.name} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{fac.name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{fac.member} ({fac.country})</td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums">{fac.completeness}</td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums">{fac.timeliness}</td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums">{fac.validity}</td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums">{fac.consistency}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                      {fac.overallScore}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fac.status === 'EXCELLENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fac.status === 'GOOD'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {fac.status === 'EXCELLENT' ? 'Grade A' : fac.status === 'GOOD' ? 'Grade B' : 'Follow Up'}
                      </span>
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
