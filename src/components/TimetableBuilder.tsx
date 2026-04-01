import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../store'
import { fetchSchoolData, fetchTimetable, createEvent, deleteEvent, updateRoleConfig } from '../store/appSlice'
import axios from '../api/axios'
import { toast } from 'react-hot-toast'
import { ChevronDown, Calendar, Plus, Users, Layout, Clock, Trash2, ShieldAlert, CheckCircle2, AlertTriangle, Pencil, X, Check, Info } from 'lucide-react'
import { useConfirm } from '../contexts/ConfirmContext'
import TimetableSkeleton from './timetable/TimetableSkeleton'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday']

// Helper for consistent subject colors
const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': 'bg-blue-600',
  'Science': 'bg-emerald-600',
  'English': 'bg-amber-600',
  'History': 'bg-rose-600',
  'Geography': 'bg-indigo-600',
  'Physics': 'bg-cyan-600',
  'Chemistry': 'bg-teal-600',
  'Biology': 'bg-green-600',
  'Computer': 'bg-slate-700',
  'Sports': 'bg-orange-600',
}

const getColorForSubject = (subjectName: string = '') => {
  return SUBJECT_COLORS[subjectName] || 'bg-indigo-600'
}

const TimetableBuilder: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { schoolData, timetable, loading } = useSelector((state: any) => state.app)
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'workload' | 'events' | 'settings'>('schedule')
  const [viewMode, setViewMode] = useState<'class' | 'teacher' | 'master'>('class')
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [selectedDay, setSelectedDay] = useState(DAYS[0])
  
  const [showModal, setShowModal] = useState(false)
  const [currentSlot, setCurrentSlot] = useState<{day: string, period_id: number, time: string} | null>(null)
  const [formData, setFormData] = useState({ subject_id: '', user_id: '', classroom_id: '' })
  const [eventFormData, setEventFormData] = useState({ name: '', type: 'holiday', duration: 'full', target_type: 'all', school_class_id: '', date: '' })
  const [periodFormData, setPeriodFormData] = useState({ name: '', start_time: '08:00', end_time: '09:00', type: 'class', sort_order: 0 })
  
  const [error, setError] = useState('')
  const [editingPeriodId, setEditingPeriodId] = useState<number | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)
  const { confirm } = useConfirm()
  const [mergePrompt, setMergePrompt] = useState<{
    classroom_id: number,
    classroom_name: string,
    class_name: string
  } | null>(null)

  useEffect(() => {
    dispatch(fetchSchoolData())
  }, [dispatch])

  useEffect(() => {
    if (viewMode === 'master') {
      dispatch(fetchTimetable({})) // Fetch everything
    } else if (viewMode === 'class' && selectedId) {
      dispatch(fetchTimetable({ school_class_id: selectedId }))
    } else if (viewMode === 'teacher' && selectedId) {
      dispatch(fetchTimetable({ user_id: selectedId }))
    }
  }, [selectedId, viewMode, dispatch])

  // --- Analytical Calculations ---
  
  const teacherWorkloads = useMemo(() => {
    if (!schoolData || !timetable) return []
    
    return schoolData.teachers.map((teacher: any) => {
      const config = schoolData.role_configs?.find((c: any) => c.role_name === teacher.role) || {
        min_classes_per_day: 2,
        max_classes_per_day: 6
      }
      
      const entries = timetable.filter((e: any) => e.user_id === teacher.id)
      const weeklyCount = entries.length
      const dailyAverage = weeklyCount / DAYS.length
      
      const utilization = (dailyAverage / config.max_classes_per_day) * 100
      
      let status: 'under' | 'optimal' | 'over' = 'optimal'
      if (dailyAverage < config.min_classes_per_day) status = 'under'
      if (dailyAverage > config.max_classes_per_day) status = 'over'
      
      return {
        ...teacher,
        weeklyCount,
        dailyAverage,
        utilization,
        status,
        config
      }
    })
  }, [schoolData, timetable])

  const isHoliday = () => {
    return schoolData?.events?.find((e: any) => e.type === 'holiday' && e.target_type === 'all')
  }

  // --- Handlers ---

  const handleSlotClick = (day: string, period: any) => {
    if (viewMode === 'teacher' || period.type !== 'class') return 
    
    const entry = timetable.find((e: any) => e.day_of_week === day && e.start_time.startsWith(period.start_time) && (viewMode === 'class' ? e.school_class_id === selectedId : true))

    setCurrentSlot({ day, period_id: period.id, time: period.start_time })
    setError('')
    
    if (entry) {
      setEditingEntryId(entry.id)
      setFormData({ 
        subject_id: entry.subject_id.toString(), 
        user_id: entry.user_id.toString(), 
        classroom_id: entry.classroom_id?.toString() || '' 
      })
    } else {
      setEditingEntryId(null)
      setFormData({ subject_id: '', user_id: '', classroom_id: '' })
    }
    
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent, isMergeConfirmed: boolean = false) => {
    e.preventDefault()
    if (!currentSlot) return
    if (!selectedId && viewMode !== 'master') return

    try {
      const payload: any = {
        ...formData,
        day_of_week: currentSlot.day,
        start_time: currentSlot.time,
        end_time: currentSlot.time.replace(':00', ':55'), 
      }

      if (viewMode === 'class') {
        payload.school_class_id = selectedId
      } else if (viewMode === 'teacher') {
        payload.user_id = selectedId
      }

      if (isMergeConfirmed && mergePrompt) {
        payload.merge_confirmed = true
        payload.classroom_id = mergePrompt.classroom_id
      }

      if (editingEntryId) {
        await axios.patch(`/timetable/${editingEntryId}`, payload)
      } else {
        await axios.post('/timetable', payload)
      }

      if (!editingEntryId && (formData as any).merge_class_id && !isMergeConfirmed) {
        await axios.post('/timetable', {
          ...payload,
          school_class_id: (formData as any).merge_class_id
        })
      }

      setShowModal(false)
      setEditingEntryId(null)
      setMergePrompt(null)
      toast.success(editingEntryId ? 'Assignment updated!' : 'Timetable updated successfully!')
      
      if (viewMode === 'master') {
        dispatch(fetchTimetable({}))
      } else if (viewMode === 'class' && selectedId) {
        dispatch(fetchTimetable({ school_class_id: selectedId }))
      } else if (viewMode === 'teacher' && selectedId) {
        dispatch(fetchTimetable({ user_id: selectedId }))
      }
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.merge_possible) {
        setMergePrompt({
          classroom_id: err.response.data.existing_classroom_id,
          classroom_name: err.response.data.existing_classroom_name,
          class_name: err.response.data.existing_class_name
        })
        return
      }
      
      const msg = err.response?.data?.error || 'Failed to save entry'
      setError(msg)
    }
  }

  const handleDeleteEntry = async (id?: number) => {
    const targetId = id || editingEntryId
    if (!targetId) return
    
    const isConfirmed = await confirm({
      title: 'Unassign Period',
      message: 'Are you sure you want to remove this teacher assignment? This action cannot be undone.',
      type: 'danger'
    })

    if (isConfirmed) {
      try {
        await axios.delete(`/timetable/${targetId}`)
        if (showModal) setShowModal(false)
        setEditingEntryId(null)
        toast.success('Period unassigned')
        
        const refreshParams = viewMode === 'master' ? {} : (viewMode === 'class' ? { school_class_id: selectedId } : { user_id: selectedId })
        dispatch(fetchTimetable(refreshParams))
      } catch (err: any) {
        toast.error('Failed to remove assignment')
      }
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(createEvent({
      ...eventFormData,
      school_class_id: eventFormData.target_type === 'all' ? null : eventFormData.school_class_id
    }))
    setEventFormData({ name: '', type: 'holiday', duration: 'full', target_type: 'all', school_class_id: '', date: '' })
  }

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPeriodId) {
        await axios.patch(`/school/periods/${editingPeriodId}`, periodFormData)
        setEditingPeriodId(null)
      } else {
        await axios.post('/school/periods', periodFormData)
      }
      dispatch(fetchSchoolData()) 
      setPeriodFormData({ name: '', start_time: '08:00', end_time: '09:00', type: 'class', sort_order: (schoolData?.periods.length || 0) + 1 })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save period')
    }
  }

  const handleEditPeriod = (p: any) => {
    setEditingPeriodId(p.id)
    setPeriodFormData({
       name: p.name,
       start_time: p.start_time.slice(0, 5),
       end_time: p.end_time.slice(0, 5),
       type: p.type,
       sort_order: p.sort_order
    })
  }

  const handleDeletePeriod = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Delete School Period',
      message: 'Are you sure you want to remove this timing session? It may affect existing timetable entries.',
      type: 'danger'
    })

    if (isConfirmed) {
      try {
        await axios.delete(`/school/periods/${id}`)
        dispatch(fetchSchoolData())
        toast.success('Period deleted')
      } catch (err: any) {
        setError('Failed to delete period')
      }
    }
  }

  const handleDeleteEvent = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Remove Calendar Lock',
      message: 'Are you sure you want to delete this holiday/event? The timetable will be unlocked for this day.',
      type: 'info'
    })

    if (isConfirmed) {
      dispatch(deleteEvent(id))
      toast.success('Event removed')
    }
  }

  const handleUpdateRoleConfig = async (role: string, min: number, max: number) => {
    try {
      await dispatch(updateRoleConfig({ role_name: role, min_classes_per_day: min, max_classes_per_day: max }))
    } catch (err: any) {
      setError('Failed to update workload configuration')
    }
  }

  if (loading && !schoolData) return <TimetableSkeleton />

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-600/10 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest">Academic Suite</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Timetable <span className="text-indigo-600">Dynamics</span></h1>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full lg:w-auto">
          {[
            { id: 'schedule', icon: <Calendar size={14} />, label: 'Schedule' },
            { id: 'workload', icon: <Users size={14} />, label: 'Workload' },
            { id: 'events', icon: <Layout size={14} />, label: 'Holidays' },
            { id: 'settings', icon: <Clock size={14} />, label: 'Settings' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="app-card p-6 flex flex-col md:flex-row gap-6 items-center">
             <div className="flex bg-slate-100 p-1 rounded-lg">
                {[
                  { id: 'class', label: 'Class View' },
                  { id: 'teacher', label: 'Teacher View' },
                  { id: 'master', label: 'Master View' }
                ].map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => { setViewMode(mode.id as any); setSelectedId('') }}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-wider transition-all ${viewMode === mode.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
                  >
                    {mode.label}
                  </button>
                ))}
             </div>

             <div className="flex-1 w-full flex gap-4">
                {viewMode === 'master' ? (
                  <div className="flex bg-slate-100 p-1 rounded-lg w-full overflow-x-auto no-scrollbar">
                    {DAYS.map(day => (
                      <button 
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex-1 min-w-[80px] px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${selectedDay === day ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="relative group flex-1">
                    <select 
                      value={selectedId} 
                      onChange={(e) => setSelectedId(Number(e.target.value))}
                      className="auth-input pr-10 shadow-sm bg-slate-50 border-slate-200"
                    >
                      <option value="">-- Select {viewMode === 'class' ? 'Class Mapping' : 'Staff Member'} --</option>
                      {viewMode === 'class' 
                          ? schoolData?.classes.map((c: any) => <option key={c.id} value={c.id}>{c.grade.name} - {c.section.name}</option>)
                          : schoolData?.teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)
                      }
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                )}
             </div>
          </div>

          {!selectedId && viewMode !== 'master' ? (
            <div className="app-card py-32 text-center flex flex-col items-center gap-6 border-dashed border-2 bg-slate-50/50">
              <div className="h-24 w-24 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-5xl animate-bounce duration-[3000ms]">🎯</div>
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-black text-slate-800">Perspective Required</h3>
                <p className="text-sm text-slate-500 leading-relaxed mt-2 uppercase font-black tracking-widest opacity-60">Select a Class or Teacher to begin analysis</p>
              </div>
            </div>
          ) : (
            <div className="app-card overflow-hidden shadow-2xl border-slate-200">
               <div className="overflow-x-auto">
                 <table className="w-full border-collapse">
                   <thead>
                     <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 border-r border-slate-200 text-[10px] uppercase font-medium text-slate-400 w-24 tracking-widest text-center">Time Slot</th>
                        {viewMode === 'master' ? (
                          schoolData?.classes.map((cls: any) => (
                            <th key={cls.id} className="p-4 text-[13px] font-medium text-slate-600 uppercase tracking-widest min-w-[200px]">
                              {cls.grade.name} - {cls.section.name}
                            </th>
                          ))
                        ) : (
                          DAYS.map(day => (
                            <th key={day} className="p-4 text-[13px] font-medium text-slate-600 uppercase tracking-widest">{day}</th>
                          ))
                        )}
                     </tr>
                   </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schoolData?.periods.length === 0 ? (
                        <tr>
                          <td colSpan={viewMode === 'master' ? (schoolData?.classes.length || 1) + 1 : 8} className="py-20 text-center">
                             <div className="flex flex-col items-center gap-4 opacity-40">
                                <Clock size={48} className="text-slate-300" />
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">No Periods Defined. Setup "Timings" first.</p>
                                <button onClick={() => setActiveTab('settings')} className="text-[10px] font-black text-indigo-600 underline">Add Bell Schedule</button>
                             </div>
                          </td>
                        </tr>
                      ) : (
                        schoolData?.periods.map((period: any) => (
                          <tr key={period.id} className="group hover:bg-slate-50/30 transition-colors border-b border-slate-100 last:border-0">
                            <td className="p-4 border-r border-slate-100 text-center bg-slate-50/20 sticky left-0 z-10">
                               <span className="block text-[11px] font-bold text-indigo-600 leading-tight uppercase tracking-tight">{period.name}</span>
                               <span className="block text-[10px] font-medium text-slate-400 font-mono mt-1 italic">{period.start_time.slice(0, 5)} - {period.end_time.slice(0, 5)}</span>
                            </td>
                            
                            {period.type !== 'class' ? (
                              <td colSpan={viewMode === 'master' ? schoolData?.classes.length : 7} className="bg-slate-100/50 p-0 overflow-hidden relative border-r border-slate-100 last:border-0">
                                 <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                    <span className="text-9xl font-black uppercase tracking-tighter -rotate-12 whitespace-nowrap">{period.name}</span>
                                 </div>
                                 <div className="h-full w-full flex items-center justify-center gap-4 py-8">
                                    <div className="h-px flex-1 bg-slate-200 ml-8"></div>
                                    <div className="px-6 py-2 bg-white rounded-full border border-slate-200 shadow-sm flex items-center gap-2 z-10 transition-all group-hover:px-8 group-hover:border-indigo-100">
                                       <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{period.name}</span>
                                       <div className="h-4 w-px bg-slate-200"></div>
                                       <span className="text-[10px] font-bold text-slate-400 italic">Institutional Break</span>
                                    </div>
                                    <div className="h-px flex-1 bg-slate-200 mr-8"></div>
                                 </div>
                              </td>
                            ) : (
                              viewMode === 'master' ? (
                                schoolData?.classes.map((cls: any) => {
                                  const entry = timetable.find((e: any) => e.school_class_id === cls.id && e.day_of_week === selectedDay && e.start_time.startsWith(period.start_time))
                                  return (
                                    <td key={cls.id} className={`p-4 text-center transition-all border-r border-slate-100 last:border-0 h-32 min-w-[200px] relative ${entry ? 'bg-indigo-50/30' : ''}`}>
                                      {entry ? (
                                        <div className="flex flex-col gap-2">
                                          <span className="text-[13px] font-bold text-indigo-700 uppercase leading-none tracking-tight">{entry.subject?.name}</span>
                                          <div className="flex flex-col items-center gap-1">
                                             <span className="text-[10px] font-medium text-slate-500 uppercase leading-none opacity-80 transition-opacity">{entry.teacher?.name}</span>
                                             <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white text-indigo-600 border border-indigo-100 uppercase tracking-tighter shadow-sm">{entry.classroom?.name}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-[9px] font-black uppercase text-slate-300 tracking-widest italic">Free Slot</div>
                                      )}
                                    </td>
                                  )
                                })
                              ) : (
                                DAYS.map((day) => {
                                  const entries = timetable.filter((e: any) => e.day_of_week === day && e.start_time.startsWith(period.start_time))
                                  const entry = viewMode === 'class' 
                                    ? entries.find((e: any) => e.school_class_id === selectedId)
                                    : entries[0] 
                                  
                                  const isMerged = entries.length > 1 && viewMode === 'teacher'
                                  const holiday = isHoliday()

                                  const prevPeriod = schoolData?.periods.find((p: any) => p.sort_order === period.sort_order - 1)
                                  const prevEntries = timetable.filter((e: any) => e.day_of_week === day && e.start_time.startsWith(prevPeriod?.start_time))
                                  const prevEntry = viewMode === 'class'
                                    ? prevEntries.find((e: any) => e.school_class_id === selectedId)
                                    : prevEntries.find((e: any) => e.user_id === selectedId)

                                  const nextPeriod = schoolData?.periods.find((p: any) => p.sort_order === period.sort_order + 1)
                                  const nextEntries = timetable.filter((e: any) => e.day_of_week === day && e.start_time.startsWith(nextPeriod?.start_time))
                                  const nextEntry = viewMode === 'class'
                                    ? nextEntries.find((e: any) => e.school_class_id === selectedId)
                                    : nextEntries.find((e: any) => e.user_id === selectedId)

                                  const isConsecutivePrev = entry && prevEntry && entry.subject_id === prevEntry.subject_id
                                  const isConsecutiveNext = entry && nextEntry && entry.subject_id === nextEntry.subject_id
                                  const isPartOfBlock = isConsecutivePrev || isConsecutiveNext
                                  
                                  const roomChangedPrev = isConsecutivePrev && entry.classroom_id !== prevEntry.classroom_id
                                  const roomChangedNext = isConsecutiveNext && entry.classroom_id !== nextEntry.classroom_id
                                  const hasRoomChangeAcrossBlock = roomChangedPrev || roomChangedNext

                                  let bgClass = ''
                                  if (entry) {
                                    if (isMerged) bgClass = 'bg-merge-glow'
                                    else if (isPartOfBlock) bgClass = getColorForSubject(entry.subject?.name)
                                    else bgClass = 'bg-indigo-50/40' 
                                  }

                                  const patternClass = hasRoomChangeAcrossBlock ? 'bg-pattern-lines' : ''
      
                                  return (
                                    <td 
                                      key={day} 
                                      onClick={() => !holiday && handleSlotClick(day, period)} 
                                      className={`p-4 text-center transition-all border-r border-slate-100 last:border-0 h-32 min-w-[160px] relative group/slot ${
                                        holiday ? 'bg-slate-50 cursor-not-allowed' : `cursor-pointer ${isMerged || isPartOfBlock ? 'hover:brightness-110' : 'hover:bg-slate-50/50'}`
                                      } ${bgClass} ${patternClass}`}
                                    >
                                      {entry && (
                                        <button 
                                          type="button"
                                          onClick={(e) => { 
                                            e.preventDefault();
                                            e.stopPropagation(); 
                                            handleDeleteEntry(entry.id); 
                                          }}
                                          className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 opacity-0 group-hover/slot:opacity-100 transition-opacity z-20 border-none bg-transparent p-0"
                                          title="Remove Assignment"
                                        >
                                          <Trash2 size={16} strokeWidth={2.5} />
                                        </button>
                                      )}

                                      {holiday ? (
                                        <div className="flex flex-col items-center opacity-40 grayscale scale-90">
                                          <Calendar className="text-slate-400 mb-1" size={16} />
                                          <span className="text-[9px] font-bold uppercase text-slate-500 tracking-tighter">Holiday Lock</span>
                                        </div>
                                      ) : entry ? (
                                        <div className={`flex flex-col gap-2 relative z-10 ${isMerged || isPartOfBlock ? 'text-white' : ''}`}>
                                          <span className={`text-[13px] font-bold uppercase leading-none tracking-tight ${!isMerged && !isPartOfBlock ? 'text-indigo-700' : ''}`}>
                                            {isMerged ? 'Merged Class' : (viewMode === 'class' ? entry.subject?.name : `${entry.schoolClass?.grade?.name}-${entry.schoolClass?.section?.name}`)}
                                          </span>
                                          <div className="flex flex-col items-center gap-1">
                                             <span className={`text-[10px] font-medium uppercase leading-none opacity-80 group-hover/slot:opacity-100 transition-opacity ${!isMerged && !isPartOfBlock ? 'text-slate-500' : ''}`}>
                                               {isMerged 
                                                  ? `${entries.map((e: any) => `${e.schoolClass?.grade?.name}-${e.schoolClass?.section?.name}`).join(' + ')}`
                                                  : (viewMode === 'class' ? entry.teacher?.name : entry.subject?.name)
                                               }
                                             </span>
                                             <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm ${isMerged || isPartOfBlock ? 'bg-white/20 border-white/30 text-white' : 'bg-white text-indigo-600 border border-indigo-100'}`}>
                                               {entry.classroom?.name}
                                             </span>
                                          </div>
                                          {isMerged && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white shadow-2xl rounded-xl p-3 border border-slate-100 opacity-0 group-hover/slot:opacity-100 transition-opacity pointer-events-none z-50 text-slate-800">
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-2">Merged Group</p>
                                              {entries.map((e: any) => (
                                                <div key={e.id} className="flex justify-between text-[11px] font-bold mb-1">
                                                  <span className="text-slate-600">{e.schoolClass?.grade?.name}-{e.schoolClass?.section?.name}</span>
                                                  <span className="text-indigo-600">{e.subject?.name}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="opacity-0 group-hover/slot:opacity-100 transition-opacity">
                                           <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-100 transform scale-75 group-hover/slot:scale-100 transition-transform">
                                              <Plus size={16} />
                                           </div>
                                        </div>
                                      )}
                                    </td>
                                  )
                                })
                              )
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>

                 </table>
               </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'workload' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherWorkloads.map((teacher: any) => (
              <div key={teacher.id} className="app-card p-6 border-t-4 border-indigo-600 flex flex-col gap-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 tracking-tight text-lg">{teacher.name}</h4>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{teacher.role}</p>
                  </div>
                  {teacher.status === 'optimal' ? (
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  ) : teacher.status === 'over' ? (
                    <AlertTriangle className="text-rose-500" size={20} />
                  ) : (
                    <AlertTriangle className="text-amber-500" size={20} />
                  )}
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                      <span className="text-slate-400">Workload Threshold</span>
                      <span className={teacher.status === 'over' ? 'text-rose-600' : 'text-slate-600'}>
                         {teacher.utilization.toFixed(0)}% Utilized
                      </span>
                   </div>
                   <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          teacher.status === 'over' ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 
                          teacher.status === 'under' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                          'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(teacher.utilization, 100)}%` }}
                      ></div>
                   </div>
                   <div className="flex justify-between text-[9px] font-bold text-slate-400 px-1 italic">
                      <span>Min: {teacher.config.min_classes_per_day}</span>
                      <span>Target: {teacher.config.max_classes_per_day}</span>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-3 rounded-xl transform transition-transform hover:-translate-y-1">
                      <span className="block text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Weekly Slots</span>
                      <span className="text-xl font-black text-slate-900">{teacher.weeklyCount}</span>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-xl transform transition-transform hover:-translate-y-1">
                      <span className="block text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Classes/Day</span>
                      <span className="text-xl font-black text-slate-900">{teacher.dailyAverage.toFixed(1)}</span>
                   </div>
                </div>

                {teacher.status === 'over' && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-pulse">
                     <ShieldAlert className="text-rose-600 shrink-0" size={16} />
                     <p className="text-[10px] font-bold text-rose-700 leading-tight">Teacher exceeds the role-based maximum capacity by {Math.max(0, teacher.dailyAverage - teacher.config.max_classes_per_day).toFixed(1)} classes.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
           <div className="app-card p-10 space-y-6 sticky top-8 border-t-8 border-rose-500 shadow-xl shadow-rose-100/20">
              <h4 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Define Institutional <span className="text-rose-500">Holidays</span></h4>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Schedule school-wide closures or event-based target locks.</p>
             
             <form onSubmit={handleCreateEvent} className="space-y-5 pt-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Internal Title</label>
                   <input 
                     type="text" 
                     required 
                     placeholder="e.g., Independence Day"
                     className="auth-input"
                     value={eventFormData.name}
                     onChange={(e) => setEventFormData({...eventFormData, name: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Event Category</label>
                      <select 
                        className="auth-input"
                        value={eventFormData.type}
                        onChange={(e) => setEventFormData({...eventFormData, type: e.target.value})}
                      >
                         <option value="holiday">Holiday</option>
                         <option value="event">Academic Event</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cycle</label>
                      <select 
                        className="auth-input"
                        value={eventFormData.duration}
                        onChange={(e) => setEventFormData({...eventFormData, duration: e.target.value})}
                      >
                         <option value="full">Full Day</option>
                         <option value="half">Half Day</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Group</label>
                   <select 
                     className="auth-input"
                     value={eventFormData.target_type}
                     onChange={(e) => setEventFormData({...eventFormData, target_type: e.target.value})}
                   >
                      <option value="all">Entire Institution</option>
                      <option value="class">Specific Class Only</option>
                   </select>
                </div>

                {eventFormData.target_type === 'class' && (
                   <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Mapping</label>
                      <select 
                        className="auth-input"
                        value={eventFormData.school_class_id}
                        onChange={(e) => setEventFormData({...eventFormData, school_class_id: e.target.value})}
                        required
                      >
                         <option value="">-- Choose Class --</option>
                         {schoolData?.classes.map((c: any) => (
                           <option key={c.id} value={c.id}>{c.grade.name}-{c.section.name}</option>
                         ))}
                      </select>
                   </div>
                )}

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Scheduled Date</label>
                   <input 
                     type="date" 
                     required 
                     className="auth-input"
                     value={eventFormData.date}
                     onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})}
                   />
                </div>

                <button type="submit" className="primary-btn w-full mt-4 flex items-center justify-center gap-2 group shadow-indigo-200 font-medium">
                   <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Commit Calendar Entry
                </button>
             </form>
           </div>

           <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                 <h4 className="text-xl font-bold text-slate-800 tracking-tight">Active <span className="text-slate-400 font-bold italic tracking-normal">Calendar Locks</span></h4>
              </div>

              {schoolData?.events?.length === 0 ? (
                 <div className="app-card py-20 text-center opacity-60 bg-slate-50 border-dashed">
                    <Calendar className="mx-auto mb-4 text-slate-300" size={48} />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No holidays scheduled</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {schoolData?.events?.map((ev: any) => (
                       <div key={ev.id} className="app-card p-6 bg-white flex flex-col gap-4 relative overflow-hidden group">
                          <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform ${ev.type === 'holiday' ? 'bg-rose-600' : 'bg-indigo-600'}`} />
                          
                          <div className="flex justify-between items-start z-10">
                             <div>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border mb-2 inline-block ${
                                  ev.type === 'holiday' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                }`}>
                                   {ev.type} • {ev.duration} day
                                </span>
                                <h5 className="font-bold text-slate-900 tracking-tight text-lg leading-tight">{ev.name}</h5>
                             </div>
                             <button 
                               onClick={() => handleDeleteEvent(ev.id)}
                               className="text-slate-300 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>

                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 z-10">
                              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                 <Calendar size={12} className="text-indigo-600" />
                                 {new Date(ev.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                 <Users size={12} className="text-indigo-600" />
                                 {ev.target_type === 'all' ? 'Every Class' : (ev.school_class ? `${ev.school_class.grade.name}-${ev.school_class.section.name}` : 'Specific Class')}
                              </div>
                          </div>
                          
                          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full ${ev.type === 'holiday' ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: ev.duration === 'full' ? '100%' : '50%' }} />
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="app-card p-10 space-y-6 border-t-8 border-indigo-600 shadow-xl shadow-indigo-100/20">
                 <h4 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3 leading-tight"><Clock size={24} className="text-indigo-600" /> Daily Bell <span className="text-indigo-600">Schedule</span></h4>
                 <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Define instructional periods and transition breaks.</p>
                 <form onSubmit={handleCreatePeriod} className="space-y-5 pt-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-medium text-slate-500 uppercase tracking-widest px-2">Label Identifier</label>
                       <input type="text" required placeholder="e.g. Period 1, Recess" className="auth-input font-medium" value={periodFormData.name} onChange={(e) => setPeriodFormData({...periodFormData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-widest px-2">Start Time</label>
                          <input type="time" required className="auth-input font-bold" value={periodFormData.start_time} onChange={(e) => setPeriodFormData({...periodFormData, start_time: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-widest px-2">End Time</label>
                          <input type="time" required className="auth-input font-bold" value={periodFormData.end_time} onChange={(e) => setPeriodFormData({...periodFormData, end_time: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-medium text-slate-500 uppercase tracking-widest px-2">Academic Category</label>
                       <select className="auth-input font-medium" value={periodFormData.type} onChange={(e) => setPeriodFormData({...periodFormData, type: e.target.value})}>
                          <option value="class">Instructional Session</option>
                          <option value="lunch">Lunch Break</option>
                          <option value="break">Transition Break</option>
                          <option value="assembly">Morning Assembly</option>
                       </select>
                    </div>
                    <button type="submit" className={`primary-btn w-full mt-4 flex items-center justify-center gap-2 group font-medium ${editingPeriodId ? 'bg-slate-900 shadow-slate-200' : ''}`}>
                        {editingPeriodId ? <Check size={18} /> : <Plus size={18} className="transition-transform group-hover:rotate-90" />}
                        {editingPeriodId ? 'Update Session' : 'Add to Bell System'}
                     </button>
                     {editingPeriodId && (
                        <button 
                          type="button" 
                          onClick={() => { setEditingPeriodId(null); setPeriodFormData({ name: '', start_time: '08:00', end_time: '09:00', type: 'class', sort_order: (schoolData?.periods.length || 0) + 1 }); }}
                          className="w-full mt-2 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2"
                        >
                           <X size={14} /> Cancel Selection
                        </button>
                     )}
                 </form>
              </div>
              <div className="lg:col-span-2 app-card p-8 min-h-[400px]">
                 <h5 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-6 px-2 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                    Active School Bell Timings
                 </h5>
                 {schoolData?.periods.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                       <Clock size={48} className="text-slate-300" />
                       <p className="text-xs font-bold uppercase tracking-widest">No timings defined yet</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {schoolData?.periods.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                             <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${p.type === 'class' ? 'bg-indigo-100' : 'bg-white shadow-sm'}`}>
                                   {p.type === 'class' ? '📚' : p.type === 'lunch' ? '🍱' : '🔔'}
                                </div>
                                <div>
                                   <p className="font-bold text-slate-800 leading-none">{p.name}</p>
                                   <div className="flex items-center gap-2 mt-1.5">
                                      <span className="text-[10px] font-bold text-indigo-600 font-mono bg-white px-2 py-0.5 rounded border border-indigo-50 shadow-sm">{p.start_time.slice(0, 5)} - {p.end_time.slice(0, 5)}</span>
                                      <span className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">{p.type}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex gap-1">
                                <button onClick={() => handleEditPeriod(p)} className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Pencil size={15} /></button>
                                <button onClick={() => handleDeletePeriod(p.id)} className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>

           <div className="app-card overflow-hidden border-t-4 border-indigo-600">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                 <div>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 text-center md:text-left leading-tight"><ShieldAlert size={20} className="text-indigo-600" /> Workload Thresholds</h4>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1 text-center md:text-left">Configure teaching capacities per role</p>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 text-[10px] font-bold uppercase tracking-widest border border-indigo-100 shadow-sm">
                    <CheckCircle2 size={14} /> Auto-Saving
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/20">
                 {['teacher', 'incharge', 'admin'].map(role => {
                    const config = schoolData?.role_configs?.find((c: any) => c.role_name === role) || { min_classes_per_day: 2, max_classes_per_day: 6 }
                    return (
                       <div key={role} className="p-12 space-y-10 hover:bg-white transition-all duration-500 group relative overflow-hidden">
                          <div className="text-center relative z-10">
                             <h5 className="text-[13px] font-bold uppercase text-slate-800 tracking-[0.3em]">{role}</h5>
                             <div className="h-1 w-10 bg-indigo-600 mx-auto mt-3 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block">Min Daily</label>
                                <div className="relative">
                                   <input 
                                     type="number" 
                                     className="auth-input text-center font-bold text-xl h-16 bg-white shadow-sm border-slate-100" 
                                     defaultValue={config.min_classes_per_day} 
                                     onBlur={(e) => handleUpdateRoleConfig(role, Number(e.target.value), config.max_classes_per_day)}
                                   />
                                </div>
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block">Max Daily</label>
                                <div className="relative">
                                   <input 
                                     type="number" 
                                     className="auth-input text-center font-bold text-xl h-16 bg-white shadow-sm border-slate-100 focus:border-rose-500" 
                                     defaultValue={config.max_classes_per_day} 
                                     onBlur={(e) => handleUpdateRoleConfig(role, config.min_classes_per_day, Number(e.target.value))}
                                   />
                                </div>
                             </div>
                          </div>
                          <p className="text-[11px] font-medium text-slate-400 text-center italic relative z-10">Institutional target: <span className="text-indigo-600 font-bold">{config.min_classes_per_day}-{config.max_classes_per_day}</span> daily sessions.</p>
                       </div>
                    )
                 })}
              </div>
           </div>
        </div>
      )}
      
      {showModal && currentSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10 animate-in fade-in zoom-in duration-300 relative">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-t-3xl" />
             
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-indigo-600" />
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{currentSlot.day} @ {currentSlot.time}</span>
                   </div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">Lesson <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Assignment</span></h4>
                </div>
                <button type="button" onClick={() => { setShowModal(false); setMergePrompt(null); setEditingEntryId(null); }} className="h-10 w-10 flex items-center justify-center border-2 border-slate-100 rounded-xl text-slate-300 hover:text-slate-600 hover:border-slate-200 transition-all">✖</button>
              </div>

              {error && !mergePrompt && (
                <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100 flex items-center gap-3 animate-in shake duration-500">
                  <ShieldAlert size={18} /> {error}
                </div>
              )}

              {mergePrompt ? (
                <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-200 animate-in zoom-in duration-300 border border-indigo-500/30">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                       <Users size={20} className="text-white" />
                    </div>
                    <div>
                       <h5 className="font-black text-sm uppercase tracking-wider mb-1">Merge Required?</h5>
                       <p className="text-xs font-medium text-white/80 leading-relaxed">
                         The selected teacher is already in <span className="font-black text-white">{mergePrompt.classroom_name}</span> with <span className="font-black text-white">{mergePrompt.class_name}</span>. 
                         Would you like to <span className="underline decoration-indigo-300 underline-offset-4">merge</span> this session?
                       </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                     <button 
                       type="button" 
                       onClick={(e) => handleSubmit(e, true)}
                       className="flex-1 py-3 bg-white text-indigo-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg shadow-indigo-900/20"
                     >
                       Yes, Merge Class
                     </button>
                     <button 
                       type="button" 
                       onClick={() => setMergePrompt(null)}
                       className="flex-1 py-3 bg-indigo-500/50 text-white border border-indigo-400/50 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500/70 transition-colors"
                     >
                       Cancel
                     </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Academic Subject</label>
                       <div className="relative group">
                         <select 
                           value={formData.subject_id} 
                           onChange={(e) => setFormData({...formData, subject_id: e.target.value})} 
                           required 
                           className="auth-input appearance-none pr-10 border-slate-100 focus:border-indigo-600"
                         >
                           <option value="">Select Subject</option>
                           {schoolData?.subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                         </select>
                         <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Lead Instructor</label>
                       <div className="relative group">
                         <select 
                           value={formData.user_id} 
                           onChange={(e) => setFormData({...formData, user_id: e.target.value})} 
                           required 
                           className="auth-input appearance-none pr-10 border-slate-100 focus:border-indigo-600"
                         >
                           <option value="">Select Staff Member</option>
                           {schoolData?.teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name} — {t.role.toUpperCase()}</option>)}
                         </select>
                         <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Designated Room</label>
                       <div className="relative group">
                         <select 
                           value={formData.classroom_id} 
                           onChange={(e) => setFormData({...formData, classroom_id: e.target.value})} 
                           className="auth-input appearance-none pr-10 border-slate-100 focus:border-indigo-600"
                         >
                           <option value="">Auto-assign Room</option>
                           {schoolData?.classrooms.map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                         </select>
                         <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                       </div>
                    </div>

                    {viewMode === 'teacher' && (
                       <div className="space-y-2 pt-2 border-t border-slate-50">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Merge with Secondary Class <span className="text-slate-300 font-medium normal-case">(Optional)</span></label>
                         <div className="relative group">
                           <select 
                             value={(formData as any).merge_class_id || ''} 
                             onChange={(e) => setFormData({...formData, merge_class_id: e.target.value} as any)} 
                             className="auth-input appearance-none pr-10 border-slate-100 focus:border-indigo-600"
                           >
                             <option value="">No Merge</option>
                             {schoolData?.classes.map((c: any) => (
                               <option key={c.id} value={c.id}>{c.grade.name}-{c.section.name}</option>
                             ))}
                           </select>
                           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                         </div>
                       </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button type="submit" className={`primary-btn w-full h-14 text-base shadow-xl ${editingEntryId ? 'bg-slate-900 shadow-slate-200' : 'shadow-indigo-100'}`}>
                      {editingEntryId ? 'Update Assignment' : 'Activate Slot'}
                    </button>
                    {editingEntryId && (
                      <button 
                        type="button" 
                        onClick={() => handleDeleteEntry()}
                        className="w-full py-4 bg-rose-50 hover:bg-rose-100 rounded-2xl text-xs font-black text-rose-600 transition-all border border-rose-100 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} /> Unassign Period
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => { setShowModal(false); setMergePrompt(null); setEditingEntryId(null); }}
                      className="w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm font-black text-slate-500 transition-all border border-slate-100"
                    >
                      Discard
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimetableBuilder
