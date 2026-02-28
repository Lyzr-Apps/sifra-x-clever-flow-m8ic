'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { FaBrain, FaBriefcase, FaGraduationCap, FaBolt, FaPalette, FaChevronDown, FaChevronUp, FaSave, FaPlus } from 'react-icons/fa'
import { cn } from '@/lib/utils'

interface IndividualAnalysis {
  mode_name?: string
  mode_icon?: string
  summary?: string
  verdict?: string
  full_analysis?: { details?: string; [key: string]: unknown }
  [key: string]: unknown
}

interface BoardroomDiscussion {
  key_conflicts?: Array<{ between?: string; topic?: string; summary?: string }>
  agreements?: string[]
  logical_clarification?: string
  creative_synthesis?: string
  professor_insight?: string
}

interface StrategicSummary {
  recommendation?: string
  consensus_score?: number
  priority_level?: string
  next_action?: string
}

interface ResultsDisplayProps {
  analyses: IndividualAnalysis[]
  discussion: BoardroomDiscussion | null
  summary: StrategicSummary | null
  expandedCards: Set<number>
  onToggleCard: (index: number) => void
  onSave: () => void
  onNewAnalysis: () => void
  decision: string
}

const MODE_CONFIG: Record<string, { icon: typeof FaBrain; color: string }> = {
  'Logical Analyst': { icon: FaBrain, color: 'hsl(191, 97%, 70%)' },
  'CEO Strategist': { icon: FaBriefcase, color: 'hsl(31, 100%, 65%)' },
  'Professor Guide': { icon: FaGraduationCap, color: 'hsl(135, 94%, 60%)' },
  'Brutal Critic': { icon: FaBolt, color: 'hsl(326, 100%, 68%)' },
  'Creative Visionary': { icon: FaPalette, color: 'hsl(265, 89%, 72%)' },
}

function getModeConfig(name?: string) {
  if (!name) return { icon: FaBrain, color: 'hsl(228, 10%, 62%)' }
  for (const [key, val] of Object.entries(MODE_CONFIG)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val
  }
  return { icon: FaBrain, color: 'hsl(228, 10%, 62%)' }
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1 text-foreground">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1 text-foreground">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2 text-foreground">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm text-foreground/90">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm text-foreground/90">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm text-foreground/90">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part)
}

