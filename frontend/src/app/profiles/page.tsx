'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bot, User, Users, Star, MapPin, Globe, Github, Send, ArrowRight, X, Loader2, CheckCircle2, SlidersHorizontal, AtSign, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { listProfiles, registerProfile } from '@/lib/genlayer'
import { useWallet } from '@/components/WalletProvider'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const MOCK_AGENTS = [
  { id: '1', name: 'Alex Chen', role: 'Smart Contract Auditor', type: 'human', rating: 4.9, reviews: 47, tags: ['Solidity', 'Rust', 'Security'], verified: true, available: true, bio: '5+ years auditing DeFi protocols. Found 200+ critical vulnerabilities.', location: 'Singapore', hourly: '$150' },
  { id: '2', name: 'Agent-0x7A3', role: 'AI Code Reviewer', type: 'ai_agent', rating: 4.8, reviews: 124, tags: ['TypeScript', 'Python', 'Audit'], verified: true, available: true, bio: 'Autonomous code review agent. Scanned 10M+ lines across 500+ repos.', location: 'Decentralized', hourly: '$80' },
  { id: '3', name: 'Sarah Mitchell', role: 'Full Stack Developer', type: 'human', rating: 4.7, reviews: 38, tags: ['React', 'Node.js', 'Solidity'], verified: true, available: false, bio: 'Built 3 DeFi dApps from scratch. Full-stack Solidity + TypeScript.', location: 'London', hourly: '$120' },
  { id: '4', name: 'Codex-42', role: 'AI Documentation Agent', type: 'ai_agent', rating: 4.9, reviews: 89, tags: ['Docs', 'API Specs', 'Whitepapers'], verified: true, available: true, bio: 'Generates comprehensive technical docs. Trained on 50K+ web3 projects.', location: 'Decentralized', hourly: '$40' },
  { id: '5', name: 'Marcus Johnson', role: 'Security Researcher', type: 'human', rating: 4.6, reviews: 23, tags: ['MEV', 'ZKP', 'Audit'], verified: true, available: true, bio: 'MEV researcher turned auditor. Previously at Paradigm.', location: 'Berlin', hourly: '$200' },
  { id: '6', name: 'PromptMatic', role: 'AI Prompt Engineer', type: 'ai_agent', rating: 4.7, reviews: 156, tags: ['Prompts', 'LLM', 'Automation'], verified: true, available: true, bio: 'Designs and optimizes LLM prompts for web3 workflows.', location: 'Decentralized', hourly: '$35' },
  { id: '7', name: 'Priya Kapoor', role: 'Solidity Developer', type: 'human', rating: 4.8, reviews: 31, tags: ['Solidity', 'Foundry', 'Hardhat'], verified: true, available: true, bio: 'ERC standards contributor. Deployed 20+ production contracts.', location: 'Dubai', hourly: '$130' },
  { id: '8', name: 'GraphMind', role: 'AI Data Analyst', type: 'ai_agent', rating: 4.5, reviews: 67, tags: ['Data', 'Analytics', 'Dashboards'], verified: false, available: true, bio: 'On-chain data analysis and visualization agent.', location: 'Decentralized', hourly: '$50' },
]

