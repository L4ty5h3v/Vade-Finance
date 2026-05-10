'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency, calculateAdvanceAmount, calculateInvestorReturn, calculatePlatformFee, calculateAnnualizedReturn } from '@/lib/utils'

const DEFAULT = {
  invoiceAmount: 50000,
  advanceRate: 85,
  paymentTermDays: 60,
  investorFeePct: 3,
  platformFeePct: 0.75,
  verifierFee: 150,
}

export default function DealEconomics() {
  const [form, setForm] = useState(DEFAULT)

  function update(key: keyof typeof DEFAULT, value: number) {
    setForm(f => ({ ...f, [key]: value }))
  }

  const calc = useMemo(() => {
    const advance = calculateAdvanceAmount(form.invoiceAmount, form.advanceRate)
    const investorReturn = calculateInvestorReturn(advance, form.investorFeePct, form.paymentTermDays)
    const platformRevenue = calculatePlatformFee(form.invoiceAmount, form.platformFeePct)
    const verifierRevenue = form.verifierFee
    const totalCost = investorReturn + platformRevenue + verifierRevenue
    const annualized = calculateAnnualizedReturn(investorReturn, advance, form.paymentTermDays)
    return { advance, investorReturn, platformRevenue, verifierRevenue, totalCost, annualized }
  }, [form])

  const chartData = [
    { name: 'Exporter\nReceives', value: calc.advance, color: '#6366f1' },
    { name: 'Investor\nReturn', value: calc.investorReturn, color: '#10b981' },
    { name: 'Platform\nFee', value: calc.platformRevenue, color: '#f59e0b' },
    { name: 'Verifier\nFee', value: calc.verifierRevenue, color: '#60a5fa' },
  ]

  const sliderCls = 'w-full h-1.5 rounded-full accent-indigo-500 bg-white/10 cursor-pointer'
  const inputCls = 'w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white text-right focus:outline-none focus:border-indigo-500/60 tabular-nums'
  const labelCls = 'text-sm text-zinc-400'

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-lg font-bold text-white mb-6">Deal Economics Calculator</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          {[
            { key: 'invoiceAmount' as const, label: 'Invoice Amount', min: 5000, max: 500000, step: 1000, fmt: (v: number) => formatCurrency(v) },
            { key: 'advanceRate' as const, label: 'Advance Rate', min: 50, max: 95, step: 1, fmt: (v: number) => `${v}%` },
            { key: 'paymentTermDays' as const, label: 'Payment Term', min: 15, max: 120, step: 5, fmt: (v: number) => `${v} days` },
            { key: 'investorFeePct' as const, label: 'Investor Fee', min: 0.5, max: 10, step: 0.25, fmt: (v: number) => `${v}%` },
            { key: 'platformFeePct' as const, label: 'Platform Fee', min: 0.1, max: 3, step: 0.05, fmt: (v: number) => `${v}%` },
            { key: 'verifierFee' as const, label: 'Verifier Fee', min: 50, max: 500, step: 25, fmt: (v: number) => formatCurrency(v) },
          ].map(({ key, label, min, max, step, fmt }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>{label}</label>
                <span className="text-sm font-semibold text-white tabular-nums">{fmt(form[key])}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={form[key]}
                onChange={e => update(key, parseFloat(e.target.value))}
                className={sliderCls}
              />
            </div>
          ))}
        </div>

        {/* Outputs */}
        <div className="space-y-4">
          {/* Chart */}
          <div className="h-48 p-4 rounded-2xl bg-white/3 border border-white/8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(v) => [formatCurrency(Number(v)), '']}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary cards */}
          {[
            { label: 'Exporter Receives Now', value: formatCurrency(calc.advance), color: 'text-indigo-400', bar: '#6366f1', pct: calc.advance / form.invoiceAmount },
            { label: 'Investor Expected Profit', value: formatCurrency(calc.investorReturn), color: 'text-emerald-400', bar: '#10b981', pct: calc.investorReturn / form.invoiceAmount },
            { label: 'Platform Revenue', value: formatCurrency(calc.platformRevenue), color: 'text-amber-400', bar: '#f59e0b', pct: calc.platformRevenue / form.invoiceAmount },
            { label: 'Verifier Revenue', value: formatCurrency(calc.verifierRevenue), color: 'text-blue-400', bar: '#60a5fa', pct: calc.verifierRevenue / form.invoiceAmount },
            { label: 'Total Cost to Exporter', value: formatCurrency(calc.totalCost), color: 'text-red-400', bar: '#f87171', pct: calc.totalCost / form.invoiceAmount },
            { label: 'Annualized Investor Return', value: `${calc.annualized}%`, color: 'text-emerald-400', bar: '#10b981', pct: calc.annualized / 100 },
          ].map(c => (
            <div key={c.label} className="p-3 rounded-xl bg-white/3 border border-white/8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">{c.label}</p>
                <p className={`text-sm font-bold tabular-nums ${c.color}`}>{c.value}</p>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, c.pct * 100)}%`, background: c.bar }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
