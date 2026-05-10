import type { InvoiceStatus, RiskLevel } from '@/lib/types'

const STATUS_MAP: Record<InvoiceStatus, { color: string; bg: string; border: string }> = {
  Draft: { color: '#6B6355', bg: 'rgba(107,99,85,0.1)', border: 'rgba(107,99,85,0.2)' },
  'Documents Uploaded': { color: '#C8A96E', bg: 'rgba(200,169,110,0.08)', border: 'rgba(200,169,110,0.2)' },
  'Buyer Confirmed': { color: '#E8C97A', bg: 'rgba(232,201,122,0.08)', border: 'rgba(232,201,122,0.2)' },
  'Under Review': { color: '#C8A96E', bg: 'rgba(200,169,110,0.08)', border: 'rgba(200,169,110,0.2)' },
  Verified: { color: '#00C4B0', bg: 'rgba(0,196,176,0.08)', border: 'rgba(0,196,176,0.2)' },
  Funded: { color: '#00E5CF', bg: 'rgba(0,229,207,0.08)', border: 'rgba(0,229,207,0.2)' },
  Repaid: { color: '#00C4B0', bg: 'rgba(0,196,176,0.08)', border: 'rgba(0,196,176,0.2)' },
  Rejected: { color: '#FF4757', bg: 'rgba(255,71,87,0.08)', border: 'rgba(255,71,87,0.2)' },
}

const RISK_MAP: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  Low: { color: '#00C4B0', bg: 'rgba(0,196,176,0.08)', border: 'rgba(0,196,176,0.2)' },
  Medium: { color: '#C8A96E', bg: 'rgba(200,169,110,0.08)', border: 'rgba(200,169,110,0.2)' },
  High: { color: '#FF4757', bg: 'rgba(255,71,87,0.08)', border: 'rgba(255,71,87,0.2)' },
}

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const s = STATUS_MAP[status]
  return (
    <span
      className="tag"
      style={{
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        fontFamily: 'var(--font-mono)',
      }}
    >
      {status}
    </span>
  )
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const s = RISK_MAP[risk]
  return (
    <span
      className="tag"
      style={{
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        fontFamily: 'var(--font-mono)',
      }}
    >
      {risk} Risk
    </span>
  )
}
