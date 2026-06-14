'use client'
import ReactMarkdown from 'react-markdown'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Send, Sparkles, User } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

interface Message {
  role: 'user' | 'ai'
  text: string
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi Rohit! 👋 Main GyanSetu AI hoon. Aap mujhse apna attendance, marks, timetable ya notices ke baare mein kuch bhi pooch sakte hain!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) router.push('/login')
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

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col h-screen pt-16 lg:pt-0 lg:ml-72">
        <div style={{ height: '56px', flexShrink: 0 }} />

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
                msg.role === 'ai' ? '' : 'bg-gray-200'
              }`}
                style={msg.role === 'ai' ? { background: 'linear-gradient(135deg, #6366f1, #818cf8)' } : {}}>
                {msg.role === 'ai'
                  ? <Sparkles size={14} className="text-white" />
                  : <User size={14} className="text-gray-500" />}
              </div>

              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed min-w-0 ${
                msg.role === 'ai'
                  ? 'bg-white border border-gray-100 text-gray-800 shadow-sm prose prose-sm max-w-none'
                  : 'text-white whitespace-pre-line'
              }`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #6366f1, #818cf8)' } : {}}>
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
                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 sm:px-10 pb-3 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => sendMessage(s)}
                className="text-sm px-4 py-2 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all">
                {s}
              </motion.button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 sm:px-10 py-5 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 w-full">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Apna sawaal type karo..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none text-sm text-gray-900"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage(input)}
              disabled={loading}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  )
}