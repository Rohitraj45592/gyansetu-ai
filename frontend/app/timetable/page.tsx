'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Clock, MapPin } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function TimetablePage() {
  const router = useRouter()
  const [timetable, setTimetable] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get(`https://gyansetu-ai-production.up.railway.app/timetable/3`)
      setTimetable(res.data.timetable || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  const subjectColors: Record<string, string> = {
    'Data Structures': '#a78bfa', 'DBMS': '#2dd4bf', 'Operating Systems': '#c084fc',
    'Computer Networks': '#4ade80', 'Web Technologies': '#f59e0b',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080c' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-purple-900 border-t-purple-500 animate-spin" />
          <p className="text-sm" style={{ color: '#52525b' }}>Loading timetable...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={{ background: '#08080c' }}>
      <Sidebar />
      <main className="flex-1 min-w-0 max-w-full overflow-hidden px-5 pb-16 sm:px-8 lg:px-12 pt-20 lg:pt-10">
        <div className="max-w-7xl mx-auto">

          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <h1 className="text-2xl font-semibold text-white">Timetable</h1>
            <p className="text-sm mt-1" style={{ color: '#9090a0' }}>Your weekly class schedule — Semester 3.</p>
          </motion.div>

          <div className="flex flex-col gap-3">
            {timetable.map((cls: any, i: number) => {
              const isToday = cls.day === today
              const accentColor = subjectColors[cls.subject] || '#6b7280'
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="rounded-2xl flex items-center gap-4 sm:gap-5 min-w-0"
                  style={{
                    background: isToday ? 'rgba(167,139,250,0.07)' : '#121218',
                    border: isToday ? '1px solid rgba(167,139,250,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isToday ? '0 0 26px rgba(167,139,250,0.22)' : `0 0 18px ${accentColor}22`,
                    padding: '16px 18px',
                  }}
                >
                  <div className="flex flex-col items-center justify-center flex-shrink-0" style={{ width: '38px' }}>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: isToday ? '#a78bfa' : '#52525b' }}>
                      {cls.day.slice(0, 3)}
                    </span>
                    {isToday && (
                      <span className="mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(167,139,250,0.18)', color: '#c4b5fd' }}>NOW</span>
                    )}
                  </div>
                  <div className="flex-shrink-0 rounded-full" style={{ width: '3px', height: '38px', background: accentColor, opacity: isToday ? 1 : 0.7, boxShadow: `0 0 8px ${accentColor}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: isToday ? '#c4b5fd' : 'white' }}>{cls.subject}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1" style={{ fontSize: '12px', color: '#71717a' }}>
                      <span className="flex items-center gap-1.5"><Clock size={12} />{cls.start_time} – {cls.end_time}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} />{cls.room}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}