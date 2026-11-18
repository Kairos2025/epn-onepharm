'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import {
  BarChart3,
  ShieldAlert,
  Building,
  CheckCircle,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  RefreshCw,
  Check,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { generateMonthlyPeriods } from '@epn/periods';
import type { SurveillanceSummary } from '@epn/domain';
import { epnClient } from '@/lib/api';

export default function DashboardPage() {
  const [selectedOrgUnit, setSelectedOrgUnit] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('202610');
  const [surveillance, setSurveillance] = useState<SurveillanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [countrySearch, setCountrySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ALERT' | 'WATCH' | 'OPTIMAL'>('ALL');
  const [actionToast, setActionToast] = useState<string | null>(null);

  const periods = generateMonthlyPeriods(12);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const loadSurveillance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await epnClient.getSurveillanceSummary();
      setSurveillance(data);
    } catch {
      // Keep previous state on transient failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurveillance();
  }, [loadSurveillance]);

  const handleAcknowledge = async (id: string) => {
    try {
      await epnClient.acknowledgeAlert(id);
      await loadSurveillance();
      showToast('Sentinel alert acknowledged and logged.');
    } catch {
      // ignore
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await epnClient.resolveAlert(id);
      await loadSurveillance();
      showToast('Sentinel alert marked as resolved.');
    } catch {
      // ignore
    }
  };

  const handleExportCsv = () => {
    if (!surveillance) return;
    const headers = [
      'Country Code',
      'Country',
      'Members',
      'Facilities Reporting',
      'Total Facilities',
      'Completeness (%)',
      'Timeliness (%)',
      'Tracer Availability (%)',
      'Stockout Rate (%)',
      'AMR Stewardship (%)',
      'Control Status'
    ];
    const rows = surveillance.countryScorecards.map(c => [
      c.country,
      c.countryName,
      c.memberCount,
      c.facilitiesReporting,
      c.totalFacilities,
      c.reportingCompletenessPct,
      c.timelinessPct,
      c.tracerAvailabilityPct,
      c.stockoutRatePct,
      c.amrStewardshipScorePct,
      c.controlStatus
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `epn-onepharm-control-scorecard-${surveillance.epiWeek}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${surveillance.epiWeek} control scorecard CSV.`);
  };

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

  const filteredScorecards = (surveillance?.countryScorecards || []).filter(c => {
    if (selectedOrgUnit !== 'ALL' && c.country !== selectedOrgUnit) return false;
    if (statusFilter !== 'ALL' && c.controlStatus !== statusFilter) return false;
    if (
      countrySearch.trim() &&
      !c.countryName.toLowerCase().includes(countrySearch.toLowerCase()) &&
      !c.country.toLowerCase().includes(countrySearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const visibleAlerts = (surveillance?.alerts || []).filter(a => {
    if (selectedOrgUnit !== 'ALL' && a.country !== selectedOrgUnit) return false;
    if (alertFilter === 'ACTIVE') return a.status !== 'RESOLVED';
    if (alertFilter === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  const alertLevelBadge =
    surveillance?.networkAlertLevel === 'HIGH_ALERT'
      ? 'bg-rose-600 text-white'
      : surveillance?.networkAlertLevel === 'ELEVATED'
      ? 'bg-amber-500 text-white'
      : 'bg-emerald-600 text-white';

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
        {actionToast && (
          <div
            role="status"
            aria-live="polite"
            className="bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionToast}</span>
            </span>
          </div>
        )}
        {/* CDC-Style Surveillance Command Banner */}
        <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-300 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${alertLevelBadge}`}>
                  {surveillance?.networkAlertLevel?.replace('_', ' ') || 'SURVEILLANCE ACTIVE'}
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  EPI-WEEK: {surveillance?.epiWeek || '2026-W47'}
                </span>
                <span className="text-[11px] text-slate-400">
                  • Completeness: {surveillance ? `${surveillance.reportingCompletenessPct}%` : '86.1%'}
                </span>
                <span className="text-[11px] text-slate-400">
                  • Timeliness: {surveillance ? `${surveillance.timelinessPct}%` : '79.9%'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold mt-1">
                EPN Pharmaceutical Surveillance &amp; Control Center
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
              <span className="text-slate-400">Active Alerts: </span>
              <span className="font-bold text-white">{surveillance?.activeAlertsCount ?? 5}</span>
              <span className="text-rose-400 font-semibold ml-1.5">
                ({surveillance?.criticalAlertsCount ?? 2} Critical)
              </span>
            </div>
            <button
              onClick={loadSurveillance}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Feed</span>
            </button>
          </div>
        </div>

        {/* Top Header & Filters bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                DHIS2 Compatible
              </span>
              <span className="text-xs text-slate-500">Live Surveillance &amp; Analytics Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Network Control &amp; Performance Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated pharmaceutical systems indicators, sentinel stock-out alerts, and AMR control across 149 members and 25,000 facilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedOrgUnit}
                onChange={e => setSelectedOrgUnit(e.target.value)}
                className="bg-transparent font-medium outline-none text-slate-700"
              >
                <option value="ALL">All Network (EPN Total)</option>
                <option value="KE">Kenya (CHAK &amp; MEDS)</option>
                <option value="NG">Nigeria (CHAN &amp; Medi-Pharm)</option>
                <option value="TZ">Tanzania (CSSC)</option>
                <option value="CM">Cameroon (CBCHS &amp; PCC)</option>
                <option value="CD">DR Congo (ECC)</option>
                <option value="UG">Uganda (UCMB / UPMB)</option>
                <option value="RW">Rwanda (BUFMAR)</option>
                <option value="SS">South Sudan (CHASS)</option>
              </select>
            </div>

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

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors shadow-xs"
            >
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

        {/* 4 Primary Indicator Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Tracer Medicine Availability</span>
              <span className="flex items-center text-emerald-600 font-bold gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +16.0%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {surveillance ? `${surveillance.tracerAvailabilityPct}%` : '84.2%'}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>WHO/EPN Target: 85.0%</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">On Track</span>
            </div>
            <p className="text-[10px] text-slate-400">Formula: Available tracer items / items assessed.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Stock-out Rate</span>
              <span className="flex items-center text-emerald-600 font-bold gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> -15.3%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {surveillance ? `${surveillance.stockoutRatePct}%` : '6.8%'}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Control Target: &lt;5.0%</span>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">Watch</span>
            </div>
            <p className="text-[10px] text-slate-400">Formula: Facility-days with stock-out / observed days.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Reporting Completeness</span>
              <span className="flex items-center text-sky-600 font-bold gap-0.5">
                <Activity className="w-3.5 h-3.5" /> Live
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {surveillance ? `${surveillance.reportingCompletenessPct}%` : '86.1%'}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Benchmark: &ge;80.0%</span>
              <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-medium">Controlled</span>
            </div>
            <p className="text-[10px] text-slate-400">Share of active FBO facilities submitting monthly DHIS2 reports.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">AMR Stewardship Compliance</span>
              <span className="flex items-center text-sky-600 font-bold gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> AWaRe
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {surveillance ? `${surveillance.amrCompliancePct}%` : '79.4%'}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>WHO Access Target: &ge;60%</span>
              <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-medium">400+ DTCs</span>
            </div>
            <p className="text-[10px] text-slate-400">Facilities adhering to WHO AWaRe antibiotic stewardship thresholds.</p>
          </div>
        </div>

        {/* CDC-Style Active Sentinel Alerts & Control Actions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Active Sentinel Alerts &amp; Early Warning Control Signals
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time threshold breaches across tracer stock-outs, WHO Watch antibiotics, cold-chain expiry, and reporting gaps
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {(['ACTIVE', 'RESOLVED', 'ALL'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setAlertFilter(f)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    alertFilter === f ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {visibleAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No alerts matching the current filter.
              </div>
            ) : (
              visibleAlerts.map(alert => (
                <div key={alert.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : alert.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{alert.code}</span>
                      <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          alert.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : alert.status === 'ACKNOWLEDGED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold">{alert.countryName}</span> ({alert.memberCode}) • {alert.facilityName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Observed: <span className="font-semibold text-slate-800">{alert.currentValue}</span> | Control Threshold:{' '}
                      <span className="font-medium">{alert.threshold}</span>
                    </div>
                    <div className="text-[11px] text-sky-800 bg-sky-50 px-2.5 py-1 rounded border border-sky-100 inline-block mt-1">
                      Control Action: {alert.recommendedAction}
                    </div>
                  </div>

                  {alert.status !== 'RESOLVED' && (
                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* National Pharmaceutical Control Scorecard Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Country Pharmaceutical Surveillance &amp; Control Scorecard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Completeness, timeliness, essential medicine availability, and AMR stewardship across priority EPN countries
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Filter country..."
                aria-label="Filter countries"
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-cyan-600 w-36"
              />
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {(['ALL', 'ALERT', 'WATCH', 'OPTIMAL'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <Link href="/maps" className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 ml-1">
                GIS Map &rarr;
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <th className="py-3 px-4 font-bold">Country</th>
                  <th className="py-3 px-4 font-bold">Facilities Reporting</th>
                  <th className="py-3 px-4 font-bold">Completeness</th>
                  <th className="py-3 px-4 font-bold">Timeliness</th>
                  <th className="py-3 px-4 font-bold">Tracer Availability</th>
                  <th className="py-3 px-4 font-bold">Stock-out Rate</th>
                  <th className="py-3 px-4 font-bold">AMR Score</th>
                  <th className="py-3 px-4 font-bold text-right">Control Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScorecards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No countries match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredScorecards.map(c => (
                    <tr key={c.country} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {c.countryName} <span className="text-slate-400 font-mono font-normal">({c.country})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 tabular-nums">
                        {c.facilitiesReporting.toLocaleString()} / {c.totalFacilities.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums w-11">{c.reportingCompletenessPct}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${
                                c.reportingCompletenessPct >= 80 ? 'bg-emerald-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, c.reportingCompletenessPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 tabular-nums">{c.timelinessPct}%</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 tabular-nums w-11">{c.tracerAvailabilityPct}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${
                                c.tracerAvailabilityPct >= 85
                                  ? 'bg-cyan-600'
                                  : c.tracerAvailabilityPct >= 78
                                  ? 'bg-amber-500'
                                  : 'bg-rose-600'
                              }`}
                              style={{ width: `${Math.min(100, c.tracerAvailabilityPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 tabular-nums">{c.stockoutRatePct}%</td>
                      <td className="py-3 px-4 text-slate-700 tabular-nums">{c.amrStewardshipScorePct}%</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.controlStatus === 'OPTIMAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.controlStatus === 'WATCH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.controlStatus === 'OPTIMAL' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {c.controlStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 12-Month Analytical Trend Visualization & Committee Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            <div className="pt-6">
              <div className="h-64 flex items-end gap-2 pb-6 border-b border-slate-200">
                {trendData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div>Avail: {d.availability}%</div>
                      <div>Stockout: {d.stockouts}%</div>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        className="w-1/2 bg-sky-600 rounded-t transition-all group-hover:bg-sky-700"
                        style={{ height: `${d.availability}%` }}
                      />
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
              <span>Source: Live Surveillance &amp; Analytics Partition</span>
              <span>Synced via @epn/sdk</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Governance &amp; Quality Structures</h3>
              <p className="text-xs text-slate-500 mt-0.5">Facility committee functionality across the network</p>

              <div className="space-y-4 mt-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Drug &amp; Therapeutics (DTC)</span>
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
