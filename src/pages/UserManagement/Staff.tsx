import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch } from '../../store'
import { createTeacher, deleteTeacher, resetStaffPassword } from '../../store/appSlice'
import { Users, Mail, ShieldCheck, Trash2, PlusCircle, Lock, Pencil, Key, Image as ImageIcon, Camera } from 'lucide-react'
import { useConfirm } from '../../contexts/ConfirmContext'

const Staff: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { confirm } = useConfirm()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { schoolData } = useSelector((state: any) => state.app)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'teacher' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = new FormData()
    data.append('name', formData.name)
    data.append('email', formData.email)
    data.append('password', formData.password)
    data.append('role', formData.role)
    if (selectedFile) {
      data.append('profile_picture', selectedFile)
    }

    dispatch(createTeacher(data))
    setFormData({ name: '', email: '', password: '', role: 'teacher' })
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Remove Staff Member',
      message: 'Are you sure you want to remove this staff member? Secure access will be revoked immediately.',
      type: 'danger'
    })

    if (isConfirmed) {
      dispatch(deleteTeacher(id))
    }
  }

  const handleResetPassword = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Reset Password',
      message: 'Reset this staff member\'s password? A new random password will be generated and sent via email.',
      type: 'warning'
    })

    if (isConfirmed) {
      dispatch(resetStaffPassword(id)).then(async (res: any) => {
        if (res.payload?.success) {
          await confirm({
            title: 'Password Generated',
            message: `Success! Final secondary backup: New password is ${res.payload.new_password}`,
            type: 'info',
            confirmText: 'Got it',
            cancelText: 'Close'
          })
        }
      })
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 app-card p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Staff Directory</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Authorized Access Management</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                  <th className="pb-5 px-4">Member Identity</th>
                  <th className="pb-5 px-4">Access Level</th>
                  <th className="pb-5 px-4">Contact</th>
                  <th className="pb-5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schoolData?.teachers.map((staff: any) => (
                  <tr key={staff.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all overflow-hidden border border-slate-200 group-hover:border-indigo-100 shadow-sm">
                          {staff.profile_picture ? (
                            <img src={staff.profile_picture} alt={staff.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-400 font-bold text-xs">
                              {staff.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-700">{staff.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                        staff.role === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                        staff.role === 'incharge' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                        'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-5 px-4 font-medium text-slate-400 text-sm italic">{staff.email}</td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleResetPassword(staff.id)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          title="Reset Password"
                        >
                          <Key size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(staff.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="app-card p-10 h-fit sticky top-32 border-t-4 border-indigo-600">
          <div className="flex items-center gap-3 mb-8">
            <PlusCircle size={20} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Add Member</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity Profile Picture Upload */}
            <div className="flex flex-col items-center gap-4 mb-2">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-24 w-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group overflow-hidden relative"
              >
                {previewUrl ? (
                  <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <Camera size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Avatar</span>
                  </>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-indigo-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <ImageIcon size={20} className="text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Institutional Identity <br/> Asset (JPG/PNG)</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Identity Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Full Name" 
                className="auth-input text-sm font-medium" 
                required 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">E-mail Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@school.com" 
                  className="auth-input pl-11 text-sm font-medium" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Institutional Role</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})} 
                  className="auth-input pl-11 appearance-none text-sm font-medium"
                >
                  <option value="teacher">Standard Teacher</option>
                  <option value="incharge">Timetable Incharge</option>
                  <option value="admin">Global Admin</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Min 8 chars" 
                  className="auth-input pl-11 text-sm font-medium" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="primary-btn mt-2 font-bold tracking-wide">Initialize Account</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Staff
