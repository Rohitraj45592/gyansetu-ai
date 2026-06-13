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
    if (!token) {
      router.push('/login')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const studentId = localStorage.getItem('student_id') || '1'
      const res = await axios.get(`https://gyansetu-ai-production.up.railway.app/marks/${studentId}`)
      setMarks(res.data.marks || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Group marks by subject
  const grouped: Record<string, any[]> = {}
  marks.forEach((m: any) => {
    if (!grouped[m.subject]) grouped[m.subject] = []
    grouped[m.subject].push(m)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading marks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar />

     <main className="flex-1 min-w-0 pt-20 px-4 pb-8 sm:px-8 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Marks</h1>
          <p className="text-gray-500 text-sm mt-1">Your exam performance, subject by subject.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Object.entries(grouped).map(([subject, exams], i) => {
            const externalExam = exams.find((e: any) => e.exam_type === 'External')
            return (
              <motion.div
                key={subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <GraduationCap size={18} className="text-indigo-600" />
                    </div>
                    <p className="font-semibold text-gray-900">{subject}</p>
                  </div>
                  {externalExam && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      externalExam.percentage >= 75 ? 'bg-green-50 text-green-600' :
                      externalExam.percentage >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>
                      <Award size={12} />
                      {externalExam.percentage}%
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {exams.map((exam: any, j: number) => (
                    <div key={j}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600">{exam.exam_type}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {exam.marks_obtained} / {exam.total_marks}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${exam.percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.08 + j * 0.05 }}
                          className="h-full rounded-full"
                          style={{ background: exam.percentage >= 75
                            ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                            : exam.percentage >= 40
                            ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  )
}