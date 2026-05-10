'use client'

import { useEffect, useRef, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

const DEAL = {
  invoice: 50000,
  exporterReceives: 42500,
  investorReturn: 1275,
  platformFee: 319,
  verifierFee: 150,
  buyerPays: 50000,
}

const ROWS = [
  { label: 'Invoice Amount', value: DEAL.invoice, pct: 100, accent: '#C8A96E', tag: 'BASE' },
  { label: 'Exporter Receives Now', value: DEAL.exporterReceives, pct: 85, accent: '#00C4B0', tag: '85% ADVANCE' },
  { label: 'Investor Return', value: DEAL.investorReturn, pct: 2.55, accent: '#C8A96E', tag: '3% FEE' },
  { label: 'Platform Fee', value: DEAL.platformFee, pct: 0.64, accent: '#8A6E3A', tag: '0.75%' },
  { label: 'Verifier Fee', value: DEAL.verifierFee, pct: 0.3, accent: '#8A6E3A', tag: 'FIXED' },
  { label: 'Buyer Pays Later', value: DEAL.buyerPays, pct: 100, accent: '#00C4B0', tag: 'AT MATURITY' },
]

export default function DealExample() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="deal-example" ref={ref} className="py-32 px-6 relative">
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(200,169,110,0.05) 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto">
        <div
          className="mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.7s ease',
          }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
            Deal Example
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>
            $50,000 invoice
            <br />
            <span className="text-[#6B6355]">Izmir → Berlin · 60 days</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-8">
          {/* Breakdown */}
          <div className="space-y-1">
            {ROWS.map((row, i) => (
              <div
                key={row.label}
                className="group relative overflow-hidden"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'none' : 'translateX(-20px)',
                  transition: `all 0.5s ease ${i * 0.07}s`,
                }}
              >
                {/* Background bar */}
                <div
                  className="absolute left-0 top-0 h-full transition-all duration-700"
                  style={{
                    width: visible ? `${Math.max(row.pct, 2)}%` : '0%',
                    background: `${row.accent}08`,
                    transitionDelay: `${i * 0.07 + 0.2}s`,
                  }}
                />

                <div className="relative flex items-center justify-between px-5 py-4 border border-[rgba(200,169,110,0.06)] hover:border-[rgba(200,169,110,0.18)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: row.accent }} />
                    <div>
                      <p className="text-sm font-medium text-[#F0E8D8]" style={{ fontFamily: 'var(--font-body)' }}>
                        {row.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="tag"
                      style={{
                        background: `${row.accent}12`,
                        color: row.accent,
                        border: `1px solid ${row.accent}30`,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {row.tag}
                    </span>
                    <p
                      className="text-base font-bold tabular-nums min-w-[80px] text-right"
                      style={{ fontFamily: 'var(--font-mono)', color: row.accent }}
                    >
                      {formatCurrency(row.value)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary panel */}
          <div
            className="sticky top-24 self-start"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateX(20px)',
              transition: 'all 0.7s ease 0.4s',
            }}
          >
            <div
              className="p-6 relative overflow-hidden"
              style={{
                background: 'rgba(200,169,110,0.04)',
                border: '1px solid rgba(200,169,110,0.15)',
              }}
            >
              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-16 h-16"
                style={{
                  background: 'linear-gradient(225deg, rgba(200,169,110,0.15) 0%, transparent 60%)',
                }}
              />

              <p
                className="text-[10px] tracking-[0.25em] uppercase text-[#C8A96E] mb-6"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Deal Summary
              </p>

              <div className="space-y-5">
                {[
                  { label: 'Exporter gets now', value: formatCurrency(DEAL.exporterReceives), color: '#00C4B0' },
                  { label: 'Total cost to exporter', value: formatCurrency(DEAL.investorReturn + DEAL.platformFee + DEAL.verifierFee), color: '#C8A96E' },
                  { label: 'Investor annualized', value: '~18.2%', color: '#C8A96E' },
                  { label: 'Buyer pays at maturity', value: formatCurrency(DEAL.buyerPays), color: '#00C4B0' },
                ].map((r) => (
                  <div key={r.label}>
                    <p className="text-xs text-[#6B6355] mb-1" style={{ fontFamily: 'var(--font-body)' }}>{r.label}</p>
                    <p className="text-2xl font-black tabular-nums" style={{ fontFamily: 'var(--font-display)', color: r.color }}>
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-[rgba(200,169,110,0.1)]">
                <p className="text-[11px] text-[#6B6355] leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  Financing simulation. No real funds. For demonstration only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
