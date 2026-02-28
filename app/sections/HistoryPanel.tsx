'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FaSearch, FaTrash, FaTimes } from 'react-icons/fa'
import { cn } from '@/lib/utils'

export interface SavedAnalysis {
  id: string
  decision: string
  contextTag: string
  consensusScore: number
  priorityLevel: string
  recommendation: string
  timestamp: string
  fullResult: Record<string, unknown>
}

interface HistoryPanelProps {
  onViewAnalysis: (analysis: SavedAnalysis) => void
}

const CONTEXT_TAGS = ['All', 'Career', 'Startup', 'Investment', 'Education', 'Life Decision']

export default function HistoryPanel({ onViewAnalysis }: HistoryPanelProps) {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState('All')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sifra_x_history')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setAnalyses(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  const handleDelete = useCallback((id: string) => {
    const updated = analyses.filter((a) => a.id !== id)
    setAnalyses(updated)
    localStorage.setItem('sifra_x_history', JSON.stringify(updated))
    setDeleteConfirm(null)
  }, [analyses])

  const filtered = analyses.filter((a) => {
    const matchesSearch = !searchQuery || a.decision.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = filterTag === 'All' || a.contextTag === filterTag
    return matchesSearch && matchesTag
  })

  if (analyses.length === 0) {
    return (
      <Card className="bg-card border-border shadow-xl">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
            <FaSearch className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No analyses yet</h3>
          <p className="text-sm text-muted-foreground">
            Ask your first strategic question to get started!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border text-foreground text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CONTEXT_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all border",
              filterTag === tag
                ? "border-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            style={filterTag === tag ? { backgroundColor: 'hsl(265, 89%, 72%)' } : undefined}
          >
            {tag}
          </button>
        ))}
      </div>

      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="space-y-3 pr-2">
          {filtered.map((analysis) => (
            <Card
              key={analysis.id}
              className="bg-card border-border hover:border-primary/40 transition-all duration-200 cursor-pointer shadow-lg"
              onClick={() => onViewAnalysis(analysis)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {analysis.decision}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {analysis.contextTag && (
                        <Badge variant="secondary" className="text-[10px] bg-secondary text-secondary-foreground">
                          {analysis.contextTag}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {analysis.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[120px]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${analysis.consensusScore ?? 0}%`,
                            backgroundColor: (analysis.consensusScore ?? 0) > 66 ? 'hsl(135, 94%, 60%)' : (analysis.consensusScore ?? 0) > 33 ? 'hsl(31, 100%, 65%)' : 'hsl(0, 100%, 62%)',
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {analysis.consensusScore ?? 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {deleteConfirm === analysis.id ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => handleDelete(analysis.id)}>
                          Delete
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setDeleteConfirm(null)}>
                          <FaTimes className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(analysis.id) }}
                      >
                        <FaTrash className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No analyses match your search.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
