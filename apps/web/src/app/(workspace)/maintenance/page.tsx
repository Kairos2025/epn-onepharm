'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Settings, Plus, Check, Edit2, Trash2, Calendar, Layers } from 'lucide-react';
import { STRATEGIC_PROGRAMMES_2021_2025 } from '@epn/domain';

interface Pillar {
  id: string;
  name: string;
  description: string;
  programmesCount: number;
}

export default function MaintenancePage() {
  const [selectedPlan, setSelectedPlan] = useState<'2021_2025' | '2026_2030'>('2026_2030');

  // 2026-2030 pillars (configurable without code deployment per Principle P5)
  const [pillars2026, setPillars2026] = useState<Pillar[]>([
    {
      id: 'pil1',
      name: 'Pillar 1: Resilient Pharmaceutical Supply Chains',
      description: 'Regional pooled procurement, local production incentives, and zero-stockout target.',
      programmesCount: 2
    },
    {
      id: 'pil2',
      name: 'Pillar 2: Quality Assurance & Counterfeit Medicine Surveillance',
      description: 'Expanded GPHF Minilab network and NIR PillScan technology adoption.',
      programmesCount: 1
    },
    {
      id: 'pil3',
      name: 'Pillar 3: Clinical Governance & Antimicrobial Stewardship',
      description: 'Active DTC and AMS stewardship committees in 100% of network referral hospitals.',
      programmesCount: 2
    }
  ]);

  const [newPillarName, setNewPillarName] = useState('');
  const [newPillarDesc, setNewPillarDesc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddPillar = () => {
    if (!newPillarName) return;
    setPillars2026([
      ...pillars2026,
      {
        id: `pil_${Date.now()}`,
        name: newPillarName,
        description: newPillarDesc,
        programmesCount: 0
      }
    ]);
    setNewPillarName('');
    setNewPillarDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                Principle P5 Configurable Metadata
              </span>
              <h1 className="text-xl font-bold text-slate-900">Strategic Plan & Metadata Editor</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Define strategic pillars, map programmes, and configure health priorities without redeploying code.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedPlan}
              onChange={e => setSelectedPlan(e.target.value as any)}
              className="p-2 border border-slate-300 rounded-lg bg-slate-50 font-bold text-slate-800"
            >
              <option value="2026_2030">Strategic Plan 2026–2030 (Active / Current)</option>
              <option value="2021_2025">Strategic Plan 2021–2025 (Historical Baseline)</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Strategic Pillar</span>
            </button>
          </div>
        </div>

        {selectedPlan === '2026_2030' ? (
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 leading-relaxed">
              <b>Section 2.2 Implementation:</b> As specified in the build spec, the 2026–2030 strategic plan is treated as versioned metadata. Administrators can configure strategic pillars and link implementing programmes dynamically.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pillars2026.map(pillar => (
                <div key={pillar.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                        2026–2030 Pillar
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{pillar.programmesCount} Programmes</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{pillar.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button className="text-sky-600 hover:underline font-semibold">Map Programmes →</button>
                    <button className="text-slate-400 hover:text-slate-600">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2021–2025 Strategic Plan: 5 Seed Programmes (Verified Facts)
            </h3>
            <div className="divide-y divide-slate-100">
              {STRATEGIC_PROGRAMMES_2021_2025.map((prog, idx) => (
                <div key={prog.code} className="py-3 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{idx + 1}. {prog.name}</span>
                    <span className="text-slate-500 mt-0.5 block">{prog.description}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    {prog.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Pillar Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Add 2026–2030 Strategic Pillar</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pillar Title:</label>
                  <input
                    type="text"
                    value={newPillarName}
                    onChange={e => setNewPillarName(e.target.value)}
                    placeholder="e.g. Pillar 4: Climate Resilience & Waste Management"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Description / Focus:</label>
                  <textarea
                    value={newPillarDesc}
                    onChange={e => setNewPillarDesc(e.target.value)}
                    rows={3}
                    placeholder="Key strategic outcome objectives..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPillar}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow-xs"
                >
                  Save Pillar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
