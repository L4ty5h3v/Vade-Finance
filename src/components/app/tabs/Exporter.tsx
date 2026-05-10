'use client'

import { useState } from 'react'
import { MapPin, Globe, Package, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { InvoiceRequest } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge, RiskBadge } from '@/components/ui/StatusBadge'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'
import { DocumentCard } from '@/components/ui/DocumentCard'

const TIMELINE_STEPS: { status: InvoiceRequest['status']; label: string }[] = [
  { status: 'Draft', label: 'Invoice created' },
  { status: 'Documents Uploaded', label: 'Documents uploaded' },
  { status: 'Buyer Confirmed', label: 'Buyer confirmed' },
  { status: 'Under Review', label: 'Verifier review' },
  { status: 'Verified', label: 'Verified' },
  { status: 'Funded', label: 'Funded' },
  { status: 'Repaid', label: 'Repaid' },
]

const STATUS_ORDER: InvoiceRequest['status'][] = [
  'Draft', 'Documents Uploaded', 'Buyer Confirmed', 'Under Review', 'Verified', 'Funded', 'Repaid',
]

interface Props {
  invoices: InvoiceRequest[]
  onCreateInvoice: () => void
}

export default function Exporter({ invoices, onCreateInvoice }: Props) {
  const [selectedId, setSelectedId] = useState(invoices[0]?.id)
  const selected = invoices.find(i => i.id === selectedId) ?? invoices[0]
  const currentStepIdx = STATUS_ORDER.indexOf(selected?.status ?? 'Draft')

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden">
      {/* Left panel — list */}
      <div className="w-80 flex-shrink-0 border-r border-white/8 overflow-y-auto">
        {/* Exporter profile */}
        <div className="p-5 border-b border-white/8">
          <p className="text-sm font-bold text-white mb-1">Anatolia Olive Co.</p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
            <MapPin className="w-3 h-3" /> Izmir, Turkey
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
            <Package className="w-3 h-3" /> Olive oil export
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Globe className="w-3 h-3" /> Germany · Netherlands · UAE
          </div>
        </div>

        {/* Invoice list */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between px-2 mb-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Invoices</p>
            <button onClick={onCreateInvoice} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">+ New</button>
          </div>
          {invoices.map(inv => (
            <button
              key={inv.id}
              onClick={() => setSelectedId(inv.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                selectedId === inv.id
                  ? 'bg-indigo-500/10 border-indigo-500/35'
                  : 'bg-white/2 border-white/6 hover:border-white/15'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-medium text-white leading-tight">{inv.buyer}</p>
                <p className="text-xs font-bold text-white flex-shrink-0">{formatCurrency(inv.amount)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={inv.status} />
                <span className="text-xs text-zinc-600">{inv.paymentTermDays}d</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel — detail */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{selected.buyer}</h2>
              <p className="text-sm text-zinc-500">{selected.buyerCountry} · {selected.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <ConfidenceMeter score={selected.confidenceScore} size="md" />
            </div>
          </div>

          {/* Key figures */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Invoice', value: formatCurrency(selected.amount) },
              { label: 'Advance', value: formatCurrency(selected.advanceAmount) },
              { label: 'Term', value: `${selected.paymentTermDays} days` },
              { label: 'Rate', value: `${selected.advanceRate}%` },
            ].map(c => (
              <div key={c.label} className="p-3 rounded-xl bg-white/3 border border-white/8 text-center">
                <p className="text-base font-bold text-white">{c.value}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Status + risk */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={selected.status} />
            <RiskBadge risk={selected.riskLevel} />
            <span className="text-xs text-zinc-600">Created {formatDate(selected.createdAt)}</span>
          </div>

          {/* Status timeline */}
          <div className="p-5 rounded-2xl bg-white/3 border border-white/8">
            <p className="text-sm font-semibold text-zinc-300 mb-4">Status Timeline</p>
            <div className="flex items-center gap-0">
              {TIMELINE_STEPS.map((ts, i) => {
                const passed = i <= currentStepIdx
                const active = i === currentStepIdx
                return (
                  <div key={ts.status} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                        active ? 'bg-indigo-600 border-indigo-400' : passed ? 'bg-indigo-900 border-indigo-700' : 'bg-zinc-900 border-zinc-700'
                      }`}>
                        {passed && !active && <CheckCircle className="w-3 h-3 text-indigo-400" />}
                        {active && <div className="w-2 h-2 rounded-full bg-white" />}
                        {!passed && <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />}
                      </div>
                      <p className="text-[9px] text-center text-zinc-600 max-w-[50px] leading-tight">{ts.label}</p>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-1 ${passed && i < currentStepIdx ? 'bg-indigo-700' : 'bg-zinc-800'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Documents */}
          <div>
            <p className="text-sm font-semibold text-zinc-300 mb-3">Document Checklist</p>
            <div className="space-y-2">
              {selected.documents.map((doc, i) => (
                <DocumentCard key={i} doc={doc} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
