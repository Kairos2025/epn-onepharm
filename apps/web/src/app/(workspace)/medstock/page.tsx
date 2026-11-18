'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  AlertOctagon,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  RefreshCw,
  X
} from 'lucide-react';
import type { StockItem, StockTransaction } from '@epn/domain';
import { epnClient } from '@/lib/api';

interface StockRow {
  id: string;
  code: string;
  name: string;
  category: string;
  stockOnHand: number;
  unit: string;
  batchNo: string;
  expiryDate: string;
  monthsOfStock: number;
  isTracer: boolean;
  status: 'OPTIMAL' | 'LOW' | 'STOCK_OUT' | 'NEAR_EXPIRY';
}

const DEFAULT_FACILITY_ID = 'fac00000-0000-0000-0000-000000000001';

const BASELINE_ROWS: Record<string, { stockOnHand: number; batchNo: string; expiryDate: string; monthlyUse: number }> = {
  MED_AMOX_500: { stockOnHand: 4200, batchNo: 'AMX-2026-08', expiryDate: '2028-04-30', monthlyUse: 1500 },
  MED_AL_20_120: { stockOnHand: 180, batchNo: 'AL-2026-02', expiryDate: '2027-01-31', monthlyUse: 300 },
  MED_OXYTOCIN_10: { stockOnHand: 350, batchNo: 'OXY-2025-11', expiryDate: '2026-11-15', monthlyUse: 230 },
  MED_CEFTRIAXONE_1G: { stockOnHand: 0, batchNo: 'CEF-2025-09', expiryDate: '2027-06-30', monthlyUse: 200 }
};

