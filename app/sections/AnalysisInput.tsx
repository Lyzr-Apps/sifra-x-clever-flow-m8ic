'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface AnalysisInputProps {
  onAnalyze: (decision: string, contextTag: string) => void
  isLoading: boolean
}

const CONTEXT_TAGS = ['Career', 'Startup', 'Investment', 'Education', 'Life Decision']

export default function AnalysisInput({ onAnalyze, isLoading }: AnalysisInputProps) {
  const [decision, setDecision] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  const handleSubmit = () => {
    if (!decision.trim() || isLoading) return
    onAnalyze(decision.trim(), selectedTag)
  }

  return (
    <Card className="bg-card border-border shadow-xl">
      <CardContent className="p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight mb-1">
            What decision are you facing?
          </h2>
          <p className="text-sm text-muted-foreground">
            Describe your decision in detail. Our five strategic advisors will analyze it from every angle.
          </p>
        </div>

        <div className="relative">
          <Textarea
            placeholder="e.g. Should I leave my corporate job to launch a SaaS product in the AI space? I have 3 years of savings and a working prototype..."
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            rows={5}
            className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none text-sm"
            disabled={isLoading}
          />
          <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
            {decision.length} chars
          </span>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">Context (optional)</p>
          <div className="flex flex-wrap gap-2">
            {CONTEXT_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                disabled={isLoading}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                  selectedTag === tag
                    ? "border-primary text-primary-foreground shadow-md"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                )}
                style={selectedTag === tag ? { backgroundColor: 'hsl(265, 89%, 72%)' } : undefined}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!decision.trim() || isLoading}
          className="w-full font-semibold text-sm py-5 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
          style={{ background: 'linear-gradient(135deg, hsl(265, 89%, 72%), hsl(265, 89%, 62%))' }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            'Analyze My Decision'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
