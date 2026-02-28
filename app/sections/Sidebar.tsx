'use client'

import { FaPlus, FaHistory, FaInfoCircle, FaBars, FaTimes } from 'react-icons/fa'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  activeView: 'analysis' | 'history' | 'about'
  onNavigate: (view: 'analysis' | 'history' | 'about') => void
}

const NAV_ITEMS: { id: 'analysis' | 'history' | 'about'; label: string; icon: typeof FaPlus }[] = [
  { id: 'analysis', label: 'New Analysis', icon: FaPlus },
  { id: 'history', label: 'History', icon: FaHistory },
  { id: 'about', label: 'About', icon: FaInfoCircle },
]

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground"
        >
          {mobileOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-40 flex flex-col border-r border-border transition-transform duration-300 md:translate-x-0 md:relative md:z-auto",
          "w-64 py-6 px-4",
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: 'hsl(231, 18%, 12%)' }}
      >
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sifra <span style={{ color: 'hsl(265, 89%, 72%)' }}>X</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-tight">
            Strategic Intelligence
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  setMobileOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
                style={isActive ? { backgroundColor: 'hsl(265, 89%, 72%)' } : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto px-2 pt-4 border-t border-border">
          <p className="text-[11px] text-muted-foreground">Powered by Lyzr</p>
        </div>
      </aside>
    </>
  )
}
