'use client'

import { useRouter } from 'next/navigation'

export default function FinalCTA() {
  const router = useRouter()

  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative overflow-hidden px-12 py-20 text-center"
          style={{
            background: 'rgba(200,169,110,0.03)',
            border: '1px solid rgba(200,169,110,0.12)',
          }}
        >
          {/* Corner ornaments */}
          {[
            'top-0 left-0',
            'top-0 right-0 rotate-90',
            'bottom-0 right-0 rotate-180',
            'bottom-0 left-0 -rotate-90',
          ].map((cls, i) => (
            <div key={i} className={`absolute ${cls} w-8 h-8`}>
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                <path d="M0 0 L16 0 L16 2 L2 2 L2 16 L0 16 Z" fill="rgba(200,169,110,0.4)" />
              </svg>
            </div>
          ))}

          {/* Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(200,169,110,0.06) 0%, transparent 70%)' }}
          />

          <div className="relative">
            <p
              className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] mb-6"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Get started
            </p>

            <h2
              className="text-5xl md:text-6xl font-extrabold text-[#F0E8D8] mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Unlock capital from
              <br />
              <span className="shimmer">verified invoices.</span>
            </h2>

            <p
              className="text-sm text-[#6B6355] mb-10 max-w-lg mx-auto"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              ExportFlow TR connects Turkish exporters, trusted verifiers, and investors in a single financing workflow.
            </p>

            <button
              onClick={() => router.push('/app')}
              className="group relative px-10 py-4 text-sm font-bold tracking-widest uppercase overflow-hidden"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <div className="absolute inset-0 bg-[#C8A96E]" />
              <div className="absolute inset-0 bg-[#E8C97A] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative text-[#06060A]">Open App →</span>
            </button>
          </div>
        </div>

        <p
          className="text-center text-[11px] text-[#6B6355]/40 mt-8"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Frontend MVP · Mock data only · No real financial product · For demonstration purposes
        </p>
      </div>
    </section>
  )
}
