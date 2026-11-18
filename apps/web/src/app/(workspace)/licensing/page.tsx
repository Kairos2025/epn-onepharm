'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CreditCard, Smartphone, ShieldCheck, Check } from 'lucide-react';
import { ACCESS_TIERS } from '@epn/domain';
import { epnClient } from '@/lib/api';

export default function LicensingPage() {
  const [selectedBilling, setSelectedBilling] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [selectedTier, setSelectedTier] = useState<string>('FULL');
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CARD'>('MPESA');
  const [phoneNumber, setPhoneNumber] = useState('254712345678');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const priceMap: Record<string, Record<string, string>> = {
    BASIC: { MONTHLY: '$29', ANNUAL: '$290' },
    PRO: { MONTHLY: '$99', ANNUAL: '$990' },
    FULL: { MONTHLY: 'Custom', ANNUAL: 'Institutional DPA' }
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setPaymentMessage(null);
    try {
      const amount = priceMap[selectedTier]?.[selectedBilling] || '$990';
      const res = await epnClient.initiateMpesaStkPush({
        phone: phoneNumber,
        amount,
        plan: `${selectedTier}_${selectedBilling}`
      });
      setPaymentMessage(`${res.customerMessage} (Ref: ${res.checkoutRequestId})`);
      setPaymentSuccess(true);
    } catch {
      setPaymentSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="m3-glass-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 uppercase tracking-wider">
                Institutional DPA &amp; DFI Co-Financing
              </span>
              <h1 className="text-xl font-bold text-slate-900">Institutional Licensing &amp; Settlement</h1>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Annual institutional Data Processing Agreements (DPAs), member association licensing, and DFI blended-finance settlement. Separated from sovereign Ministry technical tracks.
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-full text-xs">
            {(['MONTHLY', 'ANNUAL'] as const).map(cadence => (
              <button
                key={cadence}
                onClick={() => setSelectedBilling(cadence)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${
                  selectedBilling === cadence ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cadence}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ACCESS_TIERS.slice(2, 5).map(tier => {
            const isSelected = selectedTier === tier.tier;
            const price = priceMap[tier.tier]?.[selectedBilling] || '$0';

            return (
              <div
                key={tier.tier}
                onClick={() => setSelectedTier(tier.tier)}
                className={`cursor-pointer p-6 m3-glass-card flex flex-col justify-between space-y-5 ${
                  isSelected ? 'ring-2 ring-cyan-700' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full uppercase">
                      {tier.tier}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold bg-cyan-700 text-white px-2.5 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">{price}</span>
                    <span className="text-xs text-slate-500">/ {selectedBilling.toLowerCase()}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{tier.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs space-y-2 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span><b>Granularity:</b> {tier.granularity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span><b>Export:</b> {tier.export}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="m3-glass-card p-6 space-y-5 max-w-xl">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Institutional Settlement</h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => setPaymentMethod('MPESA')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-colors cursor-pointer ${
                paymentMethod === 'MPESA'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>M-Pesa STK Push (Kenya &amp; EA)</span>
            </button>

            <button
              onClick={() => setPaymentMethod('CARD')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition-colors cursor-pointer ${
                paymentMethod === 'CARD'
                  ? 'border-cyan-700 bg-cyan-50 text-cyan-900'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <CreditCard className="w-4 h-4 text-cyan-700" />
              <span>Institutional Card / Wire</span>
            </button>
          </div>

          {paymentMethod === 'MPESA' ? (
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">M-Pesa Mobile Number (Safaricom):</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-sm bg-white"
                placeholder="254700000000"
              />
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">Institutional Reference (Sandbox):</label>
              <input
                type="text"
                defaultValue="DPA-2026-EPN-001"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-sm bg-slate-50"
                disabled
              />
            </div>
          )}

          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing || paymentSuccess}
            className="w-full py-2.5 rounded-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isProcessing
              ? 'Processing...'
              : paymentSuccess
              ? 'Institutional Agreement Active'
              : `Authorize ${priceMap[selectedTier]?.[selectedBilling] || '$0'}`}
          </button>

          {paymentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{paymentMessage || `Confirmed. Your ${selectedTier} institutional license is active.`}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
