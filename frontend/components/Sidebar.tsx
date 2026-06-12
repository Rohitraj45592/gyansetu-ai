'use client'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarCheck, GraduationCap, Clock,
  MessageCircle, LogOut
} from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

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

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-screen flex-shrink-0 z-10">
      <div className="px-6 py-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
          <span className="text-base">🎓</span>
        </div>
        <span className="font-semibold text-gray-900">GyanSetu AI</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
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

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}