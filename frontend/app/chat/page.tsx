'use client'
import ReactMarkdown from 'react-markdown'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Send, Lightbulb, User, Mic } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

interface Message {
  role: 'user' | 'ai'
  text: string
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
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) router.push('/login')
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)])

    // Auto-focus input on mount (opens keyboard on mobile)
    const timer = setTimeout(() => {
      if (window.innerWidth < 1024) {
        mobileInputRef.current?.focus()
      } else {
        inputRef.current?.focus()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const suggestions = [
    'Mera attendance dikhao',
    'DBMS marks kya hain?',
    'Aaj ki class kab hai?',
    '75% se kam attendance?',
  ]

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const studentId = localStorage.getItem('student_id') || '1'
      const res = await axios.post('https://gyansetu-ai-production.up.railway.app/chat/', {
        question: text,
        student_id: parseInt(studentId)
      })
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, kuch problem aa gayi. Phir try karo! 😅' }])
    } finally {
      setLoading(false)
    }
  }

  const isEmpty = messages.length === 0

  const spaceBackground = {
    backgroundColor: '#0a0a0f',
    backgroundImage: `
      radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.5), transparent),
      radial-gradient(2px 2px at 60px 70px, rgba(167,139,250,0.4), transparent),
      radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.4), transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(245,158,11,0.3), transparent),
      radial-gradient(2px 2px at 160px 20px, rgba(255,255,255,0.5), transparent),
      radial-gradient(1px 1px at 200px 100px, rgba(167,139,250,0.4), transparent),
      radial-gradient(1px 1px at 240px 50px, rgba(255,255,255,0.3), transparent),
      radial-gradient(2px 2px at 280px 90px, rgba(245,158,11,0.3), transparent),
      radial-gradient(1px 1px at 30px 120px, rgba(255,255,255,0.4), transparent),
      radial-gradient(1px 1px at 110px 150px, rgba(167,139,250,0.3), transparent)
    `,
    backgroundSize: '300px 200px',
    backgroundRepeat: 'repeat',
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={spaceBackground}>
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col h-screen pt-16 lg:pt-0">
        <div style={{ height: '56px', flexShrink: 0 }} className="hidden lg:block" />

        {isEmpty ? (
          <>
            {/* Desktop: centered welcome */}
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-10 -mt-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #f59e0b)', marginBottom: '24px' }}>
                <Lightbulb size={22} className="text-white" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-semibold text-white text-center"
                style={{ marginBottom: '40px' }}>
                {greeting}
              </motion.h1>

              <div className="w-full max-w-2xl">
                <div className="flex flex-wrap gap-2 justify-center" style={{ marginBottom: '20px' }}>
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => sendMessage(s)}
                      className="text-sm px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all backdrop-blur-sm">
                      {s}
                    </motion.button>
                  ))}
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#15151f]/90 backdrop-blur-sm px-4 py-3">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Apna sawaal type karo..."
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
                  />
                  <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0">
                    <Mic size={18} />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage(input)}
                    disabled={loading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #a78bfa, #f59e0b)' }}>
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Mobile: fixed layout */}
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl font-semibold text-white text-center">
                  {greeting}
                </motion.h1>
              </div>

              <div className="px-4 pb-6" style={{ flexShrink: 0 }}>
                <div className="flex flex-wrap gap-2 justify-center" style={{ marginBottom: '14px' }}>
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => sendMessage(s)}
                      className="text-sm px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all backdrop-blur-sm">
                      {s}
                    </motion.button>
                  ))}
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#15151f]/90 backdrop-blur-sm px-4 py-3">
                  <input
                    ref={mobileInputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Apna sawaal type karo..."
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
                  />
                  <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0">
                    <Mic size={18} />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage(input)}
                    disabled={loading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #a78bfa, #f59e0b)' }}>
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-10 pt-6 pb-6 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 w-full sm:max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>

                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'ai' ? '' : 'bg-white/10'
                  }`}
                    style={msg.role === 'ai' ? { background: 'linear-gradient(135deg, #a78bfa, #f59e0b)' } : {}}>
                    {msg.role === 'ai'
                      ? <Lightbulb size={14} className="text-white" />
                      : <User size={14} className="text-gray-300" />}
                  </div>

                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed min-w-0 ${
                    msg.role === 'ai'
                      ? 'bg-[#15151f]/90 backdrop-blur-sm border border-white/[0.06] text-gray-200 shadow-sm prose prose-invert prose-sm max-w-none'
                      : 'text-white whitespace-pre-line'
                  }`}
                    style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)' } : {}}>
                    {msg.role === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 w-full sm:max-w-[85%]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #a78bfa, #f59e0b)' }}>
                    <Lightbulb size={14} className="text-white" />
                  </div>
                  <div className="bg-[#15151f]/90 backdrop-blur-sm border border-white/[0.06] rounded-2xl px-4 py-3 shadow-sm flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 sm:px-10 py-5 border-t border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#15151f]/90 backdrop-blur-sm px-4 py-3 max-w-2xl mx-auto w-full">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Apna sawaal type karo..."
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
                />
                <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0">
                  <Mic size={18} />
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage(input)}
                  disabled={loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #f59e0b)' }}>
                  <Send size={16} />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}