'use client'

import { useEffect, useRef, useState } from 'react'

const ITEMS = [
  {
    tag: 'SIMULATED',
    title: 'Document Hash Attestation',
    desc: 'SHA-256 hash of the full document bundle recorded as proof-of-existence — no private documents stored.',
    hash: '0x91c4...fa22',
    accent: '#C8A96E',
  },
  {
    tag: 'PLANNED',
    title: 'Verifier Attestation',
    desc: 'Trusted verifier signs the confidence score on-chain. Proof the document bundle was reviewed by an authorized party.',
    hash: '0x5Tq9...dA21',
    accent: '#00C4B0',
  },
  {
    tag: 'FUTURE',
    title: 'Stablecoin Escrow',
    desc: 'USDC/USDT escrow on Solana for trustless funding. Repayment settled automatically at maturity.',
    hash: null,
    accent: '#C8A96E',
  },
  {
    tag: 'FUTURE',
    title: 'Repayment Trail',
    desc: 'Every payment event — funding, partial repayment, full settlement — leaves an immutable trail on the proof rail.',
    hash: '0x2Pa8...kL90',
    accent: '#00C4B0',
  },
]

export default function ProofLayer() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="proof-layer" ref={ref} className="py-32 px-6 relative">
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="max-w-5xl mx-auto relative">
        <div
          className="mb-16 text-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
            Proof Layer
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#F0E8D8] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Planned Solana proof rail
          </h2>
          <p className="text-sm text-[#6B6355] max-w-lg mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
            No private documents stored on-chain. Proof-of-existence hashes only.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-[rgba(200,169,110,0.06)]">
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              className="p-8 bg-[#06060A] relative overflow-hidden group"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: `all 0.5s ease ${i * 0.1}s`,
              }}
            >
              {/* Accent line top */}
              <div
                className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${item.accent}40, transparent)`, opacity: 0 }}
              />

              <div className="flex items-start justify-between mb-5">
                <span
                  className="tag"
                  style={{
                    background: `${item.accent}10`,
                    color: item.accent,
                    border: `1px solid ${item.accent}30`,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {item.tag}
                </span>
              </div>

              <h3
                className="text-lg font-bold text-[#F0E8D8] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {item.title}
              </h3>
              <p className="text-sm text-[#6B6355] leading-relaxed mb-5" style={{ fontFamily: 'var(--font-body)' }}>
                {item.desc}
              </p>

              {item.hash && (
                <div
                  className="inline-flex items-center gap-2 px-3 py-2"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${item.accent}20`,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span className="text-xs" style={{ color: item.accent }}>
                    # {item.hash}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <p
          className="text-center text-[11px] text-[#6B6355]/50 mt-8"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          All hashes are simulated. No real blockchain transactions occur in this MVP.
        </p>
      </div>
    </section>
  )
}
