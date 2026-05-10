'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? 'rgba(6,6,10,0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(200,169,110,0.1)' : '1px solid transparent',
      }}
    >
      <div className="flex items-center justify-between px-8 md:px-16 h-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-[#C8A96E] to-[#7A6340] opacity-20" />
            <div className="absolute inset-0 rounded-md border border-[#C8A96E]/30 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L6 3L10 7L6 11L2 7Z" stroke="#C8A96E" strokeWidth="1.2" />
                <path d="M6 7L10 3L14 7" stroke="#C8A96E" strokeWidth="1.2" opacity="0.5" />
              </svg>
            </div>
          </div>
          <span
            className="text-sm font-bold tracking-wider text-[#F0E8D8] uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ExportFlow TR
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {[
            { label: 'Flow', href: '#flow' },
            { label: 'Deal', href: '#deal-example' },
            { label: 'Proof', href: '#proof-layer' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs tracking-widest uppercase font-mono-data text-[#6B6355] hover:text-[#C8A96E] transition-colors duration-300"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <button
          onClick={() => router.push('/app')}
          className="relative group px-5 py-2 text-xs font-bold tracking-widest uppercase overflow-hidden"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <div className="absolute inset-0 border border-[#C8A96E]/40 group-hover:border-[#C8A96E]/80 transition-colors duration-300" />
          <div className="absolute inset-0 bg-[#C8A96E] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative text-[#C8A96E] group-hover:text-[#06060A] transition-colors duration-300">
            Open App
          </span>
        </button>
      </div>
    </header>
  )
}