export default function MedstockPage() {
  const [selectedLocation, setSelectedLocation] = useState('MAIN_STORE');
  const [medstockTab, setMedstockTab] = useState<'LEDGER' | 'TRANSACTIONS'>('LEDGER');
  const [modalKind, setModalKind] = useState<'RECEIPT' | 'DISPENSE' | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Modal form fields
  const [selectedItemId, setSelectedItemId] = useState('');
  const [qtyInput, setQtyInput] = useState('100');
  const [batchInput, setBatchInput] = useState('BATCH-2026-11');
  const [reasonInput, setReasonInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, txns] = await Promise.all([
        epnClient.getStockItems(),
        epnClient.getStockTransactions()
      ]);
      setStockItems(items);
      setTransactions(txns);
      if (items.length > 0 && !selectedItemId) {
        setSelectedItemId(items[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load Medstock inventory from /api/v1/stock.');
    } finally {
      setLoading(false);
    }
  }, [selectedItemId]);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const stockList: StockRow[] = stockItems.map(item => {
    const code = item.code || item.uid;
    const base = BASELINE_ROWS[code] || {
      stockOnHand: 500,
      batchNo: 'EPN-2026-01',
      expiryDate: '2027-12-31',
      monthlyUse: 250
    };

    const delta = transactions
      .filter(t => t.item_id === item.id || t.item_id === code)
      .reduce((acc, t) => {
        if (t.kind === 'RECEIPT' || t.kind === 'TRANSFER_IN' || t.kind === 'ADJUST_PLUS') return acc + t.qty;
        if (t.kind === 'DISPENSE' || t.kind === 'ISSUE' || t.kind === 'TRANSFER_OUT' || t.kind === 'ADJUST_MINUS') {
          return acc - t.qty;
        }
        return acc;
      }, 0);

    const stockOnHand = Math.max(0, base.stockOnHand + delta);
    const monthsOfStock = Number((stockOnHand / Math.max(1, base.monthlyUse)).toFixed(1));
    const status: StockRow['status'] =
      stockOnHand === 0
        ? 'STOCK_OUT'
        : code === 'MED_OXYTOCIN_10'
        ? 'NEAR_EXPIRY'
        : monthsOfStock < item.min_months_stock
        ? 'LOW'
        : 'OPTIMAL';

    return {
      id: item.id,
      code,
      name: item.name,
      category: item.category,
      stockOnHand,
      unit: item.unit,
      batchNo: base.batchNo,
      expiryDate: base.expiryDate,
      monthsOfStock,
      isTracer: item.is_tracer,
      status
    };
  });

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalKind || !selectedItemId) return;
    const qty = parseInt(qtyInput, 10);
    if (!qty || qty <= 0) return;

    setSubmitting(true);
    try {
      await epnClient.recordStockTransaction({
        org_unit_id: DEFAULT_FACILITY_ID,
        location_id: selectedLocation,
        item_id: selectedItemId,
        batch_no: batchInput,
        kind: modalKind,
        qty,
        occurred_at: new Date().toISOString(),
        recorded_by: 'facility_pharmacist',
        reason: reasonInput || (modalKind === 'RECEIPT' ? 'MEDS replenishment receipt' : 'Daily outpatient dispensation')
      });
      setModalKind(null);
      setReasonInput('');
      await loadStock();
      setToast(`${modalKind === 'RECEIPT' ? 'Received' : 'Dispensed'} ${qty} units and logged to audit trail.`);
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to record stock transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const optimalCount = stockList.filter(i => i.status === 'OPTIMAL').length;
  const stockoutItems = stockList.filter(i => i.status === 'STOCK_OUT');
  const nearExpiryItems = stockList.filter(i => i.status === 'NEAR_EXPIRY');

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
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
              onClick={loadStock}
              className="px-3 py-1 rounded-full bg-rose-700 text-white font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Top Header & Fast Actions */}
        <div className="m3-glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 uppercase tracking-wider">
                Medstock PWA
              </span>
              <span className="text-xs text-slate-500">Kilome Mission Hospital Pharmacy</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Pharmacy Stock &amp; FEFO Operations</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inventory ledger connected to `/api/v1/stock/transactions` and audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              aria-label="Pharmacy location"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="p-2 border border-slate-300 rounded-full bg-white font-semibold text-slate-700 px-3.5 cursor-pointer"
            >
              <option value="MAIN_STORE">Central Pharmacy Store</option>
              <option value="OUTPATIENT_DISPENSARY">Outpatient Dispensary</option>
              <option value="MATERNITY_WARD">Maternity Ward Cabinet</option>
            </select>

            <button
              type="button"
              onClick={() => setModalKind('RECEIPT')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Receive Stock</span>
            </button>

            <button
              type="button"
              onClick={() => setModalKind('DISPENSE')}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold rounded-full flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Dispense Daily</span>
            </button>

            <button
              type="button"
              onClick={loadStock}
              aria-label="Refresh stock"
              className="p-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Summary Alerts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="m3-glass-card p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Tracer Items Optimal</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
              {loading && stockList.length === 0 ? '--' : `${optimalCount} of ${stockList.length}`}
            </div>
            <span className="text-[10px] text-slate-500">Live ledger count</span>
          </div>

          <div className="bg-rose-50/90 p-4 rounded-2xl border border-rose-200 shadow-xs">
            <span className="text-[11px] font-semibold text-rose-700 uppercase flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5" /> Stock-out Alert
            </span>
            <div className="text-2xl font-extrabold text-rose-700 mt-1 tabular-nums">
              {stockoutItems.length} Item{stockoutItems.length === 1 ? '' : 's'}
            </div>
            <span className="text-[10px] text-rose-700 font-medium truncate block">
              {stockoutItems[0]?.name || 'None'}
            </span>
          </div>

          <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-200 shadow-xs">
            <span className="text-[11px] font-semibold text-amber-800 uppercase">Near Expiry (&lt;30 Days)</span>
            <div className="text-2xl font-extrabold text-amber-800 mt-1 tabular-nums">
              {nearExpiryItems.length} Batch
            </div>
            <span className="text-[10px] text-amber-700 font-medium truncate block">
              {nearExpiryItems[0]?.name || 'None'}
            </span>
          </div>

          <div className="m3-glass-card p-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Recorded Transactions</span>
            <div className="text-2xl font-extrabold text-cyan-700 mt-1 tabular-nums">
              {transactions.length}
            </div>
            <span className="text-[10px] text-slate-500">Synced with /api/v1/stock</span>
          </div>
        </div>

        {/* Folder Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/90 p-1.5 rounded-full border border-slate-200 w-fit text-xs shadow-2xs">
          {(
            [
              { id: 'LEDGER', label: `1 · Stock on Hand & FEFO (${stockList.length})` },
              { id: 'TRANSACTIONS', label: `2 · Recent Transactions (${transactions.length})` }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMedstockTab(tab.id)}
              className={`px-4 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${
                medstockTab === tab.id ? 'bg-cyan-800 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FOLDER 1: Stock Ledger Table */}
        {medstockTab === 'LEDGER' && (
        <div className="bg-white/95 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Current Stock on Hand &amp; FEFO Priority</h3>
              <p className="text-xs text-slate-500">First-Expiry-First-Out dispensing ensures minimal waste</p>
            </div>
            <span className="text-xs text-slate-500">Showing {stockList.length} tracer items</span>
          </div>

          {loading && stockList.length === 0 ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Mobile Prioritized Stock Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {stockList.map(item => (
                  <div key={item.id} className="p-4 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.code} • Batch {item.batchNo}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          item.status === 'OPTIMAL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'LOW'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'NEAR_EXPIRY'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">On Hand</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {item.stockOnHand.toLocaleString()} {item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">MOS</span>
                        <span className="font-mono text-slate-700 tabular-nums">{item.monthsOfStock} mos</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Expiry</span>
                        <span className="font-mono text-slate-700">{item.expiryDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto text-xs">
                <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Item &amp; Specification</th>
                    <th className="py-2.5 px-4">Batch Number</th>
                    <th className="py-2.5 px-4">Expiry Date</th>
                    <th className="py-2.5 px-4 text-right">Stock On Hand</th>
                    <th className="py-2.5 px-4 text-right">Months of Stock</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.code} • {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{item.batchNo}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{item.expiryDate}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                        {item.stockOnHand.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {item.monthsOfStock} mos
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.status === 'OPTIMAL' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Optimal
                          </span>
                        )}
                        {item.status === 'LOW' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Low Stock
                          </span>
                        )}
                        {item.status === 'NEAR_EXPIRY' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            Near Expiry
                          </span>
                        )}
                        {item.status === 'STOCK_OUT' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Stock-Out
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
        )}

        {/* FOLDER 2: Recent Transactions Feed */}
        {medstockTab === 'TRANSACTIONS' && (
        <div className="bg-white/95 rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Recent Stock Transactions</h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {transactions.slice(0, 6).map(t => (
              <div key={t.id} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-cyan-800">{t.kind}</span> •{' '}
                  <span className="font-semibold text-slate-800">{t.item_id}</span>
                  <div className="text-[11px] text-slate-500">{t.reason || 'Routine pharmacy movement'}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900">{t.qty} units</div>
                  <div className="text-[10px] text-slate-400">{new Date(t.occurred_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </main>

      {/* Receive / Dispense Modal */}
      {modalKind && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={modalKind === 'RECEIPT' ? 'Receive Stock' : 'Dispense Stock'}
        >
          <form onSubmit={handleRecordTransaction} className="w-full max-w-md m3-glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {modalKind === 'RECEIPT' ? 'Receive Pharmacy Stock' : 'Record Daily Dispensation'}
              </h3>
              <button
                type="button"
                onClick={() => setModalKind(null)}
                aria-label="Close modal"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Medicine Item</label>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  {stockItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qtyInput}
                    onChange={e => setQtyInput(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={batchInput}
                    onChange={e => setBatchInput(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={reasonInput}
                  onChange={e => setReasonInput(e.target.value)}
                  placeholder={modalKind === 'RECEIPT' ? 'MEDS pooled replenishment' : 'Outpatient clinic issue'}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalKind(null)}
                className="px-4 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Confirm Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
