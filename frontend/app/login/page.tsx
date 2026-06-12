'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('http://127.0.0.1:8001/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('student_id', '1')
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid email or password!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f8f7ff 0%, #ede9fe 50%, #e0e7ff 100%)' }}>

      {/* 3D Background Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full float-animation"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-20 right-20 w-96