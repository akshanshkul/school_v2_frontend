import React from 'react'
import { useSelector } from 'react-redux'
import { Search, Bell } from 'lucide-react'
import api from '../../api/axios'

const Header: React.FC<{ title: string }> = ({ title }) => {
  const { user } = useSelector((state: any) => state.auth)
  const [counts, setCounts] = React.useState({ total: 0, inquiries: 0, admissions: 0 })

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data } = await api.get('/school/notifications/counts')
        setCounts(data)
      } catch (err) {
        console.error("Failed to fetch notification counts")
      }
    }
    
    fetchCounts()
    const interval = setInterval(fetchCounts, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-24 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-20">
      <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
      
      {/* Central Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="w-full bg-slate-100/50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Language & Notifications */}
        <div className="flex items-center gap-6 pr-6 border-r border-slate-100">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
            <div className="h-5 w-7 rounded-sm bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center text-[8px] font-black uppercase">🇺🇸</div>
            <span className="text-xs font-black text-slate-600">Eng (US)</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-down text-slate-400" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
          </div>
          
          <button className="relative p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors group/bell">
            <Bell size={20} />
            {counts.total > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {counts.total}
              </span>
            )}
            
            {/* Tooltip on hover */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-2xl rounded-xl p-3 border border-slate-100 opacity-0 group-hover/bell:opacity-100 transition-opacity pointer-events-none z-50">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-2">Pending Actions</p>
               <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                     <span className="text-slate-600">Inquiries</span>
                     <span className="text-indigo-600">{counts.inquiries}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                     <span className="text-slate-600">Admissions</span>
                     <span className="text-indigo-600">{counts.admissions}</span>
                  </div>
               </div>
            </div>
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{user?.name}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{user?.role}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center group-hover:border-indigo-600/20 transition-all">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&bold=true`} 
              alt={user?.name} 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
