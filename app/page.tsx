'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent } from '@/components/ui/card'
import { FaBrain, FaBriefcase, FaGraduationCap, FaBolt, FaPalette, FaRocket } from 'react-icons/fa'
import Sidebar from './sections/Sidebar'
import AnalysisInput from './sections/AnalysisInput'
import LoadingState from './sections/LoadingState'
import ResultsDisplay from './sections/ResultsDisplay'
import HistoryPanel, { type SavedAnalysis } from './sections/HistoryPanel'
import PersonalContext, { buildContextPrompt, type UserProfile } from './sections/PersonalContext'
import DecisionMemory, { type TrackedDecision } from './sections/DecisionMemory'

const MANAGER_AGENT_ID = '69a27e6bd56a3c78b8262a4e'

type ViewType = 'analysis' | 'history' | 'profile' | 'memory' | 'about'

const AGENTS = [
  { id: '69a27e6bd56a3c78b8262a4e', name: 'Strategy Orchestrator', role: 'Manager', color: 'hsl(265, 89%, 72%)' },
  { id: '69a27e4ca96eb35aa78a9c87', name: 'Logical Analyst', role: 'Data-driven analysis', color: 'hsl(191, 97%, 70%)' },
  { id: '69a27e4c8e6d0e51fd5cd3c6', name: 'CEO Strategist', role: 'Business strategy', color: 'hsl(31, 100%, 65%)' },
  { id: '69a27e4da96eb35aa78a9c89', name: 'Professor Guide', role: 'Educational guidance', color: 'hsl(135, 94%, 60%)' },
  { id: '69a27e4d99680de146f8c21e', name: 'Brutal Critic', role: 'Reality checks', color: 'hsl(326, 100%, 68%)' },
  { id: '69a27e4dd56a3c78b8262a4c', name: 'Creative Visionary', role: 'Innovation', color: 'hsl(265, 89%, 72%)' },
]

