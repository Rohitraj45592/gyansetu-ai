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
    if (!token) {
      router.push('/login')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get(`https://gyansetu-ai-production.up.railway.app/timetable/3`)
      setTimetable(res.data.timetable || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  const subjectColors: Record<string, string> = {
    'Data Structures': '#6366f1',
    'DBMS': '#06b6d4',
    'Operating Systems': '#8b5cf6',
    'Computer Networks': '#22c55e',
    'Web Technologies': '#f59e0b',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading timetable...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar />

      <main style={{ flex: 1, marginLeft: '256px', padding: '40px 56px', minWidth: 0, width: 'calc(100% - 256px)' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500 text-sm mt-1">Your weekly class schedule — Semester 3.</p>
        </motion.div>

        <div className="space-y-4">
          {timetable.map((cls: any, i: number) => {
            const isToday = cls.day === today
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-5 transition-all ${
                  isToday ? 'border-indigo-200 ring-2 ring-indigo-50' : 'border-gray-100'
                }`}>

                {/* Day badge */}
                <div className="w-20 text-center flex-shrink-0">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {cls.day.slice(0, 3)}
                  </p>
                  {isToday && (
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      TODAY
                    </span>
                  )}
                </div>

                {/* Color bar */}
                <div className="w-1.5 h-12 rounded-full flex-shrink-0"
                  style={{ background: subjectColors[cls.subject] || '#94a3b8' }} />

                {/* Subject info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{cls.subject}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {cls.start_time} - {cls.end_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      {cls.room}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}