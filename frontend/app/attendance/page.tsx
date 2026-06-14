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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading attendance...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar />

<main className="flex-1 min-w-0 pt-24 px-4 pb-8 sm:px-8 lg:pt-10 lg:px-14" style={{ marginLeft: '80px' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Subject-wise breakdown of your attendance record.</p>
        </motion.div>

        {/* Overall Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Overall Attendance</p>
            <p className="text-4xl font-bold text-gray-900">{overallAttendance}%</p>
            <p className={`text-sm font-medium mt-1 flex items-center gap-1 ${
              overallAttendance >= 75 ? 'text-green-600' : 'text-amber-600'
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
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <BookOpen size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{a.subject}</p>
                    <p className="text-xs text-gray-400">{a.present} / {a.total} classes attended</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  a.status === 'Safe' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {a.status === 'Safe' ? 'Safe' : 'Low'}
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900">{a.percentage}%</span>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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