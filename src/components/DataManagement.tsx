import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { fetchSchoolData, createGrade, createSection, createClass, createSubject, createClassroom, createTeacher } from '../store/appSlice'

interface Props {
  onClose?: () => void;
}

const DataManagement: React.FC<Props> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { schoolData } = useSelector((state: RootState) => state.app)
  const [activeTab, setActiveTab] = useState<'grade' | 'section' | 'class' | 'subject' | 'room' | 'teacher'>('grade')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form States
  const [gradeName, setGradeName] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [selectedMapping, setSelectedMapping] = useState({ grade_id: '', section_id: '' })
  const [subject, setSubject] = useState({ name: '', code: '' })
  const [room, setRoom] = useState({ name: '', capacity: '' })
  const [teacher, setTeacher] = useState({ name: '', email: '', password: '', role: 'teacher' })

  useEffect(() => {
    dispatch(fetchSchoolData())
  }, [dispatch])

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleCreateGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); clearMessages()
    const res = await dispatch(createGrade({ name: gradeName }))
    if (createGrade.fulfilled.match(res)) { setSuccess('Grade created!'); setGradeName('') }
    else setError(res.payload as string)
    setLoading(false)
  }

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); clearMessages()
    const res = await dispatch(createSection({ name: sectionName }))
    if (createSection.fulfilled.match(res)) { setSuccess('Section created!'); setSectionName('') }
    else setError(res.payload as string)
    setLoading(false)
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMapping.grade_id || !selectedMapping.section_id) return
    setLoading(true); clearMessages()
    const res = await dispatch(createClass({ 
      grade_id: Number(selectedMapping.grade_id), 
      section_id: Number(selectedMapping.section_id) 
    }))
    if (createClass.fulfilled.match(res)) { 
      setSuccess('Class-Section mapping created!')
      setSelectedMapping({ grade_id: '', section_id: '' })
    }
    else setError(res.payload as string)
    setLoading(false)
  }

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); clearMessages()
    const res = await dispatch(createSubject(subject))
    if (createSubject.fulfilled.match(res)) { setSuccess('Subject created!'); setSubject({ name: '', code: '' }) }
    else setError(res.payload as string)
    setLoading(false)
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); clearMessages()
    const res = await dispatch(createClassroom({ name: room.name, capacity: Number(room.capacity) }))
    if (createClassroom.fulfilled.match(res)) { setSuccess('Room created!'); setRoom({ name: '', capacity: '' }) }
    else setError(res.payload as string)
    setLoading(false)
  }

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); clearMessages()
    const res = await dispatch(createTeacher(teacher))
    if (createTeacher.fulfilled.match(res)) { setSuccess('Staff added!'); setTeacher({ name: '', email: '', password: '', role: 'teacher' }) }
    else setError(res.payload as string)
    setLoading(false)
  }

  return (
    <div className="glass-card w-full max-w-3xl p-8 overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black tracking-tight text-white">School Set-up</h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕ Close</button>
        )}
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'grade', label: '1. Grades' },
          { id: 'section', label: '2. Sections' },
          { id: 'class', label: '3. Map Class' },
          { id: 'subject', label: 'Subjects' },
          { id: 'room', label: 'Rooms' },
          { id: 'teacher', label: 'Staff' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); clearMessages(); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900/50 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold mb-6">{error}</div>}
      {success && <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold mb-6">{success}</div>}

      <div className="min-h-[300px]">
        {activeTab === 'grade' && (
          <form onSubmit={handleCreateGrade} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Academic Level / Grade Name</label>
              <input type="text" value={gradeName} onChange={(e) => setGradeName(e.target.value)} required className="auth-input" placeholder="e.g. Grade 10" />
            </div>
            <button type="submit" disabled={loading} className="primary-btn">{loading ? 'Creating...' : 'Add Grade Level'}</button>
          </form>
        )}

        {activeTab === 'section' && (
          <form onSubmit={handleCreateSection} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Section Name</label>
              <input type="text" value={sectionName} onChange={(e) => setSectionName(e.target.value)} required className="auth-input" placeholder="e.g. Section A" />
            </div>
            <button type="submit" disabled={loading} className="primary-btn">{loading ? 'Creating...' : 'Add Section'}</button>
          </form>
        )}

        {activeTab === 'class' && (
          <form onSubmit={handleCreateClass} className="space-y-6">
            <p className="text-sm text-slate-400 mb-4">Select a Grade and a Section to create a unique Class entity.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Grade</label>
                <select value={selectedMapping.grade_id} onChange={(e) => setSelectedMapping({...selectedMapping, grade_id: e.target.value})} required className="auth-input">
                  <option value="">Select Grade</option>
                  {schoolData?.grades.map((g:any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Section</label>
                <select value={selectedMapping.section_id} onChange={(e) => setSelectedMapping({...selectedMapping, section_id: e.target.value})} required className="auth-input">
                  <option value="">Select Section</option>
                  {schoolData?.sections.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="primary-btn">{loading ? 'Creating...' : 'Create Class-Section Mapping'}</button>
          </form>
        )}

        {activeTab === 'subject' && (
          <form onSubmit={handleCreateSubject} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Subject Name</label>
                <input type="text" value={subject.name} onChange={(e) => setSubject({...subject, name: e.target.value})} required className="auth-input" placeholder="Mathematics" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Code</label>
                <input type="text" value={subject.code} onChange={(e) => setSubject({...subject, code: e.target.value})} className="auth-input" placeholder="MATH101" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="primary-btn">{loading ? 'Creating...' : 'Add Subject'}</button>
          </form>
        )}

        {activeTab === 'room' && (
          <form onSubmit={handleCreateRoom} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Room Name</label>
                <input type="text" value={room.name} onChange={(e) => setRoom({...room, name: e.target.value})} required className="auth-input" placeholder="Room 102" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Capacity</label>
                <input type="number" value={room.capacity} onChange={(e) => setRoom({...room, capacity: e.target.value})} className="auth-input" placeholder="30" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="primary-btn">{loading ? 'Creating...' : 'Add Room'}</button>
          </form>
        )}

        {activeTab === 'teacher' && (
          <form onSubmit={handleCreateTeacher} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Name</label>
                <input type="text" value={teacher.name} onChange={(e) => setTeacher({...teacher, name: e.target.value})} required className="auth-input" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email</label>
                <input type="email" value={teacher.email} onChange={(e) => setTeacher({...teacher, email: e.target.value})} required className="auth-input" placeholder="john@school.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
                <input type="password" value={teacher.password} onChange={(e) => setTeacher({...teacher, password: e.target.value})} required className="auth-input" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Role</label>
                <select value={teacher.role} onChange={(e) => setTeacher({...teacher, role: e.target.value})} className="auth-input">
                  <option value="teacher">Teacher</option>
                  <option value="incharge">Timetable Incharge</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="primary-btn">{loading ? 'Adding...' : 'Add Staff member'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default DataManagement
