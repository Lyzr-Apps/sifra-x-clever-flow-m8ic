'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  FaUser, FaBullseye, FaClock, FaWallet, FaShieldAlt,
  FaChevronDown, FaChevronUp, FaCheck, FaStar, FaCode,
  FaChartLine, FaEdit, FaTimes
} from 'react-icons/fa'

export interface UserProfile {
  name: string
  goals: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  skills: string[]
  timeAvailability: 'very_limited' | 'part_time' | 'full_time' | 'unlimited'
  hoursPerWeek: number
  financialSituation: 'tight' | 'moderate' | 'comfortable' | 'abundant'
  monthlyBudget: string
  riskTolerance: number
  background: string
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  goals: [],
  skillLevel: 'intermediate',
  skills: [],
  timeAvailability: 'full_time',
  hoursPerWeek: 40,
  financialSituation: 'moderate',
  monthlyBudget: '',
  riskTolerance: 50,
  background: '',
}

const STORAGE_KEY = 'sifra_x_user_profile'

const SKILL_LEVELS = [
  { id: 'beginner' as const, label: 'Beginner', desc: 'Just starting out', icon: FaStar },
  { id: 'intermediate' as const, label: 'Intermediate', desc: '1-3 years experience', icon: FaCode },
  { id: 'advanced' as const, label: 'Advanced', desc: '3-7 years experience', icon: FaChartLine },
  { id: 'expert' as const, label: 'Expert', desc: '7+ years, deep expertise', icon: FaBullseye },
]

const TIME_OPTIONS = [
  { id: 'very_limited' as const, label: 'Very Limited', desc: '<10 hrs/week', hours: 8 },
  { id: 'part_time' as const, label: 'Part-Time', desc: '10-25 hrs/week', hours: 20 },
  { id: 'full_time' as const, label: 'Full-Time', desc: '25-50 hrs/week', hours: 40 },
  { id: 'unlimited' as const, label: 'All-In', desc: '50+ hrs/week', hours: 60 },
]

const FINANCIAL_OPTIONS = [
  { id: 'tight' as const, label: 'Tight', desc: 'Limited budget, careful spending', color: 'hsl(0, 100%, 62%)' },
  { id: 'moderate' as const, label: 'Moderate', desc: 'Some flexibility for investments', color: 'hsl(31, 100%, 65%)' },
  { id: 'comfortable' as const, label: 'Comfortable', desc: 'Solid savings, can take risks', color: 'hsl(135, 94%, 60%)' },
  { id: 'abundant' as const, label: 'Abundant', desc: 'Well-funded, financial freedom', color: 'hsl(191, 97%, 70%)' },
]

const GOAL_SUGGESTIONS = [
  'Build a startup', 'Career transition', 'Financial independence',
  'Learn new skills', 'Grow my business', 'Side project',
  'Get promoted', 'Find product-market fit', 'Build personal brand',
]

interface PersonalContextProps {
  onProfileUpdate: (profile: UserProfile) => void
  compact?: boolean
}

