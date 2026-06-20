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

  const radialData = [{ name: 'Attendance', value: overallAttendance, fill: '#8B5CF6' }]

  const marksChartData = marks
    .filter((m: any) => m.exam_type === 'Internal 2')
    .map((m: any) => ({ subject: m.subject.split(' ')[0], score: m.marks_obtained, total: m.total_marks }))

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F1419', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(139,92,246,0.3)', borderTop: '3px solid #8B5CF6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Loading your dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F1419' }} className="flex overflow-x-hidden">
      {/* Subtle white glow on hover — soft, professional, not neon */}
      <style>{`
        .soft-card { transition: box-shadow 0.25s ease, border-color 0.25s ease; }
        .soft-card:hover {
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 8px 28px rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.16) !important;
        }
      `}</style>
      <Sidebar />

      {/* min-w-0 + overflow-hidden on main prevents any child from pushing layout and overlapping the topbar */}
      <main className="flex-1 min-w-0 overflow-hidden px-4 pb-28 sm:px-8 lg:px-14 pt-6 lg:pt-8">

        {/* Header — mt-14 on mobile pushes this below the fixed GyanSetu AI topbar so nothing overlaps */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between gap-4 mb-8 mt-14 lg:mt-0">
          <div className="min-w-0">
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'white' }} className="truncate">Good morning, Rohit 👋</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Here's what's happening with your academics today.</p>
          </div>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6, #F59E0B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 600, fontSize: '14px', flexShrink: 0
          }}>RK</div>
        </motion.div>

        {/* Top cards — generous gap-5 so cards never touch each other */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="soft-card min-w-0"
            style={{ background: 'rgba(20,25,35,0.9)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarCheck size={20} color="#8B5CF6" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: overallAttendance >= 75 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: overallAttendance >= 75 ? '#22c55e' : '#f59e0b' }}>
                {overallAttendance >= 75 ? 'Good' : 'Low'}
              </span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>{overallAttendance}%</p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>Overall Attendance</p>
            <div style={{ marginTop: '16px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${overallAttendance}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{ height: '100%', borderRadius: '99px', background: overallAttendance >= 75 ? '#22c55e' : '#f59e0b' }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="soft-card min-w-0"
            style={{ background: 'rgba(20,25,35,0.9)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={20} color="#14b8a6" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: 'rgba(20,184,166,0.15)', color: '#14b8a6' }}>Sem 3</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>{marks.length}</p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>Total Exam Records</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: '#14b8a6', fontSize: '14px', fontWeight: 500 }}>
              <TrendingUp size={14} />
              <span>5 subjects tracked</span>
            </div>
          </motion.div>
        </div>

        {/* Charts — stacked on mobile, side by side on large screens. gap-5 keeps clear separation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="soft-card min-w-0"
            style={{ background: 'rgba(20,25,35,0.9)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', alignSelf: 'flex-start', marginBottom: '12px' }}>Attendance Health</p>
            <div style={{ width: '180px', height: '180px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '26px', fontWeight: 700, color: 'white' }}>{overallAttendance}%</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Overall</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="lg:col-span-2 soft-card min-w-0"
            style={{ background: 'rgba(20,25,35,0.9)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>Internal 2 — Subject-wise Marks</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={marksChartData} margin={{ left: -8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={26} />
                <Tooltip
                  contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  trigger="hover"
                />
                <Bar dataKey="score" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Subject-wise Attendance */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="soft-card min-w-0"
          style={{ background: 'rgba(20,25,35,0.9)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '18px' }}>Subject-wise Attendance</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {attendance.map((a: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={15} color="#6B7280" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#E5E7EB' }} className="truncate">{a.subject}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: a.percentage >= 75 ? '#22c55e' : '#f59e0b', flexShrink: 0 }}>{a.percentage}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${a.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                      style={{ height: '100%', borderRadius: '99px', background: a.percentage >= 75 ? '#22c55e' : '#f59e0b' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Floating Chat Button — fixed to viewport corner, well clear of last card so it never sits on top of content */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/chat')}
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          width: '50px', height: '50px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6, #F59E0B)',
          border: 'none', cursor: 'pointer', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
        }}>
        <MessageCircle size={22} color="white" />
      </motion.button>
    </div>
  )
}