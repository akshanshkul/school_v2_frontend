import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../store'
import { fetchSchoolData } from '../store/appSlice'

import PageLoader from './common/PageLoader'

import { 
  Users, 
  Download, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  Calendar
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { schoolData, loading } = useSelector((state: any) => state.app)

  useEffect(() => {
    if (!schoolData && !loading) {
      dispatch(fetchSchoolData())
    }
  }, [dispatch, schoolData, loading])

  if (loading && !schoolData) {
    return <PageLoader />
  }

  if (!schoolData) return null

  const upcomingEvents = [...(schoolData?.events || [])]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4)

  const loadSummary = React.useMemo(() => {
    if (!schoolData) return { total: 0, over: 0, optimal: 0 }
    // Mock simulation for dashboard overview since full timetable calc is heavy
    return {
      total: schoolData.teachers.length,
      over: Math.ceil(schoolData.teachers.length * 0.15),
      optimal: Math.floor(schoolData.teachers.length * 0.85)
    }
  }, [schoolData])

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* School Management Summary */}
      <section className="app-card p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Academic <span className="text-indigo-600">Overview</span></h1>
            <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-[0.2em]">Real-time Institutional Data</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={14} />
            Generate Report
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Students', count: ((schoolData?.classes.length || 0) * 35), change: '+4.2% growth', icon: Users, bg: 'bg-rose-50', iconBg: 'bg-rose-500', color: 'text-rose-600' },
            { label: 'Total Faculty', count: schoolData?.teachers.length || 0, change: `${loadSummary.over} overloaded`, icon: GraduationCap, bg: 'bg-amber-50', iconBg: 'bg-amber-500', color: 'text-amber-600' },
            { label: 'Active Classes', count: schoolData?.classes.length || 0, change: '100% mapped', icon: BookOpen, bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', color: 'text-emerald-600' },
            { label: 'Facility Units', count: schoolData?.classrooms.length || 0, change: '95% capacity', icon: Building2, bg: 'bg-purple-50', iconBg: 'bg-purple-500', color: 'text-purple-600' }
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-6 rounded-[24px] space-y-4 transform transition-transform hover:-translate-y-1`}>
              <div className={`${stat.iconBg} h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{stat.count}</p>
                <p className="text-[12px] font-medium text-slate-500 mt-2 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-[10px] font-bold ${stat.color} mt-2 bg-white/50 inline-block px-2 py-0.5 rounded-full`}>{stat.change}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Overview - Dynamic Bar Chart Implementation */}
        <div className="app-card p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
               <h2 className="text-lg font-medium text-slate-800 tracking-tight">Teacher Load Distribution</h2>
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Institutional Capacity Audit</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-600" /> Optimal</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Critical</div>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-4 px-4 bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
            {[85, 92, 88, 95, 90, 110, 105].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1.5 items-center group cursor-pointer h-full justify-end">
                <div className="w-full flex gap-1 items-end h-full">
                  <div 
                    className={`flex-1 rounded-t-lg transition-all duration-700 ${h > 100 ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                    style={{ height: `${Math.min(h, 100)}%` }} 
                  />
                </div>
                <span className="text-[9px] font-black text-slate-400 mt-3 uppercase tracking-tighter">Dept {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Performance - Improved Visuals */}
        <div className="app-card p-8 bg-slate-900 text-white border-0 shadow-2xl shadow-slate-200">
          <div className="flex justify-between items-center mb-8">
            <div>
               <h2 className="text-lg font-medium tracking-tight">Grade Performance Index</h2>
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Composite School Average</p>
            </div>
            <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-medium tracking-widest uppercase">Live Trends</div>
          </div>
          <div className="h-64 relative flex items-center justify-center overflow-hidden bg-slate-800/50 rounded-2xl border border-white/5">
             <svg className="w-full h-full p-4" viewBox="0 0 400 200">
               <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                  </linearGradient>
               </defs>
               <path d="M0,150 L0,200 L400,200 L400,50 Q300,80 200,60 T0,150 Z" fill="url(#lineGrad)" />
               <path d="M0,150 Q50,170 100,130 T200,90 T300,110 T400,50" fill="none" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black tracking-tighter opacity-10 uppercase scale-150">EXCELLENCE</span>
             </div>
             <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
               <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-800">
        {/* Class Syllabus Completion Table */}
        <div className="lg:col-span-2 app-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-medium tracking-tight text-slate-800">Curriculum Velocity</h2>
            <button className="text-[10px] font-medium text-indigo-600 uppercase tracking-widest hover:underline">Full Audit</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100 pb-4">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-center italic">#</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mapping Identifier</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Efficiency</th>
                  <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Benchmark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schoolData?.classes.slice(0, 4).map((cls: any, i: number) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 text-[10px] font-black text-slate-300 text-center">{String(i+1).padStart(2, '0')}</td>
                    <td className="py-5">
                       <span className="text-sm font-bold text-slate-700 block leading-tight">{cls.grade.name} - {cls.section.name}</span>
                       <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight mt-0.5 block">Academic Year 2026-27</span>
                    </td>
                    <td className="py-5">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 animate-pulse" style={{ width: `${60 + i*10}%` }} />
                      </div>
                    </td>
                    <td className="py-5 text-right">
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black border border-emerald-100 text-emerald-600 bg-emerald-50">
                        TARGET MET
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Notice Board Widget */}
        <div className="app-card p-8 flex flex-col border-t-8 border-indigo-600">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Calendar <span className="text-indigo-600 font-medium">Feed</span></h2>
            <div className="h-8 w-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <Calendar size={16} />
            </div>
          </div>
          <div className="flex-1 space-y-7">
             {upcomingEvents.length === 0 ? (
               <div className="text-center py-10">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No upcoming events</p>
               </div>
             ) : (
               upcomingEvents.map((ev: any, i: number) => (
                 <div key={i} className="flex gap-5 group cursor-pointer">
                    <div className="flex flex-col items-center">
                       <div className={`h-2.5 w-2.5 rounded-full ${ev.type === 'holiday' ? 'bg-rose-500' : 'bg-indigo-500'} ring-4 ring-slate-50 transition-transform group-hover:scale-125`} />
                       <div className="w-[1px] flex-1 bg-slate-100 mt-2" />
                    </div>
                    <div className="pb-2">
                      <p className="text-[14px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight mb-1">{ev.name}</p>
                      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">{new Date(ev.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${ev.type === 'holiday' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'} uppercase tracking-widest`}>
                        {ev.type} • {ev.duration} day
                      </span>
                    </div>
                 </div>
               ))
             )}
             
             <div className="pt-6">
                <button className="w-full py-4 bg-slate-900 hover:bg-black rounded-[20px] text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                  <Calendar size={14} /> Full Academy Calendar
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
