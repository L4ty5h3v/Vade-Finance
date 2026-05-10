import { Hash, ShieldCheck, Coins, ArrowLeftRight, Clock } from 'lucide-react'

const EVENTS = [
  { label: 'Verification Attestation', hash: '5Tq9...dA21', time: '2026-05-03 14:22 UTC', tag: 'Simulated', color: 'text-violet-400', border: 'border-violet-500/25', icon: ShieldCheck },
  { label: 'Funding Event', hash: '9Lm2...xF44', time: '2026-05-05 09:11 UTC', tag: 'Simulated', color: 'text-indigo-400', border: 'border-indigo-500/25', icon: Coins },
  { label: 'Repayment Event', hash: '2Pa8...kL90', time: '2026-07-04 18:00 UTC', tag: 'Future', color: 'text-emerald-400', border: 'border-emerald-500/25', icon: ArrowLeftRight },
]

const BADGES = [
  { label: 'Document Hash Attestation', tag: 'Simulated', color: 'text-indigo-400', bg: 'bg-indigo-500/8', border: 'border-indigo-500/20' },
  { label: 'Verifier Attestation On-Chain', tag: 'Planned', color: 'text-violet-400', bg: 'bg-violet-500/8', border: 'border-violet-500/20' },
  { label: 'Stablecoin Escrow Ready', tag: 'Future', color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/20' },
  { label: 'Repayment Trail', tag: 'Future', color: 'text-teal-400', bg: 'bg-teal-500/8', border: 'border-teal-500/20' },
]

export default function SolanaProof() {
  return (
    <div className="p-6 max-w-3xl space-y-8">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Solana Proof Layer</h2>
        <p className="text-sm text-zinc-500">
          Planned infrastructure for trustless invoice verification. No private documents stored on-chain — proof-of-existence hashes only.
        </p>
      </div>

      {/* Feature badges */}
      <div className="grid sm:grid-cols-2 gap-3">
        {BADGES.map(b => (
          <div key={b.label} className={`flex items-center justify-between p-4 rounded-xl border ${b.bg} ${b.border}`}>
            <span className={`text-sm font-medium ${b.color}`}>{b.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${b.bg} ${b.border} ${b.color}`}>{b.tag}</span>
          </div>
        ))}
      </div>

      {/* Transaction timeline */}
      <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
        <p className="text-sm font-semibold text-zinc-300 mb-5">Fake Transaction Timeline</p>
        <div className="space-y-4">
          {EVENTS.map((ev, i) => (
            <div key={ev.label} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 bg-white/3 ${ev.border}`}>
                  <ev.icon className={`w-3.5 h-3.5 ${ev.color}`} />
                </div>
                {i < EVENTS.length - 1 && <div className="w-px flex-1 bg-white/8 my-2" />}
              </div>
              {/* Content */}
              <div className="pb-4">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <p className="text-sm font-semibold text-white">{ev.label}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${ev.color} border-current/30 bg-current/5`}>{ev.tag}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="w-3 h-3 text-zinc-600" />
                  <span className={`text-xs font-mono ${ev.color}`}>{ev.hash}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <Clock className="w-3 h-3" />
                  {ev.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/2 border border-white/6">
        <p className="text-xs text-zinc-600 leading-relaxed">
          <strong className="text-zinc-500">Disclaimer:</strong> All hashes, transactions, and blockchain events shown here are simulated for demonstration purposes. No real Solana transactions occur in this MVP. The planned proof layer will be implemented in a future version using Solana program accounts for verifier attestations and USDC escrow for funding events.
        </p>
      </div>
    </div>
  )
}
