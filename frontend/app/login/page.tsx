'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('https://gyansetu-ai-production.up.railway.app/auth/login', {
        email, password
      })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('student_id', '1')
      router.push('/dashboard')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.6s ease-out; }
        .input-field { transition: all 0.3s ease; }
        .input-field:hover { border-color: rgba(255,255,255,0.4) !important; }
        .input-field:focus { outline: none; border-color: white !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.15); }
        .sign-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,0.4); }
        .sign-btn:active { transform: translateY(0); }
        .check-item { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; font-size: 15px; color: rgba(255,255,255,0.9); }
        .check-icon { width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; }
        @media (max-width: 768px) {
          .left-panel { display: none !important; }
          .right-panel { width: 100% !important; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        {/* Left Panel */}
        <div className="left-panel" style={{
          width: '50%',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
          padding: '60px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
            }}>💡</div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>GyanSetu AI</span>
          </div>

          {/* Main text */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: '48px', fontWeight: 800, color: 'white',
              lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-0.02em'
            }}>
              Talk to your<br />academic data,<br />
              <span style={{ color: '#fde68a' }}>naturally.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: 1.7, marginBottom: '36px', maxWidth: '380px' }}>
              Attendance, marks, timetable and notices — all in one AI chat. Powered by Text-to-SQL and RAG.
            </p>
            <div>
              <div className="check-item"><div className="check-icon">✓</div> Real-time attendance tracking</div>
              <div className="check-item"><div className="check-icon">✓</div> AI-powered Q&A with your data</div>
              <div className="check-item"><div className="check-icon">✓</div> Smart notices via RAG pipeline</div>
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', position: 'relative', zIndex: 1 }}>
            © 2026 GyanSetu AI — GenAI ERP Copilot
          </p>
        </div>

        {/* Right Panel */}
        <div className="right-panel fade-in" style={{
          width: '50%',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{ width: '100%', maxWidth: '380px' }}>
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Welcome back</h2>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Login to continue to your dashboard</p>
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Email address
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%', padding: '11px 14px',
                    border: '1.5px solid #e5e7eb', borderRadius: '8px',
                    fontSize: '14px', color: '#111827',
                    background: '#f9fafb', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '11px 14px',
                    border: '1.5px solid #e5e7eb', borderRadius: '8px',
                    fontSize: '14px', color: '#111827',
                    background: '#f9fafb', boxSizing: 'border-box'
                  }}
                />
              </div>

              {error && (
                <p style={{
                  color: '#dc2626', fontSize: '13px', marginBottom: '14px',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '8px', padding: '10px 14px'
                }}>{error}</p>
              )}

              <button type="submit" className="sign-btn" disabled={loading} style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease', marginBottom: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: loading ? 0.7 : 1
              }}>
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>

              <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Demo: <span style={{ color: '#4f46e5', fontWeight: 600 }}>rohit.student@gyansetu.com</span> / <span style={{ color: '#4f46e5', fontWeight: 600 }}>rohit123</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}