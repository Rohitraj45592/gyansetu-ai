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
      const res = await axios.post('https://gyansetu-ai-production.up.railway.app/auth/login', { email, password })
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; height: 100vh; overflow: hidden; }
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(245,158,11,0.5), 0 0 40px rgba(139,92,246,0.2); transform: scale(1); }
          50% { box-shadow: 0 0 30px rgba(245,158,11,0.8), 0 0 60px rgba(139,92,246,0.4); transform: scale(1.05); }
        }
        .animated-glow { animation: glowPulse 2s ease-in-out infinite; }
        .hero-logo { animation: slideInDown 0.6s ease-out; }
        .form-container { animation: slideInUp 0.6s ease-out; }
        .fi1 { animation: slideInDown 0.6s ease-out 0.3s backwards; }
        .fi2 { animation: slideInDown 0.6s ease-out 0.4s backwards; }
        .fi3 { animation: slideInDown 0.6s ease-out 0.5s backwards; }
        .signin-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(139,92,246,0.4); }
        .signin-btn:active { transform: translateY(0); }
        .google-btn:hover { background: rgba(139,92,246,0.1) !important; border-color: #8B5CF6 !important; }
        .finput:hover { background: rgba(55,65,81,0.7) !important; border-color: rgba(139,92,246,0.5) !important; }
        .finput:focus { outline: none; background: rgba(55,65,81,0.9) !important; border-color: #8B5CF6 !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
        .forgot-link:hover { color: #FBBF24; }
        @media (max-width: 1024px) {
          .login-wrapper { grid-template-columns: 1fr !important; overflow-y: auto !important; height: auto !important; }
          .hero-section { min-height: 300px !important; justify-content: flex-start !important; padding-top: 80px !important; }
        }
        @media (max-width: 640px) {
          .hero-heading { font-size: 28px !important; }
          .form-header-h1 { font-size: 24px !important; }
        }
      `}</style>

      <div className="login-wrapper" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100vh' }}>

        {/* LEFT HERO */}
        <div className="hero-section" style={{
          background: 'linear-gradient(135deg, #5B4FE8 0%, #3B3FDB 50%, #2D1B69 100%)',
          padding: '60px 50px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', top: '-100px', right: '-100px', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', bottom: '-80px', left: '-80px', borderRadius: '50%' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="hero-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '50px' }}>
              <div className="animated-glow" style={{
                width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', border: '1px solid rgba(255,255,255,0.3)'
              }}>💡</div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>GyanSetu AI</h2>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GenAI-powered ERP Copilot</p>
              </div>
            </div>

            <h1 className="hero-heading" style={{ fontSize: '48px', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '24px' }}>
              Talk to your academic data, naturally.
            </h1>

            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginBottom: '30px', lineHeight: 1.6 }}>
              Attendance, marks, timetable and notices — all in one AI chat. Powered by Text-to-SQL and RAG.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { title: 'Real-time attendance tracking', sub: 'Instant access to your attendance data' },
                { title: 'AI-powered Q&A with your data', sub: 'Ask questions about marks, performance' },
                { title: 'Smart notices via RAG pipeline', sub: 'Never miss important announcements' },
              ].map((f, i) => (
                <div key={i} className={`fi${i + 1}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '24px', height: '24px', background: 'rgba(255,255,255,0.2)',
                    borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, border: '1px solid rgba(255,255,255,0.3)', fontSize: '12px', color: '#FFD700', fontWeight: 'bold'
                  }}>✓</div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>{f.title}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div style={{
          background: 'linear-gradient(135deg, #0F1419 0%, #1a1f2e 100%)',
          padding: '60px 50px', display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
          <div className="form-container" style={{ maxWidth: '100%' }}>
            <h1 className="form-header-h1" style={{ fontSize: '32px', fontWeight: 700, color: '#F9FAFB', marginBottom: '8px' }}>Welcome back</h1>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '30px' }}>Login to continue to your dashboard</p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E5E7EB', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email address</label>
                <input type="email" className="finput" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(55,65,81,0.5)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: '#E5E7EB', fontSize: '14px', transition: 'all 0.3s ease', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#E5E7EB', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                <input type="password" className="finput" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(55,65,81,0.5)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: '#E5E7EB', fontSize: '14px', transition: 'all 0.3s ease', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 24px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '14px', height: '14px', accentColor: '#8B5CF6' }} />
                  Remember me
                </label>
                <a href="#" className="forgot-link" style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}>Forgot password?</a>
              </div>

              {error && (
                <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px' }}>{error}</p>
              )}

              <button type="submit" className="signin-btn" disabled={loading} style={{
                width: '100%', padding: '12px 16px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #5B4FE8 100%)',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease', textTransform: 'uppercase', letterSpacing: '0.5px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginBottom: '12px', opacity: loading ? 0.7 : 1
              }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                <div style={{ flex: 1, height: '0.5px', background: 'rgba(139,92,246,0.2)' }} />
                <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Or continue with</span>
                <div style={{ flex: 1, height: '0.5px', background: 'rgba(139,92,246,0.2)' }} />
              </div>

              <button type="button" className="google-btn" style={{
                width: '100%', padding: '10px 12px', background: 'transparent',
                border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px',
                color: '#E5E7EB', fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                🔵 Continue with Google
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#9CA3AF' }}>
                Don't have an account? <a href="#" style={{ color: '#F59E0B', textDecoration: 'none', fontWeight: 700 }}>Create one here</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}