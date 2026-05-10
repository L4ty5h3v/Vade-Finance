'use client'

import { useEffect, useRef, useState } from 'react'

const STEPS = [
  { n: '01', label: 'Exporter', sub: 'Turkish SME', desc: 'Exporter receives buyer confirmation and submits invoice with full document bundle.' },
  { n: '02', label: 'Documents', sub: 'Invoice bundle', desc: 'Commercial invoice, purchase order, shipping documents, and buyer confirmation letter.' },
  { n: '03', label: 'Verifier', sub: 'Trusted review', desc: 'Authorized verifier examines the document bundle and assigns a confidence score.' },
  { n: '04', label: 'Verified', sub: 'Attestation', desc: 'Invoice receives verification attestation. Document hash recorded for integrity.' },
  { n: '05', label: 'Investor', sub: 'Early capital', desc: 'Investor funds the advance at agreed rate. Exporter receives working capital now.' },
  { n: '06', label: 'Repayment', sub: 'At maturity', desc: 'Buyer pays at invoice maturity. Investor receives principal plus return.' },
]

export default function FlowSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="flow" ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,196,176,0.04) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="mb-20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] mb-4"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            How it works
          </p>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-[#F0E8D8]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            From invoice to capital
            <br />
            <span className="text-[#6B6355]">in one flow</span>
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-px bg-[rgba(200,169,110,0.06)]">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="relative p-8 bg-[#06060A]"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`,
              }}
            >
              {/* Number */}
              <div
                className="text-[56px] font-black leading-none mb-6 select-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(200,169,110,0.08)',
                }}
              >
                {step.n}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <p
                    className="text-xl font-bold text-[#F0E8D8]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {step.label}
                  </p>
                  <p
                    className="text-[10px] tracking-widest uppercase text-[#C8A96E]"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {step.sub}
                  </p>
                </div>
                <p className="text-sm text-[#6B6355] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  {step.desc}
                </p>
              </div>

              {/* Connector arrow (not last in row) */}
              {i < STEPS.length - 1 && (i + 1) % 3 !== 0 && (
                <div
                  className="absolute top-1/2 -right-3 -translate-y-1/2 text-[#C8A96E]/20 text-lg hidden md:block"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
