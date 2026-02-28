'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  FaChartLine, FaCheckCircle, FaTimesCircle, FaRegClock,
  FaSearch, FaTrash, FaTimes, FaChevronDown, FaChevronUp,
  FaLightbulb, FaBrain, FaExclamationTriangle, FaPencilAlt,
  FaArrowRight, FaRegCalendarAlt
} from 'react-icons/fa'

export interface DecisionOutcome {
  status: 'pending' | 'success' | 'partial' | 'failed' | 'abandoned'
  reflection: string
  actualResult: string
  lessonsLearned: string
  accuracyRating: number // 1-5 how accurate was the analysis
  updatedAt: string
}

export interface TrackedDecision {
  id: string
  decision: string
  contextTag: string
  consensusScore: number
  priorityLevel: string
  recommendation: string
  timestamp: string
  predictedOutcome: string
  deadline: string
  outcome?: DecisionOutcome
  fullResult: Record<string, unknown>
}

const MEMORY_KEY = 'sifra_x_decisions'

interface DecisionMemoryProps {
  onViewAnalysis: (decision: TrackedDecision) => void
}

function getPatternInsights(decisions: TrackedDecision[]): string[] {
  const insights: string[] = []
  const completed = decisions.filter(d => d.outcome && d.outcome.status !== 'pending')

  if (completed.length < 2) {
    if (decisions.length > 0) {
      insights.push(`You have ${decisions.length} tracked decision${decisions.length > 1 ? 's' : ''}. Complete outcomes to unlock pattern analysis.`)
    }
    return insights
  }

  // Accuracy analysis
  const withRating = completed.filter(d => d.outcome && d.outcome.accuracyRating > 0)
  if (withRating.length >= 2) {
    const avgAccuracy = withRating.reduce((sum, d) => sum + (d.outcome?.accuracyRating ?? 0), 0) / withRating.length
    if (avgAccuracy >= 4) {
      insights.push(`Sifra's analyses have been highly accurate for you (avg ${avgAccuracy.toFixed(1)}/5). You can lean more heavily on the recommendations.`)
    } else if (avgAccuracy <= 2.5) {
      insights.push(`Analysis accuracy has been moderate (avg ${avgAccuracy.toFixed(1)}/5). Consider providing more context in your decisions for better results.`)
    }
  }

  // Success rate
  const successes = completed.filter(d => d.outcome?.status === 'success').length
  const failures = completed.filter(d => d.outcome?.status === 'failed').length
  const successRate = Math.round((successes / completed.length) * 100)
  insights.push(`Decision success rate: ${successRate}% (${successes} successful, ${failures} failed out of ${completed.length} completed)`)

  // Consensus score correlation
  const highConsensus = completed.filter(d => d.consensusScore >= 70)
  const lowConsensus = completed.filter(d => d.consensusScore < 50)
  if (highConsensus.length >= 2 && lowConsensus.length >= 1) {
    const highSuccess = highConsensus.filter(d => d.outcome?.status === 'success').length / highConsensus.length
    const lowSuccess = lowConsensus.filter(d => d.outcome?.status === 'success').length / lowConsensus.length
    if (highSuccess > lowSuccess + 0.2) {
      insights.push('Decisions with higher consensus scores tend to work out better for you. Pay extra attention when advisors disagree.')
    }
  }

  // Category analysis
  const categories = [...new Set(decisions.map(d => d.contextTag).filter(Boolean))]
  if (categories.length >= 2) {
    const catCounts = categories.map(c => ({
      cat: c,
      count: decisions.filter(d => d.contextTag === c).length
    })).sort((a, b) => b.count - a.count)
    insights.push(`Most analyzed area: ${catCounts[0].cat} (${catCounts[0].count} decisions). Consider diversifying your strategic focus.`)
  }

  // Time-based patterns
  const withOutcomes = completed.filter(d => d.outcome?.reflection)
  if (withOutcomes.length >= 3) {
    const mentionsTime = withOutcomes.filter(d =>
      d.outcome?.reflection?.toLowerCase().includes('time') ||
      d.outcome?.reflection?.toLowerCase().includes('longer') ||
      d.outcome?.reflection?.toLowerCase().includes('underestimate')
    )
    if (mentionsTime.length >= 2) {
      insights.push('Pattern detected: You tend to underestimate execution time. Build in 30-50% buffer for future plans.')
    }
  }

  return insights
}

