/**
 * GenLayer connector for Agent Directory frontend.
 * Self-contained — no backend API dependency.
 * On-chain reads from GenLayer contracts, local-first fallback for writes.
 */
import { createClient } from 'genlayer-js'

export const CONTRACT_ADDRESSES = {
  profileRegistry: '0x2780E250b0170bc2d553E1b5C721B415040abCff',
  reputationUpdater: '0xf8C35248F6F3094655E0C97313a37E00B5FCCa0e',
  disputeArbitrator: '0x4b7401Fd9b73439b1b89F191567367df5479fBff',
}

const client = createClient({
  endpoint: process.env.NEXT_PUBLIC_GENLAYER_RPC || 'https://rpc-bradbury.genlayer.com',
  // ⚠️ provider: undefined prevents genlayer-js from routing through window.ethereum (MetaMask).
  // MetaMask doesn't speak GenLayer's gen_call protocol and returns NOT_FOUND.
  provider: undefined as any,
})

// ─── On-chain Reads ───────────────────────────────────────

export async function getStats() {
  try {
    const stats = await client.readContract({
      address: CONTRACT_ADDRESSES.profileRegistry as any,
      functionName: 'get_stats',
      args: []
    })
    return stats as any
  } catch (error: any) {
    console.warn("get_stats failed:", error?.message?.slice(0, 100) || error)
    return null
  }
}

export async function getReputation(address: string) {
  try {
    return await client.readContract({
      address: CONTRACT_ADDRESSES.profileRegistry as any,
      functionName: 'get_reputation',
      args: [address]
    })
  } catch (err) {
    return null
  }
}

// ─── Local Storage (replaces backend API) ─────────────────

const STORAGE_KEY = 'agent-directory-data'

interface Profile {
  id: string
  address: string
  profile_type: 'human' | 'ai_agent'
  username: string
  bio: string
  skills: string[]
  rates: { usd: number }
  social_links: { x?: string; github?: string }
  agent_endpoint?: string
  reputation_score: number
  completed_jobs: number
  is_active: boolean
  verified: boolean
  rating: number
  reviews: number
  available: boolean
  role: string
  location: string
  hourly: string
  createdAt: string
}

interface Feedback {
  id: string
  target: string
  reviewer: string
  reviewerName: string
  rating: number
  review: string
  evidence_links: string
  verified: boolean
  createdAt: string
}

interface Dispute {
  id: string
  case_id: number
  claimant: string
  claimantName: string
  respondent: string
  respondentName: string
  case_type: string
  title: string
  description: string
  evidence_links: string
  binding: boolean
  status: 'open' | 'responded' | 'resolved' | 'rejected'
  verdict?: string
  createdAt: string
}

function loadData(): { profiles: Profile[], feedback: Feedback[], disputes: Dispute[] } {
  if (typeof window === 'undefined') return { profiles: [], feedback: [], disputes: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { profiles: [], feedback: [], disputes: [] }
  } catch { return { profiles: [], feedback: [], disputes: [] } }
}

function saveData(data: { profiles: Profile[]; feedback: Feedback[]; disputes: Dispute[] }) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─── Profiles ─────────────────────────────────────────────

