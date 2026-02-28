'use client'

import { Card, CardContent } from '@/components/ui/card'

const MODE_SKELETONS = [
  { name: 'Logical Analyst', color: 'hsl(191, 97%, 70%)' },
  { name: 'CEO Strategist', color: 'hsl(31, 100%, 65%)' },
  { name: 'Professor Guide', color: 'hsl(135, 94%, 60%)' },
  { name: 'Brutal Critic', color: 'hsl(326, 100%, 68%)' },
  { name: 'Creative Visionary', color: 'hsl(265, 89%, 72%)' },
]

export default function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 py-4">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'hsl(265, 89%, 72%)', animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'hsl(135, 94%, 60%)', animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'hsl(191, 97%, 70%)', animationDelay: '300ms' }} />
        </div>
        <p className="text-sm font-medium text-foreground tracking-tight">
          Boardroom assembling...
        </p>
        <p className="text-xs text-muted-foreground">
          Five strategic advisors are analyzing your decision
        </p>
      </div>

      <div className="space-y-3">
        {MODE_SKELETONS.map((mode) => (
          <Card
            key={mode.name}
            className="bg-card border-border overflow-hidden"
            style={{ borderLeft: `3px solid ${mode.color}` }}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg animate-pulse bg-muted" />
                <div className="h-4 w-32 rounded animate-pulse bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded animate-pulse bg-muted" />
                <div className="h-3 w-4/5 rounded animate-pulse bg-muted" />
                <div className="h-3 w-3/5 rounded animate-pulse bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-3">
          <div className="h-5 w-48 rounded animate-pulse bg-muted" />
          <div className="h-3 w-full rounded animate-pulse bg-muted" />
          <div className="h-6 w-full rounded-full animate-pulse bg-muted" />
          <div className="h-3 w-2/3 rounded animate-pulse bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}
