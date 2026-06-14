'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarCheck, GraduationCap, Clock,
  MessageCircle, LogOut, PanelLeft, X
} from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
    { icon: GraduationCap, label: 'Marks', path: '/marks' },
    { icon: Clock, label: 'Timetable', path: '/timetable' },
    { icon: MessageCircle, label: 'AI Chat', path: '/chat' },
  ]

  const handleNav = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  return (
    <>
      {/* Top bar - all devices */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-5 z-40">
        <button
          onClick={() => setOpen(true)}
          className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors -ml-1"
          aria-label="Open menu">
          <PanelLeft size={22} />
        </button>
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-gray-900 text-base">GyanSetu AI</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
            <span className="text-sm">🎓</span>
          </div>
        </div>
      </div>

      {/* Dark overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-[#0f1117]
          flex flex-col z-50
          w-[85%] max-w-[320px]
          lg:w-[300px]
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}>

        {/* Branding */}
        <div className="flex items-center justify-between px-6 pt-8 pb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
              <span className="text-2xl">🎓</span>
            </div>
            <span className="text-[24px] font-extrabold text-white tracking-tight leading-none">
              GyanSetu AI
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl
                  text-[19px] font-medium
                  transition-all duration-200
                  min-h-[52px]
                  ${isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                  }
                `}>
                <item.icon
                  size={23}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className="flex-shrink-0"
                />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-6 border-t border-white/[0.06] mx-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[19px] font-medium min-h-[52px] text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 -mx-4">
            <LogOut size={23} strokeWidth={1.8} className="flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}