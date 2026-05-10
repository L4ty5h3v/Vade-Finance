'use client'

import { useState } from 'react'
import { CheckCircle, Clock, RotateCcw } from 'lucide-react'
import type { DemoStage } from '@/lib/types'

const STAGES: { id: DemoStage; label: string; desc: string; color: string }[] = [
  { id: 'reset', label: 'Reset', desc: 'Invoice submitted, documents pending', color: 'text-zinc-400' },
  { id: 'buyer-confirmed', label: 'Buyer Confirmed', desc: 'Berlin Gourmet GmbH confirmed receipt of 2,000kg olive oil shipment.', color: 'text-indigo-400' },
  { id: 'verifier-review', label: 'Verifier Review', desc: 'Trusted verifier examining document bundle — commercial invoice, B/L, customs declaration, and buyer confirmation.', color: 'text-amber-400' },
  { id: 'verified', label: 'Verified', desc: 'Confidence score: 72/100. Verification attestation prepared. Document bundle hash recorded.', color: 'text-violet-400' },
  { id: 'funded', label: 'Funded', desc: 'Investor funded $42,500 (85% advance). Anatolia Olive Co. received working capital. Tx: 0x9Lm2...xF44', color: 'text-emerald-400' },
  { id: 'repaid', label: 'Repaid', desc: 'Berlin Gourmet GmbH paid $50,000 at day 60 maturity. Investor received $43,775 ($1,275 return). Platform earned $319.', color: 'text-teal-400' },
]

const STAGE_ORDER: DemoStage[] = ['reset', 'buyer-confirmed', 'verifier-review', 'verified', 'funded', 'repaid']

export default function DemoFlow() {
  const [currentStage, setCurrentStage] = useState<DemoStage>('reset')
  const currentIdx = STAGE_ORDER.indexOf(currentStage)

  return (
    <div className="p-6 max-w-3xl space-y-8">
      {/* Story */}
      <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Demo Story</p>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Anatolia Olive Co. exported premium olive oil to Germany. The buyer accepted the shipment, but payment is due in{' '}
          <strong className="text-white">60 days</strong>. ExportFlow verifies the invoice package and lets an investor fund the receivable — giving the exporter{' '}
          <strong className="text-emerald-400">$42,500 now</strong> instead of waiting.
        </p>
      </div>

      {/* Stage controls */}
      <div className="flex flex-wrap gap-2">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentStage(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              currentStage === s.id
                ? `bg-white/8 border-white/20 ${s.color}`
                : i <= currentIdx && currentStage !== 'reset'
                ? 'bg-white/3 border-white/10 text-zinc-400'
                : 'bg-white/2 border-white/6 text-zinc-600 hover:border-white/12 hover:text-zinc-400'
            }`}
          >
            {s.id === 'reset' && <RotateCcw className="w-3.5 h-3.5" />}
            {s.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {STAGES.filter(s => s.id !== 'reset').map((stage, i) => {
          const stageIdx = STAGE_ORDER.indexOf(stage.id)
          const isPassed = stageIdx <= currentIdx && currentStage !== 'reset'
          const isActive = stage.id === currentStage

          return (
            <div
              key={stage.id}
              className={`flex gap-4 p-4 rounded-xl border transition-all ${
                isActive
                  ? 'bg-white/5 border-white/15'
                  : isPassed
                  ? 'bg-white/2 border-white/6'
                  : 'bg-white/1 border-white/4 opacity-40'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isPassed ? (
                  <CheckCircle className={`w-5 h-5 ${stage.color}`} />
                ) : (
                  <Clock className="w-5 h-5 text-zinc-700" />
                )}
              </div>
              <div>
                <p className={`text-sm font-semibold mb-1 ${isPassed ? stage.color : 'text-zinc-600'}`}>
                  {stage.label}
                </p>
                <p className={`text-xs leading-relaxed ${isPassed ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  {stage.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {currentStage === 'repaid' && (
        <div className="p-5 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 text-center">
          <p className="text-base font-bold text-emerald-300 mb-1">🎉 Deal Complete</p>
          <p className="text-sm text-emerald-400/70">All parties settled. Platform earned fees. Exporter got early capital. Buyer paid on schedule.</p>
        </div>
      )}
    </div>
  )
}
