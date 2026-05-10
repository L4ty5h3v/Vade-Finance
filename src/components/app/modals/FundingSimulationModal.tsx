'use client'

import { useState } from 'react'
import { X, AlertTriangle, CheckCircle, Hash } from 'lucide-react'
import type { InvoiceRequest } from '@/lib/types'
import { formatCurrency, calculateInvestorReturn, calculatePlatformFee, generateFakeHash } from '@/lib/utils'

interface Props {
  invoice: InvoiceRequest
  onClose: () => void
  onConfirm: (txHash: string) => void
}

export default function FundingSimulationModal({ invoice, onClose, onConfirm }: Props) {
  const [confirmed, setConfirmed] = useState(false)
  const [txHash] = useState(generateFakeHash)

  const investorReturn = calculateInvestorReturn(invoice.advanceAmount, 3, invoice.paymentTermDays)
  const platformFee = calculatePlatformFee(invoice.amount, 0.75)

  function handleConfirm() {
    setConfirmed(true)
    onConfirm(txHash)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d0d18] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">Fund Invoice</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-zinc-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {!confirmed ? (
            <>
              {/* Disclaimer */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-6">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-300">Financing simulation</p>
                  <p className="text-xs text-amber-300/70">No real funds are moved. Future version will use stablecoin escrow on Solana.</p>
                </div>
              </div>

              {/* Deal summary */}
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Exporter', value: invoice.exporter },
                  { label: 'Buyer', value: invoice.buyer },
                  { label: 'Invoice Amount', value: formatCurrency(invoice.amount) },
                  { label: 'Advance (85%)', value: formatCurrency(invoice.advanceAmount) },
                  { label: 'Term', value: `${invoice.paymentTermDays} days` },
                  { label: 'Your Return', value: formatCurrency(investorReturn), highlight: true },
                  { label: 'Platform Fee', value: formatCurrency(platformFee) },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-2 border-b border-white/6">
                    <span className="text-sm text-zinc-500">{r.label}</span>
                    <span className={`text-sm font-medium ${r.highlight ? 'text-emerald-400' : 'text-white'}`}>{r.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
              >
                Confirm Funding (Simulation)
              </button>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white mb-1">Invoice Funded</p>
                <p className="text-sm text-zinc-500">Exporter will receive {formatCurrency(invoice.advanceAmount)}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/8 justify-center">
                <Hash className="w-3 h-3 text-zinc-600" />
                <span className="text-xs font-mono text-emerald-400">{txHash}</span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-white/12 text-zinc-300 text-sm hover:border-white/25 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