export default function DecisionMemory({ onViewAnalysis }: DecisionMemoryProps) {
  const [decisions, setDecisions] = useState<TrackedDecision[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [editingOutcome, setEditingOutcome] = useState<string | null>(null)
  const [outcomeForm, setOutcomeForm] = useState<Partial<DecisionOutcome>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MEMORY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setDecisions(parsed)
      }
      // Also load from regular history
      const historyStr = localStorage.getItem('sifra_x_history')
      if (historyStr) {
        const history = JSON.parse(historyStr)
        if (Array.isArray(history)) {
          const memoryStr = localStorage.getItem(MEMORY_KEY)
          const existing = memoryStr ? JSON.parse(memoryStr) : []
          const existingIds = new Set(Array.isArray(existing) ? existing.map((d: TrackedDecision) => d.id) : [])
          const newFromHistory = history
            .filter((h: Record<string, unknown>) => !existingIds.has(h.id as string))
            .map((h: Record<string, unknown>) => ({
              ...h,
              predictedOutcome: (h as Record<string, unknown>).recommendation as string ?? '',
              deadline: '',
              outcome: undefined,
            }))
          if (newFromHistory.length > 0) {
            const merged = [...(Array.isArray(existing) ? existing : []), ...newFromHistory]
            setDecisions(merged)
            localStorage.setItem(MEMORY_KEY, JSON.stringify(merged))
          }
        }
      }
    } catch { /* ignore */ }
  }, [])

  const saveDecisions = useCallback((updated: TrackedDecision[]) => {
    setDecisions(updated)
    localStorage.setItem(MEMORY_KEY, JSON.stringify(updated))
  }, [])

  const handleDeleteDecision = useCallback((id: string) => {
    const updated = decisions.filter(d => d.id !== id)
    saveDecisions(updated)
    setDeleteConfirm(null)
  }, [decisions, saveDecisions])

  const startOutcomeEdit = useCallback((decision: TrackedDecision) => {
    setEditingOutcome(decision.id)
    setOutcomeForm(decision.outcome ?? {
      status: 'pending',
      reflection: '',
      actualResult: '',
      lessonsLearned: '',
      accuracyRating: 3,
      updatedAt: '',
    })
  }, [])

  const saveOutcome = useCallback(() => {
    if (!editingOutcome) return
    const updated = decisions.map(d => {
      if (d.id === editingOutcome) {
        return {
          ...d,
          outcome: {
            status: outcomeForm.status ?? 'pending',
            reflection: outcomeForm.reflection ?? '',
            actualResult: outcomeForm.actualResult ?? '',
            lessonsLearned: outcomeForm.lessonsLearned ?? '',
            accuracyRating: outcomeForm.accuracyRating ?? 3,
            updatedAt: new Date().toISOString(),
          } as DecisionOutcome,
        }
      }
      return d
    })
    saveDecisions(updated)
    setEditingOutcome(null)
    setOutcomeForm({})
  }, [editingOutcome, outcomeForm, decisions, saveDecisions])

  const patterns = useMemo(() => getPatternInsights(decisions), [decisions])

  const filtered = decisions.filter(d => {
    const matchesSearch = !searchQuery || d.decision.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'tracked' && !d.outcome) ||
      (filterStatus === 'completed' && d.outcome && d.outcome.status !== 'pending') ||
      (filterStatus === d.outcome?.status)
    return matchesSearch && matchesStatus
  })

  const statusConfig: Record<string, { label: string; color: string; icon: typeof FaCheckCircle }> = {
    pending: { label: 'Pending', color: 'hsl(31, 100%, 65%)', icon: FaRegClock },
    success: { label: 'Success', color: 'hsl(135, 94%, 60%)', icon: FaCheckCircle },
    partial: { label: 'Partial', color: 'hsl(191, 97%, 70%)', icon: FaChartLine },
    failed: { label: 'Failed', color: 'hsl(0, 100%, 62%)', icon: FaTimesCircle },
    abandoned: { label: 'Abandoned', color: 'hsl(228, 10%, 62%)', icon: FaTimes },
  }

  const stats = {
    total: decisions.length,
    tracked: decisions.filter(d => !d.outcome || d.outcome.status === 'pending').length,
    completed: decisions.filter(d => d.outcome && d.outcome.status !== 'pending').length,
    successRate: decisions.filter(d => d.outcome?.status === 'success').length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'hsl(265, 89%, 72%)' },
          { label: 'Tracking', value: stats.tracked, color: 'hsl(31, 100%, 65%)' },
          { label: 'Completed', value: stats.completed, color: 'hsl(191, 97%, 70%)' },
          { label: 'Successful', value: stats.successRate, color: 'hsl(135, 94%, 60%)' },
        ].map(stat => (
          <Card key={stat.label} className="bg-card border-border shadow-lg">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pattern Insights */}
      {patterns.length > 0 && (
        <Card className="bg-card border-border shadow-xl overflow-hidden"
          style={{ borderLeft: '3px solid hsl(31, 100%, 65%)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
              <FaLightbulb className="w-4 h-4" style={{ color: 'hsl(31, 100%, 65%)' }} />
              Decision Intelligence Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {patterns.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/30">
                <FaBrain className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'hsl(265, 89%, 72%)' }} />
                <p className="text-xs text-foreground/90 leading-relaxed">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tracked decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border text-foreground text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'tracked', 'completed', 'success', 'failed'].map(status => (
            <button key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                filterStatus === status
                  ? "border-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
              style={filterStatus === status ? { backgroundColor: 'hsl(265, 89%, 72%)' } : undefined}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Decision List */}
      {decisions.length === 0 ? (
        <Card className="bg-card border-border shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <FaChartLine className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No tracked decisions yet</h3>
            <p className="text-sm text-muted-foreground">
              Run your first analysis and save it to start tracking decisions and building your intelligence patterns.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-500px)]">
          <div className="space-y-3 pr-2">
            {filtered.map(decision => {
              const isEditing = editingOutcome === decision.id
              const isExpanded = expandedId === decision.id
              const outcomeStatus = decision.outcome?.status ?? 'pending'
              const sConfig = statusConfig[outcomeStatus] ?? statusConfig.pending
              const StatusIcon = sConfig.icon

              return (
                <Card key={decision.id} className="bg-card border-border shadow-lg overflow-hidden transition-all duration-200">
                  <button
                    className="w-full text-left p-4 flex items-center justify-between"
                    onClick={() => setExpandedId(isExpanded ? null : decision.id)}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${sConfig.color}15` }}>
                        <StatusIcon className="w-4 h-4" style={{ color: sConfig.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{decision.decision}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {decision.contextTag && (
                            <Badge variant="secondary" className="text-[10px] bg-secondary/60">{decision.contextTag}</Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">{decision.timestamp}</span>
                          <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: `${sConfig.color}20`, color: sConfig.color }}>
                            {sConfig.label}
                          </Badge>
                        </div>
                        {/* Mini consensus bar */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden max-w-[100px]">
                            <div className="h-full rounded-full" style={{
                              width: `${decision.consensusScore ?? 0}%`,
                              backgroundColor: (decision.consensusScore ?? 0) > 66 ? 'hsl(135, 94%, 60%)' : (decision.consensusScore ?? 0) > 33 ? 'hsl(31, 100%, 65%)' : 'hsl(0, 100%, 62%)',
                            }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{decision.consensusScore}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {isExpanded ? <FaChevronUp className="w-3 h-3 text-muted-foreground" /> :
                        <FaChevronDown className="w-3 h-3 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <CardContent className="px-4 pb-4 pt-0 space-y-4">
                      <Separator className="bg-border" />

                      {/* Prediction vs Outcome */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-secondary/30">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FaArrowRight className="w-2.5 h-2.5" /> Sifra Predicted
                          </p>
                          <p className="text-xs text-foreground/90">{decision.recommendation || decision.predictedOutcome || 'No prediction recorded'}</p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ backgroundColor: decision.outcome?.actualResult ? `${sConfig.color}08` : 'transparent', border: `1px dashed ${decision.outcome?.actualResult ? sConfig.color : 'hsl(232, 16%, 28%)'}` }}>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FaCheckCircle className="w-2.5 h-2.5" /> Actual Outcome
                          </p>
                          <p className="text-xs text-foreground/90">{decision.outcome?.actualResult || 'Not recorded yet'}</p>
                        </div>
                      </div>

                      {/* Outcome form or display */}
                      {isEditing ? (
                        <div className="space-y-3 p-4 rounded-xl border border-primary/30" style={{ backgroundColor: 'hsla(265, 89%, 72%, 0.04)' }}>
                          <p className="text-xs font-semibold text-foreground">Record Outcome</p>

                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Status</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(statusConfig).map(([key, cfg]) => {
                                const Icon = cfg.icon
                                return (
                                  <button key={key}
                                    onClick={() => setOutcomeForm({ ...outcomeForm, status: key as DecisionOutcome['status'] })}
                                    className={cn(
                                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all",
                                      outcomeForm.status === key ? "border-primary/50 shadow-sm" : "border-border"
                                    )}
                                    style={outcomeForm.status === key ? { backgroundColor: `${cfg.color}15` } : undefined}
                                  >
                                    <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                                    <span className={cn("font-medium", outcomeForm.status === key ? "text-foreground" : "text-muted-foreground")}>{cfg.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">What Actually Happened?</p>
                            <Textarea
                              placeholder="Describe the actual outcome..."
                              value={outcomeForm.actualResult ?? ''}
                              onChange={(e) => setOutcomeForm({ ...outcomeForm, actualResult: e.target.value })}
                              rows={2}
                              className="bg-input border-border text-foreground text-sm resize-none"
                            />
                          </div>

                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Reflection</p>
                            <Textarea
                              placeholder="What did you learn from this decision?"
                              value={outcomeForm.reflection ?? ''}
                              onChange={(e) => setOutcomeForm({ ...outcomeForm, reflection: e.target.value })}
                              rows={2}
                              className="bg-input border-border text-foreground text-sm resize-none"
                            />
                          </div>

                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Key Lessons</p>
                            <Textarea
                              placeholder="What lessons will you carry forward?"
                              value={outcomeForm.lessonsLearned ?? ''}
                              onChange={(e) => setOutcomeForm({ ...outcomeForm, lessonsLearned: e.target.value })}
                              rows={2}
                              className="bg-input border-border text-foreground text-sm resize-none"
                            />
                          </div>

                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                              How Accurate Was Sifra's Analysis? ({outcomeForm.accuracyRating ?? 3}/5)
                            </p>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map(n => (
                                <button key={n}
                                  onClick={() => setOutcomeForm({ ...outcomeForm, accuracyRating: n })}
                                  className={cn(
                                    "w-10 h-10 rounded-lg border text-sm font-bold transition-all",
                                    (outcomeForm.accuracyRating ?? 3) >= n ? "text-foreground shadow-sm" : "border-border text-muted-foreground"
                                  )}
                                  style={(outcomeForm.accuracyRating ?? 3) >= n ? {
                                    backgroundColor: n <= 2 ? 'hsla(0, 100%, 62%, 0.15)' : n <= 3 ? 'hsla(31, 100%, 65%, 0.15)' : 'hsla(135, 94%, 60%, 0.15)',
                                    borderColor: n <= 2 ? 'hsl(0, 100%, 62%)' : n <= 3 ? 'hsl(31, 100%, 65%)' : 'hsl(135, 94%, 60%)',
                                    color: n <= 2 ? 'hsl(0, 100%, 62%)' : n <= 3 ? 'hsl(31, 100%, 65%)' : 'hsl(135, 94%, 60%)',
                                  } : undefined}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={saveOutcome}
                              className="flex-1 text-xs font-semibold rounded-xl"
                              style={{ background: 'linear-gradient(135deg, hsl(265, 89%, 72%), hsl(265, 89%, 62%))' }}>
                              Save Outcome
                            </Button>
                            <Button variant="outline" onClick={() => setEditingOutcome(null)}
                              className="text-xs border-border text-foreground">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm"
                            onClick={(e) => { e.stopPropagation(); startOutcomeEdit(decision) }}
                            className="text-xs border-border text-foreground hover:bg-secondary">
                            <FaPencilAlt className="w-3 h-3 mr-1.5" />
                            {decision.outcome ? 'Update Outcome' : 'Record Outcome'}
                          </Button>
                          <Button variant="outline" size="sm"
                            onClick={(e) => { e.stopPropagation(); onViewAnalysis(decision) }}
                            className="text-xs border-border text-foreground hover:bg-secondary">
                            <FaBrain className="w-3 h-3 mr-1.5" />
                            View Analysis
                          </Button>
                          {deleteConfirm === decision.id ? (
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="destructive" className="h-8 text-xs"
                                onClick={() => handleDeleteDecision(decision.id)}>
                                Confirm Delete
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 text-xs"
                                onClick={() => setDeleteConfirm(null)}>
                                <FaTimes className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm"
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(decision.id) }}
                              className="text-xs text-muted-foreground hover:text-destructive">
                              <FaTrash className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Show existing outcome details */}
                      {decision.outcome && decision.outcome.status !== 'pending' && !isEditing && (
                        <div className="space-y-2 mt-2">
                          {decision.outcome.reflection && (
                            <div className="p-2.5 rounded-lg bg-secondary/30">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Reflection</p>
                              <p className="text-xs text-foreground/90">{decision.outcome.reflection}</p>
                            </div>
                          )}
                          {decision.outcome.lessonsLearned && (
                            <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'hsla(31, 100%, 65%, 0.06)', borderLeft: '2px solid hsl(31, 100%, 65%)' }}>
                              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'hsl(31, 100%, 65%)' }}>Lessons Learned</p>
                              <p className="text-xs text-foreground/90">{decision.outcome.lessonsLearned}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">Analysis Accuracy:</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(n => (
                                <div key={n} className="w-4 h-4 rounded-sm"
                                  style={{
                                    backgroundColor: n <= (decision.outcome?.accuracyRating ?? 0) ?
                                      (n <= 2 ? 'hsl(0, 100%, 62%)' : n <= 3 ? 'hsl(31, 100%, 65%)' : 'hsl(135, 94%, 60%)') :
                                      'hsl(232, 16%, 28%)'
                                  }} />
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{decision.outcome.accuracyRating}/5</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No decisions match your filters.</p>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
