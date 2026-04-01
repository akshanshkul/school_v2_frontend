import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../../store'
import { fetchAttendance, markAttendance, fetchSchoolData } from '../../store/appSlice'
import { Calendar, Save, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useConfirm } from '../../contexts/ConfirmContext'

const AttendanceManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { confirm } = useConfirm()
  const { schoolData, attendance, loading } = useSelector((state: any) => state.app)
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [localRecords, setLocalRecords] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Fetch staff data if missing
  useEffect(() => {
    if (!schoolData && !loading) {
      dispatch(fetchSchoolData())
    }
  }, [schoolData, loading, dispatch])

  // Fetch attendance when date changes
  useEffect(() => {
    if (selectedDate) {
      dispatch(fetchAttendance(selectedDate))
    }
  }, [selectedDate, dispatch])

  // Sync Redux attendance state with local editable state
  useEffect(() => {
    if (schoolData?.teachers) {
      const records = schoolData.teachers.map((teacher: any) => {
        const existingRecord = attendance.find((a: any) => a.user_id === teacher.id)
        return {
          user_id: teacher.id,
          name: teacher.name,
          role: teacher.role,
          profile_picture: teacher.profile_picture,
          status: existingRecord?.status || 'present', // Default to present
          remarks: existingRecord?.remarks || '',
        }
      })
      setLocalRecords(records)
    }
  }, [schoolData, attendance])

  const handleStatusChange = (userId: number, status: string) => {
    setLocalRecords(prev => prev.map(rec => 
      rec.user_id === userId ? { ...rec, status } : rec
    ))
  }

  const handleRemarksChange = (userId: number, remarks: string) => {
    setLocalRecords(prev => prev.map(rec => 
      rec.user_id === userId ? { ...rec, remarks } : rec
    ))
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const payload = {
        date: selectedDate,
        records: localRecords.map(r => ({
          user_id: r.user_id,
          status: r.status,
          remarks: r.remarks
        }))
      }
      await dispatch(markAttendance(payload)).unwrap()
      await confirm({
        title: 'Attendance Saved',
        message: 'The daily staff register has been successfully updated and archived.',
        type: 'info',
        confirmText: 'Done'
      })
    } catch (err: any) {
      await confirm({
        title: 'Error Logging',
        message: err || 'Failed to save attendance records. Please try again.',
        type: 'danger'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const stats = {
    present: localRecords.filter(r => r.status === 'present').length,
    absent: localRecords.filter(r => r.status === 'absent').length,
    late: localRecords.filter(r => r.status === 'late').length,
    half_day: localRecords.filter(r => r.status === 'half_day').length,
    total: localRecords.length
  }

  if (!schoolData) return <div className="p-8 text-center text-slate-500 font-medium tracking-tight">Loading staff data...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-100/60 sticky top-0 z-10 transition-shadow hover:shadow-md">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
              <Calendar size={24} />
            </span>
            Daily Register
          </h2>
          <p className="text-slate-500 font-medium text-sm">Review and log institutional staff operational presence.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
          <div className="space-y-1.5 flex-1 sm:flex-none">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Date Selection</label>
            <input 
              type="date" 
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-bold cursor-pointer"
            />
          </div>
          <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70"
          >
            <Save size={18} />
            {isSaving ? 'Logging...' : 'Save Register'}
          </button>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Present" count={stats.present} total={stats.total} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatCard title="Absent" count={stats.absent} total={stats.total} icon={<XCircle size={20} />} color="rose" />
        <StatCard title="Late" count={stats.late} total={stats.total} icon={<Clock size={20} />} color="amber" />
        <StatCard title="Half-Day" count={stats.half_day} total={stats.total} icon={<AlertCircle size={20} />} color="indigo" />
      </div>

      {/* Staff Roster Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 font-bold">Faculty Member</th>
                <th className="py-4 px-6 font-bold">Designation</th>
                <th className="py-4 px-6 font-bold text-center">Status</th>
                <th className="py-4 px-6 font-bold">Administrative Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {localRecords.map((record) => (
                <tr key={record.user_id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-400 capitalize">
                        {record.profile_picture ? (
                          <img src={record.profile_picture} alt={record.name} className="h-full w-full object-cover" />
                        ) : record.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{record.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize bg-slate-100 text-slate-600">
                      {record.role}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-50 rounded-xl w-fit mx-auto border border-slate-200/60">
                      <StatusButton 
                        active={record.status === 'present'} 
                        label="P" 
                        color="text-emerald-700 bg-emerald-100 border-emerald-200" 
                        onClick={() => handleStatusChange(record.user_id, 'present')} 
                      />
                      <StatusButton 
                        active={record.status === 'late'} 
                        label="L" 
                        color="text-amber-700 bg-amber-100 border-amber-200" 
                        onClick={() => handleStatusChange(record.user_id, 'late')} 
                      />
                      <StatusButton 
                        active={record.status === 'half_day'} 
                        label="HD" 
                        color="text-indigo-700 bg-indigo-100 border-indigo-200" 
                        onClick={() => handleStatusChange(record.user_id, 'half_day')} 
                      />
                      <StatusButton 
                        active={record.status === 'absent'} 
                        label="A" 
                        color="text-rose-700 bg-rose-100 border-rose-200" 
                        onClick={() => handleStatusChange(record.user_id, 'absent')} 
                      />
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <input
                      type="text"
                      placeholder="Add institutional context..."
                      value={record.remarks}
                      onChange={(e) => handleRemarksChange(record.user_id, e.target.value)}
                      className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 py-1.5 px-1 text-sm text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none transition-colors"
                    />
                  </td>
                </tr>
              ))}
              {localRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    No faculty members found in the institutional registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, count, total, icon, color }: { title: string, count: number, total: number, icon: React.ReactNode, color: 'emerald' | 'amber' | 'rose' | 'indigo' }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0
  
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  }

  return (
    <div className={`p-5 rounded-3xl border transition-all ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold !text-[13px] uppercase tracking-wider opacity-80">{title}</span>
        <span className="opacity-80">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-black leading-none">{count}</span>
        <span className="text-sm font-bold opacity-60 mb-0.5">/ {total}</span>
      </div>
      <div className="mt-3 w-full bg-current/10 rounded-full h-1.5 overflow-hidden">
        <div className="bg-current h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

const StatusButton = ({ active, label, color, onClick }: { active: boolean, label: string, color: string, onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs transition-all border ${
        active ? `${color} shadow-sm scale-110 z-10` : 'text-slate-400 border-transparent hover:bg-slate-200/50 hover:text-slate-600'
      }`}
    >
      {label}
    </button>
  )
}

export default AttendanceManager
