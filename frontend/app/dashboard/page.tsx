'use client'
import Sidebar from '@/components/Sidebar'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { CalendarCheck, GraduationCap, TrendingUp, BookOpen, MessageCircle } from 'lucide-react'
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
    if (!token) { router.push('/login'); return }
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
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const overallAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length) : 0

  const radialData = [{ name: 'Attendance', value: overallAttendance, fill: '#8b7cf8' }]

  const marksChartData = marks
    .filter((m: any) => m.exam_type === 'Internal 2')
    .map((m: any) => ({ subject: m.subject.split(' ')[0], score: m.marks_obtained, total: m.total_marks }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1117' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-purple-900 border-t-purple-500 animate-spin" />
          <p className="text-sm" style={{ color: '#475569' }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const isGood = overallAttendance >= 75

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={{ background: '#0f1117' }}>
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 pb-10 sm:px-8 lg:px-12 pt-20 lg:pt-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-semibold text-white">Good morning, Rohit 👋</h1>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
              Here's what's happening with your academics today.
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b7cf8, #6366f1)' }}
          >
            RK
          </div>
        </motion.div>

        {/* Top stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Attendance card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl p-6"
            style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(139,124,248,0.12)' }}
              >
                <CalendarCheck size={19} color="#8b7cf8" />
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: isGood ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                  color: isGood ? '#22c55e' : '#f59e0b'
                }}
              >
                {isGood ? 'Good' : 'Low'}
              </span>
            </div>
            <p className="text-4xl font-semibold text-white">{overallAttendance}%</p>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Overall Attendance</p>
            <div
              className="mt-4 rounded-full overflow-hidden"
              style={{ height: '5px', background: 'rgba(255,255,255,0.07)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallAttendance}%` }}
                transition={{ duration: 1, delay: 0.4 }}
                className="h-full rounded-full"
                style={{ background: isGood ? '#22c55e' : '#f59e0b' }}
              />
            </div>
          </motion.div>

          {/* Exam records card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(45,212,191,0.12)' }}
              >
                <GraduationCap size={19} color="#2dd4bf" />
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }}
              >
                Sem 3
              </span>
            </div>
            <p className="text-4xl font-semibold text-white">{marks.length}</p>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Total Exam Records</p>
            <div className="mt-4 flex items-center gap-2" style={{ color: '#2dd4bf', fontSize: '13px', fontWeight: 500 }}>
              <TrendingUp size={14} />
              <span>5 subjects tracked</span>
            </div>
          </motion.div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Radial chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl p-6 flex flex-col items-center"
            style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-sm font-medium text-white self-start mb-4">Attendance Health</p>
            <div className="relative" style={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background={{ fill: 'rgba(255,255,255,0.05)' }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-white">{overallAttendance}%</span>
                <span className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Overall</span>
              </div>
            </div>
          </motion.div>

          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl p-6"
            style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-sm font-medium text-white mb-4">Internal 2 — Subject-wise Marks</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={marksChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e2435',
                    border: '1px solid rgba(139,124,248,0.25)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="score" fill="#8b7cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Subject-wise attendance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-2xl p-6"
          style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-sm font-medium text-white mb-5">Subject-wise Attendance</p>
          <div className="flex flex-col gap-5">
            {attendance.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <BookOpen size={15} color="#475569" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{a.subject}</span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: a.percentage >= 75 ? '#22c55e' : '#f59e0b' }}
                    >
                      {a.percentage}%
                    </span>
                  </div>
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ height: '5px', background: 'rgba(255,255,255,0.06)' }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${a.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: a.percentage >= 75 ? '#22c55e' : '#f59e0b' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/chat')}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b7cf8, #6366f1)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(139,124,248,0.45)'
        }}
      >
        <MessageCircle size={22} color="white" />
      </motion.button>
    </div>
  )
}

