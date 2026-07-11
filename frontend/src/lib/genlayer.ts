/** GenLayer connector for Talent Directory frontend. */
import { createClient } from 'genlayer-js'
import toast from 'react-hot-toast'

export const CONTRACT_ADDRESSES = {
  profileRegistry: '0x2780E250b0170bc2d553E1b5C721B415040abCff',
  reputationUpdater: '0xf8C35248F6F3094655E0C97313a37E00B5FCCa0e',
  disputeArbitrator: '0x4b7401Fd9b73439b1b89F191567367df5479fBff',
}

const client = createClient({
  endpoint: 'https://rpc-bradbury.genlayer.com'
})

// ─── Backend API URL ──────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function api(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    return await res.json()
  } catch (err: any) {
    console.warn(`API ${path} failed:`, err?.message)
    return null
  }
}

// ─── Profile Registry (on-chain reads) ────────────────────

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

// ─── Profile Data (off-chain backend) ─────────────────────

export async function listProfiles(search?: string, profileType?: string) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (profileType) params.set('profile_type', profileType)
  const result = await api(`/api/profiles?${params}`)
  return result || { profiles: [], total: 0 }
}

export async function getProfile(address: string) {
  return await api(`/api/profiles/${address}`)
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
}) {
  return await api('/api/profiles', {
    method: 'POST',
    body: JSON.stringify(profile),
  })
}

export async function updateProfile(address: string, profile: any) {
  return await api(`/api/profiles/${address}`, {
    method: 'PUT',
    body: JSON.stringify(profile),
  })
}

export async function deactivateProfile(address: string) {
  return await api(`/api/profiles/${address}`, { method: 'DELETE' })
}

// ─── Feedback (off-chain, verified by GenLayer) ───────────

export async function submitFeedback(feedback: {
  target: string
  reviewer: string
  rating: number
  review: string
  evidence_links?: string
}) {
  return await api('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(feedback),
  })
}

export async function listFeedback(target?: string) {
  const params = target ? `?target=${target}` : ''
  return await api(`/api/feedback${params}`)
}

// ─── Disputes (off-chain, verified by GenLayer) ───────────

export async function fileDispute(dispute: {
  claimant: string
  respondent: string
  case_type: string
  title: string
  description: string
  evidence_links?: string
  binding?: boolean
}) {
  return await api('/api/disputes', {
    method: 'POST',
    body: JSON.stringify(dispute),
  })
}

export async function listDisputes(address?: string) {
  const params = address ? `?address=${address}` : ''
  return await api(`/api/disputes${params}`)
}
