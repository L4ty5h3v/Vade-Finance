'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const Pipeline3D = dynamic(() => import('./Pipeline3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="text-xs tracking-widest uppercase animate-pulse"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-dim)' }}
      >
        Loading pipeline...
      </div>
    </div>
  ),
})

export default function Hero() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg opacity-100" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(6,6,10,0.6) 70%, rgba(6,6,10,1) 100%)',
        }}
      />

      {/* Gold glow center */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 700,
          height: 350,
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(200,169,110,0.06) 0%, transparent 70%)',
          animation: 'pulse-glow 6s ease-in-out infinite',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
      >
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-3 mb-10"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.1s' }}
        >
          <div className="h-px w-8 bg-[#C8A96E]/40" />
          <span
            className="text-[10px] tracking-[0.25em] uppercase text-[#C8A96E]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Solana-ready · Demo MVP · Turkish Export Finance
          </span>
          <div className="h-px w-8 bg-[#C8A96E]/40" />
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl lg:text-[88px] font-extrabold leading-[0.95] tracking-tight mb-8"
          style={{
            fontFamily: 'var(--font-display)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s',
          }}
        >
          <span className="text-[#F0E8D8]">Turn verified</span>
          <br />
          <span className="shimmer">export invoices</span>
          <br />
          <span className="text-[#F0E8D8]">into capital</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-base md:text-lg text-[#6B6355] max-w-xl mx-auto mb-12 leading-relaxed"
          style={{
            fontFamily: 'var(--font-body)',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease 0.4s',
          }}
        >
          ExportFlow TR helps Turkish exporters unlock early capital after buyer
          confirmation — without waiting 30–90 days.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease 0.5s',
          }}
        >
          <button
            onClick={() => router.push('/app')}
            className="group relative px-8 py-4 text-sm font-bold tracking-widest uppercase overflow-hidden"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <div className="absolute inset-0 bg-[#C8A96E]" />
            <div className="absolute inset-0 bg-[#E8C97A] translate-x-full group-hover:translate-x-0 transition-transform duration-400" />
            <span className="relative text-[#06060A]">Open App</span>
          </button>

          <a
            href="#flow"
            className="px-8 py-4 text-sm font-bold tracking-widest uppercase border border-[#C8A96E]/25 text-[#C8A96E]/60 hover:text-[#C8A96E] hover:border-[#C8A96E]/50 transition-all duration-300"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Explore the Flow ↓
          </a>
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        className="relative z-10 w-full max-w-6xl mx-auto mt-14"
        style={{
          height: 440,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1.2s ease 0.6s',
        }}
      >
        <Pipeline3D />
      </div>

      {/* Stage labels */}
      <div
        className="relative z-10 w-full max-w-4xl mx-auto px-6 mt-4 grid grid-cols-3 text-center"
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.8s ease 0.8s',
        }}
      >
        {[
          { label: 'Invoice Artifact', desc: 'Buyer-confirmed export invoice' },
          { label: 'Verification Engine', desc: 'Trusted verifier + confidence score' },
          { label: 'Funding Node', desc: 'Working capital unlocked' },
        ].map((s) => (
          <div key={s.label} className="px-4">
            <p
              className="text-[10px] font-bold tracking-widest uppercase mb-1"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}
            >
              {s.label}
            </p>
            <p className="text-[11px] text-[#6B6355]" style={{ fontFamily: 'var(--font-body)' }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: mounted ? 0.4 : 0, transition: 'opacity 0.8s ease 1s' }}
      >
        <div
          className="w-px h-12 bg-gradient-to-b from-[#C8A96E]/0 via-[#C8A96E]/60 to-[#C8A96E]/0"
          style={{ animation: 'float 2s ease-in-out infinite' }}
        />
      </div>
    </section>
  )
}
