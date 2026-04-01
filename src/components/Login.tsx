import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setAuth } from '../store/authSlice'
import axios from '../api/axios'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('/login', { email, password })
      dispatch(setAuth(response.data))
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <div className="app-card w-full max-w-md p-10 sm:p-12 animate-in fade-in zoom-in duration-500">
        <form onSubmit={handleLogin} className="space-y-8">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-200 mb-4">G</div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-500 font-medium">Enter your credentials to access the management suite</p>
          </div>
          
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600 font-bold">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="auth-input"
                placeholder="admin@school.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Password</label>
                <a href="#" className="text-[10px] font-bold text-indigo-600 hover:underline tracking-tight">Forgot?</a>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="auth-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="primary-btn">
            Sign In to Dashboard
          </button>

          <p className="text-center text-xs text-slate-500 font-medium">
            New here? {' '}
            <a href="/signup" className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">Register your school</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
