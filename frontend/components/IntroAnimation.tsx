'use client'
import { useEffect, useRef, useState } from 'react'

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const introRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const TEXT = "GyanSetu AI"
    const PURPLE_END = 8

    // letters build
    const line1 = document.getElementById('gs-line1')
    if (!line1) return
    line1.innerHTML = ''
    for (let i = 0; i < TEXT.length; i++) {
      const span = document.createElement('span')
      span.id = 'gs-ch' + i
      span.style.cssText = `
        display:inline-block;
        opacity:0;
        transform:translateY(50px) rotateX(-80deg) scale(0.85);
        transform-origin:50% 100%;
        color:${i < PURPLE_END ? '#a78bfa' : '#fff'};
        text-shadow:${i < PURPLE_END
          ? '0 1px 0 rgba(167,139,250,0.5), 0 6px 24px rgba(108,92,231,0.6)'
          : '0 1px 0 rgba(255,255,255,0.35), 0 6px 20px rgba(0,0,0,0.5)'};
        font-family:Syne,sans-serif;
        font-size:clamp(44px,7vw,82px);
        font-weight:800;
        letter-spacing:-2px;
        transition:transform 0.65s cubic-bezier(0.23,1,0.32,1), opacity 0.5s ease;
      `
      span.textContent = TEXT[i] === ' ' ? '\u00A0' : TEXT[i]
      if (TEXT[i] === ' ') span.style.width = '16px'
      line1.appendChild(span)
    }

    const timeouts: NodeJS.Timeout[] = []
    const T = (fn: () => void, ms: number) => timeouts.push(setTimeout(fn, ms))

    // glow
    T(() => {
      const glow = document.getElementById('gs-glow')
      if (glow) glow.style.opacity = '1'
    }, 100)

    // logo card
    T(() => {
      const card = document.getElementById('gs-card')
      if (!card) return
      card.style.transition = 'opacity 0.6s ease, transform 0.85s cubic-bezier(0.23,1,0.32,1)'
      card.style.opacity = '1'
      card.style.transform = 'translateY(0) rotateX(0deg) scale(1)'
    }, 200)

    // letters
    const BASE = 700, STAGGER = 52
    for (let i = 0; i < TEXT.length; i++) {
      T(() => {
        const ch = document.getElementById('gs-ch' + i)
        if (!ch) return
        ch.style.opacity = '1'
        ch.style.transform = 'translateY(0) rotateX(0deg) scale(1)'
      }, BASE + i * STAGGER)
    }

    const afterLetters = BASE + TEXT.length * STAGGER + 80

    // tagline
    T(() => {
      const tag = document.getElementById('gs-tag')
      if (!tag) return
      tag.style.transition = 'opacity 0.7s ease, transform 0.7s ease, color 0.7s ease'
      tag.style.opacity = '1'
      tag.style.transform = 'translateY(0)'
      tag.style.color = 'rgba(255,255,255,0.38)'
    }, afterLetters)

    // progress bar
    T(() => {
      const pf = document.getElementById('gs-pf')
      if (!pf) return
      pf.style.transition = 'width 2.3s cubic-bezier(0.25,0.46,0.45,0.94)'
      pf.style.width = '100%'
    }, afterLetters + 150)

    // exit
    T(() => {
      const intro = introRef.current
      if (!intro) return
      intro.style.transition = 'opacity 0.65s ease, transform 0.65s ease, filter 0.65s ease'
      intro.style.opacity = '0'
      intro.style.transform = 'scale(1.03)'
      intro.style.filter = 'blur(4px)'
    }, afterLetters + 1300)

    // complete
    T(() => onComplete(), afterLetters + 1950)

    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <div
      ref={introRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#07070f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', perspective: '800px',
      }}
    >
      {/* glow */}
      <div id="gs-glow" style={{
        position: 'absolute', width: '700px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(108,92,231,0.15) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        opacity: 0, transition: 'opacity 1s ease', pointerEvents: 'none',
      }} />

      {/* logo card */}
      <div id="gs-card" style={{
        width: '88px', height: '88px', borderRadius: '22px',
        background: 'linear-gradient(135deg,#5b4fcf 0%,#7c6ff7 50%,#6c5ce7 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(108,92,231,0.5)',
        opacity: 0,
        transform: 'translateY(-40px) rotateX(40deg) scale(0.7)',
        marginBottom: '32px', flexShrink: 0, position: 'relative',
      }}>
        <svg viewBox="0 0 24 24" fill="none" style={{ width: '46px', height: '46px', filter: 'drop-shadow(0 2px 8px rgba(255,200,50,0.5))' }}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" fill="#FFD700" opacity="0.95"/>
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z" fill="#FFD700" opacity="0.7"/>
          <path d="M9 18h6v1H9z" fill="#FFD700" opacity="0.5"/>
          <ellipse cx="12" cy="9" rx="3" ry="3" fill="#FFF176" opacity="0.4"/>
        </svg>
        {/* shine */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '22px',
          background: 'linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 50%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* text */}
      <div style={{ textAlign: 'center' }}>
        <div id="gs-line1" style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }} />
        <div id="gs-tag" style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 'clamp(12px,1.6vw,16px)',
          fontWeight: 400,
          letterSpacing: '5px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0)',
          opacity: 0,
          transform: 'translateY(16px)',
        }}>
          GenAI-Powered ERP Copilot
        </div>
      </div>

      {/* progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        background: 'rgba(255,255,255,0.03)', overflow: 'hidden',
      }}>
        <div id="gs-pf" style={{
          height: '100%', width: '0%',
          background: 'linear-gradient(90deg,#6c5ce7,#a78bfa,#c4b5fd)',
          boxShadow: '0 0 10px rgba(167,139,250,0.7)',
        }} />
      </div>
    </div>
  )
}