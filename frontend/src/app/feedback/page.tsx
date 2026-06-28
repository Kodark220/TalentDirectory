'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Shield, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { submitFeedback, listFeedback } from '@/lib/genlayer'
import { useWallet } from '@/components/WalletProvider'
import toast from 'react-hot-toast'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

const FEEDBACK_METHODS = [
  { icon: MessageSquare, label: 'On-Chain Feedback', desc: 'Submit feedback linked to a completed hire. GenLayer validators verify it before updating reputation.' },
  { icon: Shield, label: 'AI Verification', desc: 'The system checks for duplicate claims, collusion signals, and consistency before accepting feedback.' },
  { icon: Star, label: 'Reputation Update', desc: 'Verified feedback adjusts the target profile\'s reputation score. Trends are visible on their profile.' },
]

export default function FeedbackPage() {
  const [tab, setTab] = useState<'submit' | 'browse'>('browse')
  const { address, connect } = useWallet()

  // Submit form
  const [targetAddress, setTargetAddress] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [evidenceLinks, setEvidenceLinks] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Browse
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    if (tab === 'browse') {
      listFeedback().then(setReviews).catch(() => {})
    }
  }, [tab])

  async function handleSubmit() {
    if (!address) { connect?.(); return }
    if (!targetAddress || rating === 0 || !reviewText) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      await submitFeedback({
        target: targetAddress,
        reviewer: address,
        rating,
        review: reviewText,
        evidence_links: evidenceLinks || undefined,
      })
      toast.success('Feedback submitted for AI verification!')
      setTargetAddress('')
      setRating(0)
      setReviewText('')
      setEvidenceLinks('')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit feedback')
    }
    setSubmitting(false)
  }

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="max-w-4xl mx-auto space-y-6">
      <div className="orb orb-5" />
      <motion.div variants={itemAnim}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Feedback & Reviews</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-verified reputation system — feedback adjusts on-chain scores</p>
        </div>
      </motion.div>

      <motion.div variants={itemAnim}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {FEEDBACK_METHODS.map((item, i) => (
            <div key={item.label} className="border border-border rounded-xl p-4 bg-card glow-green-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <item.icon className="h-3.5 w-3.5 text-green-400" />
                </div>
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemAnim}>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'submit' | 'browse')}>
          <TabsList>
            <TabsTrigger value="browse"><Star className="h-4 w-4 mr-2" />Recent Reviews</TabsTrigger>
            <TabsTrigger value="submit"><ThumbsUp className="h-4 w-4 mr-2" />Submit Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <Card className="max-w-2xl border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Submit Feedback</CardTitle>
                <CardDescription>Rate and review a human or AI agent you worked with. Feedback is verified by GenLayer validators before updating their score.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Target Address</label>
                  <Input placeholder="0x... (the profile you worked with)" value={targetAddress} onChange={e => setTargetAddress(e.target.value)} className="bg-card border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)}
                        className={`p-2 rounded-lg border transition-all ${star <= rating ? 'border-amber-400 bg-amber-500/10 text-amber-400' : 'border-border bg-card text-muted-foreground hover:border-green-500/30'}`}>
                        <Star className={`h-5 w-5 ${star <= rating ? 'fill-amber-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Review</label>
                  <textarea className="w-full px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-all text-foreground placeholder:text-muted-foreground"
                    rows={5} placeholder="Describe your experience — quality, communication, timeliness..." value={reviewText} onChange={e => setReviewText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Evidence Links</label>
                  <Input placeholder="ipfs://Qm..., ar://..." value={evidenceLinks} onChange={e => setEvidenceLinks(e.target.value)} className="bg-card border-border" />
                  <p className="text-xs text-muted-foreground mt-1">Upload work evidence to IPFS and paste links here</p>
                </div>
                <Button onClick={handleSubmit} disabled={submitting} className="w-full h-10 bg-green-500 text-black hover:bg-green-600 rounded-lg text-sm font-medium">
                  <Shield className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit for AI Verification'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browse">
            <div className="flex gap-1.5 mb-6">
              {['All', 'Positive', 'Critical', 'Verified'].map((filter) => (
                <button key={filter} className="px-3 py-1.5 rounded-lg text-xs border border-border bg-card text-muted-foreground hover:border-green-500/30 hover:text-foreground transition-all">{filter}</button>
              ))}
            </div>
            {reviews.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="text-center py-12">
                  <Star className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="font-medium text-foreground mb-1">No reviews yet</p>
                  <p className="text-sm text-muted-foreground">Feedback appears here once users submit verified reviews. AI verification prevents manipulation.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reviews.map((fb) => (
                  <div key={fb.id} className="border border-border rounded-xl p-4 bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{fb.reviewerName}</span>
                      <span className="text-xs text-muted-foreground">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{fb.review}</p>
                    {fb.verified && (
                      <Badge className="mt-2 text-[10px] bg-green-500/10 text-green-400 border-green-500/20">Verified ✓</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
