'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarCheck, GraduationCap, Clock,
  MessageCircle, LogOut, PanelLeft
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
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 -ml-2"
          aria-label="Open menu">
          <PanelLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">GyanSetu AI</span>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
            <span className="text-xs">🎓</span>
          </div>
        </div>
      </div>

      {/* Dark overlay - mobile only */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[280px] bg-[#171717]
          flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}>

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
            <span className="text-base">🎓</span>
          </div>
          <span className="text-[17px] font-semibold text-white tracking-tight">GyanSetu AI</span>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5">
            <PanelLeft size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                pathname === item.path
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}>
              <item.icon size={19} strokeWidth={1.8} className="flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[15px] font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors">
            <LogOut size={19} strokeWidth={1.8} className="flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}