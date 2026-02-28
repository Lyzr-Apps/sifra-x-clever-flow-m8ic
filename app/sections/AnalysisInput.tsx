'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { FaArrowRight, FaTag } from 'react-icons/fa'

interface AnalysisInputProps {
  onAnalyze: (decision: string, contextTag: string) => void
  isLoading: boolean
}

const CONTEXT_TAGS = [
  { label: 'Career', color: 'hsl(191, 97%, 70%)' },
  { label: 'Startup', color: 'hsl(265, 89%, 72%)' },
  { label: 'Investment', color: 'hsl(135, 94%, 60%)' },
  { label: 'Education', color: 'hsl(31, 100%, 65%)' },
  { label: 'Life Decision', color: 'hsl(326, 100%, 68%)' },
]

export default function AnalysisInput({ onAnalyze, isLoading }: AnalysisInputProps) {
  const [decision, setDecision] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  const handleSubmit = () => {
    if (!decision.trim() || isLoading) return
    onAnalyze(decision.trim(), selectedTag)
  }

  return (
    <Card className="bg-card border-border shadow-xl overflow-hidden">
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, hsl(265, 89%, 72%), hsl(191, 97%, 70%), hsl(135, 94%, 60%))' }} />
      <CardContent className="p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight mb-1">
            What decision are you facing?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Describe your decision in detail. Five strategic advisors will independently analyze it, then debate each other in a boardroom cross-examination.
          </p>
        </div>

        <div className="relative">
          <Textarea
            placeholder="e.g. Should I leave my corporate job to launch a SaaS product in the AI space? I have 3 years of savings and a working prototype..."
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            rows={5}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none text-sm leading-relaxed pr-16"
            disabled={isLoading}
          />
          <span className="absolute bottom-2.5 right-3 text-[10px] text-muted-foreground tabular-nums">
            {decision.length} chars
          </span>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground mb-2 font-semibold uppercase tracking-widest flex items-center gap-1.5">
            <FaTag className="w-2.5 h-2.5" /> Context (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {CONTEXT_TAGS.map((tag) => {
              const active = selectedTag === tag.label
              return (
                <button
                  key={tag.label}
                  onClick={() => setSelectedTag(active ? '' : tag.label)}
                  disabled={isLoading}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                    active
                      ? "text-white shadow-md border-transparent"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  )}
                  style={active ? { backgroundColor: tag.color } : undefined}
                >
                  {tag.label}
                </button>
              )
            })}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!decision.trim() || isLoading}
          className="w-full font-semibold text-sm py-5 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] group"
          style={{ background: decision.trim() ? 'linear-gradient(135deg, hsl(265, 89%, 72%), hsl(265, 89%, 58%))' : undefined }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Assembling boardroom...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Analyze My Decision
              <FaArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
