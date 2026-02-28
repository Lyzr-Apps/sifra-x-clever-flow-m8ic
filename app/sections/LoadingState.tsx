'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FaBrain, FaBriefcase, FaGraduationCap, FaBolt, FaPalette } from 'react-icons/fa'

const MODE_SKELETONS = [
  { name: 'Logical Analyst', color: 'hsl(191, 97%, 70%)', icon: FaBrain, status: 'Crunching the data...' },
  { name: 'CEO Strategist', color: 'hsl(31, 100%, 65%)', icon: FaBriefcase, status: 'Evaluating market opportunity...' },
  { name: 'Professor Guide', color: 'hsl(135, 94%, 60%)', icon: FaGraduationCap, status: 'Building the roadmap...' },
  { name: 'Brutal Critic', color: 'hsl(326, 100%, 68%)', icon: FaBolt, status: 'Finding the blind spots...' },
  { name: 'Creative Visionary', color: 'hsl(265, 89%, 72%)', icon: FaPalette, status: 'Imagining possibilities...' },
]

export default function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(265, 89%, 72%), hsl(265, 89%, 55%))' }}>
            <span className="text-white font-bold text-xs">SX</span>
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: 'hsl(135, 94%, 60%)' }} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground tracking-tight">
            Boardroom assembling...
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Five strategic advisors are independently analyzing your decision
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full animate-pulse"
          style={{
            width: '60%',
            background: 'linear-gradient(90deg, hsl(265, 89%, 72%), hsl(191, 97%, 70%), hsl(135, 94%, 60%))',
          }} />
      </div>

      {/* Advisor cards */}
      <div className="space-y-3">
        {MODE_SKELETONS.map((mode, idx) => {
          const Icon = mode.icon
          return (
            <Card
              key={mode.name}
              className="bg-card border-border overflow-hidden"
              style={{ borderLeft: `3px solid ${mode.color}` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${mode.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: mode.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{mode.name}</p>
                    <p className="text-[10px] text-muted-foreground">{mode.status}</p>
                  </div>
                  <div className="w-5 h-5 border-2 rounded-full animate-spin"
                    style={{ borderColor: `${mode.color}30`, borderTopColor: mode.color }} />
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 rounded animate-pulse bg-muted" style={{ width: `${85 - idx * 8}%` }} />
                  <div className="h-2.5 rounded animate-pulse bg-muted" style={{ width: `${70 - idx * 5}%` }} />
                  <div className="h-2.5 rounded animate-pulse bg-muted" style={{ width: `${55 - idx * 3}%` }} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary skeleton */}
      <Card className="bg-card border-border" style={{ borderTop: '3px solid hsl(265, 89%, 72%)' }}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-40 rounded animate-pulse bg-muted" />
            <div className="ml-auto h-5 w-16 rounded-full animate-pulse bg-muted" />
          </div>
          <div className="h-3 w-full rounded animate-pulse bg-muted" />
          <div className="h-6 w-full rounded-full animate-pulse bg-muted" />
          <div className="h-3 w-3/4 rounded animate-pulse bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}
