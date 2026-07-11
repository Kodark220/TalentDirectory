'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, FileText, Gavel } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function DisputesPage() {
  const [tab, setTab] = useState<'file' | 'browse'>('browse')
  const [binding, setBinding] = useState(true)

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="max-w-4xl mx-auto space-y-6">
      <div className="orb orb-5" />
      <motion.div variants={itemAnim}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Dispute Resolution</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-powered arbitration for post-hire conflicts</p>
        </div>
      </motion.div>

      <motion.div variants={itemAnim}>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'file' | 'browse')}>
          <TabsList>
            <TabsTrigger value="browse"><FileText className="h-4 w-4 mr-2" />All Cases</TabsTrigger>
            <TabsTrigger value="file"><Scale className="h-4 w-4 mr-2" />File Dispute</TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <Card className="max-w-2xl border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">File a Dispute</CardTitle>
                <CardDescription>Had a bad experience after an off-platform hire? Submit your case for AI-powered arbitration. GenLayer validators review evidence and issue a fair verdict.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Respondent Address</label>
                  <Input placeholder="0x... (the party you're disputing with)" className="bg-card border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Case Type</label>
                  <select className="w-full h-10 px-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all text-foreground">
                    <option value="">Select type...</option>
                    <option value="payment">Payment Dispute</option>
                    <option value="quality">Quality Dispute</option>
                    <option value="delivery">Delivery Dispute</option>
                    <option value="behavior">Behavior / Conduct</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Title</label>
                  <Input placeholder="Brief title for the dispute" className="bg-card border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Your Statement</label>
                  <textarea className="w-full px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-all text-foreground placeholder:text-muted-foreground"
                    rows={5} placeholder="Describe what happened, what was agreed, and what went wrong..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Evidence Links</label>
                  <Input placeholder="ipfs://..., ar://..." className="bg-card border-border" />
                  <p className="text-xs text-muted-foreground mt-1">Upload evidence to IPFS and paste links here</p>
                </div>
                <div className={cn('flex items-center gap-4 p-4 rounded-lg border transition-all', binding ? 'border-green-500/20 bg-green-500/10' : 'border-border')}>
                  <Gavel className={cn('h-5 w-5', binding ? 'text-green-400' : 'text-muted-foreground')} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Binding Verdict</div>
                    <div className="text-xs text-muted-foreground">A binding verdict automatically adjusts reputation scores</div>
                  </div>
                  <button onClick={() => setBinding(!binding)} className={cn('relative w-11 h-6 rounded-full transition-colors', binding ? 'bg-green-500' : 'bg-green-500/20')}>
                    <div className={cn('absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-card transition-transform shadow-sm', binding && 'translate-x-5')} />
                  </button>
                </div>
                <Button className="w-full h-10 bg-green-500 text-black hover:bg-green-600 rounded-lg text-sm font-medium">
                  <Scale className="h-4 w-4 mr-2" /> Submit to AI Arbitration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browse">
            <div className="flex gap-1.5 mb-6">
              {['All', 'Open', 'Responded', 'Resolved'].map((filter) => (
                <button key={filter} className="px-3 py-1.5 rounded-lg text-xs border border-border bg-card text-muted-foreground hover:border-green-500/30 hover:text-foreground transition-all">{filter}</button>
              ))}
            </div>
            <Card className="border-border bg-card">
              <CardContent className="text-center py-12">
                <Scale className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                <p className="font-medium text-foreground mb-1">No disputes filed yet</p>
                <p className="text-sm text-muted-foreground">Disputes appear here once parties submit cases for AI arbitration.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
