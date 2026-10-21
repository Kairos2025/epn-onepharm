'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookOpen, ShieldCheck, CheckCircle2, ArrowRight, Camera, FileCheck } from 'lucide-react';

export default function StoriesPage() {
  const [activeStory, setActiveStory] = useState(0);

  const stories = [
    {
      title: 'Eliminating Pediatric Amoxicillin Stock-outs in Machakos County',
      facility: 'Kilome Mission Hospital',
      member: 'CHAK (Kenya)',
      project: 'ACCESS Phase II (Bread for the World)',
      author: 'EPN Communications / M&E Team',
      date: 'September 2026',
      consentRecorded: true,
      context: 'Satellite mission dispensaries previously suffered up to 18 stock-out days per month for amoxicillin dispersible tablets.',
      actionTaken: 'Trained facility pharmacy in-charge on consumption forecasting, established a functional Drug & Therapeutics Committee (DTC), and ring-fenced pharmacy revenues via a dedicated DRF account.',
      resultBefore: '18 Days Stockout / Month (62% Availability)',
      resultAfter: '0 Days Stockout / Month (94% Availability)',
      actionPlanStatus: 'IMPLEMENTED'
    },
    {
      title: 'Minilab Post-Marketing Surveillance Intercepts Counterfeit Antibiotics',
      facility: 'CBCHS Quality Control Lab',
      member: 'CBCHS (Cameroon)',
      project: 'Minilab Network (Difaem)',
      author: 'CBCHS Chief Pharmacist',
      date: 'August 2026',
      consentRecorded: true,
      context: 'High risk of falsified injectable antibiotics circulating in regional wholesale drug markets.',
      actionTaken: 'Screened suspicious cephalosporin commercial lots using thin-layer chromatography (TLC) GPHF-Minilab protocol.',
      resultBefore: 'Suspect batch entering clinical distribution',
      resultAfter: '0% API confirmed; 800 surgical inpatients protected',
      actionPlanStatus: 'IMPLEMENTED'
    }
  ];

  const current = stories[activeStory];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                M&E Evidence & Stories
              </span>
              <h1 className="text-xl font-bold text-slate-900">Success Stories & Action Plan Evidence</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified qualitative and quantitative change narratives backed by analytics and consent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Consent Enforced for Publication</span>
            </span>
          </div>
        </div>

        {/* Story Selector & Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Verified Story</h3>
            {stories.map((s, idx) => (
              <button
                key={s.title}
                onClick={() => setActiveStory(idx)}
                className={`w-full p-4 rounded-xl border text-left text-xs transition-colors space-y-2 ${
                  activeStory === idx
                    ? 'border-sky-600 bg-sky-50/70 shadow-sm ring-1 ring-sky-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>{s.facility}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Consent OK</span>
                </div>
                <h4 className="font-bold text-slate-900 leading-snug">{s.title}</h4>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  Published • Action Plan: {current.actionPlanStatus}
                </span>
                <span className="text-xs text-slate-500">{current.project}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{current.title}</h2>
              <div className="text-xs text-slate-500">
                Facility: <b>{current.facility}</b> • Supporting Member: <b>{current.member}</b> • {current.date}
              </div>
            </div>

            {/* Structured Before / After Evidence */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantitative Impact Verification:</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">Baseline / Problem</span>
                  <div className="text-lg font-bold text-rose-900 mt-1">{current.resultBefore}</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Outcome / Result</span>
                  <div className="text-lg font-bold text-emerald-900 mt-1">{current.resultAfter}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Context & Challenge:</span>
                <p>{current.context}</p>
              </div>
              <div>
                <span className="font-bold text-slate-900 block mb-1">Intervention & Action Plan:</span>
                <p>{current.actionTaken}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Author: {current.author}</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <FileCheck className="w-4 h-4" />
                <span>Signed Consent On File (Kenya DPA 2019 Compliant)</span>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
