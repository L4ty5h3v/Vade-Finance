'use client'

import { useState } from 'react'
import { ShieldCheck, AlertTriangle, X, CheckCircle, Hash } from 'lucide-react'
import type { InvoiceRequest } from '@/lib/types'
import { formatCurrency, generateFakeHash } from '@/lib/utils'
import { StatusBadge, RiskBadge } from '@/components/ui/StatusBadge'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'
import { DocumentCard } from '@/components/ui/DocumentCard'
import { RISK_SIGNALS } from '@/lib/mockData'

interface Props {
  invoices: InvoiceRequest[]
  onUpdateInvoice: (id: string, updates: Partial<InvoiceRequest>) => void
}

export default function Verifier({ invoices, onUpdateInvoice }: Props) {
  const queue = invoices.filter(i =>
    ['Buyer Confirmed', 'Documents Uploaded', 'Under Review'].includes(i.status)
  )
  const [selectedId, setSelectedId] = useState(queue[0]?.id)
  const selected = invoices.find(i => i.id === selectedId) ?? queue[0]
  const [attestation, setAttestation] = useState<string | null>(null)

  function handleVerify() {
    if (!selected) return
    const hash = generateFakeHash()
    setAttestation(hash)
    onUpdateInvoice(selected.id, {
      status: 'Verified',
      confidenceScore: Math.min(100, selected.confidenceScore + 18),
      attestationHash: hash,
    })
  }

  function handleReview() {
    if (!selected) return
    onUpdateInvoice(selected.id, { status: 'Under Review' })
  }

  function handleReject() {
    if (!selected) return
    onUpdateInvoice(selected.id, { status: 'Rejected' })
  }

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden">
      {/* Queue */}
      <div className="w-72 flex-shrink-0 border-r border-white/8 overflow-y-auto p-3 space-y-2">
        <p className="px-2 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Verification Queue ({queue.length})
        </p>
        {queue.length === 0 && (
          <p className="text-xs text-zinc-600 px-2 py-4">No invoices pending verification.</p>
        )}
        {queue.map(inv => (
          <button
            key={inv.id}
            onClick={() => { setSelectedId(inv.id); setAttestation(null) }}
            className={`w-full text-left p-3.5 rounded-xl border transition-all ${
              selectedId === inv.id
                ? 'bg-violet-500/10 border-violet-500/35'
                : 'bg-white/2 border-white/6 hover:border-white/15'
            }`}
          >
            <p className="text-sm font-medium text-white mb-1">{inv.exporter}</p>
            <p className="text-xs text-zinc-500 mb-2">{inv.buyer} · {formatCurrency(inv.amount)}</p>
            <StatusBadge status={inv.status} />
          </button>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{selected.exporter}</h2>
              <p className="text-sm text-zinc-500">{selected.buyer} · {selected.buyerCountry}</p>
            </div>
            <ConfidenceMeter score={selected.confidenceScore} size="lg" />
          </div>

          {/* Figures */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Invoice Amount', value: formatCurrency(selected.amount) },
              { label: 'Payment Term', value: `${selected.paymentTermDays} days` },
              { label: 'Advance Rate', value: `${selected.advanceRate}%` },
            ].map(c => (
              <div key={c.label} className="p-3 rounded-xl bg-white/3 border border-white/8 text-center">
                <p className="text-base font-bold text-white">{c.value}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={selected.status} />
            <RiskBadge risk={selected.riskLevel} />
          </div>

          {/* Risk signals */}
          <div className="p-5 rounded-2xl bg-white/3 border border-white/8">
            <p className="text-sm font-semibold text-zinc-300 mb-4">Risk Signals</p>
            <div className="space-y-2.5">
              {RISK_SIGNALS.map((sig) => (
                <div key={sig.label} className="flex items-center gap-3">
                  {sig.passed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${sig.passed ? 'text-zinc-300' : 'text-amber-300'}`}>{sig.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div>
            <p className="text-sm font-semibold text-zinc-300 mb-3">Document Bundle</p>
            <div className="space-y-2">
              {selected.documents.map((doc, i) => <DocumentCard key={i} doc={doc} />)}
            </div>
          </div>

          {/* Attestation result */}
          {attestation && (
            <div className="p-5 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-300">Verification attestation prepared</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/8">
                <Hash className="w-3 h-3 text-zinc-600" />
                <span className="text-xs font-mono text-emerald-400">{attestation}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          {selected.status !== 'Verified' && selected.status !== 'Rejected' && selected.status !== 'Funded' && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleVerify}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Mark as Verified
              </button>
              <button
                onClick={handleReview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Needs Review
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