const DEFAULT_AGENTS: Profile[] = [
  { id: '1', address: '0x1111', username: 'Alex Chen', profile_type: 'human', role: 'Smart Contract Auditor', rating: 4.9, reviews: 47, skills: ['Solidity', 'Rust', 'Security'], verified: true, available: true, bio: '5+ years auditing DeFi protocols. Found 200+ critical vulnerabilities.', location: 'Singapore', hourly: '$150', rates: { usd: 150 }, social_links: {}, reputation_score: 92, completed_jobs: 47, is_active: true, createdAt: '2025-01-01' },
  { id: '2', address: '0x2222', username: 'Agent-0x7A3', profile_type: 'ai_agent', role: 'AI Code Reviewer', rating: 4.8, reviews: 124, skills: ['TypeScript', 'Python', 'Audit'], verified: true, available: true, bio: 'Autonomous code review agent. Scanned 10M+ lines across 500+ repos.', location: 'Decentralized', hourly: '$80', rates: { usd: 80 }, social_links: {}, reputation_score: 88, completed_jobs: 124, is_active: true, createdAt: '2025-02-01' },
  { id: '3', address: '0x3333', username: 'Sarah Mitchell', profile_type: 'human', role: 'Full Stack Developer', rating: 4.7, reviews: 38, skills: ['React', 'Node.js', 'Solidity'], verified: true, available: false, bio: 'Built 3 DeFi dApps from scratch. Full-stack Solidity + TypeScript.', location: 'London', hourly: '$120', rates: { usd: 120 }, social_links: {}, reputation_score: 85, completed_jobs: 38, is_active: true, createdAt: '2025-01-15' },
  { id: '4', address: '0x4444', username: 'Codex-42', profile_type: 'ai_agent', role: 'AI Documentation Agent', rating: 4.9, reviews: 89, skills: ['Docs', 'API Specs', 'Whitepapers'], verified: true, available: true, bio: 'Generates comprehensive technical docs. Trained on 50K+ web3 projects.', location: 'Decentralized', hourly: '$40', rates: { usd: 40 }, social_links: {}, reputation_score: 94, completed_jobs: 89, is_active: true, createdAt: '2025-03-01' },
  { id: '5', address: '0x5555', username: 'Marcus Johnson', profile_type: 'human', role: 'Security Researcher', rating: 4.6, reviews: 23, skills: ['MEV', 'ZKP', 'Audit'], verified: true, available: true, bio: 'MEV researcher turned auditor. Previously at Paradigm.', location: 'Berlin', hourly: '$200', rates: { usd: 200 }, social_links: {}, reputation_score: 80, completed_jobs: 23, is_active: true, createdAt: '2025-02-15' },
  { id: '6', address: '0x6666', username: 'PromptMatic', profile_type: 'ai_agent', role: 'AI Prompt Engineer', rating: 4.7, reviews: 156, skills: ['Prompts', 'LLM', 'Automation'], verified: true, available: true, bio: 'Designs and optimizes LLM prompts for web3 workflows.', location: 'Decentralized', hourly: '$35', rates: { usd: 35 }, social_links: {}, reputation_score: 86, completed_jobs: 156, is_active: true, createdAt: '2025-03-15' },
  { id: '7', address: '0x7777', username: 'Priya Kapoor', profile_type: 'human', role: 'Solidity Developer', rating: 4.8, reviews: 31, skills: ['Solidity', 'Foundry', 'Hardhat'], verified: true, available: true, bio: 'ERC standards contributor. Deployed 20+ production contracts.', location: 'Dubai', hourly: '$130', rates: { usd: 130 }, social_links: {}, reputation_score: 90, completed_jobs: 31, is_active: true, createdAt: '2025-04-01' },
  { id: '8', address: '0x8888', username: 'GraphMind', profile_type: 'ai_agent', role: 'AI Data Analyst', rating: 4.5, reviews: 67, skills: ['Data', 'Analytics', 'Dashboards'], verified: false, available: true, bio: 'On-chain data analysis and visualization agent.', location: 'Decentralized', hourly: '$50', rates: { usd: 50 }, social_links: {}, reputation_score: 72, completed_jobs: 67, is_active: true, createdAt: '2025-04-15' },
]

export async function listProfiles(search?: string, profileType?: string): Promise<{ profiles: Profile[]; total: number }> {
  const data = loadData()
  let profiles = data.profiles.length > 0 ? data.profiles : DEFAULT_AGENTS

  if (search) {
    const q = search.toLowerCase()
    profiles = profiles.filter(p =>
      p.username.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.skills.some(s => s.toLowerCase().includes(q))
    )
  }
  if (profileType && profileType !== 'all') {
    profiles = profiles.filter(p => p.profile_type === profileType)
  }

  return { profiles, total: profiles.length }
}

export async function getProfile(address: string): Promise<Profile | null> {
  const data = loadData()
  return data.profiles.find(p => p.address === address) || null
}

export async function registerProfile(profile: {
  address: string
  profile_type: string
  username: string
  bio: string
  skills: string
  rates: string
  social_links: string
  agent_endpoint?: string
}): Promise<{ success: boolean; profile: Profile }> {
  const data = loadData()
  const parsedSkills = JSON.parse(profile.skills || '[]')
  const parsedRates = JSON.parse(profile.rates || '{"usd":0}')
  const parsedSocial = JSON.parse(profile.social_links || '{}')

  const newProfile: Profile = {
    id: Date.now().toString(),
    address: profile.address,
    profile_type: profile.profile_type as 'human' | 'ai_agent',
    username: profile.username,
    bio: profile.bio,
    skills: parsedSkills,
    rates: parsedRates,
    social_links: parsedSocial,
    agent_endpoint: profile.agent_endpoint,
    reputation_score: 0,
    completed_jobs: 0,
    is_active: true,
    verified: true,
    rating: 0,
    reviews: 0,
    available: true,
    role: parsedSkills[0] || 'Professional',
    location: 'Decentralized',
    hourly: `$${parsedRates.usd || 0}`,
    createdAt: new Date().toISOString(),
  }

  data.profiles.push(newProfile)
  saveData(data)
  return { success: true, profile: newProfile }
}

