'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  ClipboardCheck, Calendar, Clock, User, BookOpen,
  FileText, CheckCircle2, XCircle, AlertCircle, UploadCloud,
  Check, X, MessageSquare, AlertTriangle, ShieldCheck, Filter, Info
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export interface CorrectionRequest {
  id: string
  studentId: string
  studentName: string
  rollNumber: string
  subject: string
  attendanceDate: string
  classPeriod: string
  facultyName: string
  reason: string
  evidenceName?: string
  evidenceSize?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  facultyComment?: string
  submittedAt: string
  reviewedAt?: string
}

const DEFAULT_SUBJECTS = [
  'Data Structures (CS301)',
  'DBMS (CS302)',
  'Operating Systems (CS303)',
  'Computer Networks (CS304)',
  'Web Technologies (CS305)'
]

const FACULTY_LIST = [
  { name: 'Dr. Alok Verma', department: 'CSE', subject: 'DBMS' },
  { name: 'Prof. Sneha Gupta', department: 'CSE', subject: 'Data Structures' },
  { name: 'Dr. Rajesh Sharma', department: 'CSE', subject: 'Operating Systems' },
  { name: 'Prof. Ananya Roy', department: 'CSE', subject: 'Computer Networks' },
  { name: 'Prof. Vikram Patel', department: 'CSE', subject: 'Web Technologies' },
]

const PERIOD_LIST = [
  'Period 1 (09:00 - 10:00 AM)',
  'Period 2 (10:00 - 11:00 AM)',
  'Period 3 (11:00 - 12:00 PM)',
  'Period 4 (02:00 - 03:00 PM)',
  'Period 5 (03:00 - 04:00 PM)',
]

const INITIAL_REQUESTS: CorrectionRequest[] = [
  {
    id: 'ACR-1021',
    studentId: '1',
    studentName: 'Rohit Kumar',
    rollNumber: 'CSE2021001',
    subject: 'DBMS (CS302)',
    attendanceDate: '2026-04-10',
    classPeriod: 'Period 2 (10:00 - 11:00 AM)',
    facultyName: 'Dr. Alok Verma',
    reason: 'I attended the normalization lecture in Room 102 and signed the physical attendance sheet, but ERP showed absent.',
    evidenceName: 'erp_attendance_screenshot.png',
    evidenceSize: '1.2 MB',
    status: 'Approved',
    facultyComment: 'Verified with physical logbook and lab attendance. Corrected in ERP records.',
    submittedAt: '2026-04-10 14:30',
    reviewedAt: '2026-04-11 09:15'
  },
  {
    id: 'ACR-1022',
    studentId: '1',
    studentName: 'Rohit Kumar',
    rollNumber: 'CSE2021001',
    subject: 'Data Structures (CS301)',
    attendanceDate: '2026-04-12',
    classPeriod: 'Period 1 (09:00 - 10:00 AM)',
    facultyName: 'Prof. Sneha Gupta',
    reason: 'Joined online lab switch midway due to biometric scanner timeout. Submitted code assignment during class hour.',
    evidenceName: 'screen_recording_lab.mp4',
    evidenceSize: '4.8 MB',
    status: 'Pending',
    submittedAt: '2026-04-12 11:45'
  }
]

const STORAGE_KEY = 'gyansetu_attendance_corrections_v1'

