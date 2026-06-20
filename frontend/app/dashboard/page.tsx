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
      <style>{`
        .neon-card { transition: box-shadow 0.3s ease; }
        .neon-card:hover { box-shadow: 0 0 32px rgba(139,92,246,0.35); }
        .neon-card-teal:hover { box-shadow: 0 0 32px rgba(20,184,166,0.3) !important; }
      `}</style>
      <Sidebar />

      <main className="flex-1 min-w-0 overflow-hidden px-4 pb-24 sm:px-8 lg:px-14 pt-24 lg:pt-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-12 gap-4">
          <div className="min-w-0">
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white' }} className="truncate">Good morning, Rohit 👋</h1>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>Here's what's happening with your academics today.</p>
          </div>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6, #F59E0B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 600, fontSize: '14px', flexShrink: 0,
            boxShadow: '0 0 18px rgba(139,92,246,0.45)'
          }}>RK</div>
        </div>

        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
          <div className="min-w-0 neon-card"
            style={{ background: 'rgba(20,25,35,0.9)', borderRadius: '16px', padding: '26px', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarCheck size={20} color="#8B5CF6" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: overallAttendance >= 75 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: overallAttendance >= 75 ? '#22c55e' : '#f59e0b' }}>
                {overallAttendance >= 75 ? 'Good' : 'Low'}
              </span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>{overallAttendance}%</p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>Overall Attendance</p>
            <div style={{ marginTop: '18px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${overallAttendance}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{ height: '100%', borderRadius: '99px', background: overallAttendance >= 75 ? '#22c55e' : '#f59e0b' }} />
            </div>
          </div>

          <div className="min-w-0 neon-card neon-card-teal"
            style={{ background: 'rgba(20,25,35,0.9)', borderRadius: '16px', padding: '26px', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={20} color="#14b8a6" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: 'rgba(20,184,166,0.15)', color: '#14b8a6' }}>Sem 3</span>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>{marks.length}</p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>Total Exam Records</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '18px', color: '#14b8a6', fontSize: '14px', fontWeight: 500 }}>
              <TrendingUp size={14} />
              <span>5 subjects tracked</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-14">
          <div className="min-w-0 neon-card"
            style={{ background: 'rgba(20,25,35,0.9)', borderRadius: '16px', padding: '26px', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', alignSelf: 'flex-start', marginBottom: '10px' }}>Attendance Health</p>
            <div style={{ width: '192px', height: '192px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>{overallAttendance}%</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Overall</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 min-w-0 neon-card"
            style={{ background: 'rgba(20,25,35,0.9)', borderRadius: '16px', padding: '26px', border: '1px solid rgba(139,92,246,0.2)' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '18px' }}>Internal 2 — Subject-wise Marks</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={marksChartData} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ background: '#1a1f2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: 'white' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="score" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject-wise Attendance */}
        <div className="min-w-0 neon-card"
          style={{ background: 'rgba(20,25,35,0.9)', borderRadius: '16px', padding: '26px', border: '1px solid rgba(139,92,246,0.2)' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '18px' }}>Subject-wise Attendance</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {attendance.map((a: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={16} color="#6B7280" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#E5E7EB' }} className="truncate">{a.subject}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: a.percentage >= 75 ? '#22c55e' : '#f59e0b', flexShrink: 0 }}>{a.percentage}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${a.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                      style={{ height: '100%', borderRadius: '99px', background: a.percentage >= 75 ? '#22c55e' : '#f59e0b' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/chat')}
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          width: '50px', height: '50px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6, #F59E0B)',
          border: 'none', cursor: 'pointer', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 22px rgba(139,92,246,0.5), 0 6px 18px rgba(0,0,0,0.4)'
        }}>
        <MessageCircle size={22} color="white" />
      </motion.button>
    </div>
  )
}