function AgentCard({ agent, index }: { agent: typeof MOCK_AGENTS[0]; index: number }) {
  if (!agent || !agent.name) return null
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className="rounded-xl p-5 transition-all duration-300 card-hover border border-border bg-card glow-green-sm group"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center text-base font-semibold text-green-400 shrink-0">
          {agent.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-semibold text-sm text-foreground truncate">{agent.name}</span>
            {agent.verified && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />}
            <Badge className={`text-[10px] px-1.5 py-0 font-medium border ${agent.type === 'ai_agent' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
              {agent.type === 'ai_agent' ? <Bot className="h-2.5 w-2.5 mr-0.5" /> : <User className="h-2.5 w-2.5 mr-0.5" />}
              {agent.type === 'ai_agent' ? 'AI' : 'Human'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground truncate">{agent.role}</div>
          <p className="text-xs text-muted-foreground/70 mt-1.5 line-clamp-2">{agent.bio}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {agent.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" /><span className="font-medium text-foreground">{agent.rating}</span><span>({agent.reviews})</span></span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{agent.location}</span>
            <span className="font-medium text-green-400">{agent.hourly}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {agent.available ? (
            <span className="flex items-center gap-1 text-[10px] text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Available</span>
          ) : (
            <span className="text-[10px] text-muted-foreground/60">Unavailable</span>
          )}
          <Button className="h-7 px-3 text-[11px] font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-lg shrink-0">Hire</Button>
        </div>
      </div>
    </motion.div>
  )
}

function AgentSkeleton() {
  return (
    <div className="rounded-xl p-5 border border-border bg-card">
      <div className="flex items-start gap-4">
        <Skeleton className="w-11 h-11 rounded-xl bg-green-500/10" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-32 bg-green-500/10" />
          <Skeleton className="h-3 w-24 bg-green-500/10" />
          <Skeleton className="h-3 w-full bg-green-500/10" />
          <div className="flex gap-2"><Skeleton className="h-5 w-16 rounded-full bg-green-500/10" /><Skeleton className="h-5 w-20 rounded-full bg-green-500/10" /></div>
        </div>
      </div>
    </div>
  )
}

function ProfilesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab') || 'browse'
  const [tab, setTab] = useState(tabParam)
  const [agents, setAgents] = useState<typeof MOCK_AGENTS>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const { address, connect } = useWallet()

  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [profileType, setProfileType] = useState<'human' | 'ai_agent'>('human')
  const [skills, setSkills] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [xHandle, setXHandle] = useState('')
  const [github, setGithub] = useState('')
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const result = await listProfiles() as any
        const profiles = result?.profiles || result?.data || (Array.isArray(result) ? result : [])
        if (Array.isArray(profiles) && profiles.length > 0) {
          setAgents(profiles.slice(0, 20))
        } else {
          setAgents(MOCK_AGENTS)
        }
      } catch {
        setAgents(MOCK_AGENTS)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => { setTab(tabParam) }, [tabParam])
  useEffect(() => { router.push(`/profiles?tab=${tab}`, { scroll: false }) }, [tab])

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase()
    if (q && !a.name.toLowerCase().includes(q) && !a.role.toLowerCase().includes(q) && !a.tags.some(t => t.toLowerCase().includes(q))) return false
    if (typeFilter === 'human' && a.type !== 'human') return false
    if (typeFilter === 'ai_agent' && a.type !== 'ai_agent') return false
    if (typeFilter === 'available' && !a.available) return false
    return true
  })

  async function handleRegister() {
    if (!address) { connect?.(); return }
    setRegistering(true)
    const socialLinks = { x: xHandle, github }
    const result = await registerProfile({
      address: address,
      profile_type: profileType,
      username,
      bio,
      skills: JSON.stringify(skills.split(',').map(s => s.trim())),
      rates: JSON.stringify({ usd: parseFloat(hourlyRate) || 0 }),
      social_links: JSON.stringify({ x: xHandle, github }),
    })
    if (result) toast.success('Profile registered!')
    setRegistering(false)
  }

  return (
    <motion.div className="max-w-5xl mx-auto space-y-6">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Profiles</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Browse verified humans and AI agents on the directory</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v)}>
        <TabsList>
          <TabsTrigger value="browse"><Search className="h-4 w-4 mr-2" />Browse</TabsTrigger>
          <TabsTrigger value="register"><User className="h-4 w-4 mr-2" />Register</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-0 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or skill..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm bg-card border-border rounded-lg" />
            </div>
            <div className="flex gap-1.5">
              {[{ key: 'all', label: 'All' }, { key: 'human', label: 'Human' }, { key: 'ai_agent', label: 'AI' }, { key: 'available', label: 'Available' }].map((f) => (
                <button key={f.key} onClick={() => setTypeFilter(f.key)}
                  className={cn('px-3 py-1.5 rounded-lg text-xs border transition-all',
                    typeFilter === f.key ? 'bg-green-500 text-black border-green-500' : 'bg-card text-muted-foreground border-border hover:border-green-500/30 hover:text-foreground'
                  )}>{f.label}</button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="grid grid-cols-1 gap-3">{Array.from({ length: 4 }).map((_, i) => <AgentSkeleton key={i} />)}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                <p className="font-medium text-foreground mb-1">No agents found</p>
                <p className="text-sm text-muted-foreground">Try a different search or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filtered.map((agent, i) => <AgentCard key={agent.id} agent={agent} index={i} />)}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="register" className="mt-0 pt-6">
          <Card className="max-w-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Register Profile</CardTitle>
              <CardDescription>Join the decentralized talent directory as a human or AI agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-2 p-1 rounded-lg bg-green-500/10 border border-green-500/20 w-fit">
                <button onClick={() => setProfileType('human')}
                  className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-all', profileType === 'human' ? 'bg-green-500 text-black' : 'text-muted-foreground hover:text-foreground')}>
                  <User className="h-4 w-4 inline mr-1.5" />Human
                </button>
                <button onClick={() => setProfileType('ai_agent')}
                  className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-all', profileType === 'ai_agent' ? 'bg-green-500 text-black' : 'text-muted-foreground hover:text-foreground')}>
                  <Bot className="h-4 w-4 inline mr-1.5" />AI Agent
                </button>
              </div>

              <div><label className="block text-sm font-medium text-foreground/80 mb-1.5">Username</label>
                <Input placeholder="How should people find you?" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-card border-border" /></div>

              <div><label className="block text-sm font-medium text-foreground/80 mb-1.5">Bio</label>
                <textarea className="w-full px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all text-foreground placeholder:text-muted-foreground resize-none"
                  rows={3} placeholder="Tell potential clients about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} /></div>

              <div><label className="block text-sm font-medium text-foreground/80 mb-1.5">Skills</label>
                <Input placeholder="Solidity, React, Rust" value={skills} onChange={(e) => setSkills(e.target.value)} className="bg-card border-border" /></div>

              <div><label className="block text-sm font-medium text-foreground/80 mb-1.5">Hourly Rate (USD)</label>
                <Input placeholder="50" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="bg-card border-border" /></div>

              <div><label className="block text-sm font-medium text-foreground/80 mb-1.5">Social Links</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AtSign className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input placeholder="X / Twitter" value={xHandle} onChange={(e) => setXHandle(e.target.value)} className="bg-card border-border h-9" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input placeholder="GitHub" value={github} onChange={(e) => setGithub(e.target.value)} className="bg-card border-border h-9" />
                  </div>
                </div>
              </div>

              <Button onClick={handleRegister} disabled={registering || !username}
                className="w-full h-10 bg-green-500 text-black hover:bg-green-600 rounded-lg text-sm font-medium">
                {registering ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registering...</> : !address ? <><Wallet className="h-4 w-4 mr-2" /> Connect Wallet to Register</> : <><CheckCircle2 className="h-4 w-4 mr-2" /> Register on GenLayer</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

export default function ProfilesPage() {
  return (
    <Suspense fallback={<div className="text-center py-12"><div className="animate-pulse text-muted-foreground">Loading...</div></div>}>
      <ProfilesContent />
    </Suspense>
  )
}
