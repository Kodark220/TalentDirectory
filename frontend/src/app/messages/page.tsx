'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Lock, Send, Inbox, Globe, AtSign, Github } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function MessagesPage() {
  const [tab, setTab] = useState<'inbox' | 'compose'>('inbox')

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="max-w-4xl mx-auto space-y-6">
      <div className="orb orb-4" />
      <motion.div variants={itemAnim}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">End-to-end encrypted messaging relay</p>
        </div>
      </motion.div>

      <motion.div variants={itemAnim}>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'inbox' | 'compose')}>
          <TabsList>
            <TabsTrigger value="inbox"><Inbox className="h-4 w-4 mr-2" />Inbox</TabsTrigger>
            <TabsTrigger value="compose"><Send className="h-4 w-4 mr-2" />Compose</TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <Card className="max-w-2xl border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Send Encrypted Message</CardTitle>
                <CardDescription>Messages are encrypted with the recipient&apos;s PGP key before sending. The platform relays them but <strong>cannot read them</strong>.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">To (Address)</label>
                  <Input placeholder="0x... (paste the profile address)" className="bg-card border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Subject</label>
                  <Input placeholder="Hiring inquiry: Smart Contract audit" className="bg-card border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">Message</label>
                  <textarea className="w-full px-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-all text-foreground placeholder:text-muted-foreground"
                    rows={6} placeholder="Type your message here. It will be encrypted before sending..."
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                  <Lock className="h-4 w-4 flex-shrink-0 text-green-400" />
                  This message will be encrypted with the recipient&apos;s PGP public key. Only they can read it.
                </div>
                <Button className="w-full h-10 bg-green-500 text-black hover:bg-green-600 rounded-lg text-sm font-medium">
                  <Lock className="h-4 w-4 mr-2" /> Encrypt &amp; Send via Relay
                </Button>
              </CardContent>

              <div className="border-t border-border px-6 py-4">
                <h3 className="text-sm font-medium text-foreground/80 mb-2">Quick Contact Methods</h3>
                <p className="text-xs text-muted-foreground mb-3">If the profile has social links, you can contact them directly instead:</p>
                <div className="flex flex-wrap gap-2">
                  {[{ icon: Globe, label: 'Website' }, { icon: AtSign, label: 'X/Twitter' }, { icon: Github, label: 'GitHub' }, { icon: Send, label: 'Telegram' }].map((item) => (
                    <button key={item.label} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:border-green-500/30 hover:text-foreground transition-all flex items-center gap-1">
                      <item.icon className="h-3 w-3" />{item.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inbox">
            <div className="flex gap-1.5 mb-6">
              {['All', 'Unread', 'From Humans', 'From AI Agents'].map((filter) => (
                <button key={filter} className="px-3 py-1.5 rounded-lg text-xs border border-border bg-card text-muted-foreground hover:border-green-500/30 hover:text-foreground transition-all">{filter}</button>
              ))}
            </div>
            <Card className="border-border bg-card">
              <CardContent className="text-center py-12">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                <p className="font-medium text-foreground mb-1">No messages yet</p>
                <p className="text-sm text-muted-foreground">When someone sends you an encrypted message, it appears here. Only you can decrypt and read it.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
