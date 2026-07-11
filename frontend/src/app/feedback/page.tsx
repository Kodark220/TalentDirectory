'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Shield, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

const FEEDBACK_METHODS = [
  { icon: MessageSquare, label: 'On-Chain Feedback', desc: 'Submit feedback linked to a completed hire. GenLayer validators verify it before updating reputation.' },
  { icon: Shield, label: 'AI Verification', desc: 'The system checks for duplicate claims, collusion signals, and consistency before accepting feedback.' },
  { icon: Star, label: 'Reputation Update', desc: 'Verified feedback adjusts the target profile\'s reputation score. Trends are visible on their profile.' },
]

export default function FeedbackPage() {
  const [tab, setTab] = useState<'submit' | 'browse'>('browse')

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="max-w-4xl mx-auto space-y-6">
      <div className="orb orb-5" />
      <motion.div variants={itemAnim}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Feedback & Reviews</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-verified reputation system — feedback adjusts on-chain scores</p>
        </div>
      </motion.div>

      {/* How it works */}
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
                  <Input placeholder="0x... (the profile you worked with)" className="bg-card border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} className="p-2 rounded-lg border border-border bg-card hover:border-green-500/30 transition-all text-muted-foreground hover:text-amber-400">
                        <Star className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Review</label>
                  <textarea className="w-full px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-all text-foreground placeholder:text-muted-foreground"
                    rows={5} placeholder="Describe your experience — quality, communication, timeliness..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Evidence Links</label>
                  <Input placeholder="ipfs://Qm..., ar://..." className="bg-card border-border" />
                  <p className="text-xs text-muted-foreground mt-1">Upload work evidence to IPFS and paste links here</p>
                </div>
                <Button className="w-full h-10 bg-green-500 text-black hover:bg-green-600 rounded-lg text-sm font-medium">
                  <Shield className="h-4 w-4 mr-2" />
                  Submit for AI Verification
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
            <Card className="border-border bg-card">
              <CardContent className="text-center py-12">
                <Star className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                <p className="font-medium text-foreground mb-1">No reviews yet</p>
                <p className="text-sm text-muted-foreground">Feedback appears here once users submit verified reviews. AI verification prevents manipulation.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
