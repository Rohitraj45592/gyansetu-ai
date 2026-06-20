'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { BookOpen, CheckCircle, AlertTriangle } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function AttendancePage() {
  const router = useRouter()
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const studentId = localStorage.getItem('student_id') || '1'
      const res = await axios.get(`https://gyansetu-ai-production.up.railway.app/attendance/${studentId}`)
      setAttendance(res.data.attendance || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const overallAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080c' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-purple-900 border-t-purple-500 animate-spin" />
          <p className="text-sm" style={{ color: '#52525b' }}>Loading attendance...</p>
        </div>
      </div>
    )
  }

  const isGood = overallAttendance >= 75

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={{ background: '#08080c' }}>
      <Sidebar />
      <main className="flex-1 min-w-0 max-w-full overflow-hidden px-5 pb-16 sm:px-8 lg:px-12 pt-20 lg:pt-10">
        <div className="max-w-7xl mx-auto">

          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <h1 className="text-2xl font-semibold text-white">Attendance</h1>
            <p className="text-sm mt-1" style={{ color: '#9090a0' }}>Subject-wise breakdown of your attendance record.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl p-6 mb-6 flex flex-wrap items-center justify-between gap-6"
            style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.07)', boxShadow: isGood ? '0 0 28px rgba(74,222,128,0.13)' : '0 0 28px rgba(245,158,11,0.13)' }}
          >
            <div className="min-w-0">
              <p className="text-sm mb-1" style={{ color: '#9090a0' }}>Overall Attendance</p>
              <p className="text-5xl font-semibold text-white">{overallAttendance}%</p>
              <p className="flex items-center gap-1.5 mt-2 text-sm font-medium" style={{ color: isGood ? '#4ade80' : '#f59e0b' }}>
                {isGood ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                {isGood ? 'You are on track!' : 'Attendance below 75%'}
              </p>
            </div>
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-white flex-shrink-0"
              style={{
                background: isGood ? 'linear-gradient(135deg, #4ade80, #22c55e)' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                boxShadow: isGood ? '0 0 24px rgba(74,222,128,0.45)' : '0 0 24px rgba(245,158,11,0.45)'
              }}
            >
              {overallAttendance}%
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {attendance.map((a: any, i: number) => {
              const safe = a.percentage >= 75
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                  className="rounded-2xl p-6 min-w-0"
                  style={{
                    background: '#121218', border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: safe ? '0 0 24px rgba(74,222,128,0.13)' : '0 0 24px rgba(245,158,11,0.16)'
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(167,139,250,0.16)', boxShadow: '0 0 14px rgba(167,139,250,0.3)' }}>
                        <BookOpen size={17} color="#a78bfa" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{a.subject}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>{a.present} / {a.total} classes attended</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: safe ? 'rgba(74,222,128,0.12)' : 'rgba(245,158,11,0.12)', color: safe ? '#4ade80' : '#f59e0b' }}>
                      {safe ? 'Safe' : 'Low'}
                    </span>
                  </div>
                  <p className="text-3xl font-semibold mb-3" style={{ color: safe ? '#4ade80' : '#f59e0b' }}>{a.percentage}%</p>
                  <div className="rounded-full overflow-hidden" style={{ height: '5px', background: 'rgba(255,255,255,0.07)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${a.percentage}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                      className="h-full rounded-full"
                      style={{ background: safe ? 'linear-gradient(90deg, #4ade80, #22c55e)' : 'linear-gradient(90deg, #fbbf24, #f59e0b)' }} />
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