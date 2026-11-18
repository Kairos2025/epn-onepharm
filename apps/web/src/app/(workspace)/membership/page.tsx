'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Calendar,
  ShieldCheck,
  Building2,
  Globe
} from 'lucide-react';
import type {
  MembershipDashboardData,
  MembershipRegionFilter,
  MemberRecordDetail
} from '@epn/domain';
import { epnClient } from '@/lib/api';

type MainTab = 'FEES' | 'REACH' | 'RECORD';
type RecordSubTab = 'PROFILE' | 'FACILITIES' | 'CONTACTS' | 'SUBSCRIPTION' | 'ENGAGEMENT';

export default function MembershipPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('FEES');
  const [region, setRegion] = useState<MembershipRegionFilter>('ALL');
  const [data, setData] = useState<MembershipDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState('mem_ceca20');
  const [recordSubTab, setRecordSubTab] = useState<RecordSubTab>('SUBSCRIPTION');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceNo, setInvoiceNo] = useState('INV-2027-014');
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await epnClient.getMembershipDashboard(region);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Unable to load Membership Health Dashboard.');
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeRecord: MemberRecordDetail | undefined =
    data?.records.find(r => r.id === selectedRecordId) || data?.records[0];

  const handleInvoiceStep = async (nextStatus: MemberRecordDetail['invoice2027']['status']) => {
    if (!activeRecord) return;
    setSavingInvoice(true);
    try {
      await epnClient.issueMemberInvoice(activeRecord.id, {
        invoiceNo: invoiceNo || `INV-2027-${activeRecord.code}`,
        issuedDate: invoiceDate,
        status: nextStatus
      });
      await loadData();
      setToast(`2027 invoice for ${activeRecord.code} updated to ${nextStatus}.`);
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to update 2027 invoice.');
    } finally {
      setSavingInvoice(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium px-4 py-3 rounded-2xl flex items-center justify-between"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-1 rounded-full bg-rose-700 text-white font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Top Header + Tabs + Region Filter */}
        <div className="m3-glass-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs w-fit">
              {(
                [
                  { id: 'FEES', label: 'Membership & fees' },
                  { id: 'REACH', label: 'Reach & engagement' },
                  { id: 'RECORD', label: 'Member record (data entry)' }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${
                    activeTab === tab.id ? 'bg-cyan-800 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Region</span>
              {(
                [
                  { id: 'ALL', label: 'All regions' },
                  { id: 'EAST', label: 'East' },
                  { id: 'WEST', label: 'West' },
                  { id: 'CENTRAL', label: 'Central' },
                  { id: 'SOUTHERN', label: 'Southern' }
                ] as const
              ).map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRegion(r.id)}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                    region === r.id
                      ? 'bg-cyan-800 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
              <button
                type="button"
                onClick={loadData}
                aria-label="Refresh membership data"
                className="p-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'FEES'
                ? 'Membership Health Dashboard'
                : activeTab === 'REACH'
                ? 'Reach, growth and engagement'
                : 'Member Record & 2027 Fee Workflow'}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              EPN membership, voting rights, fee payment, and data quality. Membership year 1 January to 31 December.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-200 font-medium">
                AGM 2026 membership status paper · 9 Oct 2026
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-900 border border-sky-200 font-medium">
                Payment &amp; contact tracker · 18 Oct 2025
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                2027 fee cycle starts Jan 2027
              </span>
            </div>
          </div>
        </div>

        {loading && !data ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="m3-glass-card h-28 animate-pulse bg-white/70" />
            ))}
          </div>
        ) : (
          data && (
            <>
              {/* TAB 1: MEMBERSHIP & FEES */}
              {activeTab === 'FEES' && (
                <div className="space-y-6">
                  {/* 5 Headline KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="m3-glass-card p-4 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">Members</span>
                      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{data.summary.totalMembers}</div>
                      <p className="text-[11px] text-slate-500">{data.summary.newOrdinary2026}</p>
                    </div>
                    <div className="m3-glass-card p-4 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">Ordinary · voting</span>
                      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{data.summary.ordinaryVoting}</div>
                      <p className="text-[11px] text-slate-500">50% of members; {data.summary.associateNoVote} Associate</p>
                    </div>
                    <div className="m3-glass-card p-4 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">Fees collected 2025</span>
                      <div className="text-3xl font-extrabold text-amber-700 tabular-nums">{data.summary.feesCollected2025Pct}%</div>
                      <p className="text-[11px] text-slate-500">
                        ${data.summary.feesCollected2025Usd.toLocaleString()} of ${data.summary.feesExpectedUsd.toLocaleString()}
                      </p>
                    </div>
                    <div className="m3-glass-card p-4 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">Members who paid 2025</span>
                      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{data.summary.membersPaid2025}</div>
                      <p className="text-[11px] text-slate-500">9% of members ({data.summary.membersPaid2024} in 2024)</p>
                    </div>
                    <div className="m3-glass-card p-4 space-y-1 col-span-2 sm:col-span-1">
                      <span className="text-[11px] font-semibold text-slate-500">Finance contact on file</span>
                      <div className="text-3xl font-extrabold text-rose-700 tabular-nums">{data.summary.financeContactPct}%</div>
                      <p className="text-[11px] text-slate-500">{data.summary.financeContactOnFile} of 151 needed for invoicing</p>
                    </div>
                  </div>

                  {/* Members by category & voting rights */}
                  <div className="m3-glass-card p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h2 className="text-sm font-bold text-slate-900">Members by category and voting rights</h2>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-3 h-3 rounded-xs bg-cyan-800" /> Ordinary (voting)
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-3 h-3 rounded-xs bg-cyan-200" /> Associate (no vote)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {data.categories.map(cat => (
                        <div key={cat.code} className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 text-xs">
                          <div className="md:col-span-4 font-semibold text-slate-800">{cat.name}</div>
                          <div className="md:col-span-7 bg-slate-100 h-6 rounded-lg overflow-hidden flex">
                            {cat.ordinary > 0 && (
                              <div
                                className="bg-cyan-800 text-white text-[10px] font-bold flex items-center px-2"
                                style={{ width: `${(cat.ordinary / 55) * 100}%` }}
                              >
                                {cat.ordinary}
                              </div>
                            )}
                            {cat.associate > 0 && (
                              <div
                                className="bg-cyan-200 text-cyan-950 text-[10px] font-bold flex items-center px-2"
                                style={{ width: `${(cat.associate / 55) * 100}%` }}
                              >
                                {cat.associate}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-1 text-right font-bold text-slate-900 tabular-nums">
                            {cat.total} <span className="text-slate-400 font-normal">{cat.sharePct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fees collected vs expected + Members paying 2019-2025 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="m3-glass-card p-5 sm:p-6 space-y-4">
                      <h3 className="text-sm font-bold text-slate-900">1 · Fees collected vs expected</h3>
                      <div className="space-y-4 text-xs">
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>2024 (Forum year)</span>
                            <span className="tabular-nums">$13,152 of $33,000 · 40%</span>
                          </div>
                          <div className="w-full bg-amber-100 h-5 rounded-lg overflow-hidden">
                            <div className="bg-cyan-800 h-full" style={{ width: '40%' }} />
                          </div>
                          <span className="text-[11px] text-slate-500 mt-1 block">$19,848 unpaid</span>
                        </div>
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>2025</span>
                            <span className="tabular-nums">$3,869 of $33,000 · 12%</span>
                          </div>
                          <div className="w-full bg-amber-100 h-5 rounded-lg overflow-hidden">
                            <div className="bg-cyan-800 h-full" style={{ width: '12%' }} />
                          </div>
                          <span className="text-[11px] text-slate-500 mt-1 block">$29,131 unpaid</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                          <div className="font-extrabold text-rose-900 text-base tabular-nums">$48,979</div>
                          <div className="text-[10px] text-rose-700">unpaid 2024–2025</div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                          <div className="font-extrabold text-amber-900 text-base tabular-nums">-71%</div>
                          <div className="text-[10px] text-amber-700">fees 2025 vs 2024</div>
                        </div>
                        <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                          <div className="font-extrabold text-cyan-900 text-base tabular-nums">30%</div>
                          <div className="text-[10px] text-cyan-800">2027 target (~$10k)</div>
                        </div>
                      </div>

                      {/* Unpaid invoice aging from JPEG */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-semibold text-slate-600 mb-2">Unpaid invoices by age</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {data.invoiceAging.map(a => (
                            <div key={a.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="font-extrabold text-slate-900 text-lg tabular-nums">{a.count}</div>
                              <div className="text-[10px] text-slate-600">{a.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="m3-glass-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">2 · Members paying each year, 2019–2025</h3>
                        <p className="text-xs text-slate-500">Forum years marked ★</p>
                        <div className="h-52 flex items-end gap-3 pt-6 pb-2 border-b border-slate-200">
                          {data.yearlyPayments.map(y => (
                            <div key={y.year} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                              <span className="text-[11px] font-bold text-slate-800 tabular-nums">{y.membersPaid}</span>
                              <div
                                className={`w-full rounded-t-lg ${
                                  y.year === 2025 ? 'bg-amber-600' : 'bg-sky-700'
                                }`}
                                style={{ height: `${(y.membersPaid / 62) * 100}%` }}
                              />
                              <span className="text-[10px] font-bold text-slate-700">
                                {y.year}
                                {y.isForumYear ? ' ★' : ''}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                ${(y.amountUsd / 1000).toFixed(1)}k
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Member Size Bands from JPEG */}
                      <div className="pt-2 space-y-2">
                        <div className="text-xs font-bold text-slate-900">Member size by health facilities</div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          {data.sizeBands.map(b => (
                            <div key={b.band} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="font-bold text-slate-900">{b.band}</div>
                              <div className="text-[10px] text-slate-500">{b.range}</div>
                              <div className="font-extrabold text-cyan-800 mt-1 tabular-nums">
                                {b.count} <span className="font-normal text-slate-400">({b.sharePct}%)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 · Who paid, by category (2024 vs 2025) */}
                  <div className="m3-glass-card p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">3 · Who paid, by category</h3>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-xs bg-cyan-800" /> 2024
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-2.5 h-2.5 rounded-xs bg-amber-600" /> 2025
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                      {[
                        ...data.categories.map(c => ({
                          code: c.code === 'INDIVIDUAL' ? 'Individuals' : c.code,
                          p24: c.paid2024,
                          p25: c.paid2025,
                          sub: `${Math.round((c.paid2024 / c.total) * 100)}% paid in 2024 · ${Math.round((c.paid2025 / c.total) * 100)}% in 2025`
                        })),
                        { code: 'No category', p24: 7, p25: 4, sub: 'to be classified' }
                      ].map(item => (
                        <div key={item.code} className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                          <div className="font-bold text-slate-900">{item.code}</div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-cyan-800 h-full rounded-full" style={{ width: `${(item.p24 / 15) * 100}%` }} />
                              </div>
                              <span className="font-bold tabular-nums">{item.p24}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(item.p25 / 15) * 100}%` }} />
                              </div>
                              <span className="font-bold tabular-nums">{item.p25}</span>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500">{item.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4 · 2027 Fee Cycle Pipeline */}
                  <div className="m3-glass-card p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        4 · 2027 fee cycle: invoice &rarr; submission &rarr; acknowledgement &rarr; payment
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Cycle activates Jan 2027
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                      {[
                        { when: 'EARLY JAN 2027', label: 'Invoice issued', val: data.feeCycle2027.invoiceIssued, desc: 'Fee letter signed by ED with Value Proposition' },
                        { when: 'JAN 2027', label: 'Submitted to member', val: data.feeCycle2027.submitted, desc: 'Sent to member finance contact' },
                        { when: 'FEB 2027', label: 'Acknowledged', val: data.feeCycle2027.acknowledged, desc: 'Receipt confirmed; 30-day reminder if not' },
                        { when: 'MAR–APR 2027', label: 'Payment received', val: data.feeCycle2027.paymentReceived, desc: '60-day reminder; ED escalation at 90 days' },
                        { when: 'BEFORE AGM', label: 'Good-standing list', val: data.feeCycle2027.goodStandingList, desc: 'Members paid up for AGM voting' }
                      ].map(step => (
                        <div key={step.label} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                          <div className="text-[10px] font-mono font-bold text-cyan-800">{step.when}</div>
                          <div className="font-bold text-slate-900">{step.label}</div>
                          <div className="text-xl font-extrabold text-slate-900 tabular-nums">
                            {step.val} <span className="text-xs font-normal text-slate-400">/ 151</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{step.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5 · Contacts on file & Clean-up Queue */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="m3-glass-card p-5 sm:p-6 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">5 · Member contacts on file</h3>
                      <div className="space-y-3 text-xs">
                        {data.contactsOnFile.map(c => (
                          <div key={c.field}>
                            <div className="flex justify-between font-semibold mb-1">
                              <span>{c.field}</span>
                              <span className="tabular-nums">{c.pct}% ({c.count})</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${c.pct >= 70 ? 'bg-sky-700' : 'bg-amber-600'}`}
                                style={{ width: `${c.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="m3-glass-card p-5 sm:p-6 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">Records to clean before January 2027</h3>
                      <div className="space-y-2 text-xs">
                        {data.cleanUpQueue.map(q => (
                          <div
                            key={q.label}
                            className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 flex items-center justify-between gap-2"
                          >
                            <span className="font-medium text-amber-950">{q.label}</span>
                            <span className="font-extrabold text-amber-900 font-mono text-sm tabular-nums">{q.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: REACH & ENGAGEMENT + ROLES & 2027 CALENDAR */}
              {activeTab === 'REACH' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="m3-glass-card p-5 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">Members by country (Top 12 of 37)</h3>
                        <span className="text-[11px] text-slate-500">24 records missing country</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {data.countriesTop12.map(c => (
                          <div key={c.country} className="grid grid-cols-12 items-center gap-2">
                            <span className="col-span-4 font-semibold text-slate-800">{c.country}</span>
                            <div className="col-span-7 bg-slate-100 h-3.5 rounded-full overflow-hidden">
                              <div className="bg-sky-700 h-full rounded-full" style={{ width: `${(c.count / 14) * 100}%` }} />
                            </div>
                            <span className="col-span-1 text-right font-bold tabular-nums">{c.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="m3-glass-card p-5 sm:p-6 space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-cyan-700" /> Working language (151 members)
                        </h3>
                        <div className="h-4 w-full rounded-full overflow-hidden flex">
                          {data.languages.map(l => (
                            <div key={l.label} className={l.color} style={{ width: `${(l.count / 151) * 100}%` }} />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs pt-1">
                          {data.languages.map(l => (
                            <span key={l.label} className="flex items-center gap-1.5 text-slate-700">
                              <span className={`w-2.5 h-2.5 rounded-xs ${l.color}`} />
                              <span>{l.label}: <b>{l.count}</b></span>
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          A quarter of members work in French: fee letters, reminders, and surveys require EN &amp; FR parity.
                        </p>
                      </div>

                      <div className="m3-glass-card p-5 sm:p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">Growth since AGM 2025</h3>
                          <span className="font-mono font-bold text-cyan-800 text-xs">149 &rarr; 151</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="font-bold text-slate-900">CECA 20 — Communauté Evangélique au Centre de l’Afrique</div>
                          <div className="text-slate-600">DR Congo (Bunia) · CHA · Ordinary · 93 facilities (5 hospitals, 88 health centres)</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="font-bold text-slate-900">CMMB — Catholic Medical Mission Board</div>
                          <div className="text-slate-600">USA · HSS · Ordinary · Supply chain partnership for under-resourced facilities</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Member ownership & engagement (Strategic Plan Pillar 2) */}
                  <div className="m3-glass-card p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        Member ownership &amp; engagement (Strategic Plan Pillar 2)
                      </h3>
                      <span className="text-[11px] text-slate-500">What the 2027 membership function will track</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {[
                        { title: 'Paying fees', val: '9%', sub: '14 of 151 members paid in 2025 · payment tracker' },
                        { title: 'Sharing data', val: '—', sub: 'Data sharing agreements · EDMS, from Q2 2027' },
                        { title: 'Joining initiatives', val: '—', sub: 'Members in TWGs and projects · project register' },
                        { title: 'Webinar participation', val: '—', sub: 'Webinar attendance lists' },
                        { title: 'LMS active users', val: '—', sub: 'Learning Management System' },
                        { title: 'Quarterly member calls', val: '—', sub: 'Attendance, from March 2027' },
                        { title: 'Satisfaction survey', val: '—', sub: 'Annual survey, Aug–Sep 2027' },
                        { title: 'Onboarded within 2 weeks', val: '—', sub: 'Welcome pack sent to new members' },
                        { title: 'Records complete & current', val: '—', sub: 'Database clean-up, Nov 2026 – Jan 2027' }
                      ].map(card => (
                        <div key={card.title} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{card.title}</span>
                            <span className="font-extrabold text-cyan-800 tabular-nums">{card.val}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{card.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proposed 2027 Good-Standing Benefits */}
                  <div className="bg-cyan-900 text-white rounded-2xl p-5 sm:p-6 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">Proposed for 2027</span>
                    <h3 className="text-base font-bold">Benefits linked to good standing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-cyan-50">
                      <div>• Voting rights at AGM and EGMs</div>
                      <div>• Free LMS access with certificates</div>
                      <div>• Pool of experts &amp; multi-country projects</div>
                      <div>• Eligibility for annual Member Award</div>
                      <div>• Discount on EPN Forum 2028 registration</div>
                      <div>• Recognition in NetLink and at AGM</div>
                    </div>
                  </div>

                  {/* Role Accountability Matrix & 2027 Fee Calendar from DOCX */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="m3-glass-card p-5 sm:p-6 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-700" /> Membership Function Roles &amp; Safeguards
                      </h3>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                        {data.roleMatrix.map(r => (
                          <div key={r.role} className="p-3 text-xs space-y-1">
                            <div className="font-bold text-slate-900">{r.role}</div>
                            <div className="text-slate-600"><b>Membership:</b> {r.membership}</div>
                            {r.communications !== '—' && <div className="text-slate-500"><b>Comms:</b> {r.communications}</div>}
                            {r.ict !== '—' && <div className="text-slate-500"><b>ICT:</b> {r.ict}</div>}
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950">
                        <b>Safeguards:</b> Intern never handles cash; all member data stays in EPN systems (never personal email/files); formal handover before departure.
                      </div>
                    </div>

                    <div className="m3-glass-card p-5 sm:p-6 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-700" /> 2027 Membership Fee Calendar (30% Target)
                      </h3>
                      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                        {data.feeCalendar2027.map(item => (
                          <div key={item.when} className="p-3 text-xs space-y-0.5">
                            <div className="flex justify-between font-bold text-cyan-900">
                              <span>{item.when}</span>
                              <span className="text-[10px] font-mono text-slate-500">{item.owner}</span>
                            </div>
                            <div className="text-slate-800">{item.action}</div>
                            <div className="text-[11px] text-slate-500">Output: {item.output}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MEMBER RECORD (DATA ENTRY) */}
              {activeTab === 'RECORD' && activeRecord && (
                <div className="space-y-6">
                  <div className="m3-glass-card p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-cyan-800 text-white font-bold flex items-center justify-center text-sm shrink-0">
                          {activeRecord.code}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">{activeRecord.name}</h2>
                          <p className="text-xs text-slate-600">
                            {activeRecord.category} · {activeRecord.votingStatus} · {activeRecord.country}
                            {activeRecord.city ? ` (${activeRecord.city})` : ''} · {activeRecord.language} · Approved {activeRecord.approvedDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <select
                          aria-label="Select member record"
                          value={activeRecord.id}
                          onChange={e => setSelectedRecordId(e.target.value)}
                          className="p-2 border border-slate-300 rounded-full bg-white font-semibold text-slate-800 px-3.5 cursor-pointer"
                        >
                          {data.records.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.code} — {r.name.slice(0, 32)}
                            </option>
                          ))}
                        </select>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-700">
                          {activeRecord.facilitiesCount} facilities
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs">
                      {(['PROFILE', 'FACILITIES', 'CONTACTS', 'SUBSCRIPTION', 'ENGAGEMENT'] as const).map(sub => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setRecordSubTab(sub)}
                          className={`px-3 py-1 rounded-full font-semibold cursor-pointer ${
                            recordSubTab === sub ? 'bg-cyan-100 text-cyan-900' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {sub.charAt(0) + sub.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2027 Subscription Invoice Workflow */}
                  <div className="m3-glass-card p-5 sm:p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-700" /> 2027 subscription invoice
                      </h3>
                      <span className="text-xs font-mono text-slate-500">
                        {activeRecord.invoice2027.invoiceNo || 'INV-2027-[no.]'} · Fee: ${activeRecord.invoice2027.amountUsd}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {(
                        [
                          { step: 1, key: 'ISSUED', label: 'Invoice issued' },
                          { step: 2, key: 'SUBMITTED', label: 'Submitted' },
                          { step: 3, key: 'ACKNOWLEDGED', label: 'Acknowledged' },
                          { step: 4, key: 'PAID', label: 'Paid' }
                        ] as const
                      ).map(s => {
                        const order = { PENDING: 0, ISSUED: 1, SUBMITTED: 2, ACKNOWLEDGED: 3, PAID: 4 };
                        const current = order[activeRecord.invoice2027.status];
                        const done = current >= s.step;
                        return (
                          <div
                            key={s.key}
                            className={`p-3.5 rounded-2xl border ${
                              done ? 'border-cyan-700 bg-cyan-50/70' : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="font-mono text-[10px] font-bold text-slate-500">{s.step}</div>
                            <div className="font-bold text-slate-900 mt-0.5">{s.label}</div>
                            <div className="text-[11px] text-cyan-800 font-semibold mt-0.5">
                              {done ? 'completed' : current + 1 === s.step ? 'next' : 'pending'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                      <div className="font-bold text-slate-900">Record / advance 2027 invoice step</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Date</label>
                          <input
                            type="date"
                            value={invoiceDate}
                            onChange={e => setInvoiceDate(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Invoice number</label>
                          <input
                            type="text"
                            value={invoiceNo}
                            onChange={e => setInvoiceNo(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={savingInvoice}
                          onClick={() => handleInvoiceStep('ISSUED')}
                          className="px-4 py-2 rounded-full bg-cyan-800 hover:bg-cyan-900 text-white font-semibold cursor-pointer"
                        >
                          Issue invoice
                        </button>
                        <button
                          type="button"
                          disabled={savingInvoice}
                          onClick={() => handleInvoiceStep('SUBMITTED')}
                          className="px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold cursor-pointer"
                        >
                          Mark Submitted
                        </button>
                        <button
                          type="button"
                          disabled={savingInvoice}
                          onClick={() => handleInvoiceStep('ACKNOWLEDGED')}
                          className="px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold cursor-pointer"
                        >
                          Mark Acknowledged
                        </button>
                        <button
                          type="button"
                          disabled={savingInvoice}
                          onClick={() => handleInvoiceStep('PAID')}
                          className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Completeness + Who updates what + Change history */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="m3-glass-card p-5 space-y-3 text-xs">
                      <h3 className="text-sm font-bold text-slate-900">Record completeness</h3>
                      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                        {activeRecord.completenessPct}% <span className="text-xs font-normal text-slate-500">of required fields</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-800 h-full rounded-full" style={{ width: `${activeRecord.completenessPct}%` }} />
                      </div>
                      <div className="font-bold text-slate-700 pt-1">Missing</div>
                      <ul className="space-y-1 text-slate-600">
                        {activeRecord.missingFields.map(f => (
                          <li key={f}>• {f}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="m3-glass-card p-5 space-y-2 text-xs">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-700" /> Who updates what
                      </h3>
                      <div><b>Finance:</b> invoice steps and payments</div>
                      <div><b>Membership officer:</b> profile and approvals</div>
                      <div><b>Member:</b> own contacts via secure link</div>
                      <div><b>System:</b> facilities, engagement, arrears</div>
                    </div>

                    <div className="m3-glass-card p-5 space-y-2 text-xs">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-cyan-700" /> Change history
                      </h3>
                      <div className="space-y-2">
                        {activeRecord.changeHistory.map((h, idx) => (
                          <div key={idx} className="text-slate-700">
                            <span className="font-bold text-slate-900">{h.date}</span> · {h.note}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
}