export default function PersonalContext({ onProfileUpdate, compact = false }: PersonalContextProps) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object') {
          setProfile({ ...DEFAULT_PROFILE, ...parsed })
          setHasProfile(true)
        }
      }
    } catch { /* ignore */ }
  }, [])

  const saveProfile = useCallback((updated: UserProfile) => {
    setProfile(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    onProfileUpdate(updated)
    setHasProfile(true)
  }, [onProfileUpdate])

  const addGoal = useCallback((goal: string) => {
    if (!goal.trim() || profile.goals.includes(goal.trim())) return
    const updated = { ...profile, goals: [...profile.goals, goal.trim()] }
    saveProfile(updated)
    setNewGoal('')
  }, [profile, saveProfile])

  const removeGoal = useCallback((goal: string) => {
    const updated = { ...profile, goals: profile.goals.filter(g => g !== goal) }
    saveProfile(updated)
  }, [profile, saveProfile])

  const addSkill = useCallback((skill: string) => {
    if (!skill.trim() || profile.skills.includes(skill.trim())) return
    const updated = { ...profile, skills: [...profile.skills, skill.trim()] }
    saveProfile(updated)
    setNewSkill('')
  }, [profile, saveProfile])

  const removeSkill = useCallback((skill: string) => {
    const updated = { ...profile, skills: profile.skills.filter(s => s !== skill) }
    saveProfile(updated)
  }, [profile, saveProfile])

  const getRiskLabel = (val: number) => {
    if (val <= 20) return 'Very Conservative'
    if (val <= 40) return 'Conservative'
    if (val <= 60) return 'Moderate'
    if (val <= 80) return 'Aggressive'
    return 'Very Aggressive'
  }

  const getRiskColor = (val: number) => {
    if (val <= 20) return 'hsl(191, 97%, 70%)'
    if (val <= 40) return 'hsl(135, 94%, 60%)'
    if (val <= 60) return 'hsl(31, 100%, 65%)'
    if (val <= 80) return 'hsl(326, 100%, 68%)'
    return 'hsl(0, 100%, 62%)'
  }

  const profileCompleteness = Math.round(
    ((profile.name ? 1 : 0) +
    (profile.goals.length > 0 ? 1 : 0) +
    (profile.skills.length > 0 ? 1 : 0) +
    (profile.background ? 1 : 0) +
    1 + 1 + 1) / 7 * 100
  )

  // Compact view for when it's shown alongside the input
  if (compact && hasProfile && !isEditing) {
    return (
      <Card className="bg-card border-border shadow-lg overflow-hidden transition-all duration-300"
        style={{ borderLeft: '3px solid hsl(265, 89%, 72%)' }}>
        <button
          className="w-full text-left p-4 flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'hsla(265, 89%, 72%, 0.15)' }}>
              <FaUser className="w-4 h-4" style={{ color: 'hsl(265, 89%, 72%)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {profile.name || 'Your Profile'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Personalized analysis active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-[10px] px-2 py-0.5 font-medium"
              style={{ backgroundColor: 'hsla(135, 94%, 60%, 0.15)', color: 'hsl(135, 94%, 60%)' }}>
              <FaCheck className="w-2.5 h-2.5 mr-1" />
              {profileCompleteness}%
            </Badge>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"
              onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}>
              <FaEdit className="w-3 h-3" />
            </Button>
            {isExpanded ? <FaChevronUp className="w-3 h-3 text-muted-foreground" /> :
              <FaChevronDown className="w-3 h-3 text-muted-foreground" />}
          </div>
        </button>
        {isExpanded && (
          <CardContent className="px-4 pb-4 pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-secondary/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Skill Level</p>
                <p className="text-xs font-medium text-foreground mt-0.5 capitalize">{profile.skillLevel}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-secondary/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{profile.hoursPerWeek} hrs/week</p>
              </div>
              <div className="p-2.5 rounded-lg bg-secondary/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Finances</p>
                <p className="text-xs font-medium text-foreground mt-0.5 capitalize">{profile.financialSituation}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-secondary/40">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: getRiskColor(profile.riskTolerance) }}>
                  {getRiskLabel(profile.riskTolerance)}
                </p>
              </div>
            </div>
            {Array.isArray(profile.goals) && profile.goals.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Goals</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.goals.map(g => (
                    <Badge key={g} variant="secondary" className="text-[10px] bg-secondary/60">{g}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  // Full editing view
  return (
    <Card className="bg-card border-border shadow-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsla(265, 89%, 72%, 0.2), hsla(191, 97%, 70%, 0.2))' }}>
              <FaUser className="w-5 h-5" style={{ color: 'hsl(265, 89%, 72%)' }} />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground tracking-tight">
                Personal Context Engine
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tell Sifra about yourself for personalized strategic advice
              </p>
            </div>
          </div>
          {isEditing && hasProfile && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground"
              onClick={() => setIsEditing(false)}>
              <FaTimes className="w-3 h-3 mr-1" /> Close
            </Button>
          )}
        </div>
        {/* Completeness bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Profile Completeness</span>
            <span className="text-xs font-semibold" style={{ color: 'hsl(265, 89%, 72%)' }}>{profileCompleteness}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${profileCompleteness}%`, background: 'linear-gradient(90deg, hsl(265, 89%, 72%), hsl(191, 97%, 70%))' }} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-3">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FaUser className="w-3 h-3" /> Your Name
          </label>
          <Input
            placeholder="What should we call you?"
            value={profile.name}
            onChange={(e) => saveProfile({ ...profile, name: e.target.value })}
            className="bg-input border-border text-foreground text-sm"
          />
        </div>

        {/* Goals */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FaBullseye className="w-3 h-3" /> Your Goals
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {Array.isArray(profile.goals) && profile.goals.map(goal => (
              <Badge key={goal} className="text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'hsla(265, 89%, 72%, 0.15)', color: 'hsl(265, 89%, 72%)' }}
                onClick={() => removeGoal(goal)}>
                {goal}
                <FaTimes className="w-2.5 h-2.5 opacity-60" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addGoal(newGoal) }}
              className="bg-input border-border text-foreground text-sm flex-1"
            />
            <Button variant="outline" size="sm" onClick={() => addGoal(newGoal)}
              className="border-border text-foreground text-xs">Add</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {GOAL_SUGGESTIONS.filter(s => !profile.goals.includes(s)).slice(0, 5).map(s => (
              <button key={s} onClick={() => addGoal(s)}
                className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
                + {s}
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Skill Level */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FaChartLine className="w-3 h-3" /> Experience Level
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SKILL_LEVELS.map(sl => {
              const Icon = sl.icon
              const active = profile.skillLevel === sl.id
              return (
                <button key={sl.id}
                  onClick={() => saveProfile({ ...profile, skillLevel: sl.id })}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all duration-200",
                    active ? "border-primary/50 shadow-md" : "border-border hover:border-foreground/20"
                  )}
                  style={active ? { backgroundColor: 'hsla(265, 89%, 72%, 0.08)' } : undefined}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon className="w-3 h-3" style={{ color: active ? 'hsl(265, 89%, 72%)' : 'hsl(228, 10%, 62%)' }} />
                    <span className={cn("text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground")}>{sl.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{sl.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FaCode className="w-3 h-3" /> Key Skills
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {Array.isArray(profile.skills) && profile.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs px-2.5 py-1 flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                onClick={() => removeSkill(skill)}>
                {skill} <FaTimes className="w-2.5 h-2.5 opacity-60" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g., Python, Marketing, Sales)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addSkill(newSkill) }}
              className="bg-input border-border text-foreground text-sm flex-1"
            />
            <Button variant="outline" size="sm" onClick={() => addSkill(newSkill)}
              className="border-border text-foreground text-xs">Add</Button>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Time Availability */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FaClock className="w-3 h-3" /> Time Availability
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_OPTIONS.map(opt => {
              const active = profile.timeAvailability === opt.id
              return (
                <button key={opt.id}
                  onClick={() => saveProfile({ ...profile, timeAvailability: opt.id, hoursPerWeek: opt.hours })}
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all duration-200",
                    active ? "border-primary/50 shadow-md" : "border-border hover:border-foreground/20"
                  )}
                  style={active ? { backgroundColor: 'hsla(191, 97%, 70%, 0.08)' } : undefined}
                >
                  <p className={cn("text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground")}>{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Financial Situation */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FaWallet className="w-3 h-3" /> Financial Situation
          </label>
          <div className="grid grid-cols-4 gap-2">
            {FINANCIAL_OPTIONS.map(opt => {
              const active = profile.financialSituation === opt.id
              return (
                <button key={opt.id}
                  onClick={() => saveProfile({ ...profile, financialSituation: opt.id })}
                  className={cn(
                    "p-2.5 rounded-xl border text-center transition-all duration-200",
                    active ? "border-primary/50 shadow-md" : "border-border hover:border-foreground/20"
                  )}
                  style={active ? { backgroundColor: `${opt.color}10` } : undefined}
                >
                  <p className={cn("text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground")}>{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 hidden md:block">{opt.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Risk Tolerance */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <FaShieldAlt className="w-3 h-3" /> Risk Tolerance
          </label>
          <div className="px-1">
            <Slider
              value={[profile.riskTolerance]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => saveProfile({ ...profile, riskTolerance: v[0] })}
              className="mb-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Conservative</span>
              <span className="text-xs font-bold" style={{ color: getRiskColor(profile.riskTolerance) }}>
                {getRiskLabel(profile.riskTolerance)} ({profile.riskTolerance}%)
              </span>
              <span className="text-[10px] text-muted-foreground">Aggressive</span>
            </div>
          </div>
        </div>

        {/* Background */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Brief Background (optional)
          </label>
          <textarea
            placeholder="Tell us a bit about your situation... e.g., 'I'm a software engineer with 5 years of experience looking to transition into founding my own company.'"
            value={profile.background}
            onChange={(e) => saveProfile({ ...profile, background: e.target.value })}
            rows={3}
            className="w-full rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none text-sm p-3 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {isEditing && hasProfile && (
          <Button
            onClick={() => setIsEditing(false)}
            className="w-full font-semibold text-sm py-4 rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, hsl(265, 89%, 72%), hsl(265, 89%, 62%))' }}
          >
            <FaCheck className="w-3.5 h-3.5 mr-2" />
            Save Profile
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function buildContextPrompt(profile: UserProfile): string {
  if (!profile.name && profile.goals.length === 0 && !profile.background) return ''

  const parts: string[] = ['[PERSONAL CONTEXT FOR PERSONALIZED ANALYSIS]']

  if (profile.name) parts.push(`Name: ${profile.name}`)
  if (profile.background) parts.push(`Background: ${profile.background}`)
  if (profile.goals.length > 0) parts.push(`Goals: ${profile.goals.join(', ')}`)
  if (profile.skills.length > 0) parts.push(`Key Skills: ${profile.skills.join(', ')}`)
  parts.push(`Experience Level: ${profile.skillLevel}`)
  parts.push(`Time Available: ${profile.hoursPerWeek} hours/week (${profile.timeAvailability.replace('_', ' ')})`)
  parts.push(`Financial Situation: ${profile.financialSituation}`)
  if (profile.monthlyBudget) parts.push(`Monthly Budget: ${profile.monthlyBudget}`)
  parts.push(`Risk Tolerance: ${profile.riskTolerance}% (${
    profile.riskTolerance <= 20 ? 'Very Conservative' :
    profile.riskTolerance <= 40 ? 'Conservative' :
    profile.riskTolerance <= 60 ? 'Moderate' :
    profile.riskTolerance <= 80 ? 'Aggressive' : 'Very Aggressive'
  })`)

  parts.push('[IMPORTANT: Tailor ALL analysis to this person\'s specific situation, skill level, time constraints, financial reality, and risk tolerance. Make recommendations actionable for THEIR context.]')

  return parts.join('\n')
}
