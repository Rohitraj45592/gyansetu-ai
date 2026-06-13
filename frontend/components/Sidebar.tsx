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
      {/* Top bar - always visible */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
          aria-label="Open menu">
          <PanelLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">GyanSetu AI</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
            <span className="text-sm">🎓</span>
          </div>
        </div>
      </div>

      {/* Dark overlay when sidebar open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200
          flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}>

        <div className="px-6 py-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
              <span className="text-base">🎓</span>
            </div>
            <span className="font-semibold text-gray-900">GyanSetu AI</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-gray-500 hover:text-gray-800">
            <PanelLeft size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === item.path
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}