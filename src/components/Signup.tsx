import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setAuth } from '../store/authSlice'
import axios from '../api/axios'

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    school_name: '',
    school_email: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('/register', formData)
      dispatch(setAuth(response.data))
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <div className="app-card w-full max-w-2xl p-10 sm:p-12 animate-in fade-in zoom-in duration-500">
        <form onSubmit={handleSignup} className="space-y-8">
          <div className="text-center space-y-2">
             <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-200 mb-4">G</div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register with Gradox</h2>
            <p className="text-xs text-slate-500 font-medium whitespace-pre-line">Initialize your school management system and administrator account.</p>
          </div>
          
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-xs text-red-600 font-bold">
              {error}
            </div>
          )}

          {/* School Info Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">1. Institutional Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">School Name</label>
                <input 
                  type="text" 
                  value={formData.school_name} 
                  onChange={(e) => setFormData({...formData, school_name: e.target.value})} 
                  required 
                  className="auth-input"
                  placeholder="e.g. St. James Academy"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Official Email</label>
                <input 
                  type="email" 
                  value={formData.school_email} 
                  onChange={(e) => setFormData({...formData, school_email: e.target.value})} 
                  required 
                  className="auth-input"
                  placeholder="contact@school.edu"
                />
              </div>
            </div>
          </div>

          {/* Admin Info Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">2. Administrative Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                  className="auth-input"
                  placeholder="Super Admin Name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Personal Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                  className="auth-input"
                  placeholder="admin@personal.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required 
                  className="auth-input"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Verification</label>
                <input 
                  type="password" 
                  value={formData.password_confirmation} 
                  onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})} 
                  required 
                  className="auth-input"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="primary-btn mt-4 shadow-lg shadow-indigo-100">
            Initialize School System
          </button>

          <p className="text-center text-xs text-slate-500 font-medium">
            Already have a school registered? {' '}
            <a href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">Click here to sign in</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Signup