const SAMPLE_RESULT = {
  boardroom_discussion: {
    key_conflicts: [
      { between: 'CEO Strategist vs Brutal Critic', topic: 'Timing', summary: 'The CEO sees a strong market window while the Critic argues the prototype needs 6 more months of validation before market entry.' },
      { between: 'Logical Analyst vs Creative Visionary', topic: 'Revenue Model', summary: 'The Analyst recommends a proven SaaS subscription model, but the Visionary advocates for a disruptive freemium-to-enterprise flywheel.' },
    ],
    agreements: ['All advisors agree the AI market opportunity is real and growing rapidly.', 'Consensus that the 3-year savings runway provides adequate buffer for experimentation.', 'Universal agreement that the working prototype is a strong differentiator.'],
    logical_clarification: 'Data shows that SaaS startups with working prototypes at launch have a 3.2x higher survival rate. The 3-year runway aligns with typical Series A timelines.',
    creative_synthesis: 'Consider a hybrid approach: launch a focused beta to 50 design partners while keeping consulting income for 6 months, creating both validation data and early revenue.',
    professor_insight: 'Historical pattern analysis shows the most successful founder transitions happen when corporate expertise directly maps to the startup domain. Ensure your corporate network becomes your first customer pipeline.',
  },
  strategic_summary: {
    recommendation: 'Proceed with a staged transition: Begin with a 3-month moonlighting phase to validate product-market fit, then make the full leap with early customer traction as your safety net.',
    consensus_score: 74,
    priority_level: 'High',
    next_action: 'Identify and reach out to 10 potential design partners from your corporate network this week to gauge interest in a beta program.',
  },
  individual_analyses: [
    { mode_name: 'Logical Analyst', mode_icon: 'brain', summary: 'The numbers support a cautious go. With a working prototype and 3-year runway, the risk-adjusted expected value is positive, assuming you hit product-market fit within 18 months.', verdict: 'Conditional Go - proceed with clear milestones and kill criteria.', full_analysis: { details: 'Success probability estimated at 35-40% based on comparable SaaS launches.\n\n**Key Variables:**\n- Market timing (favorable)\n- Prototype maturity (moderate)\n- Founder domain expertise (high)\n- Competitive landscape (intensifying)\n\n**Risk Factors:**\n- Burn rate without revenue: ~$4K/month\n- Time to first paying customer: 4-8 months estimated' }, pros: ['Working prototype reduces technical risk', '3-year runway exceeds average'], cons: ['No validated revenue model yet', 'Competitive market'], success_probability: 38 },
    { mode_name: 'CEO Strategist', mode_icon: 'briefcase', summary: 'The market window for AI tools is narrowing. First-mover advantage in your niche could be worth more than another year of corporate salary. The prototype is your unfair advantage.', verdict: 'Strong Go - speed is your competitive moat.', full_analysis: { details: 'Market opportunity is estimated at $2.4B by 2026 in your specific vertical.\n\nExecution strategy should prioritize landing 3 enterprise pilots within Q1.' }, market_opportunity: 'AI tools market growing 40% YoY in your vertical', competitive_edge: 'Working prototype + domain expertise = 12-month head start', execution_strategy: ['Month 1-2: Beta launch with 10 design partners', 'Month 3-4: Iterate based on feedback', 'Month 5-6: Begin monetization'] },
    { mode_name: 'Professor Guide', mode_icon: 'graduation-cap', summary: 'This decision mirrors the classic "explore vs exploit" dilemma in decision theory. Your corporate experience has given you exploitation skills; now is the time to explore.', verdict: 'Go with structured learning milestones.', full_analysis: { details: 'Core concepts at play: opportunity cost theory, sunk cost fallacy avoidance, and lean startup methodology.' }, core_concepts: ['Opportunity Cost Theory', 'Lean Startup Methodology'], step_by_step_roadmap: [{ phase: 1, title: 'Validation', description: 'Spend 4 weeks validating with 20 potential customers' }, { phase: 2, title: 'MVP Launch', description: 'Launch minimum viable product to first 5 paying customers' }], required_skills: ['Sales and customer development', 'Financial modeling'] },
    { mode_name: 'Brutal Critic', mode_icon: 'lightning', summary: 'Your prototype is not your product. You have zero paying customers, zero market validation, and your "3 years of savings" will evaporate faster than you think.', verdict: 'Do NOT quit until you have 3 paying customers.', full_analysis: { details: 'Hard reality: 90% of SaaS startups fail. Your savings buffer is an illusion of safety.' }, hard_truths: ['Zero revenue validation so far', 'Corporate skills do not equal startup skills'], blind_spots: ['You are overestimating prototype readiness', 'Health insurance costs alone could be $800/month'], must_fix: ['Get 3 paying customers before quitting', 'Build a 6-month emergency fund separate from business runway'] },
    { mode_name: 'Creative Visionary', mode_icon: 'palette', summary: 'Forget the binary quit-or-stay framing. Create a third option: negotiate a 4-day work week, launch on the side, and let customer demand pull you into full-time entrepreneurship.', verdict: 'Reframe the decision - create a bridge path.', full_analysis: { details: 'The most innovative founders today are building in public while maintaining income stability.' }, innovative_twists: ['Launch as an open-source tool first to build community', 'Partner with an AI influencer for co-creation'], hybrid_alternative: 'Negotiate reduced hours at current job, launch beta simultaneously, transition when MRR hits $5K', wild_card: 'Apply to Y Combinator with your prototype - if accepted, that is your signal to go all-in.' },
  ],
}

interface ParsedResult {
  boardroom_discussion: Record<string, unknown>
  strategic_summary: Record<string, unknown>
  individual_analyses: Record<string, unknown>[]
}