function renderExtraFields(analysis: IndividualAnalysis) {
  const skipKeys = new Set(['mode_name', 'mode_icon', 'summary', 'verdict', 'full_analysis'])
  const entries = Object.entries(analysis).filter(([k]) => !skipKeys.has(k))
  if (entries.length === 0) return null
  return (
    <div className="space-y-3 mt-3">
      {entries.map(([key, val]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        if (Array.isArray(val)) {
          if (val.length === 0) return null
          if (typeof val[0] === 'string') {
            return (
              <div key={key}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                <ul className="space-y-1">
                  {val.map((item, i) => <li key={i} className="text-sm text-foreground/90 ml-3 list-disc">{String(item)}</li>)}
                </ul>
              </div>
            )
          }
          return (
            <div key={key}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              {val.map((item, i) => (
                <Card key={i} className="bg-secondary/50 border-border mb-2">
                  <CardContent className="p-3 text-sm">
                    {typeof item === 'object' && item !== null
                      ? Object.entries(item).map(([k2, v2]) => (
                          <p key={k2}><span className="font-medium text-muted-foreground">{k2.replace(/_/g, ' ')}:</span> {String(v2 ?? '')}</p>
                        ))
                      : String(item)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        }
        if (typeof val === 'string' && val.length > 0) {
          return (
            <div key={key}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              {val.length > 100 ? renderMarkdown(val) : <p className="text-sm text-foreground/90">{val}</p>}
            </div>
          )
        }
        if (typeof val === 'number') {
          return (
            <div key={key}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-medium text-foreground">{val}%</p>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

export default function ResultsDisplay({ analyses, discussion, summary, expandedCards, onToggleCard, onSave, onNewAnalysis, decision }: ResultsDisplayProps) {
  return (
    <ScrollArea className="h-[calc(100vh-100px)]">
      <div className="space-y-6 pr-2 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Analysis Results</h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">{decision}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onSave} className="text-xs border-border text-foreground hover:bg-secondary">
              <FaSave className="w-3 h-3 mr-1.5" /> Save
            </Button>
            <Button variant="outline" size="sm" onClick={onNewAnalysis} className="text-xs border-border text-foreground hover:bg-secondary">
              <FaPlus className="w-3 h-3 mr-1.5" /> New
            </Button>
          </div>
        </div>

        {summary && (
          <Card className="bg-card border-border shadow-2xl overflow-hidden" style={{ borderTop: '3px solid hsl(265, 89%, 72%)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground tracking-tight">Strategic Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.recommendation && (
                <div className="p-3 rounded-xl bg-secondary/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Recommendation</p>
                  {renderMarkdown(summary.recommendation)}
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Consensus</p>
                    <span className="text-sm font-bold text-foreground">{summary.consensus_score ?? 0}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${summary.consensus_score ?? 0}%`,
                        background: (summary.consensus_score ?? 0) > 66
                          ? 'linear-gradient(90deg, hsl(135, 94%, 60%), hsl(135, 94%, 50%))'
                          : (summary.consensus_score ?? 0) > 33
                            ? 'linear-gradient(90deg, hsl(31, 100%, 65%), hsl(31, 100%, 55%))'
                            : 'linear-gradient(90deg, hsl(0, 100%, 62%), hsl(0, 100%, 52%))',
                      }}
                    />
                  </div>
                </div>
                {summary.priority_level && (
                  <Badge className={cn(
                    "text-xs font-semibold px-3 py-1",
                    summary.priority_level.toLowerCase() === 'high' ? 'bg-destructive text-destructive-foreground' :
                    summary.priority_level.toLowerCase() === 'medium' ? 'text-white' : 'text-white'
                  )} style={{
                    backgroundColor: summary.priority_level.toLowerCase() === 'high' ? 'hsl(0, 100%, 62%)' :
                    summary.priority_level.toLowerCase() === 'medium' ? 'hsl(31, 100%, 65%)' : 'hsl(135, 94%, 60%)',
                  }}>
                    {summary.priority_level}
                  </Badge>
                )}
              </div>
              {summary.next_action && (
                <div className="p-3 rounded-xl border border-primary/30" style={{ backgroundColor: 'hsla(265, 89%, 72%, 0.08)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(265, 89%, 72%)' }}>Next Immediate Action</p>
                  <p className="text-sm text-foreground font-medium">{summary.next_action}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {Array.isArray(analyses) && analyses.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Individual Analyses</h3>
            {analyses.map((analysis, index) => {
              const config = getModeConfig(analysis?.mode_name)
              const Icon = config.icon
              const isExpanded = expandedCards.has(index)
              return (
                <Card
                  key={index}
                  className="bg-card border-border shadow-lg overflow-hidden transition-all duration-200"
                  style={{ borderLeft: `3px solid ${config.color}` }}
                >
                  <button
                    className="w-full text-left p-4 flex items-center justify-between"
                    onClick={() => onToggleCard(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{analysis?.mode_name ?? 'Advisor'}</span>
                    </div>
                    {isExpanded ? <FaChevronUp className="w-3 h-3 text-muted-foreground" /> : <FaChevronDown className="w-3 h-3 text-muted-foreground" />}
                  </button>
                  <CardContent className="px-4 pb-4 pt-0">
                    {analysis?.summary && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Summary</p>
                        {renderMarkdown(analysis.summary)}
                      </div>
                    )}
                    {analysis?.verdict && (
                      <div className="p-2.5 rounded-lg bg-secondary/60 mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Verdict</p>
                        <p className="text-sm font-medium text-foreground">{analysis.verdict}</p>
                      </div>
                    )}
                    {isExpanded && (
                      <div className="mt-3 space-y-3">
                        {analysis?.full_analysis?.details && (
                          <div>
                            <Separator className="mb-3 bg-border" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Full Analysis</p>
                            {renderMarkdown(String(analysis.full_analysis.details))}
                          </div>
                        )}
                        {renderExtraFields(analysis)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {discussion && (
          <Card className="bg-card border-border shadow-xl overflow-hidden" style={{ borderTop: '3px solid hsl(191, 97%, 70%)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground tracking-tight">Boardroom Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {Array.isArray(discussion.key_conflicts) && discussion.key_conflicts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Conflicts</p>
                  <div className="space-y-3">
                    {discussion.key_conflicts.map((conflict, i) => (
                      <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] border-destructive/50 text-destructive">{conflict?.between ?? 'Advisors'}</Badge>
                          <span className="text-[10px] text-muted-foreground">on</span>
                          <span className="text-xs font-medium text-foreground">{conflict?.topic ?? ''}</span>
                        </div>
                        <p className="text-sm text-foreground/90">{conflict?.summary ?? ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(discussion.agreements) && discussion.agreements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Points of Agreement</p>
                  <ul className="space-y-1.5">
                    {discussion.agreements.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'hsl(135, 94%, 60%)' }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {discussion.logical_clarification && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'hsla(191, 97%, 70%, 0.08)', borderLeft: '3px solid hsl(191, 97%, 70%)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(191, 97%, 70%)' }}>Logical Clarification</p>
                  {renderMarkdown(discussion.logical_clarification)}
                </div>
              )}
              {discussion.creative_synthesis && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'hsla(265, 89%, 72%, 0.08)', borderLeft: '3px solid hsl(265, 89%, 72%)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(265, 89%, 72%)' }}>Creative Synthesis</p>
                  {renderMarkdown(discussion.creative_synthesis)}
                </div>
              )}
              {discussion.professor_insight && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'hsla(135, 94%, 60%, 0.08)', borderLeft: '3px solid hsl(135, 94%, 60%)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(135, 94%, 60%)' }}>Professor Insight</p>
                  {renderMarkdown(discussion.professor_insight)}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}
