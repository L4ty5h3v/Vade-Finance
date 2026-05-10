'use client'

import { useState } from 'react'
import { X, Check, ChevronRight } from 'lucide-react'
import type { InvoiceRequest } from '@/lib/types'
import { generateFakeHash } from '@/lib/utils'

interface Props {
  onClose: () => void
  onSubmit: (invoice: InvoiceRequest) => void
}

const STEPS = ['Buyer Info', 'Invoice Details', 'Financing Terms', 'Documents', 'Review']

export default function CreateInvoiceModal({ onClose, onSubmit }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    buyer: '',
    buyerCountry: '',
    amount: '',
    currency: 'USD',
    paymentTermDays: '60',
    advanceRate: '85',
    investorFeePct: '3',
    platformFeePct: '0.75',
  })

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit() {
    const amount = parseFloat(form.amount) || 50000
    const advanceRate = parseFloat(form.advanceRate) || 85
    const newInvoice: InvoiceRequest = {
      id: `INV-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      exporter: 'Anatolia Olive Co.',
      exporterLocation: 'Izmir, Turkey',
      exporterSector: 'Olive oil export',
      buyer: form.buyer || 'New Buyer Ltd.',
      buyerCountry: form.buyerCountry || 'Germany',
      amount,
      currency: form.currency,
      paymentTermDays: parseInt(form.paymentTermDays) || 60,
      advanceRate,
      advanceAmount: Math.round(amount * (advanceRate / 100)),
      status: 'Documents Uploaded',
      riskLevel: 'Medium',
      confidenceScore: 0,
      documents: [
        { type: 'Commercial Invoice', fileName: `invoice_${Date.now()}.pdf`, hash: generateFakeHash(), uploaded: true, uploadedAt: new Date().toISOString().split('T')[0] },
        { type: 'Purchase Order', fileName: `po_${Date.now()}.pdf`, hash: generateFakeHash(), uploaded: true, uploadedAt: new Date().toISOString().split('T')[0] },
        { type: 'Shipping Document', fileName: '', hash: '', uploaded: false },
        { type: 'Customs Declaration', fileName: '', hash: '', uploaded: false },
        { type: 'Buyer Confirmation', fileName: '', hash: '', uploaded: false },
      ],
      createdAt: new Date().toISOString().split('T')[0],
    }
    onSubmit(newInvoice)
    onClose()
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d0d18] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">Create Invoice Request</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-zinc-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-1 px-6 py-4 border-b border-white/8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-400' : 'bg-white/5 text-zinc-600'
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-indigo-400 font-medium' : 'text-zinc-600'}`}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-700 ml-auto flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[220px]">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Buyer Company Name</label>
                <input className={inputCls} placeholder="Berlin Gourmet GmbH" value={form.buyer} onChange={e => update('buyer', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Buyer Country</label>
                <input className={inputCls} placeholder="Germany" value={form.buyerCountry} onChange={e => update('buyerCountry', e.target.value)} />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Invoice Amount (USD)</label>
                <input type="number" className={inputCls} placeholder="50000" value={form.amount} onChange={e => update('amount', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Payment Term (days)</label>
                <input type="number" className={inputCls} value={form.paymentTermDays} onChange={e => update('paymentTermDays', e.target.value)} />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Advance Rate (%)</label>
                <input type="number" className={inputCls} value={form.advanceRate} onChange={e => update('advanceRate', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Investor Fee (%)</label>
                <input type="number" className={inputCls} value={form.investorFeePct} onChange={e => update('investorFeePct', e.target.value)} />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 mb-3">Documents will be attached (simulated upload)</p>
              {['Commercial Invoice', 'Purchase Order', 'Shipping Document', 'Customs Declaration', 'Buyer Confirmation'].map((doc) => (
                <div key={doc} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/8">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm text-zinc-300">{doc}</span>
                  <span className="ml-auto text-xs text-zinc-600 font-mono">{generateFakeHash()}</span>
                </div>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400 mb-4">Review your invoice request before submitting.</p>
              {[
                { label: 'Buyer', value: form.buyer || 'New Buyer Ltd.' },
                { label: 'Country', value: form.buyerCountry || 'Germany' },
                { label: 'Amount', value: `$${parseFloat(form.amount || '50000').toLocaleString()}` },
                { label: 'Term', value: `${form.paymentTermDays} days` },
                { label: 'Advance Rate', value: `${form.advanceRate}%` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between py-2 border-b border-white/6">
                  <span className="text-sm text-zinc-500">{r.label}</span>
                  <span className="text-sm text-white font-medium">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/8">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
            >
              Submit Request
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
