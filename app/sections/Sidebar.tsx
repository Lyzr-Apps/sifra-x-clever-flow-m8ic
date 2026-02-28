'use client'

import { FaPlus, FaHistory, FaInfoCircle, FaBars, FaTimes, FaUser, FaChartLine } from 'react-icons/fa'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type ViewType = 'analysis' | 'history' | 'profile' | 'memory' | 'about'

interface SidebarProps {
  activeView: ViewType
  onNavigate: (view: ViewType) => void
}

const NAV_ITEMS: { id: ViewType; label: string; icon: typeof FaPlus; section?: string }[] = [
  { id: 'analysis', label: 'New Analysis', icon: FaPlus, section: 'Analyze' },
  { id: 'profile', label: 'My Profile', icon: FaUser, section: 'Analyze' },
  { id: 'history', label: 'History', icon: FaHistory, section: 'Track' },
  { id: 'memory', label: 'Decision Memory', icon: FaChartLine, section: 'Track' },
  { id: 'about', label: 'About', icon: FaInfoCircle },
]

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  let lastSection = ''

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground bg-card/80 backdrop-blur-sm shadow-lg border border-border"
        >
          {mobileOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
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
        <div className="mb-8 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(265, 89%, 72%), hsl(265, 89%, 55%))' }}>
              <span className="text-white font-bold text-sm">SX</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground leading-tight">
                Sifra <span style={{ color: 'hsl(265, 89%, 72%)' }}>X</span>
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                Strategic Intelligence
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            const showSection = item.section && item.section !== lastSection
            if (item.section) lastSection = item.section

            return (
              <div key={item.id}>
                {showSection && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold px-3 pt-4 pb-1.5">
                    {item.section}
                  </p>
                )}
                {!item.section && item.id === 'about' && <div className="h-4" />}
                <button
                  onClick={() => {
                    onNavigate(item.id)
                    setMobileOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                  style={isActive ? { backgroundColor: 'hsl(265, 89%, 72%)' } : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.id === 'profile' && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: isActive ? 'hsla(0, 0%, 100%, 0.2)' : 'hsla(135, 94%, 60%, 0.15)',
                        color: isActive ? 'white' : 'hsl(135, 94%, 60%)'
                      }}>
                      NEW
                    </span>
                  )}
                  {item.id === 'memory' && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: isActive ? 'hsla(0, 0%, 100%, 0.2)' : 'hsla(31, 100%, 65%, 0.15)',
                        color: isActive ? 'white' : 'hsl(31, 100%, 65%)'
                      }}>
                      NEW
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </nav>

        <div className="mt-auto px-2 pt-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground">Powered by Lyzr</p>
        </div>
      </aside>
    </>
  )
}
