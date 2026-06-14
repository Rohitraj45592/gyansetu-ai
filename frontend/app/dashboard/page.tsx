'use client'
import Sidebar from '@/components/Sidebar'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  CalendarCheck, GraduationCap, MessageCircle, TrendingUp, BookOpen
} from 'lucide-react'
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [attendance, setAttendance] = useState<any[]>([])
  const [marks, setMarks] = useState<any[]>([])
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
      const [attRes, marksRes] = await Promise.all([
        axios.get(`https://gyansetu-ai-production.up.railway.app/attendance/${studentId}`),
        axios.get(`https://gyansetu-ai-production.up.railway.app/marks/${studentId}`)
      ])
      setAttendance(attRes.data.attendance || [])
      setMarks(marksRes.data.marks || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const overallAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length)
    : 0

  const radialData = [{ name: 'Attendance', value: overallAttendance, fill: '#4f46e5' }]

  const marksChartData = marks
    .filter((m: any) => m.exam_type === 'Internal 2')
    .map((m: any) => ({ subject: m.subject.split(' ')[0], score: m.marks_obtained, total: m.total_marks }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar />

<main className="flex-1 min-w-0 px-4 pb-8 sm:px-8 lg:px-14 pt-16 lg:pt-8 lg:ml-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, Rohit 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening with your academics today.</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
            RK
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <CalendarCheck size={20} className="text-indigo-600" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                overallAttendance >= 75 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {overallAttendance >= 75 ? 'Good' : 'Low'}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{loading ? '—' : `${overallAttendance}%`}</p>
            <p className="text-sm text-gray-500 mt-1">Overall Attendance</p>
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallAttendance}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: overallAttendance >= 75 ? '#22c55e' : '#f59e0b' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={20} className="text-teal-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-teal-50 text-teal-600">
                Sem 3
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{marks.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Exam Records</p>
            <div className="flex items-center gap-1 mt-4 text-sm text-teal-600 font-medium">
              <TrendingUp size={14} />
              <span>5 subjects tracked</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-purple-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-50 text-purple-600">
                AI Powered
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 leading-tight">Ask GyanSetu AI</p>
            <p className="text-sm text-gray-500 mt-1">Get instant answers about your data</p>
            <button className="mt-4 w-full py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ background: '#4f46e5' }}>
              Open Chat →
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center min-w-0">
            <p className="text-sm font-semibold text-gray-900 self-start mb-2">Attendance Health</p>
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{overallAttendance}%</span>
                <span className="text-xs text-gray-400">Overall</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-w-0">
            <p className="text-sm font-semibold text-gray-900 mb-4">Internal 2 — Subject-wise Marks</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={marksChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f5f5f5' }} />
                <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-4">Subject-wise Attendance</p>
          <div className="space-y-4">
            {attendance.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{a.subject}</span>
                    <span className={`text-sm font-semibold ${a.percentage >= 75 ? 'text-green-600' : 'text-amber-600'}`}>
                      {a.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${a.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.7 + i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: a.percentage >= 75 ? '#22c55e' : '#f59e0b' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}