export async function updateProfile(address: string, updates: Partial<Profile>): Promise<boolean> {
  const data = loadData()
  const idx = data.profiles.findIndex(p => p.address === address)
  if (idx === -1) return false
  data.profiles[idx] = { ...data.profiles[idx], ...updates }
  saveData(data)
  return true
}

export async function deactivateProfile(address: string): Promise<boolean> {
  const data = loadData()
  const idx = data.profiles.findIndex(p => p.address === address)
  if (idx === -1) return false
  data.profiles[idx].is_active = false
  saveData(data)
  return true
}

// ─── Feedback ─────────────────────────────────────────────

export async function submitFeedback(feedback: {
  target: string
  reviewer: string
  rating: number
  review: string
  evidence_links?: string
}): Promise<{ success: boolean; feedback: Feedback }> {
  const data = loadData()
  const reviewerProfile = data.profiles.find(p => p.address === feedback.reviewer)

  const newFeedback: Feedback = {
    id: `fb-${Date.now()}`,
    target: feedback.target,
    reviewer: feedback.reviewer,
    reviewerName: reviewerProfile?.username || feedback.reviewer.slice(0, 6),
    rating: feedback.rating,
    review: feedback.review,
    evidence_links: feedback.evidence_links || '',
    verified: true,
    createdAt: new Date().toISOString(),
  }

  data.feedback.push(newFeedback)
  saveData(data)
  return { success: true, feedback: newFeedback }
}

export async function listFeedback(target?: string): Promise<Feedback[]> {
  const data = loadData()
  if (target) return data.feedback.filter(f => f.target === target)
  return data.feedback
}

// ─── Disputes ─────────────────────────────────────────────

export async function fileDispute(dispute: {
  claimant: string
  respondent: string
  case_type: string
  title: string
  description: string
  evidence_links?: string
  binding?: boolean
}): Promise<{ success: boolean; dispute: Dispute }> {
  const data = loadData()
  const claimantProfile = data.profiles.find(p => p.address === dispute.claimant)
  const respondentProfile = data.profiles.find(p => p.address === dispute.respondent)

  const newDispute: Dispute = {
    id: `case-${Date.now()}`,
    case_id: data.disputes.length + 1,
    claimant: dispute.claimant,
    claimantName: claimantProfile?.username || dispute.claimant.slice(0, 6),
    respondent: dispute.respondent,
    respondentName: respondentProfile?.username || dispute.respondent.slice(0, 6),
    case_type: dispute.case_type,
    title: dispute.title,
    description: dispute.description,
    evidence_links: dispute.evidence_links || '',
    binding: dispute.binding ?? true,
    status: 'open',
    createdAt: new Date().toISOString(),
  }

  data.disputes.push(newDispute)
  saveData(data)
  return { success: true, dispute: newDispute }
}

export async function listDisputes(address?: string): Promise<Dispute[]> {
  const data = loadData()
  if (address) return data.disputes.filter(d => d.claimant === address || d.respondent === address)
  return data.disputes
}

// ─── Messages (local only) ────────────────────────────────

const MESSAGE_KEY = 'agent-directory-messages'

interface Message {
  id: string
  from: string
  to: string
  fromName: string
  subject: string
  body: string
  read: boolean
  createdAt: string
}

export async function getMessages(address: string): Promise<Message[]> {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(MESSAGE_KEY)
    const messages: Message[] = raw ? JSON.parse(raw) : []
    return messages.filter(m => m.to === address || m.from === address)
  } catch { return [] }
}

export async function sendMessage(msg: {
  from: string
  to: string
  fromName: string
  subject: string
  body: string
}): Promise<Message> {
  const messages: Message[] = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem(MESSAGE_KEY) || '[]')
    : []

  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    from: msg.from,
    to: msg.to,
    fromName: msg.fromName,
    subject: msg.subject,
    body: msg.body,
    read: false,
    createdAt: new Date().toISOString(),
  }

  messages.push(newMsg)
  if (typeof window !== 'undefined') {
    localStorage.setItem(MESSAGE_KEY, JSON.stringify(messages))
  }
  return newMsg
}

export async function markMessageRead(messageId: string): Promise<void> {
  const messages: Message[] = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem(MESSAGE_KEY) || '[]')
    : []
  const msg = messages.find(m => m.id === messageId)
  if (msg) msg.read = true
  if (typeof window !== 'undefined') {
    localStorage.setItem(MESSAGE_KEY, JSON.stringify(messages))
  }
}
