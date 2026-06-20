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
    if (!token) {
      router.push('/login')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const studentId = localStorage.getItem('student_id') || '1'
      const res = await axios.get(`https://gyansetu-ai-production.up.railway.app/attendance/${studentId}`)
      setAttendance(res.data.attendance || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const overallAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-900 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading attendance...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex overflow-x-hidden">
      {/* Subtle white glow on hover — same as dashboard */}
      <style>{`
        .soft-card { transition: box-shadow 0.25s ease, border-color 0.25s ease; }
        .soft-card:hover {
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 8px 28px rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.16) !important;
        }
      `}</style>
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 pb-8 sm:px-8 lg:px-14 pt-16 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8">
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-gray-400 text-sm mt-1">Subject-wise breakdown of your attendance record.</p>
        </motion.div>

        {/* Overall Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="soft-card bg-[#15151f] rounded-2xl p-6 border border-white/[0.06] shadow-sm mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Overall Attendance</p>
            <p className="text-4xl font-bold text-white">{overallAttendance}%</p>
            <p className={`text-sm font-medium mt-1 flex items-center gap-1 ${
              overallAttendance >= 75 ? 'text-green-400' : 'text-amber-400'
            }`}>
              {overallAttendance >= 75 ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {overallAttendance >= 75 ? 'You are on track!' : 'Attendance below 75%'}
            </p>
          </div>
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: overallAttendance >= 75
              ? 'linear-gradient(135deg, #22c55e, #4ade80)'
              : 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
            {overallAttendance}%
          </div>
        </motion.div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {attendance.map((a: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
              className="soft-card bg-[#15151f] rounded-2xl p-6 border border-white/[0.06] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <BookOpen size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{a.subject}</p>
                    <p className="text-xs text-gray-500">{a.present} / {a.total} classes attended</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  a.status === 'Safe' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {a.status === 'Safe' ? 'Safe' : 'Low'}
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-white">{a.percentage}%</span>
              </div>

              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${a.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                  className="h-full rounded-full"
                  style={{ background: a.percentage >= 75
                    ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                    : 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}