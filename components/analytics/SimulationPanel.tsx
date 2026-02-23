'use client'

// SimulationPanel - Revenue projection simulator with sliders for pricing, country, audience

import { useState, useTransition } from 'react'
import { runSimulation, type SimulationResult } from '@/actions/simulation'
import { Loader2, TrendingUp, DollarSign, Target, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'

const COUNTRIES = [
  'United States', 'United Kingdom', 'Germany', 'Canada',
  'Australia', 'France', 'India', 'Brazil', 'Japan',
]

const AUDIENCE_LABELS: Record<number, string> = {
  1000: '1K', 10000: '10K', 50000: '50K', 100000: '100K',
  500000: '500K', 1000000: '1M', 5000000: '5M', 10000000: '10M',
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

interface Props {
  roomId: string
  roomName: string
}

export function SimulationPanel({ roomId, roomName }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pricing, setPricing] = useState(29)
  const [country, setCountry] = useState('United States')
  const [audience, setAudience] = useState(10000)
  const [result, setResult] = useState<SimulationResult | null>(null)

  function calculate() {
    startTransition(async () => {
      try {
        const data = await runSimulation({ roomId, pricing, country, audienceSize: audience })
        setResult(data)
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Simulation failed')
      }
    })
  }

  const chartData = result?.monthly.map((revenue, i) => ({
    month: `M${i + 1}`,
    revenue,
  })) ?? []

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Revenue Simulation</h2>
        <p className="text-white/50 text-sm mt-1">Adjust parameters and calculate 12-month projections</p>
      </div>

      {/* Controls */}
      <div className="glass-card p-6 space-y-6">
        {/* Pricing */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/70 text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Monthly Price
            </label>
            <span className="font-display font-bold text-white text-lg">${pricing}/mo</span>
          </div>
          <input type="range" min={1} max={999} value={pricing}
            onChange={(e) => setPricing(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>$1</span><span>$999</span>
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="text-white/70 text-sm font-medium flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-blue-400" />
            Target Country
          </label>
          <div className="grid grid-cols-3 gap-2">
            {COUNTRIES.map((c) => (
              <button key={c} onClick={() => setCountry(c)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${country === c
                    ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/40'
                    : 'glass text-white/50 hover:text-white hover:bg-white/10'
                  }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/70 text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Addressable Audience
            </label>
            <span className="font-display font-bold text-white text-lg">
              {AUDIENCE_LABELS[audience] ?? audience.toLocaleString()}
            </span>
          </div>
          <input type="range" min={0} max={7}
            value={Object.keys(AUDIENCE_LABELS).indexOf(String(audience))}
            onChange={(e) => {
              const keys = Object.keys(AUDIENCE_LABELS).map(Number)
              setAudience(keys[Number(e.target.value)] ?? 10000)
            }}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
        </div>

        <button onClick={calculate} disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-all btn-glow">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          {isPending ? 'Calculating…' : 'Calculate Projections'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '12-Month Revenue', value: formatCurrency(result.totalRevenue), icon: DollarSign, color: 'text-green-400' },
              { label: 'Break-Even Month', value: `Month ${result.breakEvenMonth}`, icon: Target, color: 'text-yellow-400' },
              { label: 'MoM Growth', value: `${result.growthRate}%`, icon: TrendingUp, color: 'text-indigo-400' },
              { label: 'Customer LTV', value: formatCurrency(result.ltv), icon: Users, color: 'text-purple-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                <div className={`font-display font-bold text-xl ${color}`}>{value}</div>
                <div className="text-white/40 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Monthly Revenue Projection
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 0, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                    contentStyle={{ background: 'rgba(15,12,41,0.9)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '0.75rem', color: '#f1f5f9' }}
                  />
                  <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
