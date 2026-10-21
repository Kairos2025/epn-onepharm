'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CreditCard, Smartphone, ShieldCheck, Check, Clock } from 'lucide-react';
import { ACCESS_TIERS } from '@epn/domain';

export default function BillingPage() {
  const [selectedBilling, setSelectedBilling] = useState<'HOURLY' | 'DAILY' | 'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedTier, setSelectedTier] = useState<string>('PRO');
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CARD'>('MPESA');
  const [phoneNumber, setPhoneNumber] = useState('254712345678');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const priceMap: Record<string, Record<string, string>> = {
    BASIC: { HOURLY: '$2', DAILY: '$5', MONTHLY: '$29', ANNUAL: '$290' },
    PRO: { HOURLY: '$8', DAILY: '$19', MONTHLY: '$99', ANNUAL: '$990' },
    FULL: { HOURLY: 'Custom', DAILY: 'Custom', MONTHLY: 'Custom', ANNUAL: 'Institutional DPA' }
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                Access Tiers & Subscriptions
              </span>
              <h1 className="text-xl font-bold text-slate-900">Subscription & Billing Management</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Time-boxed and recurring analytical access passes supporting pan-African mobile money (M-Pesa) and cards.
            </p>
          </div>

          {/* Billing Cadence Selector (Meeting Requirement: Hourly, Daily, Monthly, Annual) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
            {(['HOURLY', 'DAILY', 'MONTHLY', 'ANNUAL'] as const).map(cadence => (
              <button
                key={cadence}
                onClick={() => setSelectedBilling(cadence)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  selectedBilling === cadence ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cadence}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ACCESS_TIERS.slice(2, 5).map(tier => {
            const isSelected = selectedTier === tier.tier;
            const price = priceMap[tier.tier]?.[selectedBilling] || '$0';

            return (
              <div
                key={tier.tier}
                onClick={() => setSelectedTier(tier.tier)}
                className={`cursor-pointer p-6 rounded-xl border transition-all flex flex-col justify-between space-y-5 bg-white ${
                  isSelected ? 'border-sky-600 shadow-md ring-2 ring-sky-600' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded uppercase">
                      {tier.tier}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">
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

        {/* Checkout & Payment Box */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 max-w-xl">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Complete Subscription Checkout</h3>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => setPaymentMethod('MPESA')}
              className={`p-3 rounded-lg border flex items-center justify-center gap-2 font-bold transition-colors ${
                paymentMethod === 'MPESA'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>M-Pesa STK Push (Kenya & EA)</span>
            </button>

            <button
              onClick={() => setPaymentMethod('CARD')}
              className={`p-3 rounded-lg border flex items-center justify-center gap-2 font-bold transition-colors ${
                paymentMethod === 'CARD'
                  ? 'border-sky-600 bg-sky-50 text-sky-800'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <CreditCard className="w-4 h-4 text-sky-600" />
              <span>Credit / Debit Card (Stripe)</span>
            </button>
          </div>

          {paymentMethod === 'MPESA' ? (
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">M-Pesa Mobile Number (Safaricom):</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-sm"
                placeholder="254700000000"
              />
              <span className="text-[11px] text-slate-400 block">
                A prompt will be sent immediately to this phone to enter PIN and authorize payment.
              </span>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">Card Details (Sandbox Simulator):</label>
              <input
                type="text"
                defaultValue="4242 •••• •••• 4242"
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-sm bg-slate-50"
                disabled
              />
            </div>
          )}

          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing || paymentSuccess}
            className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Processing Payment...' : paymentSuccess ? 'Subscription Active!' : `Authorize ${priceMap[selectedTier]?.[selectedBilling] || '$0'}`}
          </button>

          {paymentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Payment confirmed. Your {selectedTier} pass is active until end of billing cycle.</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
