'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Calendar,
  ShieldCheck,
  Building2,
  Globe,
  Mail,
  Send,
  UserCheck,
  Plus,
  Trash2,
  Upload,
  Zap,
  Download
} from 'lucide-react';
import type {
  MembershipDashboardData,
  MembershipRegionFilter,
  MemberRecordDetail
} from '@epn/domain';
import { epnClient } from '@/lib/api';

type MainTab = 'FEES' | 'REACH' | 'RECORD' | 'FUNCTION';
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
  const [invoiceRecipientEmail, setInvoiceRecipientEmail] = useState('');
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [contactPrimaryEmail, setContactPrimaryEmail] = useState('');
  const [contactFinanceEmail, setContactFinanceEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [referencePeople, setReferencePeople] = useState<
    Array<{ name: string; role: string; email?: string; phone?: string }>
  >([]);
  const [reminderToEmail, setReminderToEmail] = useState('');
  const [reminderSubject, setReminderSubject] = useState('');
  const [reminderBody, setReminderBody] = useState('');
  const [savingContacts, setSavingContacts] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [activatingWhen, setActivatingWhen] = useState<string | null>(null);
  const [lastActivationResult, setLastActivationResult] = useState<{
    when: string;
    remindersDispatched: number;
    recipients: Array<{ code: string; name: string; email: string }>;
  } | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importPreviewRows, setImportPreviewRows] = useState<
    Array<{
      code: string;
      name: string;
      category?: MemberRecordDetail['category'];
      votingStatus?: MemberRecordDetail['votingStatus'];
      country?: string;
      city?: string;
      facilitiesCount?: number;
      primaryEmail?: string;
      financeEmail?: string;
      phone?: string;
      referencePerson?: string;
      referenceRole?: string;
    }>
  >([]);
  const [importingRows, setImportingRows] = useState(false);
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

  useEffect(() => {
    if (!activeRecord) return;
    const primary = activeRecord.contacts?.primaryEmail || '';
    const finance = activeRecord.contacts?.financeEmail || '';
    setInvoiceRecipientEmail(finance || primary);
    setContactPrimaryEmail(primary);
    setContactFinanceEmail(finance);
    setContactPhone(activeRecord.contacts?.phone || '');
    setReferencePeople(activeRecord.contacts?.referencePeople || []);
    setReminderToEmail(primary || finance);
    setReminderSubject(`EPN One Network — Annual Contact & Reference People Update (${activeRecord.code})`);
    const missingList = activeRecord.missingFields.length
      ? `\n\nItems flagged for update:\n${activeRecord.missingFields.map(f => `- ${f}`).join('\n')}`
      : '';
    const refNames = (activeRecord.contacts?.referencePeople || []).map(p => `${p.name} (${p.role})`).join(', ');
    setReminderBody(
      `Dear ${refNames || activeRecord.name} team,\n\nAs part of the EPN One Network 2027 membership cycle, please review and confirm your health association's contact email, finance billing contact, and designated reference people.${missingList}\n\nThank you for keeping EPN One Network records up to date.\n\nWarm regards,\nEPN Secretariat`
    );
  }, [activeRecord]);

  const handleInvoiceStep = async (
    nextStatus: MemberRecordDetail['invoice2027']['status'],
    includeDispatchEmail = false
  ) => {
    if (!activeRecord) return;
    setSavingInvoice(true);
    try {
      await epnClient.issueMemberInvoice(activeRecord.id, {
        invoiceNo: invoiceNo || `INV-2027-${activeRecord.code}`,
        issuedDate: invoiceDate,
        status: nextStatus,
        ...(includeDispatchEmail && invoiceRecipientEmail ? { sentToEmail: invoiceRecipientEmail } : {})
      });
      await loadData();
      const sentInfo =
        includeDispatchEmail && invoiceRecipientEmail ? ` and dispatched to ${invoiceRecipientEmail}` : '';
      setToast(`2027 invoice for ${activeRecord.code} updated to ${nextStatus}${sentInfo}.`);
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to update 2027 invoice.');
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleSaveContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;
    setSavingContacts(true);
    try {
      await epnClient.updateMemberContacts(activeRecord.id, {
        primaryEmail: contactPrimaryEmail,
        financeEmail: contactFinanceEmail,
        phone: contactPhone,
        referencePeople: referencePeople.filter(p => p.name.trim())
      });
      await loadData();
      setToast(`Contacts & reference people verified and saved for ${activeRecord.code}.`);
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to save member contacts.');
    } finally {
      setSavingContacts(false);
    }
  };

  const handleSendReminder = async () => {
    if (!activeRecord || !reminderToEmail.trim()) {
      setError('Please enter a recipient email address for the reminder.');
      return;
    }
    setSendingReminder(true);
    try {
      await epnClient.sendMemberDataReminder(activeRecord.id, {
        toEmail: reminderToEmail.trim(),
        subject: reminderSubject,
        message: reminderBody
      });
      await loadData();
      setToast(`Data & contact update reminder logged for ${activeRecord.code} (${reminderToEmail.trim()}).`);
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to send update reminder.');
    } finally {
      setSendingReminder(false);
    }
  };

  const handleActivateCalendarStep = async (when: string, action: string) => {
    setActivatingWhen(when);
    setError(null);
    try {
      const res = await epnClient.activateFeeCalendarStep({
        when,
        message: action
      });
      setLastActivationResult({
        when: res.when,
        remindersDispatched: res.remindersDispatched,
        recipients: res.recipients
      });
      await loadData();
      setToast(
        `Activated "${when}" immediately — ${res.remindersDispatched} member reminder message(s) & email(s) dispatched.`
      );
      setTimeout(() => setToast(null), 4500);
    } catch (err: any) {
      setError(err?.message || 'Failed to activate calendar milestone.');
    } finally {
      setActivatingWhen(null);
    }
  };

  const parseCsvLine = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setImportFileName(file.name);

    try {
      if (file.name.toLowerCase().endsWith('.csv') || file.type.includes('csv') || file.type === 'text/plain') {
        const text = await file.text();
        const lines = text
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(Boolean);
        if (lines.length < 2) {
          setError('CSV must contain a header row and at least one association row.');
          return;
        }
        const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const rows = lines.slice(1).map(line => {
          const cols = parseCsvLine(line);
          const get = (keys: string[]) => {
            const idx = headers.findIndex(h => keys.some(k => h.includes(k)));
            return idx >= 0 ? cols[idx] || '' : '';
          };
          const catRaw = get(['category', 'type']).toUpperCase();
          const category = (['CHA', 'HSS', 'DSO', 'CHI', 'INDIVIDUAL'].includes(catRaw)
            ? catRaw
            : 'CHA') as MemberRecordDetail['category'];
          const voteRaw = get(['voting', 'status']).toUpperCase();
          const votingStatus = (voteRaw === 'ASSOCIATE' ? 'ASSOCIATE' : 'ORDINARY') as MemberRecordDetail['votingStatus'];
          const facNum = Number.parseInt(get(['facilit', 'fosa']), 10);
          return {
            code: get(['code', 'abbr']) || `MEM${Math.floor(Math.random() * 900 + 100)}`,
            name: get(['name', 'organization', 'association']) || 'Unnamed Association',
            category,
            votingStatus,
            country: get(['country']) || 'Kenya',
            city: get(['city', 'town']) || undefined,
            facilitiesCount: Number.isNaN(facNum) ? 1 : facNum,
            primaryEmail: get(['primaryemail', 'email']) || undefined,
            financeEmail: get(['financeemail', 'finance']) || undefined,
            phone: get(['phone', 'tel']) || undefined,
            referencePerson: get(['referenceperson', 'focal', 'contactperson']) || undefined,
            referenceRole: get(['referencerole', 'role']) || 'Focal Point'
          };
        });
        setImportPreviewRows(rows);
      } else if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
        const buf = await file.arrayBuffer();
        const raw = new TextDecoder('latin1').decode(buf);
        const textChunks = (raw.match(/\(([^()]{3,160})\)/g) || [])
          .map(s => s.slice(1, -1).replace(/\\[rn]/g, ' ').trim())
          .filter(s => /[A-Za-z0-9]/.test(s) && !s.startsWith('PDF'));
        const joined = textChunks.join('\n');
        const emailMatches = joined.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
        const lines = joined
          .split(/\n+/)
          .map(l => l.trim())
          .filter(l => l.length > 3);

        // Extract structured rows if lines contain comma/pipe/tab or email-anchored records
        const parsedRows: typeof importPreviewRows = [];
        const delimLines = lines.filter(l => l.includes(',') || l.includes('|') || l.includes('\t'));
        for (const dl of delimLines) {
          const parts = dl.split(/[,|\t]/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            parsedRows.push({
              code: parts[0].slice(0, 12).toUpperCase(),
              name: parts[1],
              country: parts[2] || 'Kenya',
              primaryEmail: parts.find(p => p.includes('@')) || emailMatches[0],
              referencePerson: parts.find(p => !p.includes('@') && parts.indexOf(p) >= 3) || undefined
            });
          }
        }
        if (parsedRows.length === 0 && (emailMatches.length > 0 || lines.length > 0)) {
          parsedRows.push({
            code: file.name.replace(/\.pdf$/i, '').slice(0, 8).toUpperCase(),
            name: lines[0]?.slice(0, 80) || file.name.replace(/\.pdf$/i, ''),
            country: 'Kenya',
            primaryEmail: emailMatches[0] || '',
            financeEmail: emailMatches[1] || emailMatches[0] || '',
            referencePerson: lines.find(l => /Dr\.|Mr\.|Ms\.|Sr\.|Pharm\./i.test(l)) || ''
          });
        }
        setImportPreviewRows(parsedRows);
      } else {
        setError('Unsupported file format. Please upload a .csv or .pdf file.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to parse uploaded file.');
    }
  };

  const handleImportNow = async () => {
    if (importPreviewRows.length === 0) return;
    setImportingRows(true);
    setError(null);
    try {
      const res = await epnClient.importMemberRecords({
        sourceFile: importFileName || 'upload',
        rows: importPreviewRows
      });
      await loadData();
      setToast(
        `System updated immediately from ${importFileName}: ${res.created} created, ${res.updated} updated (${res.totalRecords} total records).`
      );
      setImportPreviewRows([]);
      setImportFileName('');
      setTimeout(() => setToast(null), 5000);
    } catch (err: any) {
      setError(err?.message || 'Failed to import health association data.');
    } finally {
      setImportingRows(false);
    }
  };

  const downloadSampleCsv = () => {
    const csv = [
      'code,name,category,votingStatus,country,city,facilitiesCount,primaryEmail,financeEmail,phone,referencePerson,referenceRole',
      'C20,CECA 20 — Communauté Evangélique au Centre de l’Afrique,CHA,ORDINARY,DR Congo,Bunia,93,coordination@ceca20-sante.org,finance@ceca20-sante.org,+243 81 000 2020,Dr. Jean-Luc Mugisha,Health Coordinator',
      'CHAK,Christian Health Association of Kenya (CHAK),CHA,ORDINARY,Kenya,Nairobi,584,secretariat@chak.or.ke,finance@chak.or.ke,+254 20 444 1920,Dr. Samuel Mwenda,General Secretary'
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'epn-health-associations-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">

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
                  { id: 'FEES', label: '1 · Overview & Fees' },
                  { id: 'REACH', label: '2 · Composition, Reach & Data Quality' },
                  { id: 'RECORD', label: '3 · Member Records, Invoices & Imports' },
                  { id: 'FUNCTION', label: '4 · 2027 Plan, ToR & JD' }
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
                ? 'Overview & Fee Collection'
                : activeTab === 'REACH'
                ? 'Composition, Reach & Data Quality'
                : activeTab === 'RECORD'
                ? 'Member Records, Invoices & CSV/PDF Imports'
                : '2027 Membership Plan, Intern ToR & Officer JD'}
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
                    <div className="m3-glass-card border-t-4 border-t-cyan-700 p-4 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Members</span>
                      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{data.summary.totalMembers}</div>
                      <p className="text-xs text-slate-600">{data.summary.newOrdinary2026}</p>
                    </div>
                    <div className="m3-glass-card border-t-4 border-t-sky-600 p-4 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ordinary · voting</span>
                      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{data.summary.ordinaryVoting}</div>
                      <p className="text-xs text-slate-600">50% of members; {data.summary.associateNoVote} Associate</p>
                    </div>
                    <div className="m3-glass-card border-t-4 border-t-amber-600 p-4 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fees collected 2025</span>
                      <div className="text-3xl font-extrabold text-amber-700 tabular-nums">{data.summary.feesCollected2025Pct}%</div>
                      <p className="text-xs text-slate-600">
                        ${data.summary.feesCollected2025Usd.toLocaleString()} of ${data.summary.feesExpectedUsd.toLocaleString()}
                      </p>
                    </div>
                    <div className="m3-glass-card border-t-4 border-t-emerald-600 p-4 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Members paid 2025</span>
                      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{data.summary.membersPaid2025}</div>
                      <p className="text-xs text-slate-600">9% of members ({data.summary.membersPaid2024} in 2024)</p>
                    </div>
                    <div className="m3-glass-card border-t-4 border-t-rose-600 p-4 space-y-1 col-span-2 sm:col-span-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Finance contact</span>
                      <div className="text-3xl font-extrabold text-rose-700 tabular-nums">{data.summary.financeContactPct}%</div>
                      <p className="text-xs text-slate-600">{data.summary.financeContactOnFile} of 151 needed for invoicing</p>
                    </div>
                  </div>

                  {/* 1 · Fees collected vs expected + 2 · Members paying 2019-2025 */}
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

                      {/* Unpaid invoice aging */}
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
                        <div className="h-60 flex items-end gap-3 pt-6 pb-2 border-b border-slate-200">
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
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
                        <span>Need to classify categories or check facility size?</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('REACH')}
                          className="font-semibold text-cyan-800 hover:underline cursor-pointer"
                        >
                          Open Composition &amp; Data Quality &rarr;
                        </button>
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
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveTab('RECORD')}
                        className="px-4 py-2 rounded-full bg-cyan-800 hover:bg-cyan-900 text-white text-xs font-semibold cursor-pointer"
                      >
                        Manage Invoices, Contacts &amp; Imports &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMPOSITION, REACH & DATA QUALITY */}
              {activeTab === 'REACH' && (
                <div className="space-y-6">
                  {/* Section A: Composition & Size */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 m3-glass-card p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h2 className="text-sm font-bold text-slate-900">A · Members by category and voting rights</h2>
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

                    <div className="m3-glass-card p-5 sm:p-6 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">Member size by health facilities</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-xs">
                        {data.sizeBands.map(b => (
                          <div key={b.band} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900">{b.band}</span>
                              <span className="text-[10px] text-slate-500 ml-1.5">{b.range}</span>
                            </div>
                            <div className="font-extrabold text-cyan-800 tabular-nums">
                              {b.count} <span className="font-normal text-slate-400">({b.sharePct}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section B: Geographic & Language Reach */}
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

                  {/* Section C: Contact Quality & Pre-2027 Clean-Up Queue */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="m3-glass-card p-5 sm:p-6 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">C · Member contacts on file</h3>
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

                    <div className="m3-glass-card p-5 sm:p-6 space-y-3 flex flex-col justify-between">
                      <div className="space-y-3">
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
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveTab('RECORD')}
                          className="px-4 py-2 rounded-full bg-cyan-800 hover:bg-cyan-900 text-white text-xs font-semibold cursor-pointer"
                        >
                          Open Data Entry &amp; CSV/PDF Import &rarr;
                        </button>
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

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                      <div className="flex flex-wrap gap-2">
                        {(['PROFILE', 'FACILITIES', 'CONTACTS', 'SUBSCRIPTION', 'ENGAGEMENT'] as const).map(sub => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setRecordSubTab(sub)}
                            className={`px-3 py-1 rounded-full font-semibold cursor-pointer ${
                              recordSubTab === sub ? 'bg-cyan-100 text-cyan-900' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {sub === 'CONTACTS' ? 'Contacts & Reference People' : sub.charAt(0) + sub.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecordSubTab('CONTACTS')}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-semibold hover:bg-amber-100 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Remind Association to Update Data</span>
                      </button>
                    </div>
                  </div>

                  {/* Contacts, Reference People & Update Reminder Center */}
                  {recordSubTab === 'CONTACTS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <form onSubmit={handleSaveContacts} className="m3-glass-card p-5 sm:p-6 space-y-4 text-xs">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-cyan-700" /> Contact Emails &amp; Reference People
                          </h3>
                          <span className="text-[11px] text-slate-500">
                            Verified: <b>{activeRecord.contacts?.lastVerifiedDate || 'Needs verification'}</b>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Primary Association Email</label>
                            <input
                              type="email"
                              value={contactPrimaryEmail}
                              onChange={e => setContactPrimaryEmail(e.target.value)}
                              placeholder="secretariat@association.org"
                              className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700 block mb-1">Finance / Invoice Email</label>
                            <input
                              type="email"
                              value={contactFinanceEmail}
                              onChange={e => setContactFinanceEmail(e.target.value)}
                              placeholder="finance@association.org"
                              className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Telephone / WhatsApp</label>
                          <input
                            type="text"
                            value={contactPhone}
                            onChange={e => setContactPhone(e.target.value)}
                            placeholder="+254 ..."
                            className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-800">Reference People (Focal Points)</label>
                            <button
                              type="button"
                              onClick={() =>
                                setReferencePeople(prev => [...prev, { name: '', role: 'Focal Point', email: '' }])
                              }
                              className="inline-flex items-center gap-1 text-cyan-800 font-semibold hover:underline cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Reference Person
                            </button>
                          </div>
                          {referencePeople.map((person, idx) => (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 items-center">
                              <input
                                type="text"
                                value={person.name}
                                onChange={e =>
                                  setReferencePeople(prev =>
                                    prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p))
                                  )
                                }
                                placeholder="Full name"
                                className="p-1.5 border border-slate-300 rounded-lg bg-white"
                              />
                              <input
                                type="text"
                                value={person.role}
                                onChange={e =>
                                  setReferencePeople(prev =>
                                    prev.map((p, i) => (i === idx ? { ...p, role: e.target.value } : p))
                                  )
                                }
                                placeholder="Role (e.g. Chief Pharmacist)"
                                className="p-1.5 border border-slate-300 rounded-lg bg-white"
                              />
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="email"
                                  value={person.email || ''}
                                  onChange={e =>
                                    setReferencePeople(prev =>
                                      prev.map((p, i) => (i === idx ? { ...p, email: e.target.value } : p))
                                    )
                                  }
                                  placeholder="Email"
                                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white"
                                />
                                <button
                                  type="button"
                                  aria-label="Remove reference person"
                                  onClick={() => setReferencePeople(prev => prev.filter((_, i) => i !== idx))}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="submit"
                          disabled={savingContacts}
                          className="px-4 py-2 rounded-full bg-cyan-800 hover:bg-cyan-900 text-white font-semibold cursor-pointer"
                        >
                          {savingContacts ? 'Saving...' : 'Save Contacts & Mark Verified'}
                        </button>
                      </form>

                      {/* Data & Contact Update Reminder Composer */}
                      <div className="m3-glass-card p-5 sm:p-6 space-y-4 text-xs">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-amber-600" /> Remind Association to Update Data
                          </h3>
                          <span className="text-[11px] text-slate-500">
                            Last reminder: <b>{activeRecord.contacts?.lastReminderSentDate || 'None yet'}</b>
                          </span>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Recipient Email (Association / Reference Person)</label>
                          <input
                            type="email"
                            value={reminderToEmail}
                            onChange={e => setReminderToEmail(e.target.value)}
                            placeholder="contact@association.org"
                            className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                          <input
                            type="text"
                            value={reminderSubject}
                            onChange={e => setReminderSubject(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Reminder Message</label>
                          <textarea
                            rows={7}
                            value={reminderBody}
                            onChange={e => setReminderBody(e.target.value)}
                            className="w-full p-2.5 border border-slate-300 rounded-xl bg-white leading-relaxed"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={sendingReminder}
                            onClick={handleSendReminder}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{sendingReminder ? 'Logging...' : 'Send & Log Update Reminder'}</span>
                          </button>
                          {reminderToEmail && (
                            <a
                              href={`mailto:${encodeURIComponent(reminderToEmail)}?subject=${encodeURIComponent(reminderSubject)}&body=${encodeURIComponent(reminderBody)}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Open in Email Client</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bulk Upload Health Association Data (CSV / PDF) */}
                  <div className="m3-glass-card p-5 sm:p-6 space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Upload className="w-4 h-4 text-cyan-700" /> Upload Health Association Data (CSV or PDF)
                        </h3>
                        <p className="text-slate-600 mt-0.5">
                          Upload a <b>.csv</b> or <b>.pdf</b> file of health associations, contact emails, and reference people to update the system immediately.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={downloadSampleCsv}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Sample CSV</span>
                        </button>
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-800 hover:bg-cyan-900 text-white font-semibold cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose CSV / PDF</span>
                          <input
                            type="file"
                            accept=".csv,.pdf,text/csv,application/pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {importPreviewRows.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-semibold text-slate-800">
                            Ready to import <b>{importPreviewRows.length}</b> record(s) from <span className="font-mono">{importFileName}</span>
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setImportPreviewRows([]);
                                setImportFileName('');
                              }}
                              className="px-3 py-1.5 rounded-full border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer"
                            >
                              Clear
                            </button>
                            <button
                              type="button"
                              disabled={importingRows}
                              onClick={handleImportNow}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>{importingRows ? 'Updating...' : 'Update System Immediately'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                              <tr>
                                <th className="py-2 px-3">Code</th>
                                <th className="py-2 px-3">Association Name</th>
                                <th className="py-2 px-3">Country</th>
                                <th className="py-2 px-3">Primary Email</th>
                                <th className="py-2 px-3">Finance Email</th>
                                <th className="py-2 px-3">Reference Person</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {importPreviewRows.map((row, idx) => (
                                <tr key={idx}>
                                  <td className="py-2 px-3 font-bold text-slate-900">{row.code}</td>
                                  <td className="py-2 px-3 text-slate-800">{row.name}</td>
                                  <td className="py-2 px-3 text-slate-600">{row.country || '—'}</td>
                                  <td className="py-2 px-3 text-slate-600">{row.primaryEmail || '—'}</td>
                                  <td className="py-2 px-3 text-slate-600">{row.financeEmail || '—'}</td>
                                  <td className="py-2 px-3 text-slate-600">{row.referencePerson || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="font-bold text-slate-900">Record, send &amp; advance 2027 invoice</div>
                        {activeRecord.invoice2027.sentToEmail && (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            Dispatched to {activeRecord.invoice2027.sentToEmail} ({activeRecord.invoice2027.sentAt})
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Send to Email (Finance / Focal)</label>
                          <input
                            type="email"
                            value={invoiceRecipientEmail}
                            onChange={e => setInvoiceRecipientEmail(e.target.value)}
                            placeholder="finance@association.org"
                            className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={savingInvoice}
                          onClick={() => handleInvoiceStep('ISSUED', true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-800 hover:bg-cyan-900 text-white font-semibold cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Invoice &amp; Mark Issued</span>
                        </button>
                        {invoiceRecipientEmail && (
                          <a
                            href={`mailto:${encodeURIComponent(invoiceRecipientEmail)}?subject=${encodeURIComponent(`EPN One Network 2027 Membership Invoice — ${invoiceNo || activeRecord.code}`)}&body=${encodeURIComponent(`Dear ${activeRecord.name} Finance Team,\n\nPlease find attached your 2027 EPN One Network membership fee invoice (${invoiceNo || `INV-2027-${activeRecord.code}`}) for $${activeRecord.invoice2027.amountUsd} USD, dated ${invoiceDate}.\n\nKindly acknowledge receipt and confirm your finance contact & reference people.\n\nWarm regards,\nEPN Secretariat`)}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Open Email Draft</span>
                          </a>
                        )}
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

              {/* TAB 4: MEMBERSHIP FUNCTION (Intern ToR, Officer JD & 2027 Fee Calendar) */}
              {activeTab === 'FUNCTION' && (
                <div className="space-y-6">
                  {/* Document Header */}
                  <div className="m3-glass-card p-5 sm:p-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src="/epn-logo.png" alt="Ecumenical Pharmaceutical Network (EPN)" className="h-10 w-auto object-contain shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-800">
                            Office of the Executive Director · 11 November 2026 · Draft for team review
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                            Membership Function: Intern Terms of Reference, Officer Job Description &amp; 2027 Fee Calendar
                          </h2>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-semibold shrink-0">
                        Strategic Plan 2026–2030 · Pillar 2
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      From January 2027, a <b>Membership Intern</b> runs day-to-day membership work, the <b>Membership, Communications and ICT Officer</b> stays accountable for results, and the <b>Executive Director</b> remains the senior contact for member leaders. Both posts sit in the Executive Director&apos;s office, under the Executive Support Units. The aim is to raise membership fee payment from USD 3,869 in 2025 (~12%) toward the USD 33,000 annual expectation, starting with a <b>30% target (~USD 10,000) in 2027</b>.
                    </p>
                  </div>

                  {/* Role Accountability Matrix + 3 Safeguards */}
                  <div className="m3-glass-card p-5 sm:p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">How the Membership Function is Organised</h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Role</th>
                            <th className="py-2.5 px-3">Membership</th>
                            <th className="py-2.5 px-3">Communications</th>
                            <th className="py-2.5 px-3">ICT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          <tr>
                            <td className="py-2.5 px-3 font-bold text-slate-900">Executive Director</td>
                            <td className="py-2.5 px-3">Signs the annual fee letter; calls or writes to members over 90 days in arrears; reports good-standing status to the Board, AGM and EGM</td>
                            <td className="py-2.5 px-3">Spokesperson; approves key messages</td>
                            <td className="py-2.5 px-3">Sets priorities</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-bold text-slate-900">Membership, Communications &amp; ICT Officer (accountable)</td>
                            <td className="py-2.5 px-3">About 25% of time: membership strategy, KPIs, database design; supervises and coaches the intern; reviews the monthly dashboard</td>
                            <td className="py-2.5 px-3">About 40% of time</td>
                            <td className="py-2.5 px-3">About 35% of time</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-bold text-slate-900">Membership Intern (operational lead)</td>
                            <td className="py-2.5 px-3">About 80% of time: database, invoicing with Finance, reminders, onboarding, member calls and surveys</td>
                            <td className="py-2.5 px-3">About 20% of time: member stories for NetLink and social media</td>
                            <td className="py-2.5 px-3">Data entry in the membership database</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-bold text-slate-900">Finance and Grants Officer</td>
                            <td className="py-2.5 px-3">Issues invoices, records payments, reconciles with the intern every month</td>
                            <td className="py-2.5 px-3">—</td>
                            <td className="py-2.5 px-3">—</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                      <b>Three safeguards apply to all roles:</b> (1) the intern never handles cash (all payments go to EPN bank or mobile-money accounts and are confirmed by Finance); (2) all member data stays in an EPN system, not personal files or email; and (3) each intern hands over to the next before leaving.
                    </div>
                  </div>

                  {/* Two-Column: Intern ToR + Officer Revised JD */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Terms of Reference: Membership Intern */}
                    <div className="m3-glass-card p-5 sm:p-6 space-y-4 text-xs">
                      <div className="border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Terms of Reference</span>
                        <h3 className="text-base font-bold text-slate-900">Membership Intern</h3>
                        <p className="text-slate-600 mt-1">
                          Runs EPN&apos;s day-to-day membership operations so that every member is invoiced, followed up, engaged and shown the value of the network.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div><b>Unit:</b> Executive Support Units, Office of the ED</div>
                        <div><b>Reports to:</b> Membership, Comms &amp; ICT Officer</div>
                        <div><b>Location:</b> EPN Secretariat, Nairobi</div>
                        <div><b>Duration:</b> 6–12 months, from Jan 2027</div>
                        <div className="col-span-2"><b>Works closely with:</b> Executive Director; Finance &amp; Grants Officer; Senior Officer Programs · <b>Terms:</b> Monthly stipend under EPN&apos;s internship policy</div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-900 uppercase text-[11px]">Main Responsibilities</h4>
                        <ul className="space-y-1 text-slate-700 list-disc pl-4">
                          <li><b>Membership database:</b> clean and keep up to date all 151 member records (organization, contact person, country, category, voting status, fee amount, payment history, arrears).</li>
                          <li><b>Fee cycle:</b> prepare fee letters &amp; personalised benefit statements; work with Finance to issue invoices; send reminders at 30 &amp; 60 days; prepare 90-day escalation list for the ED.</li>
                          <li><b>Payment tracking &amp; monthly dashboard:</b> reconcile monthly with Finance; maintain good-standing list; deliver one-page monthly report (payment rate, collected, arrears by region, engagement).</li>
                          <li><b>Onboarding &amp; engagement:</b> send welcome pack within 2 weeks of approval; organise quarterly member calls; run annual satisfaction survey; track TWG, webinar, LMS &amp; project participation.</li>
                          <li><b>Member stories &amp; governance:</b> collect stories for E-Pharmalink, NetLink &amp; social media (~20% time); prepare AGM/EGM voting-rights lists; support 2027 member award; maintain handover file.</li>
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-900 uppercase text-[11px]">First 90 Days Deliverables</h4>
                        <ul className="space-y-1 text-slate-700 list-disc pl-4">
                          <li>Clean membership database verified with the Officer (end of Jan 2027)</li>
                          <li>2027 fee letters, benefit statements &amp; invoices sent to all members (end of Jan 2027)</li>
                          <li>First monthly dashboard &amp; welcome pack template approved (Feb 2027)</li>
                          <li>Escalation list for members not paid after 90 days (Apr 2027)</li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-100 space-y-1">
                          <div className="font-bold text-cyan-950">Performance Indicators</div>
                          <div className="text-slate-700">Expected fees collected (30% 2027 target); complete/up-to-date records; timely reminders &amp; dashboards; onboarding &le;2 weeks; survey response rate.</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="font-bold text-slate-900">Qualifications &amp; Learning</div>
                          <div className="text-slate-700">Graduate in business, comms, public health or pharmacy; strong Excel/CRM; clear English (French an advantage); monthly coaching + mid-term &amp; final review.</div>
                        </div>
                      </div>
                    </div>

                    {/* Revised Job Description: Membership, Communications and ICT Officer */}
                    <div className="m3-glass-card p-5 sm:p-6 space-y-4 text-xs">
                      <div className="border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Revised Job Description</span>
                        <h3 className="text-base font-bold text-slate-900">Membership, Communications &amp; ICT Officer</h3>
                        <p className="text-slate-600 mt-1">
                          Leads EPN&apos;s membership, communications and ICT functions, stays accountable for membership results, and supervises the Membership Intern (freeing capacity for 2027 ICT deadlines).
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 text-center">
                          <div className="text-lg font-extrabold text-cyan-900">~40%</div>
                          <div className="font-bold text-slate-800">Comms &amp; Visibility</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-center">
                          <div className="text-lg font-extrabold text-sky-900">~35%</div>
                          <div className="font-bold text-slate-800">ICT &amp; Digital</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                          <div className="text-lg font-extrabold text-emerald-900">~25%</div>
                          <div className="font-bold text-slate-800">Membership Lead</div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-900 uppercase text-[11px]">Key Responsibilities</h4>
                        <ul className="space-y-1 text-slate-700 list-disc pl-4">
                          <li><b>Membership (accountable lead):</b> own annual membership plan &amp; 2027 fee calendar; design/protect database linked to EDMS; supervise &amp; coach intern (weekly check-ins, monthly dashboard); embed Value Proposition; quarterly reports to ED; lead survey analysis &amp; 2027 member award.</li>
                          <li><b>Communications &amp; visibility:</b> produce E-Pharmalink &amp; NetLink; manage website, social media &amp; published good-standing list; organise webinars, EPN Forum comms &amp; ED advocacy/position papers.</li>
                          <li><b>ICT &amp; digital systems:</b> lead ICT input to EDMS &amp; network dashboard (due Q2 2027); support Finance ERP (operational Q2 2027); administer LMS &amp; member access; manage IT equipment, security &amp; backups.</li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-100 space-y-1">
                          <div className="font-bold text-cyan-950">Performance Indicators</div>
                          <div className="text-slate-700">Fees collected vs target; intern monthly dashboard on time; E-Pharmalink &amp; NetLink on schedule; monthly web/social updates; EDMS/dashboard live Q2 2027; LMS growth.</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="font-bold text-slate-900">Qualifications</div>
                          <div className="text-slate-700">Degree in comms, IT or business; 3+ years experience in comms/ICT/membership; database &amp; digital platform skills; coaching/supervision; English (French advantage).</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2027 Fee Calendar + Benefits + Open Questions + ED Sign-off */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 m3-glass-card p-5 sm:p-6 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-cyan-700" /> Membership Fee Calendar 2027 (30% / ~USD 10,000 Target)
                        </h3>
                        <span className="text-[11px] text-slate-600">Click <b>Activate Now</b> to trigger reminders &amp; email dispatch</span>
                      </div>

                      {lastActivationResult && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-emerald-950">
                            <b>{lastActivationResult.when}</b> activated — <b>{lastActivationResult.remindersDispatched}</b> reminder message(s) &amp; email(s) logged.
                          </div>
                          {lastActivationResult.recipients.length > 0 && (
                            <a
                              href={`mailto:${encodeURIComponent(lastActivationResult.recipients.map(r => r.email).join(','))}?subject=${encodeURIComponent(`EPN One Network — ${lastActivationResult.when} Action & Data Update Reminder`)}&body=${encodeURIComponent(`Dear EPN Member Association,\n\nThis is an automated reminder for the ${lastActivationResult.when} milestone in the EPN 2027 Membership Calendar. Please review and update your association's contact email, finance contact, and designated reference people in EPN One Network.\n\nWarm regards,\nEPN Secretariat`)}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shrink-0"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email All Recipients ({lastActivationResult.recipients.length})</span>
                            </a>
                          )}
                        </div>
                      )}

                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">When</th>
                              <th className="py-2 px-3">Action</th>
                              <th className="py-2 px-3">Owner</th>
                              <th className="py-2 px-3">Output</th>
                              <th className="py-2 px-3 text-right">Activate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {data.feeCalendar2027.map(item => (
                              <tr key={item.when} className={item.status === 'ACTIVATED' ? 'bg-emerald-50/40' : ''}>
                                <td className="py-2 px-3 font-bold text-cyan-900 whitespace-nowrap">{item.when}</td>
                                <td className="py-2 px-3">{item.action}</td>
                                <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{item.owner}</td>
                                <td className="py-2 px-3 text-slate-600">{item.output}</td>
                                <td className="py-2 px-3 text-right whitespace-nowrap">
                                  {item.status === 'ACTIVATED' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                      <CheckCircle className="w-3 h-3" /> Active ({item.remindersDispatched ?? 0} sent)
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={activatingWhen === item.when}
                                      onClick={() => handleActivateCalendarStep(item.when, item.action)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-800 hover:bg-cyan-900 text-white font-semibold text-[11px] cursor-pointer"
                                    >
                                      <Zap className="w-3 h-3" />
                                      <span>{activatingWhen === item.when ? 'Running...' : 'Activate Now'}</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="m3-glass-card p-5 space-y-2.5 text-xs">
                        <h3 className="text-sm font-bold text-slate-900">Benefits Linked to Good Standing</h3>
                        <ul className="space-y-1 text-slate-700 list-disc pl-4">
                          <li>Voting rights at AGM &amp; EGMs (subject to constitution)</li>
                          <li>Free LMS access with certificates</li>
                          <li>Eligibility for EPN pool of experts &amp; multi-country projects</li>
                          <li>Eligibility for the 2027 member award</li>
                          <li>Discount on EPN Forum registration (next Forum in 2028)</li>
                          <li>Recognition in NetLink and at the AGM</li>
                        </ul>
                      </div>

                      <div className="m3-glass-card p-5 space-y-2.5 text-xs">
                        <h3 className="text-sm font-bold text-slate-900">Questions to Settle Before January</h3>
                        <ul className="space-y-1 text-slate-700 list-disc pl-4">
                          <li>Does the constitution link voting rights to paid fees?</li>
                          <li>Which payment channels can members use (bank, mobile money) and in which currencies?</li>
                          <li>Does the Board agree the 30% target for 2027?</li>
                        </ul>
                        <div className="pt-3 mt-3 border-t border-slate-200 text-slate-800">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Approved by</div>
                          <div className="font-bold mt-0.5">Richard Neci Cizungu</div>
                          <div className="text-[11px] text-slate-600">Executive Director · EPN</div>
                        </div>
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
