'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Radio,
  ShieldCheck,
  Database,
  Lock
} from 'lucide-react';
import { generateMonthlyPeriods } from '@epn/periods';
import type {
  SurveillanceSummary,
  AuditLogEntry,
  MemberSharingPolicy,
  EpnActorRole
} from '@epn/domain';
import { epnClient } from '@/lib/api';

export default function DashboardPage() {
  const [selectedOrgUnit, setSelectedOrgUnit] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('202610');
  const [surveillance, setSurveillance] = useState<SurveillanceSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [sharingPolicies, setSharingPolicies] = useState<MemberSharingPolicy[]>([]);
  const [actorRole, setActorRole] = useState<EpnActorRole>('EPN_COORDINATOR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [countrySearch, setCountrySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ALERT' | 'WATCH' | 'OPTIMAL'>('ALL');
  const [dashboardTab, setDashboardTab] = useState<'ALERTS' | 'TRENDS' | 'GOVERNANCE'>('ALERTS');
  const [actionToast, setActionToast] = useState<string | null>(null);

  const periods = generateMonthlyPeriods(12);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const loadSurveillance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, logs, policies] = await Promise.all([
        epnClient.getSurveillanceSummary(),
        epnClient.getAuditLogs(20),
        epnClient.getSharingPolicies()
      ]);
      setSurveillance(summary);
      setAuditLogs(logs);
      setSharingPolicies(policies);
    } catch (err: any) {
      setError(err?.message || 'Unable to load surveillance feed from /api/v1.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurveillance();
  }, [loadSurveillance]);

  const handleRoleChange = (role: EpnActorRole) => {
    setActorRole(role);
    epnClient.setRole(role);
    showToast(`Active operator role switched to ${role}.`);
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await epnClient.acknowledgeAlert(id);
      await loadSurveillance();
      showToast('Sentinel alert acknowledged and recorded in audit log.');
    } catch (err: any) {
      showToast(err?.message || 'Permission denied for current role.');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await epnClient.resolveAlert(id);
      await loadSurveillance();
      showToast('Sentinel alert marked as resolved and recorded in audit log.');
    } catch (err: any) {
      showToast(err?.message || 'Permission denied for current role.');
    }
  };

  const handleDhis2Pull = async (dryRun: boolean) => {
    try {
      const res = await epnClient.pullDhis2('khis_ke', dryRun);
      await loadSurveillance();
      showToast(
        dryRun
          ? `KHIS Kenya Dry-Run: ${res.recordsMapped}/${res.recordsReceived} mapped (${res.unmappedRatePct}% unmapped).`
          : `KHIS Kenya Live Sync: ingested ${res.ingestedCount} records (${res.provenance}).`
      );
    } catch (err: any) {
      showToast(err?.message || 'DHIS2 sync failed.');
    }
  };

  const handleToggleSharing = async (
    memberCode: string,
    field: 'shareFacilityAlerts' | 'shareAmrSignals' | 'dpaSigned',
    value: boolean
  ) => {
    try {
      await epnClient.updateSharingPolicy(memberCode, { [field]: value });
      await loadSurveillance();
      showToast(`Updated ${memberCode} sovereignty policy (${field}: ${value}).`);
    } catch (err: any) {
      showToast(err?.message || 'Permission denied for current role.');
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
      'Control Status',
      'Provenance'
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
      c.controlStatus,
      c.provenance
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

  // Scope KPIs & Trend to selectedOrgUnit + selectedPeriod
  const activeCountryCard = useMemo(
    () =>
      selectedOrgUnit === 'ALL'
        ? null
        : surveillance?.countryScorecards.find(c => c.country === selectedOrgUnit) || null,
    [selectedOrgUnit, surveillance]
  );

  const activeScopeLabel = activeCountryCard ? activeCountryCard.countryName : 'All Network (EPN Total)';
  const kpiTracer = activeCountryCard ? activeCountryCard.tracerAvailabilityPct : surveillance?.tracerAvailabilityPct;
  const kpiStockout = activeCountryCard ? activeCountryCard.stockoutRatePct : surveillance?.stockoutRatePct;
  const kpiCompleteness = activeCountryCard
    ? activeCountryCard.reportingCompletenessPct
    : surveillance?.reportingCompletenessPct;
  const kpiAmr = activeCountryCard ? activeCountryCard.amrStewardshipScorePct : surveillance?.amrCompliancePct;

  const trendData = useMemo(() => {
    const baseAvail = kpiTracer ?? 84.2;
    const baseStockout = kpiStockout ?? 6.8;
    const periodShift = (parseInt(selectedPeriod.slice(-2), 10) || 10) % 4;
    const months = ['Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26'];
    return months.map((month, idx) => {
      const progress = idx / 11;
      const availability = Number(Math.max(45, Math.min(99, baseAvail - 12 * (1 - progress) + periodShift * 0.3)).toFixed(1));
      const stockouts = Number(Math.max(1, Math.min(40, baseStockout + 10 * (1 - progress))).toFixed(1));
      return { month, availability, stockouts };
    });
  }, [kpiTracer, kpiStockout, selectedPeriod]);

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
    <div className="flex-1 flex flex-col min-h-screen">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-5">
        {actionToast && (
          <div
            role="status"
            aria-live="polite"
            className="bg-emerald-700/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-md border border-emerald-500/40 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionToast}</span>
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium px-4 py-3 rounded-2xl flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </span>
            <button
              type="button"
              onClick={loadSurveillance}
              className="px-3 py-1 rounded-full bg-rose-700 hover:bg-rose-800 text-white font-semibold cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* CDC-Style Surveillance Command Banner */}
        <div className="m3-glass-dark text-white p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${alertLevelBadge}`}>
                  {surveillance ? surveillance.networkAlertLevel.replace('_', ' ') : 'LOADING...'}
                </span>
                {surveillance && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      surveillance.provenance === 'DHIS2_LIVE_SYNC'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    {surveillance.provenance.replace(/_/g, ' ')}
                  </span>
                )}
                <span className="text-[11px] font-mono text-slate-300">
                  EPI-WEEK: {surveillance?.epiWeek || '...'}
                </span>
                {surveillance && (
                  <span className="text-[11px] text-slate-300">
                    • Active Alerts: <strong className="text-white">{surveillance.activeAlertsCount}</strong> ({surveillance.criticalAlertsCount} Critical)
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-bold mt-1.5">
                EPN Pharmaceutical Surveillance &amp; Control Center
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
              <Lock className="w-3.5 h-3.5 text-cyan-300" />
              <select
                aria-label="Operator Role"
                value={actorRole}
                onChange={e => handleRoleChange(e.target.value as EpnActorRole)}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer"
              >
                <option value="EPN_COORDINATOR" className="text-slate-900">Role: EPN Coordinator</option>
                <option value="DOCTOR" className="text-slate-900">Role: Hospital Doctor</option>
                <option value="MEMBER_PHARMACIST" className="text-slate-900">Role: Member Pharmacist</option>
                <option value="PUBLIC_VIEWER" className="text-slate-900">Role: Public Viewer (Read-Only)</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => handleDhis2Pull(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Sync KHIS Kenya</span>
            </button>
            <button
              type="button"
              onClick={loadSurveillance}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Context Filter Bar (Country + Period + Export) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-600">
            Active Scope: <span className="font-bold text-slate-900">{activeScopeLabel}</span> • Period:{' '}
            <span className="font-mono font-semibold text-slate-800">{selectedPeriod}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <Building className="w-3.5 h-3.5 text-cyan-700" />
              <select
                aria-label="Filter by Country"
                value={selectedOrgUnit}
                onChange={e => setSelectedOrgUnit(e.target.value)}
                className="bg-transparent font-medium outline-none text-slate-800 cursor-pointer"
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

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-cyan-700" />
              <select
                aria-label="Filter by Period"
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="bg-transparent font-medium outline-none text-slate-800 cursor-pointer"
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
              disabled={!surveillance}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3.5 py-1.5 rounded-full font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/visualizer"
              className="flex items-center gap-1.5 bg-cyan-700 hover:bg-cyan-800 text-white px-3.5 py-1.5 rounded-full font-semibold transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Visualizer</span>
            </Link>
          </div>
        </div>

        {/* Folder Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/90 p-1.5 rounded-full border border-slate-200 w-fit text-xs shadow-2xs">
          {(
            [
              { id: 'ALERTS', label: '1 · Alerts & Country Scorecard' },
              { id: 'TRENDS', label: '2 · Trends & Governance' },
              { id: 'GOVERNANCE', label: '3 · Sovereignty & Audit Trail' }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDashboardTab(tab.id)}
              className={`px-4 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${
                dashboardTab === tab.id ? 'bg-cyan-800 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FOLDER 1: Alerts & Country Scorecard */}
        {dashboardTab === 'ALERTS' && (
        <>
        {/* FIRST-READ OBJECT: Active Sentinel Alerts & Early Warning Control Signals */}
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Active Sentinel Alerts &amp; Early Warning Control Signals
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                First-read threshold breaches across tracer stock-outs, WHO Watch antibiotics, near-expiry batches, and reporting gaps
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs">
              {(['ACTIVE', 'RESOLVED', 'ALL'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setAlertFilter(f)}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    alertFilter === f ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading && !surveillance ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {visibleAlerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No sentinel alerts matching the selected country and status filter.
                </div>
              ) : (
                visibleAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50 ${
                      alert.severity === 'CRITICAL' && alert.status !== 'RESOLVED' ? 'border-l-4 border-l-rose-600' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800">
                          {alert.provenance.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold">{alert.countryName}</span> ({alert.memberCode}) • {alert.facilityName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Observed: <span className="font-semibold text-slate-800">{alert.currentValue}</span> | Threshold:{' '}
                        <span className="font-medium">{alert.threshold}</span>
                      </div>
                      <div className="text-[11px] text-cyan-900 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100 inline-block mt-1">
                        Control Action: {alert.recommendedAction}
                      </div>
                    </div>

                    {alert.status !== 'RESOLVED' && (
                      <div className="flex items-center gap-2 shrink-0 text-xs">
                        {alert.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-3.5 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleResolve(alert.id)}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer"
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
          )}
        </div>

        {/* 4 Scoped Indicator Cards (with explicit loading skeletons) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading && !surveillance ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="m3-glass-card p-5 h-32 animate-pulse bg-white/70" />
            ))
          ) : (
            <>
              <div className="m3-glass-card p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Tracer Medicine Availability</span>
                  <span className="flex items-center text-emerald-600 font-bold gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Target 85%
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {kpiTracer !== undefined ? `${kpiTracer}%` : '--'}
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>{activeScopeLabel}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      (kpiTracer ?? 0) >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {(kpiTracer ?? 0) >= 85 ? 'On Track' : 'Below Target'}
                  </span>
                </div>
              </div>

              <div className="m3-glass-card p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Stock-out Rate</span>
                  <span className="flex items-center text-emerald-600 font-bold gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5" /> Target &lt;5%
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {kpiStockout !== undefined ? `${kpiStockout}%` : '--'}
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>{activeScopeLabel}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      (kpiStockout ?? 99) < 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {(kpiStockout ?? 99) < 5 ? 'Controlled' : 'Action Needed'}
                  </span>
                </div>
              </div>

              <div className="m3-glass-card p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Reporting Completeness</span>
                  <span className="flex items-center text-cyan-700 font-bold gap-0.5">
                    <Activity className="w-3.5 h-3.5" /> Bench &ge;80%
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {kpiCompleteness !== undefined ? `${kpiCompleteness}%` : '--'}
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>{activeScopeLabel}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      (kpiCompleteness ?? 0) >= 80 ? 'bg-cyan-50 text-cyan-800' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {(kpiCompleteness ?? 0) >= 80 ? 'Controlled' : 'Reporting Gap'}
                  </span>
                </div>
              </div>

              <div className="m3-glass-card p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">AMR Stewardship Score</span>
                  <span className="flex items-center text-cyan-700 font-bold gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> WHO AWaRe
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {kpiAmr !== undefined ? `${kpiAmr}%` : '--'}
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>{activeScopeLabel}</span>
                  <span className="text-[10px] bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded-full font-medium">
                    400+ DTCs
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* National Pharmaceutical Control Scorecard (Desktop Table + Mobile Prioritized Cards) */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Country Pharmaceutical Surveillance &amp; Control Scorecard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Completeness, timeliness, essential medicine availability, and provenance across priority EPN countries
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Filter country..."
                aria-label="Filter countries"
                className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs outline-none focus:border-cyan-600 w-36"
              />
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
                {(['ALL', 'ALERT', 'WATCH', 'OPTIMAL'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
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

          {/* Mobile Prioritized View (390px: zero horizontal scroll) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredScorecards.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No countries match the selected filter.</div>
            ) : (
              filteredScorecards.map(c => (
                <div key={c.country} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{c.countryName}</span>{' '}
                      <span className="font-mono text-slate-400">({c.country})</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.controlStatus === 'OPTIMAL'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.controlStatus === 'WATCH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.controlStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Tracer Avail</span>
                      <span className="font-bold text-slate-900 tabular-nums">{c.tracerAvailabilityPct}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Completeness</span>
                      <span className="font-semibold text-slate-800 tabular-nums">{c.reportingCompletenessPct}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Stock-out</span>
                      <span className="font-semibold text-slate-800 tabular-nums">{c.stockoutRatePct}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <th className="py-3 px-4 font-bold">Country</th>
                  <th className="py-3 px-4 font-bold">Facilities Reporting</th>
                  <th className="py-3 px-4 font-bold">Completeness</th>
                  <th className="py-3 px-4 font-bold">Tracer Availability</th>
                  <th className="py-3 px-4 font-bold">Stock-out Rate</th>
                  <th className="py-3 px-4 font-bold">AMR Score</th>
                  <th className="py-3 px-4 font-bold">Provenance</th>
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
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                c.reportingCompletenessPct >= 80 ? 'bg-emerald-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, c.reportingCompletenessPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 tabular-nums w-11">{c.tracerAvailabilityPct}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            c.provenance === 'DHIS2_LIVE_SYNC'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {c.provenance === 'DHIS2_LIVE_SYNC' ? 'DHIS2 LIVE' : 'BENCHMARK'}
                        </span>
                      </td>
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
        </>
        )}

        {/* FOLDER 2: 12-Month Analytical Trend Visualization & Governance Structures */}
        {dashboardTab === 'TRENDS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 m3-glass-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  12-Month Trend ({activeScopeLabel}): Availability vs Stock-out Rate
                </h3>
                <p className="text-xs text-slate-500">Scoped to {activeScopeLabel} • Period {selectedPeriod}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-cyan-800 font-medium">
                  <span className="w-3 h-3 rounded-sm bg-cyan-600"></span> Availability (%)
                </span>
                <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                  <span className="w-3 h-3 rounded-sm bg-rose-500"></span> Stock-outs (%)
                </span>
              </div>
            </div>

            <div className="pt-6">
              <div className="h-56 flex items-end gap-2 pb-6 border-b border-slate-200">
                {trendData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div>Avail: {d.availability}%</div>
                      <div>Stockout: {d.stockouts}%</div>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        className="w-1/2 bg-cyan-600 rounded-t transition-all group-hover:bg-cyan-700"
                        style={{ height: `${d.availability}%` }}
                      />
                      <div
                        className="w-1/2 bg-rose-500 rounded-t transition-all group-hover:bg-rose-600"
                        style={{ height: `${Math.min(100, d.stockouts * 2)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium mt-1 rotate-45 origin-left truncate">
                      {d.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="m3-glass-card p-6 space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Governance &amp; Quality Structures</h3>
              <p className="text-xs text-slate-500 mt-0.5">Facility committee functionality across the network</p>

              <div className="space-y-4 mt-5">
                {[
                  { label: 'Drug & Therapeutics (DTC)', pct: 82, count: '410 Facilities', color: 'bg-cyan-600' },
                  { label: 'Infection Prevention (IPC)', pct: 76, count: '380 Facilities', color: 'bg-emerald-600' },
                  { label: 'Antimicrobial Stewardship (AMS)', pct: 64, count: '320 Facilities', color: 'bg-purple-600' },
                  { label: 'Quality Improvement (QIT)', pct: 71, count: '355 Facilities', color: 'bg-amber-500' }
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-slate-900">{item.pct}% ({item.count})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-cyan-50 rounded-xl border border-cyan-100 text-xs space-y-1">
              <span className="font-bold text-cyan-950">Capacity Building Milestone:</span>
              <p className="text-cyan-900 text-[11px] leading-relaxed">
                Over 1,200 healthcare workers trained in EmONC, supply chain forecasting, and AMR surveillance.
              </p>
            </div>
          </div>
        </div>
        )}

        {/* FOLDER 3: Member Data Sovereignty & Append-Only Audit Trail */}
        {dashboardTab === 'GOVERNANCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Member Data Sovereignty &amp; DPA Controls
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Each member association governs upward sharing of facility alerts and AMR signals
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDhis2Pull(true)}
                className="px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Test KHIS Dry-Run
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {sharingPolicies.map(p => (
                <div key={p.memberCode} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">
                      {p.memberCode} <span className="font-normal text-slate-500">({p.country})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{p.memberName}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSharing(p.memberCode, 'shareFacilityAlerts', !p.shareFacilityAlerts)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        p.shareFacilityAlerts ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      Alerts: {p.shareFacilityAlerts ? 'ON' : 'MASKED'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleSharing(p.memberCode, 'shareAmrSignals', !p.shareAmrSignals)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        p.shareAmrSignals ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      AMR: {p.shareAmrSignals ? 'ON' : 'MASKED'}
                    </button>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                        p.dpaSigned ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {p.dpaSigned ? 'DPA Signed' : 'DPA Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Append-Only Governance Audit Trail</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable log of alert actions, DHIS2 syncs, data entries, and sovereignty updates
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-mono font-semibold text-slate-600">
                {auditLogs.length} Events
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 text-xs space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-cyan-800 text-[11px]">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.occurredAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    Target: <span className="font-mono">{log.targetId}</span> &rarr;{' '}
                    <span className="font-semibold">{log.newState}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Actor: {log.actorId} ({log.actorRole})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
