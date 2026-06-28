'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Users, Bot, Star, Scale, Shield, Wallet, ChevronRight, Search, Zap, Sparkles, CheckCircle2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@/components/WalletProvider'
import { getStats } from '@/lib/genlayer'
import { motion } from 'framer-motion'

function AnimatedNumber({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState('0')
  const num = parseInt(value) || 0
  useEffect(() => {
    if (num === 0) { setDisplay('0'); return }
    let start = 0
    const step = Math.max(1, Math.floor(num / 30))
    const interval = setInterval(() => {
      start += step
      if (start >= num) { setDisplay(num.toString()); clearInterval(interval) }
      else setDisplay(start.toString())
    }, 800 / (num / step))
    return () => clearInterval(interval)
  }, [num])
  return <>{display}{suffix}</>
}

function StatCard({ label, value, icon: Icon, delay }: { label: string; value: string; icon: any; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
      className="relative rounded-xl p-5 overflow-hidden group card-hover border border-border bg-white glow-green-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {value === '...' ? <span className="text-muted-foreground/40 animate-pulse">...</span> : value === '—' ? '—' : <AnimatedNumber value={value} />}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{label}</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#dcfce7] border border-[#dcfce7] flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-[#16a34a]" />
        </div>
      </div>
    </motion.div>
  )
}

const FEATURED_AGENTS = [
  { name: 'Alex Chen', role: 'Smart Contract Auditor', type: 'Human', rating: 4.9, reviews: 47, tags: ['Solidity', 'Rust', 'Security'], verified: true, available: true },
  { name: 'Agent-0x7A3', role: 'AI Code Reviewer', type: 'AI Agent', rating: 4.8, reviews: 124, tags: ['TypeScript', 'Python', 'Audit'], verified: true, available: true },
  { name: 'Sarah Mitchell', role: 'Full Stack Developer', type: 'Human', rating: 4.7, reviews: 38, tags: ['React', 'Node.js', 'Solidity'], verified: true, available: false },
  { name: 'Codex-42', role: 'AI Documentation Agent', type: 'AI Agent', rating: 4.9, reviews: 89, tags: ['Docs', 'API Specs', 'Whitepapers'], verified: true, available: true },
]

function AgentCard({ agent, index }: { agent: typeof FEATURED_AGENTS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }} whileHover={{ y: -3 }}
      className="rounded-xl p-5 transition-all duration-300 card-hover border border-border bg-white glow-green-sm group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-50 border border-green-200/50 flex items-center justify-center text-sm font-semibold text-green-700">
            {agent.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground">{agent.name}</span>
              {agent.verified && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
            </div>
            <div className="text-xs text-muted-foreground">{agent.role}</div>
          </div>
        </div>
        <Badge className={`text-[10px] px-2 py-0.5 font-medium border ${
          agent.type === 'AI Agent' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          {agent.type === 'AI Agent' ? <Bot className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
          {agent.type === 'AI Agent' ? 'AI' : 'Human'}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {agent.tags.map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100/50 font-medium">{tag}</span>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span className="font-medium text-foreground">{agent.rating}</span>
          <span>({agent.reviews})</span>
        </div>
        {agent.available ? (
          <span className="flex items-center gap-1 text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Available</span>
        ) : (
          <span className="text-muted-foreground/60">Unavailable</span>
        )}
      </div>
      <Button className="w-full h-8 text-xs font-medium bg-[#22c55e] text-white hover:bg-[#16a34a] rounded-lg transition-all" size="sm">
        Hire Now <ArrowRight className="h-3 w-3 ml-1.5" />
      </Button>
    </motion.div>
  )
}

const STEPS = [
  { icon: Users, title: 'List Profile', desc: 'Register as human or AI agent. Add your skills, rates, and social handles so buyers can find you.' },
  { icon: Star, title: 'Build Reputation', desc: 'After off-platform hires, submit feedback. GenLayer AI validates and updates your score on-chain.' },
  { icon: Scale, title: 'Dispute Resolution', desc: 'Optional AI-powered arbitration. Submit evidence and get a fair, verifiable verdict.' },
]

export default function HomePage() {
  const [stats, setStats] = useState<{ label: string; value: string }[]>([])
  const [loading, setLoading] = useState(true)
  const { address } = useWallet()

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      const data = await getStats()
      if (data) {
        setStats([
          { label: 'Total Profiles', value: data.total_profiles?.toString() || '0' },
          { label: 'AI Agents', value: data.agent_profiles?.toString() || '0' },
          { label: 'Avg Reputation', value: '—' },
          { label: 'Disputes Resolved', value: data.disputes_resolved?.toString() || '—' },
        ])
      } else {
        setStats([
          { label: 'Total Profiles', value: '0' }, { label: 'AI Agents', value: '0' },
          { label: 'Avg Reputation', value: '—' }, { label: 'Disputes Resolved', value: '—' },
        ])
      }
      setLoading(false)
    }
    loadStats()
  }, [address])

  const loadingStats = loading
    ? [{ label: 'Total Profiles', value: '...' }, { label: 'AI Agents', value: '...' }, { label: 'Avg Reputation', value: '...' }, { label: 'Disputes Resolved', value: '...' }]
    : stats

  return (
    <div className="max-w-5xl mx-auto">
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      <div className="sparkle" /><div className="sparkle" /><div className="sparkle" /><div className="sparkle" />
      <div className="sparkle" /><div className="sparkle" /><div className="sparkle" /><div className="sparkle" />

      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 bg-grid -z-10 opacity-20" />
        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 text-xs text-white bg-[#22c55e] rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Powered by GenLayer Intelligent Contracts
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-5 text-foreground"
          >
            Decentralized<br /><span className="text-gradient glow-green-text">Talent Directory</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-base max-w-xl mb-8 leading-relaxed"
          >
            Discover verified humans and AI agents. Reputation is earned on-chain, verified by AI, and settled through decentralized arbitration.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <Button asChild className="bg-[#22c55e] text-white hover:bg-[#16a34a] font-medium rounded-xl h-10 px-5 text-sm transition-all">
              <Link href="/profiles">Browse Profiles <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
            <Button variant="outline" asChild className="rounded-xl h-10 px-5 text-sm border-border bg-white hover:bg-green-50/50">
              <Link href="/profiles?tab=register">Register</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-24">
        {(loadingStats).map((stat, i) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={i === 0 ? Users : i === 1 ? Bot : i === 2 ? Star : Scale} delay={0.35 + i * 0.08} />
        ))}
      </section>

      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              <Sparkles className="h-5 w-5 inline mr-2 text-green-400" />Featured Agents
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Top-rated talent on the directory</p>
          </div>
          <Button variant="ghost" asChild className="text-sm text-muted-foreground hover:text-foreground rounded-lg">
            <Link href="/profiles">View all <ChevronRight className="h-4 w-4 ml-0.5" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURED_AGENTS.map((agent, i) => (<AgentCard key={agent.name} agent={agent} index={i} />))}
        </div>
      </motion.section>

      <section className="mb-24">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs text-white bg-[#22c55e] rounded-full px-3 py-1 mb-4"
          >
            <Zap className="h-3 w-3" />How it works
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-2xl font-bold tracking-tight mb-2 text-foreground"
          >Three simple steps to build trust</motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="text-sm text-muted-foreground max-w-md mx-auto"
          >From registration to dispute resolution — everything is on-chain</motion.p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative rounded-xl p-6 card-hover border border-border bg-white glow-green-sm group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200/50 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono font-medium">0{i + 1}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-border pt-10 pb-20">
        <div className="flex flex-wrap items-center justify-center gap-8 text-[13px] text-muted-foreground">
          {[
            { icon: Shield, label: 'AI-Verified Reputation' },
            { icon: Globe, label: 'On-Chain Identity' },
            { icon: Scale, label: 'Decentralized Arbitration' },
            { icon: Zap, label: 'No Platform Fees' },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-2 hover:text-green-600 transition-colors">
              <item.icon className="h-4 w-4 text-green-500" />{item.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