export default function AttendanceCorrectionPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'student' | 'faculty-demo'>('student')
  const [requests, setRequests] = useState<CorrectionRequest[]>([])
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Form Fields
  const [subject, setSubject] = useState('')
  const [attendanceDate, setAttendanceDate] = useState('')
  const [classPeriod, setClassPeriod] = useState('')
  const [facultyName, setFacultyName] = useState('')
  const [reason, setReason] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')

  // Faculty Review Demo State
  const [facultyFilter, setFacultyFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All')
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({})
  const [facultyComments, setFacultyComments] = useState<Record<string, string>>({})

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Load persisted requests from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setRequests(JSON.parse(saved))
      } else {
        setRequests(INITIAL_REQUESTS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS))
      }
    } catch {
      setRequests(INITIAL_REQUESTS)
    }

    // Attempt to fetch live subjects from student attendance data
    fetchSubjects()
  }, [router])

  const fetchSubjects = async () => {
    try {
      const studentId = localStorage.getItem('student_id') || '1'
      const res = await axios.get(`https://gyansetu-ai-backend.onrender.com/attendance/${studentId}`)
      if (res.data?.attendance?.length > 0) {
        const liveSubs = res.data.attendance.map((a: any) => a.subject)
        setSubjects(liveSubs)
      }
    } catch {
      // Fallback to DEFAULT_SUBJECTS
    }
  }

  const persistRequests = (updated: CorrectionRequest[]) => {
    setRequests(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save to localStorage', e)
    }
  }

  // File Upload Handler with Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      return
    }

    const allowedTypes = [
      'video/mp4', 'video/webm', 'video/quicktime',
      'image/png', 'image/jpeg', 'image/webp',
      'application/pdf'
    ]
    const maxSize = 15 * 1024 * 1024 // 15MB

    if (!allowedTypes.includes(file.type)) {
      setFileError('Unsupported file type. Please upload MP4, WebM, PNG, JPG, or PDF.')
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    if (file.size > maxSize) {
      setFileError('File size exceeds the 15MB limit. Please upload a smaller recording or screenshot.')
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    setSelectedFile(file)
  }

  // Handle Request Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    // Validation
    if (!subject) {
      setFormError('Please select the subject.')
      return
    }
    if (!attendanceDate) {
      setFormError('Please select the attendance date.')
      return
    }
    if (!classPeriod) {
      setFormError('Please select the class period.')
      return
    }
    if (!facultyName) {
      setFormError('Please select the concerned faculty member.')
      return
    }
    if (!reason.trim()) {
      setFormError('Please provide a reason explaining your attendance correction request.')
      return
    }
    if (reason.trim().length < 15) {
      setFormError('Please provide a more detailed reason (at least 15 characters).')
      return
    }

    setSubmitting(true)

    // Format new request
    const studentId = localStorage.getItem('student_id') || '1'
    const now = new Date()
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16)
    const newId = `ACR-${Math.floor(1000 + Math.random() * 9000)}`

    const newRequest: CorrectionRequest = {
      id: newId,
      studentId,
      studentName: 'Rohit Kumar',
      rollNumber: 'CSE2021001',
      subject,
      attendanceDate,
      classPeriod,
      facultyName,
      reason: reason.trim(),
      evidenceName: selectedFile ? selectedFile.name : undefined,
      evidenceSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : undefined,
      status: 'Pending',
      submittedAt: formattedDate
    }

    // Try sending to local/backend endpoint if available
    try {
      await axios.post('http://127.0.0.1:8000/attendance-correction/', {
        student_id: parseInt(studentId),
        student_name: newRequest.studentName,
        roll_number: newRequest.rollNumber,
        subject: newRequest.subject,
        attendance_date: newRequest.attendanceDate,
        class_period: newRequest.classPeriod,
        faculty_name: newRequest.facultyName,
        reason: newRequest.reason,
        evidence_reference: newRequest.evidenceName
      }, { timeout: 1500 }).catch(() => {
        // Safe backend fallback
      })
    } catch {
      // Backend optional for demo
    }

    // Persist to local state & localStorage
    const updated = [newRequest, ...requests]
    persistRequests(updated)

    setSubmitting(false)
    setFormSuccess(`Request #${newId} has been successfully submitted for faculty review.`)

    // Reset Form
    setSubject('')
    setAttendanceDate('')
    setClassPeriod('')
    setFacultyName('')
    setReason('')
    setSelectedFile(null)
  }

  // Faculty Review Demo Actions
  const handleFacultyDecision = (reqId: string, decision: 'Approved' | 'Rejected') => {
    const comment = facultyComments[reqId] || ''
    const now = new Date()
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 16)

    const updated = requests.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          status: decision,
          facultyComment: comment.trim() || (decision === 'Approved' ? 'Verified and approved by faculty.' : 'Insufficient evidence provided for attendance credit.'),
          reviewedAt: formattedDate
        }
      }
      return r
    })

    persistRequests(updated)
    setActionFeedback(prev => ({
      ...prev,
      [reqId]: `Request ${decision.toLowerCase()} successfully.`
    }))

    setTimeout(() => {
      setActionFeedback(prev => {
        const copy = { ...prev }
        delete copy[reqId]
        return copy
      })
    }, 3000)
  }

  // Filtered requests for faculty demo tab
  const filteredFacultyRequests = requests.filter(r => {
    if (facultyFilter === 'All') return true
    return r.status === facultyFilter
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex overflow-x-hidden">
      <style>{`
        .soft-card {
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .soft-card:hover {
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 8px 28px rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.16) !important;
        }
        .custom-input {
          background: rgba(20, 24, 34, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f3f4f6;
          border-radius: 12px;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .custom-input:focus {
          border-color: #8B5CF6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }
        .custom-input option {
          background: #15151f;
          color: white;
        }
      `}</style>

      <Sidebar />

      <main className="flex-1 min-w-0 px-4 pb-16 sm:px-8 lg:px-14 pt-16 lg:pt-8">
        {/* Top Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #F59E0B 100%)' }}>
                <ClipboardCheck size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Correction</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  Submit a request if you believe your attendance was marked incorrectly.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Role / Demo View Switcher */}
          <div className="flex items-center p-1 bg-[#15151f] border border-white/[0.08] rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}>
              Student View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('faculty-demo')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'faculty-demo'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}>
              <ShieldCheck size={14} className="text-amber-400" />
              Faculty Review (Demo)
            </button>
          </div>
        </div>

        {/* Informational Summary Alert */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-8 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-3.5">
          <Info size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            <span className="font-semibold text-white">How it works:</span> Attendance dispute submissions are routed directly to the concerned course instructor. Faculty members inspect the physical register or lecture activity log and record an official decision with audit remarks. Corrected records automatically synchronize with your attendance analytics.
          </div>
        </motion.div>

        {activeTab === 'student' ? (
          <>
            {/* Student Submission Form */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="soft-card bg-[#15151f] rounded-2xl p-6 sm:p-8 border border-white/[0.06] mb-10">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-lg font-semibold text-white">New Correction Request</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Please provide accurate class details to expedite verification.</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Student: Rohit Kumar (CSE)
                </span>
              </div>

              {formError && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2.5">
                  <AlertCircle size={18} className="flex-shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="mb-6 p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="flex-shrink-0 text-green-400" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={subject}
                        onChange={(e) => {
                          setSubject(e.target.value)
                          // Auto select matching faculty if found
                          const matched = FACULTY_LIST.find(f => e.target.value.toLowerCase().includes(f.subject.toLowerCase()))
                          if (matched) setFacultyName(matched.name)
                        }}
                        className="custom-input w-full text-sm appearance-none cursor-pointer pr-10">
                        <option value="">Select subject...</option>
                        {subjects.map((sub, idx) => (
                          <option key={idx} value={sub}>{sub}</option>
                        ))}
                      </select>
                      <BookOpen size={16} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Attendance Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Attendance Date <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="custom-input w-full text-sm"
                      />
                      <Calendar size={16} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none hidden" />
                    </div>
                  </div>

                  {/* Class Period */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Class Period <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={classPeriod}
                        onChange={(e) => setClassPeriod(e.target.value)}
                        className="custom-input w-full text-sm appearance-none cursor-pointer pr-10">
                        <option value="">Select class period...</option>
                        {PERIOD_LIST.map((p, idx) => (
                          <option key={idx} value={p}>{p}</option>
                        ))}
                      </select>
                      <Clock size={16} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Concerned Faculty */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Concerned Faculty <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={facultyName}
                        onChange={(e) => setFacultyName(e.target.value)}
                        className="custom-input w-full text-sm appearance-none cursor-pointer pr-10">
                        <option value="">Select faculty member...</option>
                        {FACULTY_LIST.map((fac, idx) => (
                          <option key={idx} value={fac.name}>
                            {fac.name} ({fac.subject})
                          </option>
                        ))}
                      </select>
                      <User size={16} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Reason Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Reason for Correction <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="I attended this class, but my attendance was marked absent by mistake. Please review my request."
                    className="custom-input w-full text-sm resize-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Describe your physical presence, lab desk, quiz submission, or signature details to assist the faculty reviewer.
                  </p>
                </div>

                {/* Supporting Evidence File Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Supporting Evidence (Optional)
                  </label>
                  <div className="p-4 rounded-xl border border-dashed border-white/10 bg-[#12131c] hover:border-purple-500/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                          <UploadCloud size={20} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-white">
                            {selectedFile ? selectedFile.name : 'Attach ERP Screen Recording, Screenshot, or Document'}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {selectedFile
                              ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • File ready to submit`
                              : 'Supports MP4, WebM, PNG, JPG, or PDF up to 15MB'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedFile && (
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            Remove
                          </button>
                        )}
                        <label className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-white bg-white/10 hover:bg-white/15 transition-colors">
                          Browse File
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {fileError && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                      <AlertTriangle size={13} /> {fileError}
                    </p>
                  )}

                  {/* Evidence Security Notice */}
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
                    <ShieldCheck size={13} className="text-gray-400 flex-shrink-0" />
                    <span>
                      Demo privacy notice: Supporting evidence files are referenced locally within this demonstration session and are not uploaded to an unsecured public bucket.
                    </span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    }}>
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck size={18} />
                        <span>Submit Correction Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* My Correction Requests Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">My Correction Requests</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time status updates and faculty remarks for your submitted disputes.</p>
                </div>
                <span className="text-xs text-gray-400 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.06]">
                  Total: {requests.length}
                </span>
              </div>

              {requests.length === 0 ? (
                <div className="soft-card bg-[#15151f] rounded-2xl p-10 border border-white/[0.06] text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3.5 text-gray-400">
                    <ClipboardCheck size={28} />
                  </div>
                  <h3 className="text-base font-semibold text-white">No Correction Requests Yet</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    You have not submitted any attendance correction requests. If you notice an incorrect absence in your records, submit a dispute using the form above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {requests.map((req) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="soft-card bg-[#15151f] rounded-2xl p-5 sm:p-6 border border-white/[0.06]">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/[0.08] text-purple-300">
                              #{req.id}
                            </span>
                            <h3 className="text-base font-bold text-white">{req.subject}</h3>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                req.status === 'Approved'
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  : req.status === 'Rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                              {req.status === 'Approved' && <CheckCircle2 size={12} />}
                              {req.status === 'Rejected' && <XCircle size={12} />}
                              {req.status === 'Pending' && <Clock size={12} />}
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Submitted on {req.submittedAt}
                          </p>
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300">
                          <span className="bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06] flex items-center gap-1.5">
                            <Calendar size={13} className="text-purple-400" />
                            {req.attendanceDate}
                          </span>
                          <span className="bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06] flex items-center gap-1.5">
                            <Clock size={13} className="text-amber-400" />
                            {req.classPeriod.split(' ')[0]} {req.classPeriod.split(' ')[1] || ''}
                          </span>
                        </div>
                      </div>

                      {/* Details & Reason */}
                      <div className="bg-[#0f1118] rounded-xl p-4 border border-white/[0.04] space-y-2.5 mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>
                            Reviewer: <strong className="text-gray-200">{req.facultyName}</strong>
                          </span>
                          {req.evidenceName && (
                            <span className="flex items-center gap-1.5 text-purple-300 font-medium">
                              <FileText size={13} />
                              {req.evidenceName} ({req.evidenceSize || 'File'})
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                          <strong className="text-gray-400">Student Reason:</strong> {req.reason}
                        </p>
                      </div>

                      {/* Faculty Feedback Section */}
                      {req.facultyComment && (
                        <div
                          className={`rounded-xl p-3.5 text-xs sm:text-sm flex items-start gap-2.5 ${
                            req.status === 'Approved'
                              ? 'bg-green-500/5 border border-green-500/15 text-green-300'
                              : 'bg-rose-500/5 border border-rose-500/15 text-rose-300'
                          }`}>
                          <MessageSquare size={16} className="flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block mb-0.5">
                              Faculty Remarks ({req.reviewedAt || 'Reviewed'}):
                            </span>
                            <span>{req.facultyComment}</span>
                          </div>
                        </div>
                      )}

                      {req.status === 'Pending' && (
                        <div className="text-xs text-amber-400/80 flex items-center gap-1.5 pt-1">
                          <Clock size={13} />
                          <span>Under faculty review. Decisions will be recorded with an official comment.</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        ) : (
          /* Faculty Review Demonstration View */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6">
            {/* Demonstration Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
              <ShieldCheck size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-amber-300">
                  Demonstration Review Panel (Faculty Mode)
                </h3>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                  In a production environment, this review workflow is secured by instructor authorization. This panel demonstrates how faculty members inspect student claims, examine supporting evidence, enter justification remarks, and issue binding approval or rejection decisions.
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 mr-1">
                <Filter size={13} /> Filter:
              </span>
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFacultyFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    facultyFilter === tab
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Review Cards */}
            {filteredFacultyRequests.length === 0 ? (
              <div className="soft-card bg-[#15151f] rounded-2xl p-10 border border-white/[0.06] text-center">
                <p className="text-sm text-gray-400">No requests found under the "{facultyFilter}" category.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFacultyRequests.map(req => (
                  <div
                    key={req.id}
                    className="soft-card bg-[#15151f] rounded-2xl p-6 border border-white/[0.06] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/[0.08] text-purple-300">
                          #{req.id}
                        </span>
                        <span className="text-sm font-bold text-white">{req.studentName} ({req.rollNumber})</span>
                        <span className="text-xs text-gray-400">• {req.subject}</span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                          req.status === 'Approved'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : req.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Disputed Class Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-[#0f1118] p-3 rounded-xl border border-white/[0.04]">
                        <span className="text-gray-400 block">Class Date</span>
                        <span className="text-white font-medium">{req.attendanceDate}</span>
                      </div>
                      <div className="bg-[#0f1118] p-3 rounded-xl border border-white/[0.04]">
                        <span className="text-gray-400 block">Period</span>
                        <span className="text-white font-medium">{req.classPeriod}</span>
                      </div>
                      <div className="bg-[#0f1118] p-3 rounded-xl border border-white/[0.04]">
                        <span className="text-gray-400 block">Assigned Faculty</span>
                        <span className="text-white font-medium">{req.facultyName}</span>
                      </div>
                    </div>

                    {/* Student Claim & Evidence */}
                    <div className="bg-[#0f1118] p-4 rounded-xl border border-white/[0.04] space-y-2">
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        <strong className="text-purple-300">Student Explanation:</strong> {req.reason}
                      </p>
                      {req.evidenceName && (
                        <div className="pt-2 flex items-center gap-2 text-xs text-gray-400 border-t border-white/[0.04]">
                          <FileText size={14} className="text-purple-400" />
                          <span>Submitted Supporting Evidence:</span>
                          <span className="text-white font-mono bg-white/[0.06] px-2 py-0.5 rounded">
                            {req.evidenceName} ({req.evidenceSize || 'N/A'})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Feedback Toast */}
                    {actionFeedback[req.id] && (
                      <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-300 flex items-center gap-2">
                        <Check size={14} />
                        {actionFeedback[req.id]}
                      </div>
                    )}

                    {/* Faculty Action Controls */}
                    <div className="pt-2 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                          Faculty Review Remark
                        </label>
                        <input
                          type="text"
                          defaultValue={req.facultyComment || ''}
                          placeholder="e.g. Cross-verified with lab logbook, attendance updated in ERP."
                          onChange={(e) => {
                            const val = e.target.value
                            setFacultyComments(prev => ({ ...prev, [req.id]: val }))
                          }}
                          className="custom-input w-full text-xs sm:text-sm"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleFacultyDecision(req.id, 'Rejected')}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5">
                          <X size={14} />
                          {req.status === 'Rejected' ? 'Already Rejected' : 'Reject Request'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFacultyDecision(req.id, 'Approved')}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-green-300 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 transition-all flex items-center gap-1.5">
                          <Check size={14} />
                          {req.status === 'Approved' ? 'Already Approved' : 'Approve & Correct Attendance'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}
