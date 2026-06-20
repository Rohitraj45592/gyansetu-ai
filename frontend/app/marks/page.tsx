'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { GraduationCap, Award } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function MarksPage() {
  const router = useRouter()
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
      const res = await axios.get(`https://gyansetu-ai-production.up.railway.app/marks/${studentId}`)
      setMarks(res.data.marks || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const grouped: Record<string, any[]> = {}
  marks.forEach((m: any) => {
    if (!grouped[m.subject]) grouped[m.subject] = []
    grouped[m.subject].push(m)
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080c' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-purple-900 border-t-purple-500 animate-spin" />
          <p className="text-sm" style={{ color: '#52525b' }}>Loading marks...</p>
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
            <h1 className="text-2xl font-semibold text-white">Marks</h1>
            <p className="text-sm mt-1" style={{ color: '#9090a0' }}>Your exam performance, subject by subject.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Object.entries(grouped).map(([subject, exams], i) => {
              const externalExam = exams.find((e: any) => e.exam_type === 'External')
              const pct = externalExam?.percentage ?? 0
              const tagColor = pct >= 75 ? { bg: 'rgba(74,222,128,0.12)', text: '#4ade80' }
                : pct >= 40 ? { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' }
                : { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' }
              const glow = pct >= 75 ? '0 0 24px rgba(74,222,128,0.13)'
                : pct >= 40 ? '0 0 24px rgba(245,158,11,0.15)'
                : '0 0 24px rgba(239,68,68,0.15)'

              return (
                <motion.div
                  key={subject}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-2xl p-6 min-w-0"
                  style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.07)', boxShadow: glow }}
                >
                  <div className="flex items-center justify-between gap-3 pb-4 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(167,139,250,0.16)', boxShadow: '0 0 14px rgba(167,139,250,0.3)' }}>
                        <GraduationCap size={18} color="#a78bfa" />
                      </div>
                      <p className="font-medium text-white truncate">{subject}</p>
                    </div>
                    {externalExam && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 flex-shrink-0" style={{ background: tagColor.bg, color: tagColor.text }}>
                        <Award size={11} />{pct}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    {exams.map((exam: any, j: number) => {
                      const examPct = exam.percentage ?? 0
                      const barColor = examPct >= 75 ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                        : examPct >= 40 ? 'linear-gradient(90deg, #a78bfa, #f59e0b)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)'
                      return (
                        <div key={j} className="min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                            <span className="text-sm" style={{ color: '#9090a0' }}>{exam.exam_type}</span>
                            <span className="text-sm font-semibold text-white flex-shrink-0">
                              {exam.marks_obtained} <span style={{ color: '#71717a', fontWeight: 400 }}>/ {exam.total_marks}</span>
                            </span>
                          </div>
                          <div className="rounded-full overflow-hidden" style={{ height: '4px', background: 'rgba(255,255,255,0.07)' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${examPct}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.08 + j * 0.05 }}
                              className="h-full rounded-full" style={{ background: barColor }} />
                          </div>
                        </div>
                      )
                    })}
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