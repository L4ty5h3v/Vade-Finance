import { MOCK_INVOICES, PLATFORM_STATS } from '@/lib/mockData'
import { formatCurrency } from '@/lib/utils'
import { StatusBadge, RiskBadge } from '@/components/ui/StatusBadge'
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter'

const KPI = [
  { label: 'Verified Volume', value: formatCurrency(PLATFORM_STATS.verifiedVolume), accent: '#C8A96E', sub: 'Total across 4 invoices' },
  { label: 'Avg Days Unlocked', value: `${PLATFORM_STATS.avgDaysUnlocked}d`, accent: '#00C4B0', sub: 'Earlier than maturity' },
  { label: 'Platform Fees', value: formatCurrency(PLATFORM_STATS.platformFees), accent: '#C8A96E', sub: '0.75% per invoice' },
  { label: 'Investor Return', value: formatCurrency(PLATFORM_STATS.investorReturn), accent: '#00C4B0', sub: 'Across funded invoices' },
]

const FLOW = ['Exporter', 'Documents', 'Verifier', 'Verified', 'Investor', 'Repayment']

const featured = MOCK_INVOICES[0]

export default function Overview() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'rgba(200,169,110,0.06)' }}>
        {KPI.map((c) => (
          <div key={c.label} className="p-6" style={{ background: '#0A0A12' }}>
            <p
              className="text-[10px] tracking-widest uppercase mb-3"
              style={{ fontFamily: 'var(--font-mono)', color: '#6B6355' }}
            >
              {c.label}
            </p>
            <p
              className="text-3xl font-black mb-1"
              style={{ fontFamily: 'var(--font-display)', color: c.accent }}
            >
              {c.value}
            </p>
            <p className="text-xs" style={{ fontFamily: 'var(--font-body)', color: '#6B6355' }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Workflow */}
      <div className="p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(200,169,110,0.08)' }}>
        <p
          className="text-[10px] tracking-widest uppercase mb-5"
          style={{ fontFamily: 'var(--font-mono)', color: '#6B6355' }}
        >
          Platform Workflow
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {FLOW.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className="px-3 py-1.5 text-xs font-bold tracking-wider uppercase"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: '#C8A96E',
                  background: 'rgba(200,169,110,0.06)',
                  border: '1px solid rgba(200,169,110,0.15)',
                }}
              >
                {step}
              </div>
              {i < FLOW.length - 1 && (
                <span style={{ color: 'rgba(200,169,110,0.3)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Featured invoice */}
      <div className="p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(200,169,110,0.08)' }}>
        <p
          className="text-[10px] tracking-widest uppercase mb-5"
          style={{ fontFamily: 'var(--font-mono)', color: '#6B6355' }}
        >
          Featured Invoice
        </p>
        <div className="flex flex-wrap items-start gap-8">
          <div className="flex-1 min-w-[220px] space-y-4">
            <div>
              <p className="text-2xl font-black text-[#F0E8D8] mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                {featured.exporter}
              </p>
              <p className="text-xs text-[#6B6355]" style={{ fontFamily: 'var(--font-body)' }}>
                {featured.exporterLocation} · {featured.exporterSector}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: '#C8A96E', fontFamily: 'var(--font-mono)', fontSize: 10 }}>→</span>
              <span className="font-semibold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-body)' }}>
                {featured.buyer}
              </span>
              <span className="text-[#6B6355] text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                ({featured.buyerCountry})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Invoice', value: formatCurrency(featured.amount), color: '#C8A96E' },
                { label: 'Term', value: `${featured.paymentTermDays} days`, color: '#F0E8D8' },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-[10px] text-[#6B6355] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>{f.label}</p>
                  <p className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: f.color }}>
                    {f.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={featured.status} />
              <RiskBadge risk={featured.riskLevel} />
            </div>
          </div>

          <ConfidenceMeter score={featured.confidenceScore} size="lg" />
        </div>
      </div>
    </div>
  )
}