function parseManagerResponse(apiResponse: Record<string, unknown>): ParsedResult | null {
  const paths = [
    apiResponse,
    (apiResponse as Record<string, unknown>)?.result,
    ((apiResponse as Record<string, unknown>)?.result as Record<string, unknown>)?.response,
    ((apiResponse as Record<string, unknown>)?.result as Record<string, unknown>)?.result,
  ]
  for (const candidate of paths) {
    if (!candidate || typeof candidate !== 'object') continue
    const obj = candidate as Record<string, unknown>
    if (obj.boardroom_discussion || obj.strategic_summary || obj.individual_analyses) {
      return {
        boardroom_discussion: (obj.boardroom_discussion as Record<string, unknown>) ?? {},
        strategic_summary: (obj.strategic_summary as Record<string, unknown>) ?? {},
        individual_analyses: Array.isArray(obj.individual_analyses) ? obj.individual_analyses : [],
      }
    }
  }
  if (typeof (apiResponse as Record<string, unknown>)?.result === 'string') {
    try {
      const parsed = JSON.parse((apiResponse as Record<string, unknown>).result as string)
      if (parsed?.boardroom_discussion || parsed?.strategic_summary || parsed?.individual_analyses) {
        return {
          boardroom_discussion: parsed.boardroom_discussion ?? {},
          strategic_summary: parsed.strategic_summary ?? {},
          individual_analyses: Array.isArray(parsed.individual_analyses) ? parsed.individual_analyses : [],
        }
      }
    } catch { /* not JSON string */ }
  }
  return null
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <Card className="bg-card border-border shadow-2xl max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'hsla(0, 100%, 62%, 0.1)' }}>
                <FaBolt className="w-6 h-6" style={{ color: 'hsl(0, 100%, 62%)' }} />
              </div>
              <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
              <button onClick={() => this.setState({ hasError: false, error: '' })}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, hsl(265, 89%, 72%), hsl(265, 89%, 62%))' }}>
                Try again
              </button>
            </CardContent>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Page() {
  const [activeView, setActiveView] = useState<ViewType>('analysis')
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ParsedResult | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [currentDecision, setCurrentDecision] = useState('')
  const [currentTag, setCurrentTag] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [useSample, setUseSample] = useState(false)
  const [viewingHistory, setViewingHistory] = useState<SavedAnalysis | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  // Load profile on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sifra_x_user_profile')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.name) {
          setUserProfile(parsed)
          setHasProfile(true)
        }
      }
    } catch { /* ignore */ }
  }, [])

  const handleProfileUpdate = useCallback((profile: UserProfile) => {
    setUserProfile(profile)
    setHasProfile(true)
  }, [])

  const handleAnalyze = useCallback(async (decision: string, contextTag: string) => {
    setIsLoading(true)
    setErrorMsg('')
    setAnalysisResult(null)
    setExpandedCards(new Set())
    setCurrentDecision(decision)
    setCurrentTag(contextTag)
    setActiveAgentId(MANAGER_AGENT_ID)
    setSavedMsg('')

    try {
      // Build the personalized message
      let message = ''

      // Add personal context if available
      if (userProfile) {
        const contextPrompt = buildContextPrompt(userProfile)
        if (contextPrompt) {
          message += contextPrompt + '\n\n'
        }
      }

      // Add context tag
      if (contextTag) {
        message += `[Decision Category: ${contextTag}]\n\n`
      }

      message += `[DECISION TO ANALYZE]\n${decision}`

      const result = await callAIAgent(message, MANAGER_AGENT_ID)

      if (result.success && result.response) {
        const parsed = parseManagerResponse(result.response as unknown as Record<string, unknown>)
        if (parsed) {
          setAnalysisResult(parsed)
        } else {
          setErrorMsg('Response received but could not parse the strategic analysis. The agent may have returned an unexpected format.')
        }
      } else {
        setErrorMsg(result.error ?? result.response?.message ?? 'Analysis failed. Please try again.')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error occurred.')
    } finally {
      setIsLoading(false)
      setActiveAgentId(null)
    }
  }, [userProfile])

  const handleToggleCard = useCallback((index: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const handleSave = useCallback(() => {
    if (!analysisResult) return
    const saved: SavedAnalysis = {
      id: Date.now().toString(),
      decision: currentDecision,
      contextTag: currentTag,
      consensusScore: (analysisResult.strategic_summary as Record<string, unknown>)?.consensus_score as number ?? 0,
      priorityLevel: ((analysisResult.strategic_summary as Record<string, unknown>)?.priority_level as string) ?? '',
      recommendation: ((analysisResult.strategic_summary as Record<string, unknown>)?.recommendation as string) ?? '',
      timestamp: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      fullResult: analysisResult as unknown as Record<string, unknown>,
    }
    try {
      // Save to history
      const existing = JSON.parse(localStorage.getItem('sifra_x_history') ?? '[]')
      const updated = Array.isArray(existing) ? [saved, ...existing] : [saved]
      localStorage.setItem('sifra_x_history', JSON.stringify(updated))

      // Also save to decision memory for tracking
      const memoryKey = 'sifra_x_decisions'
      const memExisting = JSON.parse(localStorage.getItem(memoryKey) ?? '[]')
      const trackedDecision: TrackedDecision = {
        ...saved,
        predictedOutcome: saved.recommendation,
        deadline: '',
        outcome: undefined,
      }
      const memUpdated = Array.isArray(memExisting) ? [trackedDecision, ...memExisting] : [trackedDecision]
      localStorage.setItem(memoryKey, JSON.stringify(memUpdated))

      setSavedMsg('Analysis saved to History & Decision Memory')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch { /* ignore */ }
  }, [analysisResult, currentDecision, currentTag])

  const handleNewAnalysis = useCallback(() => {
    setAnalysisResult(null)
    setExpandedCards(new Set())
    setCurrentDecision('')
    setCurrentTag('')
    setErrorMsg('')
    setViewingHistory(null)
    setUseSample(false)
    setSavedMsg('')
  }, [])

  const handleViewHistory = useCallback((analysis: SavedAnalysis) => {
    const parsed = parseManagerResponse(analysis.fullResult)
    if (parsed) {
      setAnalysisResult(parsed)
      setCurrentDecision(analysis.decision)
      setCurrentTag(analysis.contextTag)
      setExpandedCards(new Set())
      setActiveView('analysis')
      setViewingHistory(analysis)
    }
  }, [])

  const handleViewTrackedDecision = useCallback((decision: TrackedDecision) => {
    const parsed = parseManagerResponse(decision.fullResult)
    if (parsed) {
      setAnalysisResult(parsed)
      setCurrentDecision(decision.decision)
      setCurrentTag(decision.contextTag)
      setExpandedCards(new Set())
      setActiveView('analysis')
    }
  }, [])

  const handleToggleSample = useCallback(() => {
    if (!useSample) {
      setAnalysisResult({
        boardroom_discussion: SAMPLE_RESULT.boardroom_discussion,
        strategic_summary: SAMPLE_RESULT.strategic_summary,
        individual_analyses: SAMPLE_RESULT.individual_analyses,
      })
      setCurrentDecision('Should I leave my corporate job to launch a SaaS product in the AI space?')
      setCurrentTag('Startup')
      setExpandedCards(new Set())
      setUseSample(true)
    } else {
      handleNewAnalysis()
    }
  }, [useSample, handleNewAnalysis])

  const VIEW_TITLES: Record<ViewType, string> = {
    analysis: 'Decision Analysis',
    history: 'Analysis History',
    profile: 'Personal Context',
    memory: 'Decision Memory',
    about: 'About Sifra X',
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground font-sans flex">
        <Sidebar activeView={activeView} onNavigate={(v) => { setActiveView(v); if (v === 'analysis') setViewingHistory(null) }} />

        <main className="flex-1 min-h-screen md:ml-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="md:hidden w-10" />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {VIEW_TITLES[activeView]}
                </h1>
                {activeView === 'analysis' && hasProfile && userProfile?.name && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Personalized for {userProfile.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeView === 'analysis' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-muted-foreground">Sample</span>
                    <button
                      onClick={handleToggleSample}
                      className="relative w-10 h-5 rounded-full transition-colors duration-200"
                      style={{ backgroundColor: useSample ? 'hsl(265, 89%, 72%)' : 'hsl(232, 16%, 28%)' }}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${useSample ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </label>
                )}
              </div>
            </div>

            {/* Success message */}
            {savedMsg && (
              <div className="mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: 'hsla(135, 94%, 60%, 0.1)', color: 'hsl(135, 94%, 60%)' }}>
                <FaRocket className="w-3.5 h-3.5" />
                {savedMsg}
              </div>
            )}

            {/* === ANALYSIS VIEW === */}
            {activeView === 'analysis' && (
              <div className="space-y-6">
                {/* Personal context compact view */}
                {hasProfile && !analysisResult && !isLoading && (
                  <PersonalContext onProfileUpdate={handleProfileUpdate} compact={true} />
                )}

                {!analysisResult && !isLoading && (
                  <AnalysisInput onAnalyze={handleAnalyze} isLoading={isLoading} />
                )}

                {/* Setup prompt for new users */}
                {!hasProfile && !analysisResult && !isLoading && (
                  <Card className="bg-card border-border shadow-lg overflow-hidden"
                    style={{ borderLeft: '3px solid hsl(135, 94%, 60%)' }}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'hsla(135, 94%, 60%, 0.12)' }}>
                        <FaRocket className="w-4 h-4" style={{ color: 'hsl(135, 94%, 60%)' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Get personalized analysis</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Set up your profile so every analysis is tailored to your situation, skills, and goals.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveView('profile')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ backgroundColor: 'hsla(135, 94%, 60%, 0.12)', color: 'hsl(135, 94%, 60%)' }}
                      >
                        Set Up
                      </button>
                    </CardContent>
                  </Card>
                )}

                {isLoading && <LoadingState />}

                {errorMsg && !isLoading && (
                  <Card className="bg-card border-destructive/50 shadow-lg">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'hsla(0, 100%, 62%, 0.1)' }}>
                        <FaBolt className="w-4 h-4" style={{ color: 'hsl(0, 100%, 62%)' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-destructive font-medium">{errorMsg}</p>
                        <button onClick={handleNewAnalysis} className="text-xs text-muted-foreground mt-1 underline">Try again</button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analysisResult && !isLoading && (
                  <ResultsDisplay
                    analyses={Array.isArray(analysisResult.individual_analyses) ? analysisResult.individual_analyses as Array<Record<string, unknown>> : []}
                    discussion={analysisResult.boardroom_discussion as Record<string, unknown>}
                    summary={analysisResult.strategic_summary as Record<string, unknown>}
                    expandedCards={expandedCards}
                    onToggleCard={handleToggleCard}
                    onSave={handleSave}
                    onNewAnalysis={handleNewAnalysis}
                    decision={currentDecision}
                  />
                )}

                {/* Agent Status Panel */}
                <Card className="bg-card border-border shadow-lg">
                  <CardContent className="p-4">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Agent Boardroom</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {AGENTS.map((agent) => (
                        <div key={agent.id} className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-300"
                          style={{ backgroundColor: activeAgentId === agent.id ? `${agent.color}10` : 'hsla(232, 16%, 24%, 0.5)' }}>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeAgentId === agent.id ? 'animate-pulse' : ''}`}
                            style={{ backgroundColor: activeAgentId === agent.id ? agent.color : activeAgentId ? 'hsl(232, 16%, 28%)' : 'hsl(228, 10%, 62%)' }} />
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-foreground truncate">{agent.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* === PROFILE VIEW === */}
            {activeView === 'profile' && (
              <PersonalContext onProfileUpdate={handleProfileUpdate} />
            )}

            {/* === HISTORY VIEW === */}
            {activeView === 'history' && (
              <HistoryPanel onViewAnalysis={handleViewHistory} />
            )}

            {/* === DECISION MEMORY VIEW === */}
            {activeView === 'memory' && (
              <DecisionMemory onViewAnalysis={handleViewTrackedDecision} />
            )}

            {/* === ABOUT VIEW === */}
            {activeView === 'about' && (
              <Card className="bg-card border-border shadow-xl">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, hsl(265, 89%, 72%), hsl(265, 89%, 55%))' }}>
                      <span className="text-white font-bold text-lg">SX</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Sifra <span style={{ color: 'hsl(265, 89%, 72%)' }}>X</span>
                      </h2>
                      <p className="text-sm text-muted-foreground">Multi-Perspective Strategic Intelligence System</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Sifra X helps ambitious decision-makers break through single-perspective thinking. Input any decision and receive analysis from five distinct strategic personalities, followed by a boardroom-style cross-examination and consensus score. With the Personal Context Engine, every analysis is tailored to your specific situation. The Decision Memory System tracks your decisions over time, building intelligence patterns unique to you.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-border bg-secondary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FaRocket className="w-4 h-4" style={{ color: 'hsl(265, 89%, 72%)' }} />
                        <p className="text-sm font-semibold text-foreground">Personal Context</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your goals, skills, risk tolerance, and situation are woven into every analysis for truly personalized advice.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-secondary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FaBrain className="w-4 h-4" style={{ color: 'hsl(191, 97%, 70%)' }} />
                        <p className="text-sm font-semibold text-foreground">Decision Memory</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Track decisions over time, compare predictions vs outcomes, and discover your decision-making patterns.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">The Five Advisors</p>
                    {[
                      { icon: FaBrain, name: 'Logical Analyst', desc: 'Objective, data-driven analysis with pros/cons and risk assessment', color: 'hsl(191, 97%, 70%)' },
                      { icon: FaBriefcase, name: 'CEO Strategist', desc: 'Market opportunity, competitive edge, and execution strategy', color: 'hsl(31, 100%, 65%)' },
                      { icon: FaGraduationCap, name: 'Professor Guide', desc: 'Core concepts, step-by-step roadmap, and learning directions', color: 'hsl(135, 94%, 60%)' },
                      { icon: FaBolt, name: 'Brutal Critic', desc: 'Hard truths, blind spots, and unflinching reality checks', color: 'hsl(326, 100%, 68%)' },
                      { icon: FaPalette, name: 'Creative Visionary', desc: 'Innovative twists, hybrid alternatives, and wild card ideas', color: 'hsl(265, 89%, 72%)' },
                    ].map((mode) => {
                      const Icon = mode.icon
                      return (
                        <div key={mode.name} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${mode.color}15` }}>
                            <Icon className="w-4 h-4" style={{ color: mode.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{mode.name}</p>
                            <p className="text-xs text-muted-foreground">{mode.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-4 border-t border-border">Powered by Lyzr</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
