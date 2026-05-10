'use client'

import Link from 'next/link'
import type { AppTab } from '@/lib/types'

const TABS: { id: AppTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'exporter', label: 'Exporter' },
  { id: 'verifier', label: 'Verifier' },
  { id: 'investor', label: 'Investor' },
  { id: 'deal-economics', label: 'Economics' },
  { id: 'solana-proof', label: 'Solana Proof' },
  { id: 'demo-flow', label: 'Demo Flow' },
]

interface AppHeaderProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  onCreateInvoice: () => void
}

export default function AppHeader({ activeTab, onTabChange, onCreateInvoice }: AppHeaderProps) {
  return (
    <div
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(6,6,10,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(200,169,110,0.1)',
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-6 h-6 flex items-center justify-center"
              style={{ border: '1px solid rgba(200,169,110,0.3)', background: 'rgba(200,169,110,0.06)' }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L6 3L10 7L6 11L2 7Z" stroke="#C8A96E" strokeWidth="1.2" />
                <path d="M6 7L10 3L14 7" stroke="#C8A96E" strokeWidth="1.2" opacity="0.4" />
              </svg>
            </div>
            <span
              className="text-xs font-bold tracking-wider uppercase text-[#F0E8D8] group-hover:text-[#C8A96E] transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ExportFlow TR
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className="tag"
              style={{
                background: 'rgba(200,169,110,0.08)',
                color: '#C8A96E',
                border: '1px solid rgba(200,169,110,0.2)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Demo
            </span>
            <span
              className="tag"
              style={{
                background: 'rgba(0,196,176,0.08)',
                color: '#00C4B0',
                border: '1px solid rgba(0,196,176,0.2)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Solana-ready
            </span>
          </div>
        </div>

        <button
          onClick={onCreateInvoice}
          className="group relative px-4 py-2 text-xs font-bold tracking-widest uppercase overflow-hidden"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <div className="absolute inset-0 border border-[#C8A96E]/30 group-hover:border-[#C8A96E]/70 transition-colors" />
          <div className="absolute inset-0 bg-[#C8A96E] translate-y-full group-hover:translate-y-0 transition-transform duration-250" />
          <span className="relative text-[#C8A96E] group-hover:text-[#06060A] transition-colors">
            + Create Invoice
          </span>
        </button>
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center overflow-x-auto px-6"
        style={{ borderTop: '1px solid rgba(200,169,110,0.06)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative px-4 py-3 text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-colors"
            style={{
              fontFamily: 'var(--font-mono)',
              color: activeTab === tab.id ? '#C8A96E' : '#6B6355',
            }}
          >
            {activeTab === tab.id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, #C8A96E, transparent)' }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
