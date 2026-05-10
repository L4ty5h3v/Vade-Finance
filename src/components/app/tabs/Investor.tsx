'use client'

import { useState } from 'react'
import { Filter, ArrowRight } from 'lucide-react'
import type { InvoiceRequest } from '@/lib/types'
import { formatCurrency, calculateInvestorReturn, calculatePlatformFee, calculateAnnualizedReturn } from '@/lib/utils'
import { StatusBadge, RiskBadge } from '@/components/ui/StatusBadge'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'
import FundingSimulationModal from '../modals/FundingSimulationModal'

interface Props {
  invoices: InvoiceRequest[]
  onUpdateInvoice: (id: string, updates: Partial<InvoiceRequest>) => void
}

export default function Investor({ invoices, onUpdateInvoice }: Props) {
  const market = invoices.filter(i => ['Verified', 'Buyer Confirmed'].includes(i.status))
  const [selectedId, setSelectedId] = useState(market[0]?.id)
  const [fundingInvoice, setFundingInvoice] = useState<InvoiceRequest | null>(null)
  const selected = invoices.find(i => i.id === selectedId) ?? market[0]

  function handleFund(txHash: string) {
    if (!selected) return
    onUpdateInvoice(selected.id, { status: 'Funded', txHash })
  }

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden">
      {/* Marketplace list */}
      <div className="w-80 flex-shrink-0 border-r border-white/8 overflow-y-auto">
        <div className="p-4 border-b border-white/8">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Marketplace ({market.length})</p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-zinc-500">
            <Filter className="w-3 h-3" />
            All invoices · All risk levels
          </div>
        </div>

        <div className="p-3 space-y-2">
          {market.length === 0 && (
            <p className="text-xs text-zinc-600 px-2 py-4">No verified invoices available for funding.</p>
          )}
          {market.map(inv => {
            const ret = calculateInvestorReturn(inv.advanceAmount, 3, inv.paymentTermDays)
            const ann = calculateAnnualizedReturn(ret, inv.advanceAmount, inv.paymentTermDays)
            return (
              <button
                key={inv.id}
                onClick={() => setSelectedId(inv.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedId === inv.id
                    ? 'bg-emerald-500/8 border-emerald-500/30'
                    : 'bg-white/2 border-white/6 hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{inv.exporter}</p>
                    <p className="text-xs text-zinc-500">{inv.buyerCountry} · {inv.paymentTermDays}d</p>
                  </div>
                  <ConfidenceMeter score={inv.confidenceScore} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">{formatCurrency(inv.amount)}</p>
                  <p className="text-xs text-emerald-400 font-semibold">{ann}% p.a.</p>
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <RiskBadge risk={inv.riskLevel} />
                  <StatusBadge status={inv.status} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Deal detail */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{selected.exporter}</h2>
              <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                <ArrowRight className="w-3.5 h-3.5" />
                {selected.buyer} · {selected.buyerCountry}
              </div>
            </div>
            <ConfidenceMeter score={selected.confidenceScore} size="lg" />
          </div>

          {/* Deal economics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(() => {
              const ret = calculateInvestorReturn(selected.advanceAmount, 3, selected.paymentTermDays)
              const ann = calculateAnnualizedReturn(ret, selected.advanceAmount, selected.paymentTermDays)
              const fee = calculatePlatformFee(selected.amount, 0.75)
              return [
                { label: 'Invoice Amount', value: formatCurrency(selected.amount), color: 'text-white' },
                { label: 'Advance (85%)', value: formatCurrency(selected.advanceAmount), color: 'text-indigo-400' },
                { label: 'Term', value: `${selected.paymentTermDays} days`, color: 'text-white' },
                { label: 'Your Return', value: formatCurrency(ret), color: 'text-emerald-400' },
                { label: 'Annualized', value: `${ann}%`, color: 'text-emerald-400' },
                { label: 'Platform Fee', value: formatCurrency(fee), color: 'text-amber-400' },
              ]
            })().map(c => (
              <div key={c.label} className="p-4 rounded-xl bg-white/3 border border-white/8">
                <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={selected.status} />
            <RiskBadge risk={selected.riskLevel} />
          </div>

          {/* Funding CTA */}
          {selected.status !== 'Funded' && selected.status !== 'Repaid' && (
            <button
              onClick={() => setFundingInvoice(selected)}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-emerald-500/20"
            >
              Fund Invoice — {formatCurrency(selected.advanceAmount)}
            </button>
          )}

          {selected.status === 'Funded' && selected.txHash && (
            <div className="p-5 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
              <p className="text-sm font-semibold text-emerald-300 mb-2">Invoice Funded</p>
              <p className="text-xs font-mono text-emerald-500">{selected.txHash}</p>
            </div>
          )}
        </div>
      )}

      {fundingInvoice && (
        <FundingSimulationModal
          invoice={fundingInvoice}
          onClose={() => setFundingInvoice(null)}
          onConfirm={(txHash) => { handleFund(txHash); setFundingInvoice(null) }}
        />
      )}
    </div>
  )
}
