import type { InvoiceStatus, RiskLevel } from './types'

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateAdvanceAmount(invoiceAmount: number, advanceRate: number): number {
  return Math.round(invoiceAmount * (advanceRate / 100))
}

export function calculateInvestorReturn(
  advanceAmount: number,
  investorFeePct: number,
  paymentTermDays: number
): number {
  return Math.round(advanceAmount * (investorFeePct / 100) * (paymentTermDays / 365))
}

export function calculatePlatformFee(invoiceAmount: number, platformFeePct: number): number {
  return Math.round(invoiceAmount * (platformFeePct / 100))
}

export function calculateTotalCostToExporter(
  invoiceAmount: number,
  advanceAmount: number,
  investorReturn: number,
  platformFee: number,
  verifierFee: number
): number {
  return invoiceAmount - advanceAmount + investorReturn + platformFee + verifierFee
}

export function calculateAnnualizedReturn(
  profit: number,
  principal: number,
  days: number
): number {
  if (principal === 0 || days === 0) return 0
  return Math.round(((profit / principal) * (365 / days)) * 10000) / 100
}

export function generateFakeHash(): string {
  const chars = '0123456789abcdef'
  const start = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const end = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `0x${start}...${end}`
}

export function getStatusColor(status: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    Draft: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
    'Documents Uploaded': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'Buyer Confirmed': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    'Under Review': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    Verified: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    Funded: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Repaid: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
    Rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  }
  return map[status]
}

export function getRiskColor(risk: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    Low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    High: 'text-red-400 bg-red-400/10 border-red-400/20',
  }
  return map[risk]
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
