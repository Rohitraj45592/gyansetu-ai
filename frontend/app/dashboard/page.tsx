'use client'
import Sidebar from '@/components/Sidebar'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { CalendarCheck, GraduationCap, TrendingUp, BookOpen, MessageCircle, Clock3 } from 'lucide-react'
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [attendance, setAttendance] = useState<any[]>([])
  const [marks, setMarks] = useState<any[]>([])
  const [timetable, setTimetable] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const studentId = localStorage.getItem('student_id') || '1'
      const [attRes, marksRes, ttRes] = await Promise.all([
        axios.get(`https://gyansetu-ai-production.up.railway.app/attendance/${studentId}`),
        axios.get(`https://gyansetu-ai-production.up.railway.app/marks/${studentId}`),
        axios.get(`https://gyansetu-ai-production.up.railway.app/timetable/3`)
      ])
      setAttendance(attRes.data.attendance || [])
      setMarks(marksRes.data.marks || [])
      setTimetable(ttRes.data.timetable || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const overallAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length) : 0

  const radialData = [{ name: 'Attendance', value: overallAttendance, fill: 'url(#ringGradient)' }]

  const marksChartData = marks
    .filter((m: any) => m.exam_type === 'Internal 2')
    .map((m: any) => ({ subject: m.subject.split(' ')[0], score: m.marks_obtained, total: m.total_marks }))

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todayClass = timetable.find((t: any) => t.day === today)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080c' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-purple-900 border-t-purple-500 animate-spin" />
          <p className="text-sm" style={{ color: '#52525b' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const isGood = overallAttendance >= 75

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={{ background: '#08080c' }}>
      <Sidebar />

      <main className="flex-1 min-w-0 max-w-full overflow-hidden px-5 pb-28 sm:px-8 lg:px-12 pt-20 lg:pt-10">
        <div className="max-w-7xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-8 gap-4"
          >
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-white truncate">Good morning, Rohit 👋</h1>
              <p className="text-sm mt-1" style={{ color: '#9090a0' }}>
                Here's what's happening with your academics today.
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #f59e0b)', boxShadow: '0 0 20px rgba(167,139,250,0.4)' }}
            >
              RK
            </div>
          </motion.div>

          {/* Top stat cards — each with its own neon glow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl p-6 min-w-0"
              style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 0 28px rgba(167,139,250,0.16)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(167,139,250,0.16)', boxShadow: '0 0 16px rgba(167,139,250,0.3)' }}>
                  <CalendarCheck size={19} color="#a78bfa" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                  style={{ background: isGood ? 'rgba(74,222,128,0.12)' : 'rgba(245,158,11,0.12)', color: isGood ? '#4ade80' : '#f59e0b' }}>
                  {isGood ? 'Good' : 'Low'}
                </span>
              </div>
              <p className="text-4xl font-semibold text-white">{overallAttendance}%</p>
              <p className="text-sm mt-1" style={{ color: '#9090a0' }}>Overall Attendance</p>
              <div className="mt-4 rounded-full overflow-hidden" style={{ height: '5px', background: 'rgba(255,255,255,0.07)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${overallAttendance}%` }} transition={{ duration: 1, delay: 0.4 }}
                  className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #a78bfa, #f59e0b)' }} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl p-6 min-w-0"
              style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 0 28px rgba(45,212,191,0.15)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(45,212,191,0.16)', boxShadow: '0 0 16px rgba(45,212,191,0.3)' }}>
                  <GraduationCap size={19} color="#2dd4bf" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }}>
                  5 subjects
                </span>
              </div>
              <p className="text-4xl font-semibold text-white">{marks.length}</p>
              <p className="text-sm mt-1" style={{ color: '#9090a0' }}>Exam Records</p>
              <div className="mt-4 flex items-center gap-2" style={{ color: '#2dd4bf', fontSize: '13px', fontWeight: 500 }}>
                <TrendingUp size={14} /><span>On track this semester</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-2xl p-6 min-w-0 sm:col-span-2 lg:col-span-1"
              style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 0 28px rgba(245,158,11,0.15)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.16)', boxShadow: '0 0 16px rgba(245,158,11,0.3)' }}>
                  <Clock3 size={19} color="#f59e0b" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                  Sem 3
                </span>
              </div>
              {todayClass ? (
                <>
                  <p className="text-xl font-semibold text-white truncate">{todayClass.subject}</p>
                  <p className="text-sm mt-1" style={{ color: '#9090a0' }}>Today's class</p>
                  <p className="text-sm mt-4" style={{ color: '#9090a0' }}>{todayClass.start_time}–{todayClass.end_time} · {todayClass.room}</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-semibold text-white">No class today</p>
                  <p className="text-sm mt-1" style={{ color: '#9090a0' }}>Enjoy your day off</p>
                </>
              )}
            </motion.div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.4 }}
              className="rounded-2xl p-6 flex flex-col items-center min-w-0"
              style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 0 28px rgba(167,139,250,0.16)' }}
            >
              <div className="self-start flex items-center justify-between w-full mb-4">
                <p className="text-sm font-medium text-white">Attendance Health</p>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(167,139,250,0.12)', color: '#c4b5fd' }}>Sem 3</span>
              </div>
              <div className="relative" style={{ width: 180, height: 180, filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.45))' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="72%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                    <defs>
                      <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} fill="url(#ringGradient)" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold text-white">{overallAttendance}%</span>
                  <span className="text-xs mt-0.5" style={{ color: '#9090a0' }}>Overall</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}
              className="lg:col-span-2 rounded-2xl p-6 min-w-0"
              style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 0 28px rgba(167,139,250,0.1)' }}
            >
              <p className="text-sm font-medium text-white mb-4">Internal 2 — Subject-wise Marks</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={marksChartData} barSize={28}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#6d5acf" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#18181f', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '10px', color: 'white', fontSize: '13px' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="score" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }}
            className="rounded-2xl p-6 min-w-0"
            style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 0 28px rgba(167,139,250,0.1)' }}
          >
            <p className="text-sm font-medium text-white mb-5">Subject-wise Attendance</p>
            <div className="flex flex-col gap-5">
              {attendance.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <BookOpen size={15} color="#71717a" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-medium truncate" style={{ color: '#e4e4e7' }}>{a.subject}</span>
                      <span className="text-sm font-semibold flex-shrink-0" style={{ color: a.percentage >= 75 ? '#4ade80' : '#f59e0b' }}>{a.percentage}%</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: '5px', background: 'rgba(255,255,255,0.07)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${a.percentage}%` }} transition={{ duration: 0.8, delay: 0.7 + i * 0.05 }}
                        className="h-full rounded-full" style={{ background: a.percentage >= 75 ? '#4ade80' : '#f59e0b' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <motion.button
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/chat')}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', width: '48px', height: '48px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #a78bfa, #f59e0b)', border: 'none', cursor: 'pointer', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(167,139,250,0.45), 0 6px 20px rgba(0,0,0,0.4)'
        }}
      >
        <MessageCircle size={20} color="white" />
      </motion.button>
    </div>
  )
}