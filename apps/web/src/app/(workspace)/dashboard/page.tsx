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
  Lock,
  Mail,
  MapPin,
  Sparkles,
  TrendingUp,
  Layers,
  Clock,
  Filter,
  RotateCcw,
  ChevronRight,
  Flame,
  Eye,
  Siren,
  LayoutGrid,
  Table2
} from 'lucide-react';
import { generateMonthlyPeriods } from '@epn/periods';
import type {
  SurveillanceSummary,
  AuditLogEntry,
  MemberSharingPolicy,
  EpnActorRole
} from '@epn/domain';
import { epnClient } from '@/lib/api';

const COUNTRY_META: Record<string, { flag: string; region: string; memberLabel: string }> = {
  KE: { flag: '🇰🇪', region: 'East Africa', memberLabel: 'CHAK & MEDS' },
  NG: { flag: '🇳🇬', region: 'West Africa', memberLabel: 'CHAN & Medi-Pharm' },
  TZ: { flag: '🇹🇿', region: 'East Africa', memberLabel: 'CSSC' },
  CM: { flag: '🇨🇲', region: 'Central Africa', memberLabel: 'CBCHS & PCC' },
  CD: { flag: '🇨🇩', region: 'Central Africa', memberLabel: 'ECC / CBCA / CECA 20' },
  UG: { flag: '🇺🇬', region: 'East Africa', memberLabel: 'UCMB & UPMB' },
  RW: { flag: '🇷🇼', region: 'East Africa', memberLabel: 'BUFMAR' },
  SS: { flag: '🇸🇸', region: 'East Africa', memberLabel: 'CHASS' }
};

