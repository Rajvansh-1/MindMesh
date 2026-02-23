'use client'

// AnalysisPanel - Displays SWOT analysis, risk score, market viability, and AI analysis trigger

import { useState } from 'react'
import { analyzeIdea } from '@/actions/ai'
import { Loader2, Zap, TrendingUpIcon, AlertTriangle, Target, DollarSign, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import type { AnalysisResult } from '@/lib/ai'

interface Report {
  id: string
  strengths: string
  weaknesses: string
  opportunities: string
  threats: string
  riskScore: number
  marketViability: string
  revenueEstimate: string
  competitorSummary: string
  createdAt: Date
}

interface Props {
  roomId: string
  latestReport: Report | null
}

export function AnalysisPanel({ roomId, latestReport }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(
    latestReport ? {
      strengths: JSON.parse(latestReport.strengths),
      weaknesses: JSON.parse(latestReport.weaknesses),
      opportunities: JSON.parse(latestReport.opportunities),
      threats: JSON.parse(latestReport.threats),
      riskScore: latestReport.riskScore,
      marketViability: latestReport.marketViability as 'LOW' | 'MEDIUM' | 'HIGH',
      revenueEstimate: latestReport.revenueEstimate,
      competitorSummary: latestReport.competitorSummary,
    } : null
  )

  async function runAnalysis() {
    setLoading(true)
    try {
      const data = await analyzeIdea(roomId)
      setResult(data)
      toast.success('AI analysis complete! 🧠')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header + Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">AI Analysis</h2>
          <p className="text-white/50 text-sm mt-1">
            {result ? 'Click Analyze to refresh with a new analysis' : 'Run AI analysis on your idea graph'}
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all btn-glow"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? 'Analyzing…' : 'Analyze Idea'}
        </button>
      </div>

      {loading && (
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-white/60">AI is analyzing your idea graph…</p>
          <div className="flex gap-2 justify-center mt-4">
            {['Scanning nodes', 'SWOT analysis', 'Market research', 'Risk assessment'].map((step) => (
              <span key={step} className="skeleton text-xs px-3 py-1 rounded-full text-transparent">{step}</span>
            ))}
          </div>
        </div>
      )}

      {!loading && !result && (
        <div className="glass-card p-16 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="font-display font-bold text-xl text-white mb-2">No Analysis Yet</h3>
          <p className="text-white/50 text-sm mb-6">
            Add at least one node to your graph, then click &ldquo;Analyze Idea&rdquo; above
          </p>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Score Cards Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-5 text-center">
              <div className={`text-4xl font-black font-display ${result.riskScore < 40 ? 'text-green-400'
                  : result.riskScore < 70 ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>{result.riskScore}</div>
              <div className="text-white/50 text-sm mt-1">Risk Score</div>
              <div className="text-xs text-white/30 mt-0.5">Lower is safer</div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className={`text-2xl font-black font-display ${result.marketViability === 'HIGH' ? 'text-green-400'
                  : result.marketViability === 'MEDIUM' ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>{result.marketViability}</div>
              <div className="text-white/50 text-sm mt-1">Market Viability</div>
            </div>
            <div className="glass-card p-5 text-center">
              <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-2" />
              <div className="text-white font-semibold text-sm">{result.revenueEstimate}</div>
              <div className="text-white/50 text-xs mt-0.5">Revenue Estimate</div>
            </div>
          </div>

          {/* SWOT Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'strengths', label: '💪 Strengths', color: 'text-green-300', border: 'border-green-500/30', bg: 'bg-green-500/10' },
              { key: 'weaknesses', label: '⚠️ Weaknesses', color: 'text-yellow-300', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
              { key: 'opportunities', label: '🚀 Opportunities', color: 'text-blue-300', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
              { key: 'threats', label: '🛡 Threats', color: 'text-red-300', border: 'border-red-500/30', bg: 'bg-red-500/10' },
            ].map(({ key, label, color, border, bg }) => (
              <div key={key} className={`glass-card p-5 border ${border} ${bg}`}>
                <h3 className={`font-semibold text-sm mb-3 ${color}`}>{label}</h3>
                <ul className="space-y-2">
                  {(result[key as keyof AnalysisResult] as string[]).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Competitor Summary */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Competitor Summary</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{result.competitorSummary}</p>
          </div>
        </>
      )}
    </div>
  )
}
