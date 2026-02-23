import Link from 'next/link'
import { Brain, Zap, Users, TrendingUp, Star, ArrowRight, BarChart3, GitBranch, Lightbulb } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen animated-bg text-white overflow-hidden">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Brain className="w-8 h-8 text-indigo-400" />
          <span className="font-display font-bold text-xl">MindMesh</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#about" className="hover:text-white transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/register"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all btn-glow">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center pt-24 pb-20 px-6">
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-indigo-300 font-medium mb-8 animate-fade-in">
          <Zap className="w-3.5 h-3.5" />
          AI-Powered Idea Collaboration Platform
        </div>

        <h1 className="font-display font-black text-5xl md:text-7xl leading-tight mb-6 animate-slide-up">
          Where Great Ideas
          <br />
          <span className="gradient-text">Become Startups</span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in">
          Build visual idea graphs, collaborate in real-time, run AI-powered SWOT analysis,
          simulate revenue projections, and generate investor-ready pitch decks — all in one place.
        </p>

        <div className="flex items-center justify-center gap-4 animate-slide-up">
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all btn-glow">
            Start Building Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-2 glass text-white/80 hover:text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:bg-white/10">
            Sign In
          </Link>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 mt-16 flex-wrap">
          {[
            { value: '10K+', label: 'Ideas Built' },
            { value: '95%', label: 'User Satisfaction' },
            { value: '3min', label: 'Avg. Time to Insight' },
            { value: 'Free', label: 'To Get Started' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-black text-3xl gradient-text">{stat.value}</div>
              <div className="text-white/50 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl mb-4">Everything You Need to Launch</h2>
          <p className="text-white/50 text-lg">From first idea to investor pitch in minutes, not months.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title}
              className="glass-card p-6 group cursor-pointer">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-300 transition-colors">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl mb-4">Simple Pricing</h2>
          <p className="text-white/50 text-lg">Start free, scale when you're ready.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {PLANS.map((plan) => (
            <div key={plan.name}
              className={`glass-card p-8 ${plan.highlight ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/20' : ''}`}>
              {plan.highlight && (
                <div className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  <Star className="w-3 h-3" /> Most Popular
                </div>
              )}
              <h3 className="font-display font-bold text-2xl mb-2">{plan.name}</h3>
              <div className="font-display font-black text-5xl mb-1">
                {plan.price}<span className="text-xl text-white/40 font-normal">/mo</span>
              </div>
              <p className="text-white/50 text-sm mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className={`block text-center py-3 rounded-xl font-semibold transition-all ${plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 btn-glow'
                    : 'glass hover:bg-white/10'
                  }`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span className="font-display font-semibold text-white/60">MindMesh</span>
        </div>
        <p>© 2025 MindMesh. Built for founders who move fast.</p>
      </footer>
    </main>
  )
}

const FEATURES = [
  { icon: '🧠', title: 'Visual Idea Graphs', description: 'Build interactive node graphs to map your idea: problems, solutions, revenue streams, competitors, and more.' },
  { icon: '🤖', title: 'AI SWOT Analysis', description: 'One-click AI analysis returns a full SWOT breakdown, risk score, market viability assessment, and competitor summary.' },
  { icon: '📊', title: 'Revenue Simulation', description: 'Adjust pricing, country, and audience size to get 12-month revenue projections with break-even analysis.' },
  { icon: '🎤', title: 'Pitch Deck Generator', description: 'Automatically generate a 10-slide investor-ready pitch deck from your idea graph and analysis data.' },
  { icon: '👥', title: 'Team Collaboration', description: 'Invite collaborators to your idea rooms with role-based access (Editor/Viewer). Work together seamlessly.' },
  { icon: '⚡', title: 'Instant Insights', description: 'Go from blank canvas to data-driven startup analysis in under 3 minutes. Ship ideas faster than ever.' },
]

const PLANS = [
  {
    name: 'Free', price: '$0',
    description: 'Perfect for solo founders exploring ideas.',
    highlight: false,
    features: ['3 idea rooms', '5 graph nodes per room', 'Basic AI analysis', 'Personal dashboard'],
  },
  {
    name: 'Pro', price: '$29',
    description: 'For serious founders and teams.',
    highlight: true,
    features: ['Unlimited rooms', 'Unlimited nodes', 'Full AI analysis + history', 'Revenue simulation', 'Pitch deck generator', 'Team collaboration (5 members)', 'Priority support'],
  },
]