function RadialGauge({
  value,
  color,
  size = 54,
  strokeWidth = 5
}: {
  value: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-extrabold text-slate-800 tabular-nums">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

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
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'WATCH'>('ALL');
  const [countrySearch, setCountrySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ALERT' | 'WATCH' | 'OPTIMAL'>('ALL');
  const [scorecardView, setScorecardView] = useState<'TABLE' | 'CARDS'>('CARDS');
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

  const buildAlertGmailUrl = (alert: SurveillanceSummary['alerts'][number]) => {
    const subject = `[EPN ${alert.severity}] ${alert.code}: ${alert.title} (${alert.countryName})`;
    const body = [
      `Dear ${alert.memberCode} Focal Point & Supply Chain Team,`,
      '',
      `An automated ${alert.severity} sentinel alert has been triggered in the EPN Supply Chain Portal & Health Control Center:`,
      '',
      `• Alert Code: ${alert.code}`,
      `• Title: ${alert.title}`,
      `• Location: ${alert.facilityName}, ${alert.countryName} (${alert.memberCode})`,
      `• Observed: ${alert.currentValue}`,
      `• Threshold: ${alert.threshold}`,
      `• Recommended Control Action: ${alert.recommendedAction}`,
      '',
      'Please confirm receipt and share your mitigation status in the EPN portal.',
      '',
      'Warm regards,',
      'Ecumenical Pharmaceutical Network (EPN)',
      'Supply Chain Portal & Health Control Secretariat',
      'P.O. Box 749-00606 Sarit Centre, Nairobi, Kenya | https://epnetwork.org'
    ].join('\n');
    return `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

  const totalReportingFacilities = useMemo(() => {
    if (!surveillance) return { reporting: 0, total: 0 };
    if (activeCountryCard) {
      return { reporting: activeCountryCard.facilitiesReporting, total: activeCountryCard.totalFacilities };
    }
    return surveillance.countryScorecards.reduce(
      (acc, c) => ({ reporting: acc.reporting + c.facilitiesReporting, total: acc.total + c.totalFacilities }),
      { reporting: 0, total: 0 }
    );
  }, [surveillance, activeCountryCard]);

  const compositeHealthIndex = useMemo(() => {
    if (kpiTracer === undefined || kpiCompleteness === undefined || kpiAmr === undefined || kpiStockout === undefined) {
      return 84;
    }
    const stockoutScore = Math.max(0, 100 - kpiStockout * 3);
    return Math.round(kpiTracer * 0.35 + kpiCompleteness * 0.25 + kpiAmr * 0.2 + stockoutScore * 0.2);
  }, [kpiTracer, kpiCompleteness, kpiAmr, kpiStockout]);

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
    if (alertFilter === 'ACTIVE' && a.status === 'RESOLVED') return false;
    if (alertFilter === 'RESOLVED' && a.status !== 'RESOLVED') return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  });

  const alertCounts = useMemo(() => {
    const base = (surveillance?.alerts || []).filter(a => selectedOrgUnit === 'ALL' || a.country === selectedOrgUnit);
    const active = base.filter(a => a.status !== 'RESOLVED');
    return {
      totalActive: active.length,
      critical: active.filter(a => a.severity === 'CRITICAL').length,
      warning: active.filter(a => a.severity === 'WARNING').length,
      watch: active.filter(a => a.severity === 'WATCH').length,
      resolved: base.filter(a => a.status === 'RESOLVED').length
    };
  }, [surveillance, selectedOrgUnit]);

  const scorecardCounts = useMemo(() => {
    const list = surveillance?.countryScorecards || [];
    return {
      all: list.length,
      alert: list.filter(c => c.controlStatus === 'ALERT').length,
      watch: list.filter(c => c.controlStatus === 'WATCH').length,
      optimal: list.filter(c => c.controlStatus === 'OPTIMAL').length
    };
  }, [surveillance]);

  const alertLevelBadge =
    surveillance?.networkAlertLevel === 'HIGH_ALERT'
      ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/40'
      : surveillance?.networkAlertLevel === 'ELEVATED'
      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/40'
      : 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40';

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
        {/* Toast Banner */}
        {actionToast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 bg-[#004a59] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-[#31cdcf]/40 flex items-center gap-2.5 max-w-md"
          >
            <CheckCircle className="w-4 h-4 text-[#31cdcf] shrink-0" />
            <span>{actionToast}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium px-4 py-3 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </span>
            <button
              type="button"
              onClick={loadSurveillance}
              className="px-3.5 py-1.5 rounded-full bg-rose-700 hover:bg-rose-800 text-white font-semibold cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* MISSION-CONTROL COMMAND HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003440] via-[#004a59] to-[#005a87] text-white shadow-lg border border-white/10">
          {/* Subtle decorative radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#31cdcf]/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 left-1/3 w-80 h-80 rounded-full bg-[#f27f20]/15 blur-3xl"
          />

          <div className="relative p-5 sm:p-7 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Left Identity + Status */}
              <div className="flex items-start gap-4">
                <div className="relative p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shrink-0">
                  <Radio className="w-6 h-6 text-[#31cdcf]" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white" />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${alertLevelBadge}`}>
                      <Siren className="w-3 h-3" />
                      {surveillance ? surveillance.networkAlertLevel.replace('_', ' ') : 'LOADING...'}
                    </span>
                    {surveillance && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          surveillance.provenance === 'DHIS2_LIVE_SYNC'
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                            : 'bg-amber-400/15 text-amber-200 border-amber-300/35'
                        }`}
                      >
                        {surveillance.provenance.replace(/_/g, ' ')}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-mono text-cyan-100 border border-white/15">
                      <Clock className="w-3 h-3 text-[#31cdcf]" />
                      EPI-WEEK {surveillance?.epiWeek || '...'}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    EPN Pharmaceutical Surveillance &amp; Control Center
                  </h1>
                  <p className="text-xs sm:text-sm text-cyan-100/85 max-w-2xl">
                    Real-time early warning radar across faith-based supply chains, tracer medicine stock-outs, WHO AWaRe antimicrobial stewardship, and national reporting completeness.
                  </p>
                </div>
              </div>

              {/* Right Network Health Index + Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                  <div className="relative inline-flex items-center justify-center w-12 h-12">
                    <svg width="48" height="48" className="-rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="4.5" />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#31cdcf"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - compositeHealthIndex / 100)}
                      />
                    </svg>
                    <span className="absolute text-xs font-extrabold text-white tabular-nums">{compositeHealthIndex}</span>
                  </div>
                  <div className="text-xs">
                    <div className="text-[10px] uppercase tracking-wider text-cyan-200 font-semibold">Health Index</div>
                    <div className="font-bold text-white">{activeScopeLabel}</div>
                    <div className="text-[11px] text-cyan-100/80 tabular-nums">
                      {totalReportingFacilities.reporting.toLocaleString()} / {totalReportingFacilities.total.toLocaleString()} FOSAs
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrated Action & Scope Bar inside Hero */}
            <div className="pt-4 border-t border-white/15 flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 rounded-full transition-colors">
                  <Building className="w-3.5 h-3.5 text-[#31cdcf]" />
                  <select
                    aria-label="Filter by Country"
                    value={selectedOrgUnit}
                    onChange={e => setSelectedOrgUnit(e.target.value)}
                    className="bg-transparent font-semibold outline-none text-white cursor-pointer"
                  >
                    <option value="ALL" className="text-slate-900">All Network (EPN Total)</option>
                    <option value="KE" className="text-slate-900">🇰🇪 Kenya (CHAK &amp; MEDS)</option>
                    <option value="NG" className="text-slate-900">🇳🇬 Nigeria (CHAN &amp; Medi-Pharm)</option>
                    <option value="TZ" className="text-slate-900">🇹🇿 Tanzania (CSSC)</option>
                    <option value="CM" className="text-slate-900">🇨🇲 Cameroon (CBCHS &amp; PCC)</option>
                    <option value="CD" className="text-slate-900">🇨🇩 DR Congo (ECC)</option>
                    <option value="UG" className="text-slate-900">🇺🇬 Uganda (UCMB / UPMB)</option>
                    <option value="RW" className="text-slate-900">🇷🇼 Rwanda (BUFMAR)</option>
                    <option value="SS" className="text-slate-900">🇸🇸 South Sudan (CHASS)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 rounded-full transition-colors">
                  <Calendar className="w-3.5 h-3.5 text-[#31cdcf]" />
                  <select
                    aria-label="Filter by Period"
                    value={selectedPeriod}
                    onChange={e => setSelectedPeriod(e.target.value)}
                    className="bg-transparent font-semibold outline-none text-white cursor-pointer"
                  >
                    {periods.map(p => (
                      <option key={p.iso} value={p.iso} className="text-slate-900">
                        {p.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 rounded-full transition-colors">
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
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

                {selectedOrgUnit !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedOrgUnit('ALL')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-100 font-semibold cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Scope
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDhis2Pull(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f27f20] hover:bg-[#dc6e14] text-white font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  Sync KHIS Kenya
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={!surveillance}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <Link
                  href="/visualizer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#31cdcf]" />
                  Visualizer
                </Link>
                <button
                  type="button"
                  onClick={loadSurveillance}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#004a59] hover:bg-cyan-50 font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4 VISUAL TELEMETRY GAUGE CARDS (FIRST-READ EXECUTIVE STRIP) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading && !surveillance ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-36 animate-pulse" />
            ))
          ) : (
            <>
              {/* Card 1: Tracer Medicine Availability */}
              <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#004a59]/40 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#004a59] to-[#31cdcf]" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Tracer Availability
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 tabular-nums mt-1">
                      {kpiTracer !== undefined ? `${kpiTracer}%` : '--'}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Target &ge; 85%
                    </div>
                  </div>
                  <RadialGauge
                    value={kpiTracer ?? 0}
                    color={(kpiTracer ?? 0) >= 85 ? '#059669' : '#f59e0b'}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t border-slate-100">
                  <span className="text-slate-500 truncate">{activeScopeLabel}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (kpiTracer ?? 0) >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {(kpiTracer ?? 0) >= 85 ? 'On Track' : 'Below Target'}
                  </span>
                </div>
              </div>

              {/* Card 2: Stock-out Rate */}
              <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-rose-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 to-amber-400" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Stock-out Rate
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 tabular-nums mt-1">
                      {kpiStockout !== undefined ? `${kpiStockout}%` : '--'}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 mt-1">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      Control Ceiling &lt; 5%
                    </div>
                  </div>
                  <RadialGauge
                    value={Math.max(0, 100 - (kpiStockout ?? 0) * 4)}
                    color={(kpiStockout ?? 99) < 5 ? '#059669' : '#e11d48'}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t border-slate-100">
                  <span className="text-slate-500 truncate">{activeScopeLabel}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (kpiStockout ?? 99) < 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {(kpiStockout ?? 99) < 5 ? 'Controlled' : 'Action Needed'}
                  </span>
                </div>
              </div>

              {/* Card 3: Reporting Completeness */}
              <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#005a87]/40 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#005a87] to-sky-400" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Reporting Completeness
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 tabular-nums mt-1">
                      {kpiCompleteness !== undefined ? `${kpiCompleteness}%` : '--'}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#005a87] mt-1">
                      <Activity className="w-3.5 h-3.5" />
                      Benchmark &ge; 80%
                    </div>
                  </div>
                  <RadialGauge
                    value={kpiCompleteness ?? 0}
                    color={(kpiCompleteness ?? 0) >= 80 ? '#005a87' : '#e11d48'}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t border-slate-100">
                  <span className="text-slate-500 truncate">{activeScopeLabel}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (kpiCompleteness ?? 0) >= 80 ? 'bg-sky-100 text-sky-900' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {(kpiCompleteness ?? 0) >= 80 ? 'Controlled' : 'Reporting Gap'}
                  </span>
                </div>
              </div>

              {/* Card 4: AMR Stewardship Score */}
              <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#67a671] to-emerald-400" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      AMR Stewardship
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 tabular-nums mt-1">
                      {kpiAmr !== undefined ? `${kpiAmr}%` : '--'}
                    </div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      WHO AWaRe Index
                    </div>
                  </div>
                  <RadialGauge value={kpiAmr ?? 0} color="#004a59" />
                </div>
                <div className="flex items-center justify-between text-[11px] pt-3 mt-3 border-t border-slate-100">
                  <span className="text-slate-500 truncate">{activeScopeLabel}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#004a59]/10 text-[#004a59]">
                    400+ Active DTCs
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* SEGMENTED WORKSPACE TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs text-xs">
            {(
              [
                {
                  id: 'ALERTS',
                  label: 'Sentinel Alerts & Country Scorecard',
                  badge: alertCounts.totalActive,
                  icon: ShieldAlert
                },
                { id: 'TRENDS', label: '12-Month Trends & Committees', icon: TrendingUp },
                {
                  id: 'GOVERNANCE',
                  label: 'Sovereignty & Audit Trail',
                  badge: auditLogs.length,
                  icon: Layers
                }
              ] as const
            ).map(tab => {
              const Icon = tab.icon;
              const active = dashboardTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDashboardTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#004a59] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {'badge' in tab && tab.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Link
            href="/maps"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004a59] hover:text-[#f27f20] transition-colors self-start sm:self-auto"
          >
            <MapPin className="w-3.5 h-3.5" />
            Open Live GIS Surveillance Map
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* TAB 1: SENTINEL ALERTS & COUNTRY SCORECARD */}
        {dashboardTab === 'ALERTS' && (
          <div className="space-y-6">
            {/* 2-Column Command Split: Alert Triage Feed (2/3) + Country Risk Radar (1/3) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left 8 cols: Sentinel Alert Triage Cards */}
              <div className="xl:col-span-8 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                          <Flame className="w-4 h-4" />
                        </span>
                        <h2 className="text-base font-extrabold text-slate-900">
                          Active Sentinel Alerts &amp; Early Warning Signals
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Threshold breaches across tracer stock-outs, WHO Watch antibiotics, near-expiry batches, and reporting gaps.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs shrink-0">
                      {(['ACTIVE', 'RESOLVED', 'ALL'] as const).map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setAlertFilter(f)}
                          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            alertFilter === f ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity Quick Filter Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 mr-1">
                      <Filter className="w-3 h-3" />
                      Severity:
                    </span>
                    {(
                      [
                        { id: 'ALL', label: `All (${alertCounts.totalActive})`, activeCls: 'bg-slate-900 text-white' },
                        {
                          id: 'CRITICAL',
                          label: `Critical (${alertCounts.critical})`,
                          activeCls: 'bg-rose-600 text-white'
                        },
                        {
                          id: 'WARNING',
                          label: `Warning (${alertCounts.warning})`,
                          activeCls: 'bg-amber-500 text-slate-950'
                        },
                        { id: 'WATCH', label: `Watch (${alertCounts.watch})`, activeCls: 'bg-sky-600 text-white' }
                      ] as const
                    ).map(chip => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setSeverityFilter(chip.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          severityFilter === chip.id
                            ? chip.activeCls
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Alert Cards */}
                  {loading && !surveillance ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  ) : visibleAlerts.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                      <div className="text-sm font-bold text-slate-800">All Clear for Current Filter</div>
                      <p className="text-xs text-slate-500">
                        No sentinel alerts match the selected country, severity, and status filters.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleAlerts.map(alert => {
                        const isCritical = alert.severity === 'CRITICAL';
                        const isWarning = alert.severity === 'WARNING';
                        const isResolved = alert.status === 'RESOLVED';
                        const meta = COUNTRY_META[alert.country];

                        const cardAccent = isResolved
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : isCritical
                          ? 'border-rose-200 bg-gradient-to-r from-rose-50/70 via-white to-white hover:border-rose-300'
                          : isWarning
                          ? 'border-amber-200 bg-gradient-to-r from-amber-50/60 via-white to-white hover:border-amber-300'
                          : 'border-sky-200 bg-gradient-to-r from-sky-50/60 via-white to-white hover:border-sky-300';

                        const leftStripe = isResolved
                          ? 'bg-emerald-500'
                          : isCritical
                          ? 'bg-rose-600'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-sky-500';

                        return (
                          <article
                            key={alert.id}
                            className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs hover:shadow-md ${cardAccent}`}
                          >
                            <div className={`absolute inset-y-0 left-0 w-1.5 ${leftStripe}`} />

                            <div className="pl-2 space-y-3">
                              {/* Top Row: Severity + Code + Status */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                      isCritical
                                        ? 'bg-rose-600 text-white'
                                        : isWarning
                                        ? 'bg-amber-500 text-slate-950'
                                        : 'bg-sky-600 text-white'
                                    }`}
                                  >
                                    {isCritical ? <Siren className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                    {alert.severity}
                                  </span>
                                  <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {alert.code}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      alert.status === 'RESOLVED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : alert.status === 'ACKNOWLEDGED'
                                        ? 'bg-indigo-100 text-indigo-800'
                                        : 'bg-slate-200/80 text-slate-700'
                                    }`}
                                  >
                                    {alert.status}
                                  </span>
                                </div>

                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                                  {alert.provenance.replace(/_/g, ' ')}
                                </span>
                              </div>

                              {/* Title & Location */}
                              <div>
                                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                                  {alert.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                                  <span>{meta?.flag || '🌍'}</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrgUnit(alert.country)}
                                    className="font-bold text-[#004a59] hover:underline cursor-pointer"
                                  >
                                    {alert.countryName}
                                  </button>
                                  <span className="text-slate-400">({alert.memberCode})</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="font-medium text-slate-700">{alert.facilityName}</span>
                                </div>
                              </div>

                              {/* Observed vs Threshold Metric Strip */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                <div className="rounded-xl bg-white/90 border border-slate-200/80 px-3 py-2">
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                                    Observed Signal
                                  </span>
                                  <span
                                    className={`font-extrabold ${
                                      isCritical ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-sky-800'
                                    }`}
                                  >
                                    {alert.currentValue}
                                  </span>
                                </div>
                                <div className="rounded-xl bg-white/90 border border-slate-200/80 px-3 py-2">
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                                    Control Threshold
                                  </span>
                                  <span className="font-bold text-slate-800">{alert.threshold}</span>
                                </div>
                              </div>

                              {/* Recommended Control Action + Buttons */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                <div className="flex items-start gap-2 text-xs text-[#004a59] bg-cyan-50/90 border border-cyan-200/80 px-3 py-2 rounded-xl flex-1">
                                  <Sparkles className="w-3.5 h-3.5 text-[#005a87] shrink-0 mt-0.5" />
                                  <span>
                                    <strong className="font-bold">Control Action:</strong> {alert.recommendedAction}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-xs">
                                  <a
                                    href={buildAlertGmailUrl(alert)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                                    title="Escalate this alert via Gmail"
                                  >
                                    <Mail className="w-3.5 h-3.5 text-[#f27f20]" />
                                    Gmail
                                  </a>

                                  {!isResolved && (
                                    <>
                                      {alert.status === 'ACTIVE' && (
                                        <button
                                          type="button"
                                          onClick={() => handleAcknowledge(alert.id)}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          Acknowledge
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleResolve(alert.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer shadow-2xs"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        Resolve
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right 4 cols: Interactive Country Risk Radar */}
              <aside className="xl:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Country Risk Radar</h3>
                      <p className="text-[11px] text-slate-500">Click any country to scope the control center</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                      {scorecardCounts.all} Nations
                    </span>
                  </div>

                  {/* Summary Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setStatusFilter(statusFilter === 'ALERT' ? 'ALL' : 'ALERT')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        statusFilter === 'ALERT'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <div className="text-lg font-extrabold tabular-nums">{scorecardCounts.alert}</div>
                      <div className="text-[10px] font-bold uppercase">Alert</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter(statusFilter === 'WATCH' ? 'ALL' : 'WATCH')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        statusFilter === 'WATCH'
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <div className="text-lg font-extrabold tabular-nums">{scorecardCounts.watch}</div>
                      <div className="text-[10px] font-bold uppercase">Watch</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter(statusFilter === 'OPTIMAL' ? 'ALL' : 'OPTIMAL')}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        statusFilter === 'OPTIMAL'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <div className="text-lg font-extrabold tabular-nums">{scorecardCounts.optimal}</div>
                      <div className="text-[10px] font-bold uppercase">Optimal</div>
                    </button>
                  </div>

                  {/* Quick Clickable Country List */}
                  <div className="space-y-2">
                    {(surveillance?.countryScorecards || []).map(c => {
                      const meta = COUNTRY_META[c.country];
                      const isSelected = selectedOrgUnit === c.country;
                      return (
                        <button
                          key={c.country}
                          type="button"
                          onClick={() => setSelectedOrgUnit(isSelected ? 'ALL' : c.country)}
                          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#004a59] text-white border-[#004a59] shadow-sm'
                              : 'bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-[#004a59]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base shrink-0">{meta?.flag || '🌍'}</span>
                            <div className="min-w-0">
                              <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {c.countryName}
                              </div>
                              <div className={`text-[10px] truncate ${isSelected ? 'text-cyan-100' : 'text-slate-500'}`}>
                                Avail {c.tracerAvailabilityPct}% · Stockout {c.stockoutRatePct}%
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : c.controlStatus === 'OPTIMAL'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.controlStatus === 'WATCH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {c.controlStatus}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>

            {/* COUNTRY PHARMACEUTICAL SURVEILLANCE & CONTROL SCORECARD */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Country Pharmaceutical Surveillance &amp; Control Scorecard
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Completeness, essential medicine availability, stock-out heat, and WHO AWaRe stewardship across priority EPN nations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={e => setCountrySearch(e.target.value)}
                    placeholder="Search country..."
                    aria-label="Filter countries"
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-[#004a59] focus:bg-white w-40"
                  />

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['ALL', 'ALERT', 'WATCH', 'OPTIMAL'] as const).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setScorecardView('CARDS')}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        scorecardView === 'CARDS' ? 'bg-white text-[#004a59] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Card Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setScorecardView('TABLE')}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        scorecardView === 'TABLE' ? 'bg-white text-[#004a59] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Compact Table View"
                    >
                      <Table2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Grid View (Default — visually engaging on both mobile and desktop) */}
              {scorecardView === 'CARDS' ? (
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {filteredScorecards.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-xs text-slate-500">
                      No countries match the selected filter.
                    </div>
                  ) : (
                    filteredScorecards.map(c => {
                      const meta = COUNTRY_META[c.country];
                      const isAlert = c.controlStatus === 'ALERT';
                      const isWatch = c.controlStatus === 'WATCH';
                      return (
                        <div
                          key={c.country}
                          onClick={() => setSelectedOrgUnit(selectedOrgUnit === c.country ? 'ALL' : c.country)}
                          className={`group rounded-2xl border p-4 transition-all cursor-pointer hover:shadow-md flex flex-col justify-between space-y-4 ${
                            selectedOrgUnit === c.country
                              ? 'border-[#004a59] ring-2 ring-[#004a59]/15 bg-cyan-50/30'
                              : isAlert
                              ? 'border-rose-200/90 bg-white hover:border-rose-300'
                              : isWatch
                              ? 'border-amber-200/90 bg-white hover:border-amber-300'
                              : 'border-emerald-200/90 bg-white hover:border-emerald-300'
                          }`}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-2xl leading-none">{meta?.flag || '🌍'}</span>
                              <div className="min-w-0">
                                <div className="font-extrabold text-sm text-slate-900 truncate">
                                  {c.countryName}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {meta?.memberLabel || c.country}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
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

                          {/* Visual Progress Bars */}
                          <div className="space-y-2.5 text-xs">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-slate-500 font-medium">Tracer Availability</span>
                                <span className="font-extrabold text-slate-900 tabular-nums">{c.tracerAvailabilityPct}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    c.tracerAvailabilityPct >= 85
                                      ? 'bg-[#004a59]'
                                      : c.tracerAvailabilityPct >= 78
                                      ? 'bg-amber-500'
                                      : 'bg-rose-600'
                                  }`}
                                  style={{ width: `${Math.min(100, c.tracerAvailabilityPct)}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-slate-500 font-medium">Reporting Completeness</span>
                                <span className="font-bold text-slate-800 tabular-nums">{c.reportingCompletenessPct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    c.reportingCompletenessPct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(100, c.reportingCompletenessPct)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Bottom 3-Metric Strip */}
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                            <div className="rounded-xl bg-slate-50 py-1.5 px-1">
                              <div className="text-[10px] text-slate-400 font-semibold">Stock-out</div>
                              <div
                                className={`text-xs font-extrabold tabular-nums ${
                                  c.stockoutRatePct < 5
                                    ? 'text-emerald-700'
                                    : c.stockoutRatePct < 10
                                    ? 'text-amber-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {c.stockoutRatePct}%
                              </div>
                            </div>
                            <div className="rounded-xl bg-slate-50 py-1.5 px-1">
                              <div className="text-[10px] text-slate-400 font-semibold">AMR</div>
                              <div className="text-xs font-extrabold text-slate-800 tabular-nums">
                                {c.amrStewardshipScorePct}%
                              </div>
                            </div>
                            <div className="rounded-xl bg-slate-50 py-1.5 px-1">
                              <div className="text-[10px] text-slate-400 font-semibold">FOSAs</div>
                              <div className="text-xs font-extrabold text-slate-800 tabular-nums">
                                {c.facilitiesReporting.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Desktop Table View */
                <div className="overflow-x-auto">
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
                          <td colSpan={8} className="py-8 text-center text-slate-500">
                            No countries match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredScorecards.map(c => {
                          const meta = COUNTRY_META[c.country];
                          return (
                            <tr
                              key={c.country}
                              onClick={() => setSelectedOrgUnit(selectedOrgUnit === c.country ? 'ALL' : c.country)}
                              className="hover:bg-cyan-50/40 transition-colors cursor-pointer"
                            >
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                <span className="mr-2">{meta?.flag || '🌍'}</span>
                                {c.countryName}{' '}
                                <span className="text-slate-400 font-mono font-normal">({c.country})</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-700 tabular-nums">
                                {c.facilitiesReporting.toLocaleString()} / {c.totalFacilities.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold tabular-nums w-11">{c.reportingCompletenessPct}%</span>
                                  <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        c.reportingCompletenessPct >= 80 ? 'bg-emerald-600' : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${Math.min(100, c.reportingCompletenessPct)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 tabular-nums w-11">{c.tracerAvailabilityPct}%</span>
                                  <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        c.tracerAvailabilityPct >= 85
                                          ? 'bg-[#004a59]'
                                          : c.tracerAvailabilityPct >= 78
                                          ? 'bg-amber-500'
                                          : 'bg-rose-600'
                                      }`}
                                      style={{ width: `${Math.min(100, c.tracerAvailabilityPct)}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold tabular-nums ${
                                    c.stockoutRatePct < 5
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : c.stockoutRatePct < 10
                                      ? 'bg-amber-50 text-amber-800'
                                      : 'bg-rose-50 text-rose-700'
                                  }`}
                                >
                                  {c.stockoutRatePct}%
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-800 font-semibold tabular-nums">
                                {c.amrStewardshipScorePct}%
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    c.provenance === 'DHIS2_LIVE_SYNC'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-50 text-amber-800'
                                  }`}
                                >
                                  {c.provenance === 'DHIS2_LIVE_SYNC' ? 'DHIS2 LIVE' : 'BENCHMARK'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
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
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: 12-MONTH TRENDS & GOVERNANCE STRUCTURES */}
        {dashboardTab === 'TRENDS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    12-Month Supply Chain Trajectory ({activeScopeLabel})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Monthly tracer availability vs stock-out incidence • Period {selectedPeriod}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-[#004a59] font-bold">
                    <span className="w-3 h-3 rounded-sm bg-[#004a59]" /> Availability (%)
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-700 font-bold">
                    <span className="w-3 h-3 rounded-sm bg-rose-500" /> Stock-outs (%)
                  </span>
                </div>
              </div>

              <div className="relative pt-8">
                {/* 85% target reference line */}
                <div
                  className="pointer-events-none absolute inset-x-0 border-t border-dashed border-emerald-500/60 flex justify-end"
                  style={{ top: 'calc(2rem + 15%)' }}
                >
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded -mt-2.5">
                    85% Target
                  </span>
                </div>

                <div className="h-60 flex items-end gap-2 pb-7 border-b border-slate-200">
                  {trendData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                      <div className="absolute -top-14 bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        <div className="font-bold text-[#31cdcf]">{d.month}</div>
                        <div>Avail: {d.availability}%</div>
                        <div>Stockout: {d.stockouts}%</div>
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div
                          className="w-1/2 bg-gradient-to-t from-[#004a59] to-[#005a87] rounded-t-md transition-all group-hover:brightness-110"
                          style={{ height: `${d.availability}%` }}
                        />
                        <div
                          className="w-1/2 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all group-hover:brightness-110"
                          style={{ height: `${Math.min(100, d.stockouts * 2.2)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold mt-1 rotate-45 origin-left truncate">
                        {d.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Governance &amp; Quality Committees</h3>
                <p className="text-xs text-slate-500 mt-0.5">Facility committee functionality across the EPN network</p>

                <div className="space-y-4 mt-5">
                  {[
                    { label: 'Drug & Therapeutics (DTC)', pct: 82, count: '410 Facilities', color: 'bg-[#004a59]' },
                    { label: 'Infection Prevention (IPC)', pct: 76, count: '380 Facilities', color: 'bg-emerald-600' },
                    { label: 'Antimicrobial Stewardship (AMS)', pct: 64, count: '320 Facilities', color: 'bg-[#005a87]' },
                    { label: 'Quality Improvement (QIT)', pct: 71, count: '355 Facilities', color: 'bg-[#f27f20]' }
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-700">{item.label}</span>
                        <span className="text-slate-900 tabular-nums">
                          {item.pct}% <span className="font-normal text-slate-500">({item.count})</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-[#004a59] to-[#005a87] text-white rounded-2xl text-xs space-y-1.5">
                <span className="inline-flex items-center gap-1.5 font-extrabold text-[#31cdcf]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Capacity Building Milestone
                </span>
                <p className="text-cyan-50 text-[11px] leading-relaxed">
                  Over 1,273 healthcare workers trained in EmONC, supply chain forecasting, Minilab QA, and WHO AWaRe AMR surveillance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEMBER DATA SOVEREIGNTY & AUDIT TRAIL */}
        {dashboardTab === 'GOVERNANCE' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#004a59]" />
                    <h3 className="text-base font-extrabold text-slate-900">
                      Member Data Sovereignty &amp; DPA Controls
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Each member association governs upward sharing of facility alerts and AMR signals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDhis2Pull(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Test KHIS Dry-Run
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {sharingPolicies.map(p => (
                  <div key={p.memberCode} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50/70">
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 truncate">
                        {COUNTRY_META[p.country]?.flag || '🌍'} {p.memberCode}{' '}
                        <span className="font-normal text-slate-500">({p.country})</span>
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
                          p.shareAmrSignals ? 'bg-cyan-100 text-cyan-900' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        AMR: {p.shareAmrSignals ? 'ON' : 'MASKED'}
                      </button>
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          p.dpaSigned ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {p.dpaSigned ? 'DPA Signed' : 'DPA Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Append-Only Governance Audit Trail</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable log of alert actions, DHIS2 syncs, data entries, and sovereignty updates.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-mono font-bold text-slate-700">
                  {auditLogs.length} Events
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3.5 text-xs space-y-1 hover:bg-slate-50/70">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-[#004a59] text-[11px] bg-cyan-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(log.occurredAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      Target: <span className="font-mono font-semibold">{log.targetId}</span> &rarr;{' '}
                      <span className="font-bold text-slate-900">{log.newState}</span>
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
