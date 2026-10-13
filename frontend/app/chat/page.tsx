'use client'
import ReactMarkdown from 'react-markdown'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Send, Lightbulb, User, Mic, MicOff, Plus, Camera, Image, FileText, X } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

interface Message {
  role: 'user' | 'ai'
  text: string
  image?: string
  fileName?: string
}

const greetings = [
  'Hello, Rohit',
  'Welcome back, Rohit',
  'Rohit returns!',
  'Hey there, Rohit',
  'Good to see you, Rohit',
]

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [micSupported, setMicSupported] = useState(true)
  const [showAttachMenu, setShowAttachMenu] = useState(false)

  // NAYA — file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) router.push('/login')
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)])
    const timer = setTimeout(() => {
      if (window.innerWidth < 1024) mobileInputRef.current?.focus()
      else inputRef.current?.focus()
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { setMicSupported(false); return }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'hi-IN'
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('')
      setInput(transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.attach-menu-wrapper')) setShowAttachMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleMic = () => {
    if (!micSupported || !recognitionRef.current) return
    if (isListening) { recognitionRef.current.stop(); setIsListening(false) }
    else { setInput(''); recognitionRef.current.start(); setIsListening(true) }
  }

  // FIXED — file select hone pe preview set karo
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setShowAttachMenu(false)
    setSelectedFile(file)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => setFilePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }

    e.target.value = ''
  }

  const clearFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
  }

  // FIXED — sendMessage file bhi bhejta hai
  const sendMessage = async (text: string) => {
    if (!text.trim() && !selectedFile) return

    const userMessage: Message = {
      role: 'user',
      text: text || `${selectedFile?.name} ke baare mein poochh raha hoon`,
      image: filePreview || undefined,
      fileName: !filePreview && selectedFile ? selectedFile.name : undefined,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    const fileCopy = selectedFile
    clearFile()
    setLoading(true)

    try {
      const studentId = localStorage.getItem('student_id') || '1'
      let answer = ''

      if (fileCopy && fileCopy.type.startsWith('image/')) {
        const formData = new FormData()
        formData.append('question', text || 'Is image ke baare mein bata')
        formData.append('student_id', studentId)
        formData.append('file', fileCopy)
        const res = await axios.post(
          'https://gyansetu-ai-backend.onrender.com/chat/image/',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        answer = res.data.answer

      } else if (fileCopy) {
        const formData = new FormData()
        formData.append('question', text || `${fileCopy.name} ke baare mein bata`)
        formData.append('student_id', studentId)
        formData.append('file', fileCopy)
        const res = await axios.post(
          'https://gyansetu-ai-backend.onrender.com/chat/file/',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        answer = res.data.answer

      } else {
        const res = await axios.post('https://gyansetu-ai-backend.onrender.com/chat/', {
          question: text,
          student_id: parseInt(studentId)
        })
        answer = res.data.answer
      }

      setMessages(prev => [...prev, { role: 'ai', text: answer }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, kuch problem aa gayi. Phir try karo! 😅' }])
    } finally {
      setLoading(false)
    }
  }

  const attachOptions = [
    {
      icon: Camera, label: 'Camera', color: '#a78bfa',
      action: () => { setShowAttachMenu(false); cameraInputRef.current?.click() }
    },
    {
      icon: Image, label: 'Photos', color: '#60a5fa',
      action: () => { setShowAttachMenu(false); photoInputRef.current?.click() }
    },
    {
      icon: FileText, label: 'Files', color: '#4ade80',
      action: () => { setShowAttachMenu(false); fileInputRef.current?.click() }
    },
  ]

  const suggestions = [
    'Mera attendance dikhao',
    'DBMS marks kya hain?',
    'Aaj ki class kab hai?',
    '75% se kam attendance?',
  ]

  const isEmpty = messages.length === 0

  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i, left: (i * 37 + 13) % 100, top: (i * 53 + 7) % 100,
    size: (i % 3) + 1, delay: (i % 5) * 0.6,
  }))

  const planets = [
    { left: 8, top: 15, size: 22, color: '#a78bfa' },
    { left: 88, top: 22, size: 14, color: '#f59e0b' },
    { left: 15, top: 78, size: 18, color: '#60a5fa' },
    { left: 92, top: 70, size: 10, color: '#f472b6' },
  ]

  const MicButton = ({ size = 18 }: { size?: number }) => (
    <button type="button" onClick={toggleMic} disabled={!micSupported}
      className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
        isListening ? 'text-red-400 bg-red-500/10 animate-pulse'
        : micSupported ? 'text-gray-400 hover:text-white hover:bg-white/5'
        : 'text-gray-600 cursor-not-allowed'
      }`}>
      {isListening ? <MicOff size={size} /> : <Mic size={size} />}
    </button>
  )

  // NAYA — file preview bar input ke upar
  const FilePreviewBar = () => {
    if (!selectedFile) return null
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2"
        style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)' }}>
        {filePreview ? (
          <img src={filePreview} alt="preview" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(74,222,128,0.15)' }}>
            <FileText size={18} className="text-green-400" />
          </div>
        )}
        <span className="text-sm text-white/70 flex-1 truncate">{selectedFile.name}</span>
        <button onClick={clearFile} className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0">
          <X size={16} />
        </button>
      </motion.div>
    )
  }

  const AttachButton = () => (
    <div className="attach-menu-wrapper relative flex-shrink-0">
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelected} />
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      <AnimatePresence>
        {showAttachMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-12 left-0 z-50 rounded-2xl overflow-hidden"
            style={{
              background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: '160px'
            }}>
            {attachOptions.map((opt, i) => (
              <button key={i} type="button" onClick={opt.action}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                style={{ borderBottom: i < attachOptions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${opt.color}22` }}>
                  <opt.icon size={16} style={{ color: opt.color }} />
                </div>
                <span className="text-sm text-white font-medium">{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button type="button" onClick={() => setShowAttachMenu(prev => !prev)}
        className="p-2 rounded-xl transition-all flex-shrink-0 text-gray-400 hover:text-white hover:bg-white/5">
        {showAttachMenu ? <X size={18} /> : <Plus size={18} />}
      </button>
    </div>
  )

  // NAYA — reusable input bar with preview
  const InputBar = ({ refProp, placeholder }: {
    refProp?: React.RefObject<HTMLInputElement | null>
    placeholder: string
  }) => (
    <div className="w-full">
      <AnimatePresence><FilePreviewBar /></AnimatePresence>
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#15151f]/85 backdrop-blur-md px-4 py-3">
        <AttachButton />
        <input
          ref={refProp}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder={isListening ? 'Sun raha hoon... bolo' : placeholder}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
        />
        <MicButton />
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage(input)} disabled={loading}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #a78bfa, #f59e0b)' }}>
          <Send size={16} />
        </motion.button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; } }
        @keyframes comet {
          0% { transform: translate(-10vw, -10vh); opacity: 0; }
          5% { opacity: 1; } 85% { opacity: 1; }
          100% { transform: translate(110vw, 110vh); opacity: 0; }
        }
        .star-twinkle { animation: twinkle 2.5s ease-in-out infinite; }
        .comet-trail { animation: comet 8s linear infinite; }
      `}</style>

      <div className="min-h-screen flex overflow-x-hidden relative" style={{ backgroundColor: '#0a0a12' }}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: '8%', left: '78%', width: '70px', height: '70px', opacity: 0.85 }}>
            <defs>
              <mask id="moonMask">
                <circle cx="50" cy="50" r="38" fill="white" />
                <circle cx="64" cy="42" r="34" fill="black" />
              </mask>
            </defs>
            <circle cx="50" cy="50" r="38" fill="#e9e4f7" mask="url(#moonMask)" />
          </svg>
          {planets.map((p, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${p.left}%`, top: `${p.top}%`,
              width: `${p.size}px`, height: `${p.size}px`, borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${p.color}, ${p.color}99 60%, transparent)`,
              opacity: 0.55,
            }} />
          ))}
          {stars.map((s) => (
            <div key={s.id} className="star-twinkle" style={{
              position: 'absolute', left: `${s.left}%`, top: `${s.top}%`,
              width: `${s.size}px`, height: `${s.size}px`,
              borderRadius: '50%', background: '#ffffff',
              animationDelay: `${s.delay}s`,
            }} />
          ))}
          <div className="comet-trail" style={{ position: 'absolute', top: 0, left: 0 }}>
            <div style={{
              width: '3px', height: '3px', borderRadius: '50%', background: '#fff',
              boxShadow: '0 0 6px 2px rgba(255,255,255,0.8), -60px -28px 18px -10px rgba(167,139,250,0.5), -120px -56px 28px -14px rgba(167,139,250,0.25)',
            }} />
          </div>
        </div>

        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col h-screen pt-16 lg:pt-0 relative" style={{ zIndex: 1 }}>
          <div style={{ height: '56px', flexShrink: 0 }} className="hidden lg:block" />

          {isEmpty ? (
            <>
              {/* Desktop */}
              <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-10 -mt-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #f59e0b)', marginBottom: '24px' }}>
                  <Lightbulb size={22} className="text-white" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="text-3xl font-semibold text-white text-center" style={{ marginBottom: '40px' }}>
                  {greeting}
                </motion.h1>
                <div className="w-full max-w-2xl">
                  <div className="flex flex-wrap gap-2 justify-center" style={{ marginBottom: '20px' }}>
                    {suggestions.map((s, i) => (
                      <motion.button key={i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        onClick={() => sendMessage(s)}
                        className="text-sm px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all backdrop-blur-sm">
                        {s}
                      </motion.button>
                    ))}
                  </div>
                  <InputBar refProp={inputRef} placeholder="Chat with GyanSetu..." />
                </div>
              </div>

              {/* Mobile */}
              <div className="lg:hidden flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
                <div className="flex flex-col items-center justify-center flex-1 px-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #a78bfa, #f59e0b)', marginBottom: '16px' }}>
                    <Lightbulb size={20} className="text-white" />
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="text-xl font-semibold text-white text-center">
                    {greeting}
                  </motion.h1>
                </div>
                <div className="px-4 pb-6" style={{ flexShrink: 0 }}>
                  <div className="flex flex-wrap gap-2 justify-center" style={{ marginBottom: '14px' }}>
                    {suggestions.map((s, i) => (
                      <motion.button key={i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        onClick={() => sendMessage(s)}
                        className="text-sm px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all backdrop-blur-sm">
                        {s}
                      </motion.button>
                    ))}
                  </div>
                  <InputBar refProp={mobileInputRef} placeholder="Apna sawaal type karo..." />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 sm:px-10 pt-6 pb-6 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className={`flex gap-3 w-full sm:max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? '' : 'bg-white/10'}`}
                      style={msg.role === 'ai' ? { background: 'linear-gradient(135deg, #a78bfa, #f59e0b)' } : {}}>
                      {msg.role === 'ai' ? <Lightbulb size={14} className="text-white" /> : <User size={14} className="text-gray-300" />}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed min-w-0 ${
                        msg.role === 'ai'
                          ? 'bg-[#15151f]/90 backdrop-blur-sm border border-white/[0.06] text-gray-200 shadow-sm prose prose-invert prose-sm max-w-none'
                          : 'text-white'
                      }`}
                      style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)' } : {}}>

                      {/* NAYA — image preview message mein */}
                      {msg.image && (
                        <img src={msg.image} alt="attachment"
                          className="w-48 h-32 object-cover rounded-xl mb-2" />
                      )}
                      {/* NAYA — file badge message mein */}
                      {msg.fileName && (
                        <div className="flex items-center gap-2 mb-2 px-2 py-1 rounded-lg bg-white/10 w-fit">
                          <FileText size={12} />
                          <span className="text-xs">{msg.fileName}</span>
                        </div>
                      )}

                      {msg.role === 'ai'
                        ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                        : <span className="whitespace-pre-line">{msg.text}</span>
                      }
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 w-full sm:max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #a78bfa, #f59e0b)' }}>
                      <Lightbulb size={14} className="text-white" />
                    </div>
                    <div className="bg-[#15151f]/90 backdrop-blur-sm border border-white/[0.06] rounded-2xl px-4 py-3 shadow-sm flex items-center gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="px-4 sm:px-10 py-5 border-t border-white/[0.06] bg-[#0a0a12]/80 backdrop-blur-sm">
                <div className="max-w-2xl mx-auto w-full">
                  <InputBar placeholder="Apna sawaal type karo..." />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  )
}