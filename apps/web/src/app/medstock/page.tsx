'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  Package,
  TrendingDown,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  QrCode
} from 'lucide-react';

interface StockRow {
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

export default function MedstockPage() {
  const [selectedLocation, setSelectedLocation] = useState('MAIN_STORE');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);

  const [stockList, setStockList] = useState<StockRow[]>([
    {
      code: 'MED_AMOX_500',
      name: 'Amoxicillin 500mg Capsules',
      category: 'MEDICINE',
      stockOnHand: 4200,
      unit: 'Capsules',
      batchNo: 'AMX-2026-08',
      expiryDate: '2028-04-30',
      monthsOfStock: 2.8,
      isTracer: true,
      status: 'OPTIMAL'
    },
    {
      code: 'MED_AL_20_120',
      name: 'Artemether + Lumefantrine 20/120mg Tablets',
      category: 'MEDICINE',
      stockOnHand: 180,
      unit: 'Blisters',
      batchNo: 'AL-2026-02',
      expiryDate: '2027-01-31',
      monthsOfStock: 0.6,
      isTracer: true,
      status: 'LOW'
    },
    {
      code: 'MED_OXYTOCIN_10',
      name: 'Oxytocin 10 IU/ml Injection',
      category: 'MEDICINE',
      stockOnHand: 350,
      unit: 'Ampoules',
      batchNo: 'OXY-2025-11',
      expiryDate: '2026-11-15',
      monthsOfStock: 1.5,
      isTracer: true,
      status: 'NEAR_EXPIRY'
    },
    {
      code: 'MED_CEFTRIAXONE_1G',
      name: 'Ceftriaxone 1g Powder for Injection',
      category: 'MEDICINE',
      stockOnHand: 0,
      unit: 'Vials',
      batchNo: 'CEF-2025-09',
      expiryDate: '2027-06-30',
      monthsOfStock: 0.0,
      isTracer: true,
      status: 'STOCK_OUT'
    }
  ]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Top Header & Fast Actions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                Medstock PWA
              </span>
              <span className="text-xs text-slate-500">Kilome Mission Hospital Pharmacy</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Pharmacy Stock & FEFO Operations</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily inventory ledger feeding macro indicators automatically into EPN OnePharm core.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Location selector */}
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg bg-slate-50 font-semibold text-slate-700"
            >
              <option value="MAIN_STORE">Central Pharmacy Store</option>
              <option value="OUTPATIENT_DISPENSARY">Outpatient Dispensary</option>
              <option value="MATERNITY_WARD">Maternity Ward Cabinet</option>
            </select>

            <button
              onClick={() => setShowReceiveModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Receive Stock</span>
            </button>

            <button
              onClick={() => setShowDispenseModal(true)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Dispense Daily</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Alerts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Tracer Items Optimal</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">3 of 4</div>
            <span className="text-[10px] text-slate-400">75% Available today</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm">
            <span className="text-[11px] font-semibold text-rose-700 uppercase flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5" /> Stock-out Alert
            </span>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">1 Item</div>
            <span className="text-[10px] text-rose-600 font-medium">Ceftriaxone 1g Vial</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
            <span className="text-[11px] font-semibold text-amber-700 uppercase">Near Expiry (&lt;30 Days)</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">1 Batch</div>
            <span className="text-[10px] text-amber-600 font-medium">Oxytocin (Exp: 15 Nov)</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Core Platform Macro Feed</span>
            <div className="text-2xl font-extrabold text-sky-600 mt-1">Synchronized</div>
            <span className="text-[10px] text-slate-400">Nightly rollup complete</span>
          </div>
        </div>

        {/* Stock Ledger Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Current Stock on Hand & FEFO Priority</h3>
              <p className="text-xs text-slate-500">First-Expiry-First-Out dispensing ensures minimal waste</p>
            </div>
            <span className="text-xs text-slate-500">Showing 4 tracer items</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Item & Specification</th>
                  <th className="py-2.5 px-4">Batch Number</th>
                  <th className="py-2.5 px-4">Expiry Date</th>
                  <th className="py-2.5 px-4 text-right">Stock On Hand</th>
                  <th className="py-2.5 px-4 text-right">Months of Stock</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockList.map(item => (
                  <tr key={item.code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{item.code} • {item.category}</span>
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Optimal
                        </span>
                      )}
                      {item.status === 'LOW' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Low Stock
                        </span>
                      )}
                      {item.status === 'NEAR_EXPIRY' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          Near Expiry
                        </span>
                      )}
                      {item.status === 'STOCK_OUT' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Stock-Out
                        </span>
                      )}
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
